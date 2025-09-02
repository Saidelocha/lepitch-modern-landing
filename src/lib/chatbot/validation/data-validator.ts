/**
 * Data Validator - Zod schema validation with enhanced error handling
 * Centralized validation logic for all data types with detailed reporting
 */

import { z } from 'zod'
import { SecurityPatternMatcher } from './security-pattern-matcher'
import { InputSanitizer } from './input-sanitizer'
import { 
  ValidationRiskAnalysis, 
  ValidationCustomRules, 
  SanitizedContactInfo, 
  ChatMessageData
} from '@/types/chatbot'

export interface ValidationResult<T = unknown> {
  success: boolean
  data?: T
  errors: string[]
  sanitized?: T
  riskAnalysis?: ValidationRiskAnalysis
  metadata?: Record<string, string | number | boolean | string[]>
}

export interface ValidationContext {
  sessionId?: string
  skipSanitization?: boolean
  strictMode?: boolean
  customRules?: ValidationCustomRules
}

/**
 * Enhanced Data Validator with security integration
 */
export class DataValidator {
  // Core validation schemas
  private static readonly schemas = {
    sessionId: z.string()
      .min(1, 'Session ID requis')
      .max(100, 'Session ID trop long')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Session ID contient des caractères non autorisés'),

    browserId: z.string()
      .max(200, 'Browser ID trop long')
      .regex(/^[a-zA-Z0-9._-]*$/, 'Browser ID contient des caractères non autorisés')
      .optional(),

    name: z.string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères non autorisés'),

    email: z.string()
      .email('Format d\'email invalide')
      .max(254, 'Email trop long'),

    phone: z.string()
      .regex(/^(\+33|0)[1-9](\d{8}|\s\d{2}\s\d{2}\s\d{2}\s\d{2})$/, 'Format de téléphone invalide'),

    message: z.string()
      .min(1, 'Le message ne peut pas être vide')
      .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),

    longText: z.string()
      .min(10, 'Le texte doit contenir au moins 10 caractères')
      .max(2000, 'Le texte ne peut pas dépasser 2000 caractères')
  }

  /**
   * Validate chat message with security analysis
   */
  static async validateChatMessage(
    rawData: Record<string, unknown>,
    context: ValidationContext = {}
  ): Promise<ValidationResult<ChatMessageData>> {
    try {
      // Pre-sanitization
      const messageValue = rawData['message']
      const sessionIdValue = rawData['sessionId']
      const browserIdValue = rawData['browserId']
      
      const preSanitized = {
        message: typeof messageValue === 'string' ? this.sanitizeInput(messageValue, 'message', context) : '',
        sessionId: typeof sessionIdValue === 'string' ? this.sanitizeInput(sessionIdValue, 'sessionId', context) : '',
        browserId: typeof browserIdValue === 'string' ? this.sanitizeInput(browserIdValue, 'browserId', context) : undefined
      }

      // Security risk analysis
      const riskAnalysis = SecurityPatternMatcher.analyzeText(preSanitized.message)

      // Create dynamic schema with security check
      const messageSchema = this.schemas.message.refine(
        (_msg) => {
          if (context.strictMode) {
            return riskAnalysis.level !== 'high' && riskAnalysis.level !== 'medium'
          }
          return riskAnalysis.level !== 'high'
        },
        {
          message: 'Message bloqué pour des raisons de sécurité'
        }
      )

      const chatSchema = z.object({
        message: messageSchema,
        sessionId: this.schemas.sessionId,
        browserId: this.schemas.browserId
      })

      // Validate with schema
      const validatedData = chatSchema.parse(preSanitized)

      return {
        success: true,
        data: validatedData,
        errors: [],
        sanitized: validatedData,
        riskAnalysis: {
          level: riskAnalysis.level,
          score: riskAnalysis.score,
          patterns: riskAnalysis.patterns,
          allowWithWarning: riskAnalysis.allowWithWarning
        },
        metadata: {
          validationType: 'chatMessage',
          securityChecked: true,
          sanitized: true
        }
      }

    } catch (error) {
      return this.handleValidationError(error, rawData, 'chatMessage') as ValidationResult<ChatMessageData>
    }
  }

  /**
   * Validate contact information
   */
  static async validateContactInfo(
    rawData: Record<string, unknown>,
    context: ValidationContext = {}
  ): Promise<ValidationResult<SanitizedContactInfo>> {
    try {
      const preSanitized: SanitizedContactInfo = {}
      const validationErrors: string[] = []

      // Validate and sanitize each field
      const nomValue = rawData['nom']
      if (nomValue && typeof nomValue === 'string') {
        const nameResult = this.validateField(nomValue, 'name', context)
        if (!nameResult.success) {
          validationErrors.push(...nameResult.errors)
        } else if (nameResult.data) {
          preSanitized.nom = nameResult.data
        }
      }

      const emailValue = rawData['email']
      if (emailValue && typeof emailValue === 'string') {
        const emailResult = this.validateField(emailValue, 'email', context)
        if (!emailResult.success) {
          validationErrors.push(...emailResult.errors)
        } else if (emailResult.data) {
          // Additional email validation
          if (this.isDisposableEmail(emailResult.data)) {
            validationErrors.push('Les emails temporaires ne sont pas autorisés')
          } else {
            preSanitized.email = emailResult.data
          }
        }
      }

      const telephoneValue = rawData['telephone']
      if (telephoneValue && typeof telephoneValue === 'string') {
        const phoneResult = this.validateField(telephoneValue, 'phone', context)
        if (!phoneResult.success) {
          validationErrors.push(...phoneResult.errors)
        } else if (phoneResult.data) {
          preSanitized.telephone = this.normalizePhone(phoneResult.data)
        }
      }

      const problematiqueValue = rawData['problematique']
      if (problematiqueValue && typeof problematiqueValue === 'string') {
        const textResult = this.validateField(problematiqueValue, 'longText', context)
        if (!textResult.success) {
          validationErrors.push(...textResult.errors)
        } else if (textResult.data) {
          // Check for profanity
          if (this.containsProfanity(textResult.data)) {
            validationErrors.push('Le contenu contient des mots inappropriés')
          } else {
            preSanitized.problematique = textResult.data
          }
        }
      }

      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
          sanitized: preSanitized
        }
      }

      return {
        success: true,
        data: preSanitized,
        errors: [],
        sanitized: preSanitized,
        metadata: {
          validationType: 'contactInfo',
          fieldsValidated: Object.keys(preSanitized)
        }
      }

    } catch (error) {
      return this.handleValidationError(error, rawData, 'contactInfo') as ValidationResult<SanitizedContactInfo>
    }
  }

  /**
   * Validate a single field with specific schema
   */
  static validateField(
    value: unknown,
    fieldType: keyof typeof DataValidator.schemas,
    context: ValidationContext = {}
  ): ValidationResult<string | undefined> {
    try {
      const schema = this.schemas[fieldType]
      if (!schema) {
        return {
          success: false,
          errors: [`Unknown field type: ${fieldType}`]
        }
      }

      // Sanitize input if not skipped
      let sanitized = value
      if (!context.skipSanitization && typeof value === 'string') {
        sanitized = this.sanitizeInput(value, fieldType, context)
      }

      // Apply custom rules if provided
      if (context.customRules && context.customRules[fieldType]) {
        const customValid = context.customRules[fieldType](sanitized)
        if (!customValid) {
          return {
            success: false,
            errors: [`Custom validation failed for ${fieldType}`]
          }
        }
      }

      const validatedData = schema.parse(sanitized)

      return {
        success: true,
        data: validatedData,
        errors: [],
        sanitized: validatedData,
        metadata: {
          fieldType,
          customRuleApplied: !!(context.customRules && context.customRules[fieldType])
        }
      }

    } catch (error) {
      return this.handleValidationError(error, value, fieldType as string) as ValidationResult<string>
    }
  }

  /**
   * Batch validate multiple fields
   */
  static validateBatch(
    fields: Array<{ value: unknown; type: keyof typeof DataValidator.schemas; name?: string }>,
    context: ValidationContext = {}
  ): ValidationResult<Record<string, string> | undefined> {
    const results: Record<string, string> = {}
    const errors: string[] = []

    fields.forEach(field => {
      const result = this.validateField(field.value, field.type, context)
      const fieldName = field.name || field.type

      if (result.success && result.data) {
        results[fieldName] = result.data
      } else {
        errors.push(`${fieldName}: ${result.errors.join(', ')}`)
      }
    })

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? results : undefined,
      errors,
      metadata: {
        validationType: 'batch',
        fieldsCount: fields.length,
        successCount: Object.keys(results).length
      }
    }
  }

  /**
   * Sanitize input based on field type
   */
  private static sanitizeInput(
    value: string,
    fieldType: string,
    context: ValidationContext
  ): string {
    if (context.skipSanitization) return value

    switch (fieldType) {
      case 'message':
      case 'longText':
        return InputSanitizer.sanitizeChatMessage(value).sanitized
      case 'name':
      case 'email':
      case 'phone':
        return InputSanitizer.sanitizeContactInfo(value).sanitized
      case 'sessionId':
      case 'browserId':
        return InputSanitizer.sanitizeStrict(value).sanitized
      default:
        return InputSanitizer.sanitizeChatMessage(value).sanitized
    }
  }

  /**
   * Check if email domain is disposable
   */
  private static isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com', 'guerrillamail.com', 'tempmail.org',
      'throwaway.email', 'temp-mail.org', 'mailinator.com',
      'getairmail.com', 'tmpeml.com'
    ]

    const domain = email.split('@')[1]?.toLowerCase()
    return domain ? disposableDomains.includes(domain) : false
  }

  /**
   * Check for profanity in text
   */
  private static containsProfanity(text: string): boolean {
    const profanityList = [
      'connard', 'salope', 'enculé', 'pute', 'merde',
      'fuck', 'shit', 'bitch', 'asshole'
    ]

    const lowerText = text.toLowerCase()
    return profanityList.some(word => lowerText.includes(word))
  }

  /**
   * Normalize phone number format
   */
  private static normalizePhone(phone: string): string {
    return phone.replace(/[\s.-]/g, '')
  }

  /**
   * Handle validation errors with detailed reporting
   */
  private static handleValidationError(
    error: unknown,
    originalData: unknown,
    validationType: string
  ): ValidationResult {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
        return `${path}: ${issue.message}`
      })

      return {
        success: false,
        errors,
        sanitized: originalData,
        metadata: {
          validationType,
          zodError: true,
          issueCount: error.issues.length
        }
      }
    }

    return {
      success: false,
      errors: ['Erreur de validation inconnue'],
      sanitized: originalData,
      metadata: {
        validationType,
        unknownError: true,
        errorType: error?.constructor?.name || 'Unknown'
      }
    }
  }

  /**
   * Create custom validation schema
   */
  static createCustomSchema<T>(
    baseSchema: z.ZodSchema<T>,
    customValidations: Array<{
      name: string
      validator: (data: T) => boolean
      message: string
    }>
  ): z.ZodSchema<T> {
    return baseSchema.refine(
      (data) => customValidations.every(validation => validation.validator(data)),
      {
        message: 'Custom validation failed',
        path: []
      }
    )
  }

  /**
   * Get validation statistics for monitoring
   */
  static getValidationStats(): {
    schemas: string[]
    supportedTypes: string[]
    securityIntegrated: boolean
  } {
    return {
      schemas: Object.keys(this.schemas),
      supportedTypes: ['chatMessage', 'contactInfo', 'field', 'batch'],
      securityIntegrated: true
    }
  }

  /**
   * Performance test for validation
   */
  static async performanceTest(iterations: number = 1000): Promise<{
    averageValidationTime: number
    successRate: number
    errors: string[]
  }> {
    const testData = [
      { message: 'Hello world', sessionId: 'session_123', browserId: 'browser_456' },
      { message: '<script>alert("xss")</script>', sessionId: 'session_456', browserId: 'browser_789' },
      { nom: 'Jean Dupont', email: 'jean@example.com', telephone: '0123456789' }
    ]

    const startTime = Date.now()
    let successCount = 0
    const errors: string[] = []

    for (let i = 0; i < iterations; i++) {
      const data = testData[i % testData.length] as Record<string, unknown>
      try {
        const result = i % 2 === 0 
          ? await this.validateChatMessage(data)
          : await this.validateContactInfo(data)
        
        if (result.success) successCount++
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    const endTime = Date.now()
    const averageValidationTime = (endTime - startTime) / iterations

    return {
      averageValidationTime,
      successRate: successCount / iterations,
      errors: errors.slice(0, 10) // Limit error reporting
    }
  }
}

export default DataValidator