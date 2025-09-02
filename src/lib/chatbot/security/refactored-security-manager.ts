/**
 * Refactored Security Manager - Modern command-pattern based security system
 * Uses composition over monolithic methods for better extensibility and testing
 */

import { SecurityResult, SecurityResultUtils } from './security-result'
import { SecurityConfig } from './security-config'
import { SecurityCommandExecutor, SecurityContext, SecurityCommand } from './security-commands'
import { log } from '@/lib/logger'

/**
 * Enhanced Security Manager with command pattern and improved modularity
 */
export class RefactoredSecurityManager {
  private static executor = new SecurityCommandExecutor()

  /**
   * Main security check method - orchestrates all security validations using command pattern
   */
  static async checkUserSecurity(
    sessionId: string,
    message: string,
    request?: Request,
    metadata?: Record<string, unknown>
  ): Promise<SecurityResult> {
    try {
      // Validate configuration on first use
      if (!SecurityConfig.validateConfig()) {
        log.error('Security configuration validation failed')
        return this.createFailsafeResult('Security configuration invalid')
      }

      // Create security context
      const context: SecurityContext = {
        sessionId,
        message
      }
      
      // Ajouter les propriétés optionnelles seulement si elles existent
      if (request) {
        context.request = request
      }
      
      if (metadata) {
        context.metadata = metadata
      }

      // Execute all security commands
      const results = await this.executor.executeSecurityChecks(context)

      // Process and merge results
      return this.processSecurityResults(results, context)

    } catch (error) {
      log.error('Security check system failure', { sessionId }, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return this.createFailsafeResult('Security system error')
    }
  }

  /**
   * Process multiple security results and return final decision
   */
  private static processSecurityResults(
    results: SecurityResult[],
    context: SecurityContext
  ): SecurityResult {
    if (results.length === 0) {
      log.warn('No security results generated', { sessionId: context.sessionId })
      return this.createFailsafeResult('No security checks completed')
    }

    // If any result is blocked, return the first blocked result
    const blockedResult = results.find(result => SecurityResultUtils.isBlocked(result))
    if (blockedResult) {
      log.security('Security violation detected', { sessionId: context.sessionId }, {
        level: blockedResult.level,
        reason: blockedResult.reason,
        score: blockedResult.score
      })
      return blockedResult
    }

    // If any warnings, merge them
    const warningResults = results.filter(result => SecurityResultUtils.isWarning(result))
    if (warningResults.length > 0) {
      const mergedWarning = SecurityResultUtils.mergeResults(warningResults)
      log.security('Security warning issued', { sessionId: context.sessionId }, {
        level: mergedWarning.level,
        reason: mergedWarning.reason,
        warnings: warningResults.length
      })
      return mergedWarning
    }

    // All checks passed - merge clean results
    const finalResult = SecurityResultUtils.mergeResults(results)
    
    log.debug('Security checks passed', { sessionId: context.sessionId }, {
      checksCount: results.length,
      finalScore: finalResult.score
    })

    return finalResult
  }

  /**
   * Create failsafe result for system errors
   */
  private static createFailsafeResult(reason: string): SecurityResult {
    const config = SecurityConfig.getWarningConfig()
    return {
      isAllowed: false,
      level: 'banned',
      score: config.BAN_SCORE,
      action: 'ban',
      reason,
      timestamp: Date.now(),
      metadata: {
        failsafe: true,
        systemError: true
      }
    }
  }

  /**
   * Get security statistics for monitoring
   */
  static getSecurityStats(sessionId: string): {
    warningCount: number
    commands: string[]
    configValid: boolean
  } {
    return {
      warningCount: this.executor.getWarningCount(sessionId),
      commands: this.executor.getRegisteredCommands().map(cmd => cmd.name),
      configValid: SecurityConfig.validateConfig()
    }
  }

  /**
   * Register custom security command
   */
  static registerSecurityCommand(command: SecurityCommand): void {
    this.executor.registerCommand(command)
    log.info('Custom security command registered', {}, { commandName: command.name })
  }

  /**
   * Unregister security command
   */
  static unregisterSecurityCommand(commandName: string): boolean {
    const result = this.executor.unregisterCommand(commandName)
    if (result) {
      log.info('Security command unregistered', {}, { commandName })
    }
    return result
  }

  /**
   * Cleanup user session data
   */
  static cleanupUser(sessionId: string): void {
    this.executor.clearWarnings(sessionId)
    log.debug('Security cleanup completed', { sessionId })
  }

  /**
   * Get current warning count for a session
   */
  static getWarningCount(sessionId: string): number {
    return this.executor.getWarningCount(sessionId)
  }

  /**
   * Clear warnings for a session
   */
  static clearWarnings(sessionId: string): void {
    this.executor.clearWarnings(sessionId)
    log.debug('Warnings cleared for session', { sessionId })
  }

  /**
   * Validate security configuration
   */
  static validateConfiguration(): boolean {
    return SecurityConfig.validateConfig()
  }

  /**
   * Get current security configuration
   */
  static getConfiguration(): {
    warnings: Record<string, unknown>
    thresholds: Record<string, unknown>
    patterns: { count: number }
  } {
    return {
      warnings: SecurityConfig.getWarningConfig() as unknown as Record<string, unknown>,
      thresholds: SecurityConfig.getRiskThresholds() as unknown as Record<string, unknown>,
      patterns: {
        count: SecurityConfig.getTrollPatterns().length
      }
    }
  }

  /**
   * Test security system with sample input
   */
  static async testSecuritySystem(sessionId: string = 'test-session'): Promise<{
    passed: boolean
    results: Array<{
      input: string
      expected: string
      actual: string
      passed: boolean
    }>
    errors: string[]
  }> {
    const testCases = [
      { message: 'Hello, I need help with my presentation', expected: 'clean' },
      { message: 'météo test bot', expected: 'warning' },
      { message: '<script>alert("xss")</script>', expected: 'banned' }
    ]

    const results: Array<{
      input: string
      expected: string
      actual: string
      passed: boolean
    }> = []
    const errors: string[] = []

    for (const testCase of testCases) {
      try {
        const result = await this.checkUserSecurity(sessionId, testCase.message)
        results.push({
          input: testCase.message,
          expected: testCase.expected,
          actual: result.level,
          passed: result.level === testCase.expected
        })
      } catch (error) {
        errors.push(`Test failed for "${testCase.message}": ${error}`)
      }
    }

    const passed = results.every(r => r.passed) && errors.length === 0

    return { passed, results, errors }
  }
}

export default RefactoredSecurityManager