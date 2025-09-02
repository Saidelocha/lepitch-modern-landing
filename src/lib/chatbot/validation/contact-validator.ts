/**
 * Contact Validator - Specialized validation for contact information
 * Handles French-specific validation rules and business context
 */

import { DataValidator, ValidationResult, ValidationContext } from './data-validator'
import { LanguageDetector } from './language-detector'

export interface ContactInfo {
  nom?: string
  email?: string
  telephone?: string
  problematique?: string
  entreprise?: string
  poste?: string
  secteur?: string
}

export interface ContactValidationResult extends ValidationResult<ContactInfo> {
  completeness: number
  businessRelevance: number
  contactMethod: 'email' | 'telephone' | 'both' | 'none'
  recommendations: string[]
}

export interface ContactValidationConfig {
  requireName: boolean
  requireContact: boolean
  requireProblem: boolean
  allowPartialInfo: boolean
  businessContextRequired: boolean
  frenchValidation: boolean
}

/**
 * Specialized Contact Information Validator
 */
export class ContactValidator {
  private static readonly DEFAULT_CONFIG: ContactValidationConfig = {
    requireName: true,
    requireContact: true,
    requireProblem: true,
    allowPartialInfo: false,
    businessContextRequired: true,
    frenchValidation: true
  }

  // French business sectors for validation
  private static readonly BUSINESS_SECTORS = [
    'technologie', 'finance', 'santé', 'éducation', 'commerce',
    'industrie', 'services', 'consulting', 'startup', 'marketing',
    'vente', 'communication', 'ressources humaines', 'juridique'
  ]

  // French job titles for validation
  private static readonly JOB_TITLES = [
    'directeur', 'manager', 'responsable', 'chef', 'président',
    'pdg', 'ceo', 'commercial', 'consultant', 'développeur',
    'ingénieur', 'analyste', 'coordinateur', 'assistant',
    'fondateur', 'entrepreneur', 'freelance'
  ]

  /**
   * Comprehensive contact information validation
   */
  static async validateContactInfo(
    rawData: Record<string, unknown>,
    config: Partial<ContactValidationConfig> = {}
  ): Promise<ContactValidationResult> {
    const validationConfig = { ...this.DEFAULT_CONFIG, ...config }
    const context: ValidationContext = {
      strictMode: !validationConfig.allowPartialInfo,
      skipSanitization: false
    }

    try {
      // Basic data validation
      const baseResult = await DataValidator.validateContactInfo(rawData, context)
      
      if (!baseResult.success) {
        return this.createContactResult(baseResult, validationConfig)
      }

      const validatedData = baseResult.data as ContactInfo
      
      // Enhanced validation with contact-specific rules
      const enhancedResult = await this.performEnhancedValidation(
        validatedData,
        rawData,
        validationConfig
      )

      return enhancedResult

    } catch (error) {
      return {
        success: false,
        errors: ['Erreur lors de la validation des informations de contact'],
        completeness: 0,
        businessRelevance: 0,
        contactMethod: 'none',
        recommendations: ['Vérifiez le format des données fournies']
      }
    }
  }

  /**
   * Perform enhanced contact-specific validation
   */
  private static async performEnhancedValidation(
    data: ContactInfo,
    _rawData: Record<string, unknown>,
    config: ContactValidationConfig
  ): Promise<ContactValidationResult> {
    const errors: string[] = []
    const recommendations: string[] = []
    
    // Completeness analysis
    const completeness = this.calculateCompleteness(data, config)
    
    // Business relevance analysis
    const businessRelevance = this.analyzeBusinessRelevance(data, config)
    
    // Contact method determination
    const contactMethod = this.determineContactMethod(data)
    
    // Validation rules
    if (config.requireName && !data.nom) {
      errors.push('Le nom est requis')
      recommendations.push('Veuillez fournir votre nom complet')
    }

    if (config.requireContact && contactMethod === 'none') {
      errors.push('Au moins un moyen de contact est requis (email ou téléphone)')
      recommendations.push('Veuillez fournir votre email ou votre numéro de téléphone')
    }

    if (config.requireProblem && !data.problematique) {
      errors.push('La description de votre problématique est requise')
      recommendations.push('Veuillez décrire votre besoin en coaching')
    }

    // French language validation
    if (config.frenchValidation && data.problematique) {
      const languageAnalysis = LanguageDetector.analyzeLanguage(data.problematique)
      if (!languageAnalysis.isFrench && languageAnalysis.confidence > 0.7) {
        recommendations.push('Nous opérons principalement en français. Pourriez-vous reformuler en français ?')
      }
    }

    // Business context validation
    if (config.businessContextRequired) {
      const hasBusinessContext = this.hasBusinessContext(data)
      if (!hasBusinessContext) {
        recommendations.push('Mentionnez votre contexte professionnel pour un meilleur accompagnement')
      }
    }

    // Email specific validation
    if (data.email) {
      const emailValidation = this.validateEmailContext(data.email)
      if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors)
        recommendations.push(...emailValidation.recommendations)
      }
    }

    // Phone specific validation
    if (data.telephone) {
      const phoneValidation = this.validatePhoneContext(data.telephone)
      if (!phoneValidation.isValid) {
        errors.push(...phoneValidation.errors)
        recommendations.push(...phoneValidation.recommendations)
      }
    }

    // Generate quality recommendations
    this.generateQualityRecommendations(data, completeness, businessRelevance, recommendations)

    const result: ContactValidationResult = {
      success: errors.length === 0,
      errors,
      sanitized: data,
      completeness,
      businessRelevance,
      contactMethod,
      recommendations,
      metadata: {
        validationType: 'enhancedContact',
        configUsed: JSON.stringify(config),
        languageValidated: config.frenchValidation,
        businessValidated: config.businessContextRequired
      }
    }

    if (errors.length === 0) {
      result.data = data
    }

    return result
  }

  /**
   * Calculate information completeness percentage
   */
  private static calculateCompleteness(data: ContactInfo, config: ContactValidationConfig): number {
    const fields = ['nom', 'email', 'telephone', 'problematique', 'entreprise', 'poste']
    let totalFields = fields.length
    let completedFields = 0

    fields.forEach(field => {
      const value = data[field as keyof ContactInfo]
      if (value && value.trim().length > 0) {
        completedFields++
      }
    })

    // Adjust for required fields
    if (config.requireName && !data.nom) totalFields++
    if (config.requireContact && !data.email && !data.telephone) totalFields++
    if (config.requireProblem && !data.problematique) totalFields++

    return Math.round((completedFields / totalFields) * 100)
  }

  /**
   * Analyze business relevance of the contact information
   */
  private static analyzeBusinessRelevance(data: ContactInfo, config: ContactValidationConfig): number {
    if (!config.businessContextRequired) return 100

    let relevanceScore = 0

    // Problem description business relevance
    if (data.problematique) {
      const businessTerms = [
        'présentation', 'pitch', 'vente', 'commercial', 'négociation',
        'client', 'prospect', 'entreprise', 'business', 'startup',
        'leadership', 'management', 'équipe', 'projet', 'stratégie'
      ]
      
      const lowerProblem = data.problematique.toLowerCase()
      const matchingTerms = businessTerms.filter(term => lowerProblem.includes(term))
      relevanceScore += Math.min(40, matchingTerms.length * 8)
    }

    // Company information
    if (data.entreprise) {
      relevanceScore += 20
    }

    // Job title relevance
    if (data.poste) {
      const lowerPoste = data.poste.toLowerCase()
      const hasRelevantTitle = this.JOB_TITLES.some(title => lowerPoste.includes(title))
      if (hasRelevantTitle) {
        relevanceScore += 20
      }
    }

    // Sector relevance
    if (data.secteur) {
      const lowerSecteur = data.secteur.toLowerCase()
      const hasRelevantSector = this.BUSINESS_SECTORS.some(sector => lowerSecteur.includes(sector))
      if (hasRelevantSector) {
        relevanceScore += 20
      }
    }

    return Math.min(100, relevanceScore)
  }

  /**
   * Determine preferred contact method
   */
  private static determineContactMethod(data: ContactInfo): 'email' | 'telephone' | 'both' | 'none' {
    const hasEmail = data.email && data.email.trim().length > 0
    const hasPhone = data.telephone && data.telephone.trim().length > 0

    if (hasEmail && hasPhone) return 'both'
    if (hasEmail) return 'email'
    if (hasPhone) return 'telephone'
    return 'none'
  }

  /**
   * Check if contact has business context
   */
  private static hasBusinessContext(data: ContactInfo): boolean {
    const indicators = [
      data.entreprise && data.entreprise.trim().length > 0,
      data.poste && data.poste.trim().length > 0,
      data.secteur && data.secteur.trim().length > 0,
      data.problematique && this.containsBusinessTerms(data.problematique)
    ]

    return indicators.filter(Boolean).length >= 2
  }

  /**
   * Check if text contains business-related terms
   */
  private static containsBusinessTerms(text: string): boolean {
    const businessKeywords = [
      'entreprise', 'société', 'business', 'commercial', 'vente',
      'client', 'prospect', 'équipe', 'management', 'leadership',
      'présentation', 'pitch', 'négociation', 'projet', 'startup'
    ]

    const lowerText = text.toLowerCase()
    return businessKeywords.some(keyword => lowerText.includes(keyword))
  }

  /**
   * Validate email in business context
   */
  private static validateEmailContext(email: string): {
    isValid: boolean
    errors: string[]
    recommendations: string[]
  } {
    const errors: string[] = []
    const recommendations: string[] = []

    // Check for professional email domains
    const domain = email.split('@')[1]?.toLowerCase()
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    
    if (domain && personalDomains.includes(domain)) {
      recommendations.push('Un email professionnel pourrait être préférable pour le suivi')
    }

    // Check for suspicious patterns
    if (email.includes('+') || email.includes('..')) {
      recommendations.push('Vérifiez le format de votre adresse email')
    }

    return {
      isValid: errors.length === 0,
      errors,
      recommendations
    }
  }

  /**
   * Validate phone in French context
   */
  private static validatePhoneContext(phone: string): {
    isValid: boolean
    errors: string[]
    recommendations: string[]
  } {
    const errors: string[] = []
    const recommendations: string[] = []

    const normalized = phone.replace(/[\s.-]/g, '')

    // Check for French mobile patterns
    if (normalized.startsWith('06') || normalized.startsWith('07')) {
      // Mobile number - good for quick contact
      recommendations.push('Numéro mobile détecté - idéal pour un contact rapide')
    } else if (normalized.startsWith('01') || normalized.startsWith('02') || 
               normalized.startsWith('03') || normalized.startsWith('04') || 
               normalized.startsWith('05')) {
      // Fixed line - might be professional
      recommendations.push('Numéro fixe détecté - précisez vos heures de disponibilité')
    }

    return {
      isValid: errors.length === 0,
      errors,
      recommendations
    }
  }

  /**
   * Generate quality improvement recommendations
   */
  private static generateQualityRecommendations(
    data: ContactInfo,
    completeness: number,
    businessRelevance: number,
    recommendations: string[]
  ): void {
    if (completeness < 50) {
      recommendations.push('Complétez votre profil pour un meilleur accompagnement personnalisé')
    }

    if (businessRelevance < 60) {
      recommendations.push('Précisez votre contexte professionnel et vos objectifs de coaching')
    }

    if (!data.entreprise && !data.poste) {
      recommendations.push('Indiquez votre fonction et votre entreprise pour adapter le coaching')
    }

    if (data.problematique && data.problematique.length < 50) {
      recommendations.push('Développez votre problématique pour une évaluation plus précise')
    }
  }

  /**
   * Create contact result from base validation result
   */
  private static createContactResult(
    baseResult: ValidationResult,
    _config: ContactValidationConfig
  ): ContactValidationResult {
    const result: ContactValidationResult = {
      success: baseResult.success,
      errors: baseResult.errors,
      completeness: 0,
      businessRelevance: 0,
      contactMethod: 'none',
      recommendations: ['Corrigez les erreurs de validation avant de continuer']
    }

    if (baseResult.data) {
      result.data = baseResult.data as ContactInfo
    }

    if (baseResult.sanitized) {
      result.sanitized = baseResult.sanitized as ContactInfo
    }

    if (baseResult.riskAnalysis) {
      result.riskAnalysis = baseResult.riskAnalysis
    }

    if (baseResult.metadata) {
      result.metadata = baseResult.metadata
    }

    return result
  }

  /**
   * Validate minimum contact requirements
   */
  static validateMinimumRequirements(data: ContactInfo): {
    isValid: boolean
    missingRequirements: string[]
    severity: 'low' | 'medium' | 'high'
  } {
    const missing: string[] = []

    if (!data.nom || data.nom.trim().length < 2) {
      missing.push('nom')
    }

    if (!data.email && !data.telephone) {
      missing.push('contact')
    }

    if (!data.problematique || data.problematique.trim().length < 10) {
      missing.push('problématique')
    }

    let severity: 'low' | 'medium' | 'high' = 'low'
    if (missing.length >= 3) severity = 'high'
    else if (missing.length >= 2) severity = 'medium'

    return {
      isValid: missing.length === 0,
      missingRequirements: missing,
      severity
    }
  }

  /**
   * Get contact validation statistics
   */
  static getValidationStats(): {
    supportedFields: string[]
    businessSectors: number
    jobTitles: number
    validationRules: number
  } {
    return {
      supportedFields: ['nom', 'email', 'telephone', 'problematique', 'entreprise', 'poste', 'secteur'],
      businessSectors: this.BUSINESS_SECTORS.length,
      jobTitles: this.JOB_TITLES.length,
      validationRules: 12 // Approximate number of validation rules
    }
  }
}

export default ContactValidator