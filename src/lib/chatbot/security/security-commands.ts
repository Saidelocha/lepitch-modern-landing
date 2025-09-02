/**
 * Security Commands - Command pattern implementation for extensible security checks
 * Each security check is encapsulated as a command for better modularity
 */

import { SecurityResult, SecurityResultBuilder, RiskAnalysisBuilder } from './security-result'
import { SecurityConfig } from './security-config'
import { ClientBanManager } from './client-ban-manager'
import { AIWarningManager } from './ai-warning-manager'
import { RefactoredValidationService } from '../validation'
import { RateLimitMiddleware } from '../rate-limiter'
import { log } from '@/lib/logger'

/**
 * Base interface for all security commands
 */
export interface SecurityCommand {
  name: string
  description: string
  execute(context: SecurityContext): Promise<SecurityResult>
  canHandle(context: SecurityContext): boolean
  priority: number // Lower number = higher priority
}

/**
 * Security context passed to commands
 */
export interface SecurityContext {
  sessionId: string
  message: string
  request?: Request
  metadata?: Record<string, unknown>
  previousResults?: SecurityResult[]
}

// Legacy warning tracking removed - now using AIWarningManager for all warning management

/**
 * Ban Check Command - Checks if user is currently banned
 */
export class BanCheckCommand implements SecurityCommand {
  name = 'ban-check'
  description = 'Check if user is currently banned'
  priority = 1 // Highest priority

  canHandle(_context: SecurityContext): boolean {
    return typeof window !== 'undefined' // Only run in browser
  }

  async execute(_context: SecurityContext): Promise<SecurityResult> {
    if (ClientBanManager.isBanned()) {
      return SecurityResultBuilder
        .createBanned(SecurityConfig.getWarningConfig().BAN_SCORE)
        .setReason('User is currently banned')
        .addMetadata('banCheck', true)
        .build()
    }

    return SecurityResultBuilder
      .createClean()
      .addMetadata('banCheck', false)
      .build()
  }
}

/**
 * Troll Detection Command - Detects troll behavior patterns
 * NOTE: Warnings are now controlled by AI through AIWarningManager
 * This command only detects patterns and logs suspicious behavior
 */
export class TrollDetectionCommand implements SecurityCommand {
  name = 'troll-detection'
  description = 'Detect troll behavior patterns (AI controls warnings)'
  priority = 2

  canHandle(_context: SecurityContext): boolean {
    return true // Always applicable
  }

  async execute(context: SecurityContext): Promise<SecurityResult> {
    const patterns = SecurityConfig.getTrollPatterns()
    const lowerMessage = context.message.toLowerCase()
    
    let detectedPatterns: string[] = []
    let patternScore = 0

    // Check for troll patterns
    patterns.forEach((pattern, index) => {
      if (pattern.test(lowerMessage)) {
        detectedPatterns.push(`TROLL_${index}`)
        patternScore += 0.3
      }
    })

    // If no troll behavior detected, return clean
    if (detectedPatterns.length === 0) {
      return SecurityResultBuilder
        .createClean()
        .addMetadata('trollCheck', false)
        .build()
    }

    // Troll behavior detected - LOG ONLY, let AI handle warnings
    const warningCount = AIWarningManager.getWarningCount(context.sessionId)
    
    log.security('Troll patterns detected - AI should handle', { sessionId: context.sessionId }, {
      patterns: detectedPatterns,
      currentAIWarnings: warningCount,
      message: context.message.substring(0, 100),
      note: 'AI should trigger appropriate warning/ban response'
    })

    // Return suspicious result with risk analysis for AI to consider
    // DO NOT issue warnings directly - let AI control the flow
    return SecurityResultBuilder
      .createSuspicious(patternScore)
      .setReason(`Troll patterns detected: ${detectedPatterns.join(', ')}`)
      .setRiskAnalysis(
        RiskAnalysisBuilder
          .createMediumRisk(patternScore, detectedPatterns)
          .build()
      )
      .addMetadata('aiWarningCount', warningCount)
      .addMetadata('patterns', detectedPatterns)
      .addMetadata('aiShouldHandle', true)
      .build()
  }
}

/**
 * Content Validation Command - Validates message content using ValidationMiddleware
 */
export class ContentValidationCommand implements SecurityCommand {
  name = 'content-validation'
  description = 'Validate message content for security risks'
  priority = 3

  canHandle(_context: SecurityContext): boolean {
    return true // Always applicable
  }

  async execute(context: SecurityContext): Promise<SecurityResult> {
    try {
      const validationResult = await RefactoredValidationService.validateChatMessage({
        message: context.message,
        sessionId: context.sessionId
      })

      if (!validationResult.success) {
        const config = SecurityConfig.getWarningConfig()
        return SecurityResultBuilder
          .createBanned(config.BAN_SCORE)
          .setReason(`Content validation failed: ${validationResult.errors.join(', ')}`)
          .addMetadata('validationErrors', validationResult.errors)
          .build()
      }

      // Create result based on risk analysis
      const riskAnalysis = validationResult.securityAnalysis
      if (!riskAnalysis) {
        return SecurityResultBuilder
          .createClean()
          .addMetadata('contentValidation', true)
          .build()
      }

      // Convert risk analysis to security result
      if (riskAnalysis.level === 'high') {
        return SecurityResultBuilder
          .createBanned(riskAnalysis.score)
          .setReason('High-risk content detected')
          .setRiskAnalysis(riskAnalysis)
          .build()
      }

      if (riskAnalysis.level === 'medium') {
        return SecurityResultBuilder
          .createSuspicious(riskAnalysis.score)
          .setReason('Content flagged for review')
          .setRiskAnalysis(riskAnalysis)
          .build()
      }

      return SecurityResultBuilder
        .createClean()
        .setScore(riskAnalysis.score)
        .setRiskAnalysis(riskAnalysis)
        .addMetadata('contentValidation', true)
        .build()

    } catch (error) {
      log.error('Content validation failed', { sessionId: context.sessionId }, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      const config = SecurityConfig.getWarningConfig()
      return SecurityResultBuilder
        .createBanned(config.BAN_SCORE)
        .setReason('Content validation error')
        .addMetadata('validationError', true)
        .build()
    }
  }
}

/**
 * Rate Limit Command - Checks rate limiting with integrated monitoring
 */
export class RateLimitCommand implements SecurityCommand {
  name = 'rate-limit'
  description = 'Check rate limiting and monitor suspicious activity'
  priority = 4

  canHandle(context: SecurityContext): boolean {
    return context.request !== undefined
  }

  async execute(context: SecurityContext): Promise<SecurityResult> {
    if (!context.request) {
      // Skip if no request available
      return SecurityResultBuilder
        .createClean()
        .addMetadata('rateLimitSkipped', true)
        .build()
    }

    try {
      const rateLimitResult = await RateLimitMiddleware.checkChatRequest(
        context.request,
        context.sessionId,
        context.message
      )

      if (!rateLimitResult.allowed) {
        const config = SecurityConfig.getWarningConfig()
        return SecurityResultBuilder
          .createBanned(config.BAN_SCORE)
          .setReason(`Rate limit exceeded: ${rateLimitResult.result.reason}`)
          .addMetadata('rateLimitResult', rateLimitResult.result)
          .build()
      }

      // Log suspicious activity if detected
      if (rateLimitResult.suspicious) {
        log.security('Suspicious chat activity detected', { sessionId: context.sessionId }, {
          message: context.message.substring(0, 100),
          rateLimitData: rateLimitResult.result
        })
      }

      return SecurityResultBuilder
        .createClean()
        .addMetadata('rateLimitPassed', true)
        .addMetadata('suspicious', rateLimitResult.suspicious)
        .build()

    } catch (error) {
      log.error('Rate limit check failed', { sessionId: context.sessionId }, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      const config = SecurityConfig.getWarningConfig()
      return SecurityResultBuilder
        .createBanned(config.BAN_SCORE)
        .setReason('Rate limit check error')
        .addMetadata('rateLimitError', true)
        .build()
    }
  }
}

/**
 * Security Command Executor - Orchestrates security command execution
 */
export class SecurityCommandExecutor {
  private commands: SecurityCommand[] = []

  constructor() {
    // Register default commands
    this.registerCommand(new BanCheckCommand())
    this.registerCommand(new TrollDetectionCommand())
    this.registerCommand(new ContentValidationCommand())
    this.registerCommand(new RateLimitCommand())
  }

  /**
   * Register a new security command
   */
  registerCommand(command: SecurityCommand): void {
    this.commands.push(command)
    // Sort by priority (lower number = higher priority)
    this.commands.sort((a, b) => a.priority - b.priority)
  }

  /**
   * Remove a security command
   */
  unregisterCommand(commandName: string): boolean {
    const index = this.commands.findIndex(cmd => cmd.name === commandName)
    if (index >= 0) {
      this.commands.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Execute all applicable security commands
   */
  async executeSecurityChecks(context: SecurityContext): Promise<SecurityResult[]> {
    const results: SecurityResult[] = []
    
    for (const command of this.commands) {
      if (command.canHandle(context)) {
        try {
          const result = await command.execute(context)
          results.push(result)
          
          // Stop on first ban result for efficiency
          if (!result.isAllowed) {
            break
          }
        } catch (error) {
          log.error(`Security command ${command.name} failed`, 
            { sessionId: context.sessionId }, 
            { error: error instanceof Error ? error.message : 'Unknown error' }
          )
          
          // Create error result
          const config = SecurityConfig.getWarningConfig()
          results.push(
            SecurityResultBuilder
              .createBanned(config.BAN_SCORE)
              .setReason(`Security command ${command.name} failed`)
              .addMetadata('commandError', command.name)
              .build()
          )
          break
        }
      }
    }

    return results
  }

  /**
   * Get warning count for session - now using AIWarningManager
   */
  getWarningCount(sessionId: string): number {
    return AIWarningManager.getWarningCount(sessionId)
  }

  /**
   * Clear warnings for session - now using AIWarningManager
   */
  clearWarnings(sessionId: string): void {
    AIWarningManager.clearWarnings(sessionId)
  }

  /**
   * Get list of registered commands
   */
  getRegisteredCommands(): Readonly<SecurityCommand[]> {
    return [...this.commands]
  }
}

export default SecurityCommandExecutor