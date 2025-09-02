/**
 * Refactored Validation Service - Modern modular validation system
 * Orchestrates all validation components with performance optimization
 */

import { SecurityPatternMatcher, PatternMatchResult } from './security-pattern-matcher'
import { InputSanitizer, SanitizationResult } from './input-sanitizer'
import { DataValidator, ValidationResult, ValidationContext } from './data-validator'
import { ContactValidator } from './contact-validator'
import { ContactInfo } from '@/types/chatbot'
import { LanguageDetector, LanguageAnalysis } from './language-detector'
import { ValidationCacheManager } from './validation-cache'
import { log } from '@/lib/logger'

export interface ValidationServiceConfig {
  enableCaching: boolean
  enableSecurityAnalysis: boolean
  enableLanguageDetection: boolean
  strictMode: boolean
  cacheConfig?: {
    securityTTL?: number
    sanitizationTTL?: number
    validationTTL?: number
  }
}

export interface ComprehensiveValidationResult {
  success: boolean
  data?: ContactInfo | { message?: string; sessionId?: string; browserId?: string }
  errors: string[]
  warnings: string[]
  sanitized?: ContactInfo | { message?: string; [key: string]: unknown }
  securityAnalysis?: PatternMatchResult
  languageAnalysis?: LanguageAnalysis
  validationType: string
  performance: {
    duration: number
    cacheHit: boolean
  }
  metadata?: Record<string, unknown>
}

/**
 * Modern Validation Service with modular architecture
 */
export class RefactoredValidationService {
  private static config: ValidationServiceConfig = {
    enableCaching: true,
    enableSecurityAnalysis: true,
    enableLanguageDetection: true,
    strictMode: false,
    cacheConfig: {
      securityTTL: 10 * 60 * 1000, // 10 minutes
      sanitizationTTL: 5 * 60 * 1000, // 5 minutes
      validationTTL: 5 * 60 * 1000 // 5 minutes
    }
  }

  /**
   * Configure the validation service
   */
  static configure(newConfig: Partial<ValidationServiceConfig>): void {
    this.config = { ...this.config, ...newConfig }
    log.info('Validation service configured', {}, { config: this.config })
  }

  /**
   * Comprehensive chat message validation with all security checks
   */
  static async validateChatMessage(
    rawData: Record<string, unknown>,
    sessionId?: string
  ): Promise<ComprehensiveValidationResult> {
    const startTime = Date.now()
    const validationId = `chat_${sessionId}_${Date.now()}`

    try {
      // Check cache first
      let cacheHit = false
      if (this.config.enableCaching && rawData['message']) {
        const cached = this.getCachedResult('chat', rawData['message'] as string)
        if (cached) {
          cacheHit = true
          return {
            ...cached,
            performance: {
              duration: Date.now() - startTime,
              cacheHit: true
            }
          }
        }
      }

      const context: ValidationContext = {
        strictMode: this.config.strictMode
      }

      if (sessionId) {
        context.sessionId = sessionId
      }

      // Sanitization
      const sanitizationResult = InputSanitizer.sanitizeChatMessage((rawData['message'] as string) || '')
      
      // Security analysis
      let securityAnalysis: PatternMatchResult | undefined
      if (this.config.enableSecurityAnalysis) {
        securityAnalysis = SecurityPatternMatcher.analyzeText(sanitizationResult.sanitized)
      }

      // Language analysis
      let languageAnalysis: LanguageAnalysis | undefined
      if (this.config.enableLanguageDetection) {
        languageAnalysis = LanguageDetector.analyzeLanguage(sanitizationResult.sanitized)
      }

      // Core validation
      const validationResult = await DataValidator.validateChatMessage({
        message: sanitizationResult.sanitized,
        sessionId: rawData['sessionId'] as string,
        browserId: rawData['browserId'] as string | undefined
      }, context)

      // Combine results
      const result = this.combineValidationResults(
        validationResult,
        sanitizationResult,
        securityAnalysis,
        languageAnalysis,
        'chatMessage',
        startTime,
        cacheHit
      )

      // Cache successful results
      const messageKey = rawData['message'] as string
      if (this.config.enableCaching && result.success && messageKey) {
        this.cacheResult('chat', messageKey, result)
      }

      return result

    } catch (error) {
      log.error('Chat message validation failed', {}, {
        validationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      } as any)

      return {
        success: false,
        errors: ['Erreur de validation du message'],
        warnings: [],
        validationType: 'chatMessage',
        performance: {
          duration: Date.now() - startTime,
          cacheHit: false
        },
        metadata: {
          validationId,
          error: true
        }
      }
    }
  }

  /**
   * Comprehensive contact information validation
   */
  static async validateContactInfo(
    rawData: Record<string, unknown>,
    config?: { 
      requireAll?: boolean
      businessContext?: boolean 
    }
  ): Promise<ComprehensiveValidationResult> {
    const startTime = Date.now()
    const validationId = `contact_${Date.now()}`

    try {
      // Check cache
      let cacheHit = false
      if (this.config.enableCaching) {
        const cacheKey = JSON.stringify(rawData)
        const cached = this.getCachedResult('contact', cacheKey)
        if (cached) {
          cacheHit = true
          return {
            ...cached,
            performance: {
              duration: Date.now() - startTime,
              cacheHit: true
            }
          }
        }
      }

      // Enhanced contact validation
      const contactResult = await ContactValidator.validateContactInfo(rawData, {
        requireName: config?.requireAll || false,
        requireContact: config?.requireAll || false,
        requireProblem: config?.requireAll || false,
        businessContextRequired: config?.businessContext || false,
        allowPartialInfo: !config?.requireAll,
        frenchValidation: this.config.enableLanguageDetection
      })

      // Language analysis for problematique
      let languageAnalysis: LanguageAnalysis | undefined
      const problematique = rawData['problematique'] as string
      if (this.config.enableLanguageDetection && problematique) {
        languageAnalysis = LanguageDetector.analyzeLanguage(problematique)
      }

      // Security analysis for text fields
      let securityAnalysis: PatternMatchResult | undefined
      if (this.config.enableSecurityAnalysis && problematique) {
        securityAnalysis = SecurityPatternMatcher.analyzeText(problematique)
      }

      const result: ComprehensiveValidationResult = {
        success: contactResult.success,
        errors: contactResult.errors,
        warnings: contactResult.recommendations || [],
        validationType: 'contactInfo',
        performance: {
          duration: Date.now() - startTime,
          cacheHit
        },
        metadata: {
          validationId,
          completeness: contactResult.completeness,
          businessRelevance: contactResult.businessRelevance,
          contactMethod: contactResult.contactMethod
        }
      }

      if (contactResult.data) {
        result.data = contactResult.data
      }

      if (contactResult.sanitized) {
        result.sanitized = contactResult.sanitized
      }

      if (securityAnalysis) {
        result.securityAnalysis = securityAnalysis
      }

      if (languageAnalysis) {
        result.languageAnalysis = languageAnalysis
      }

      // Cache result
      if (this.config.enableCaching && result.success) {
        const cacheKey = JSON.stringify(rawData)
        this.cacheResult('contact', cacheKey, result)
      }

      return result

    } catch (error) {
      log.error('Contact validation failed', {}, {
        validationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      } as any)

      return {
        success: false,
        errors: ['Erreur de validation des informations de contact'],
        warnings: [],
        validationType: 'contactInfo',
        performance: {
          duration: Date.now() - startTime,
          cacheHit: false
        },
        metadata: {
          validationId,
          error: true
        }
      }
    }
  }

  /**
   * Security-focused text analysis
   */
  static analyzeTextSecurity(text: string): PatternMatchResult & {
    sanitizationNeeded: boolean
    recommendations: string[]
  } {
    const securityAnalysis = SecurityPatternMatcher.analyzeText(text)
    const sanitizationResult = InputSanitizer.sanitizeChatMessage(text)
    
    const recommendations: string[] = []
    
    if (securityAnalysis.level === 'high') {
      recommendations.push('Contenu bloqué pour des raisons de sécurité')
    } else if (securityAnalysis.level === 'medium') {
      recommendations.push('Contenu signalé pour révision')
    }

    if (sanitizationResult.changed) {
      recommendations.push('Le contenu a été modifié pour des raisons de sécurité')
    }

    return {
      ...securityAnalysis,
      sanitizationNeeded: sanitizationResult.changed,
      recommendations
    }
  }

  /**
   * Batch validation for multiple inputs
   */
  static async validateBatch(
    inputs: Array<{
      data: Record<string, unknown>
      type: 'chat' | 'contact'
      sessionId?: string
    }>
  ): Promise<ComprehensiveValidationResult[]> {
    const results = await Promise.all(
      inputs.map(async input => {
        switch (input.type) {
          case 'chat':
            return this.validateChatMessage(input.data, input.sessionId)
          case 'contact':
            return this.validateContactInfo(input.data)
          default:
            throw new Error(`Unknown validation type: ${input.type}`)
        }
      })
    )

    return results
  }

  /**
   * Get validation service statistics
   */
  static getServiceStats(): {
    config: ValidationServiceConfig
    cacheStats: Record<string, unknown>
    performance: {
      avgValidationTime: number
      successRate: number
    }
    moduleStats: {
      securityPatterns: Record<string, unknown>
      sanitizer: Record<string, unknown>
      validator: Record<string, unknown>
    }
  } {
    const cacheStats = ValidationCacheManager.getCombinedStats()
    
    return {
      config: this.config,
      cacheStats,
      performance: {
        avgValidationTime: cacheStats.totalEntries > 0 ? 50 : 0, // Placeholder
        successRate: 0.95 // Placeholder
      },
      moduleStats: {
        securityPatterns: SecurityPatternMatcher.getCacheStats(),
        sanitizer: InputSanitizer.performanceTest(100),
        validator: DataValidator.getValidationStats()
      }
    }
  }

  /**
   * Cleanup validation service resources
   */
  static cleanup(): void {
    ValidationCacheManager.cleanupAll()
    SecurityPatternMatcher.clearExpiredCache()
    log.info('Validation service cleanup completed')
  }

  /**
   * Test validation service performance
   */
  static async performanceTest(iterations: number = 100): Promise<{
    chatValidation: { avgTime: number; successRate: number }
    contactValidation: { avgTime: number; successRate: number }
    securityAnalysis: { avgTime: number; accuracy: number }
    cacheEfficiency: number
  }> {
    const testData = {
      chat: { message: 'Test message for validation', sessionId: 'test-session' },
      contact: { nom: 'Test User', email: 'test@example.com', problematique: 'Test problem description' }
    }

    // Chat validation test
    const chatStart = Date.now()
    let chatSuccess = 0
    for (let i = 0; i < iterations; i++) {
      const result = await this.validateChatMessage(testData.chat)
      if (result.success) chatSuccess++
    }
    const chatAvgTime = (Date.now() - chatStart) / iterations

    // Contact validation test
    const contactStart = Date.now()
    let contactSuccess = 0
    for (let i = 0; i < iterations; i++) {
      const result = await this.validateContactInfo(testData.contact)
      if (result.success) contactSuccess++
    }
    const contactAvgTime = (Date.now() - contactStart) / iterations

    // Security analysis test
    const securityTest = SecurityPatternMatcher.performanceTest(iterations)

    // Cache efficiency
    const cacheStats = ValidationCacheManager.getCombinedStats()
    const cacheEfficiency = cacheStats.avgHitRatio

    return {
      chatValidation: {
        avgTime: chatAvgTime,
        successRate: chatSuccess / iterations
      },
      contactValidation: {
        avgTime: contactAvgTime,
        successRate: contactSuccess / iterations
      },
      securityAnalysis: {
        avgTime: securityTest.averageTime,
        accuracy: securityTest.patternCoverage / 100
      },
      cacheEfficiency
    }
  }

  // Private helper methods

  private static combineValidationResults(
    validationResult: ValidationResult,
    sanitizationResult: SanitizationResult,
    securityAnalysis: PatternMatchResult | undefined,
    languageAnalysis: LanguageAnalysis | undefined,
    validationType: string,
    startTime: number,
    cacheHit: boolean
  ): ComprehensiveValidationResult {
    const warnings: string[] = []

    // Add sanitization warnings
    if (sanitizationResult.changed) {
      warnings.push('Le contenu a été modifié pour des raisons de sécurité')
    }

    // Add security warnings
    if (securityAnalysis && securityAnalysis.level === 'medium') {
      warnings.push('Contenu signalé pour révision de sécurité')
    }

    // Add language warnings
    if (languageAnalysis && !languageAnalysis.isFrench && languageAnalysis.confidence > 0.7) {
      warnings.push('Le texte ne semble pas être en français')
    }

    const result: ComprehensiveValidationResult = {
      success: validationResult.success,
      errors: validationResult.errors,
      warnings,
      validationType,
      performance: {
        duration: Date.now() - startTime,
        cacheHit
      },
      metadata: {
        ...validationResult.metadata,
        sanitizationChanged: sanitizationResult.changed,
        securityLevel: securityAnalysis?.level,
        languageConfidence: languageAnalysis?.confidence
      }
    }

    if (validationResult.data) {
      result.data = validationResult.data
    }

    if (validationResult.sanitized) {
      result.sanitized = validationResult.sanitized
    }

    if (securityAnalysis) {
      result.securityAnalysis = securityAnalysis
    }

    if (languageAnalysis) {
      result.languageAnalysis = languageAnalysis
    }

    return result
  }

  private static getCachedResult(type: string, key: string): ComprehensiveValidationResult | null {
    const cache = ValidationCacheManager.getCache<ComprehensiveValidationResult>(type)
    return cache.get(key)
  }

  private static cacheResult(type: string, key: string, result: ComprehensiveValidationResult): void {
    const cache = ValidationCacheManager.getCache(type)
    const ttl = this.config.cacheConfig?.validationTTL || 5 * 60 * 1000
    cache.set(key, result, ttl)
  }
}

export default RefactoredValidationService