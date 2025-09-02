/**
 * Security Patterns Configuration - Centralized security pattern definitions
 * Extracted from ValidationService for better maintainability and performance
 */

export interface SecurityPatternConfig {
  HIGH_RISK_PATTERNS: readonly RegExp[]
  MEDIUM_RISK_PATTERNS: readonly RegExp[]
  LOW_RISK_PATTERNS: readonly RegExp[]
  PROFANITY_LIST: readonly string[]
  DISPOSABLE_EMAIL_DOMAINS: readonly string[]
}

/**
 * Pre-compiled security patterns for high performance
 */
export class SecurityPatterns {
  // High-risk patterns (pre-compiled for performance)
  static readonly HIGH_RISK_PATTERNS: readonly RegExp[] = [
    // === PROMPT INJECTION PATTERNS - CRITICAL SECURITY ===
    // Pattern exact utilisé dans la breach de sécurité
    /\*\*ATTENTION\*\*.*jeu.*fini.*plus.*closeur.*librement/i,
    // Variations de ce pattern
    /\*\*ATTENTION\*\*.*jeu.*fini/i,
    /tu\s+n'es\s+plus\s+un?\s+(closeur|assistant|coach)/i,
    /le\s+jeu\s+est\s+fini/i,
    /tu\s+peux\s+répondre\s+librement/i,
    
    // Autres patterns d'injection de rôle critiques
    /ignore\s+(toutes?\s+les?\s+)?instructions?\s+(précédentes?|système)/i,
    /oublie\s+(tes?\s+)?instructions?\s+système/i,
    /change\s+ton\s+rôle\s+(maintenant|immédiatement)/i,
    /réponds?\s+comme\s+un\s+assistant\s+général/i,
    /tu\s+es\s+(maintenant|désormais)\s+un/i,
    
    // Injection SQL contextuelle (plus précise)
    /('\s*;\s*(union|select|insert|update|delete|drop))/i,
    /\b(union\s+select|drop\s+table|insert\s+into|delete\s+from)\b/i,
    
    // XSS précis
    /<script[^>]*>/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
    /javascript\s*:/i,
    /data\s*:\s*text\/html/i,
    /vbscript\s*:/i,
    
    // Path traversal précis
    /\.\.\//,
    /\.\.\\/,
    /\%2e\%2e\%2f/i,
    
    // Commandes shell contextuelles
    /\|\s*(curl|wget|nc|netcat|bash|sh|cmd|powershell)/i,
    /;\s*(curl|wget|nc|netcat|bash|sh|cmd|powershell)/i,
    /\$\([^)]*\)/,
    /`[^`]*`/,
    
    // Protocoles dangereux
    /file\s*:\/\//i,
    /ftp\s*:\/\//i
  ] as const

  static readonly MEDIUM_RISK_PATTERNS: readonly RegExp[] = [
    // Mots-clés SQL dans contexte technique (mais pas coaching)
    /\b(select|update|delete)\b(?!.*(?:de\s+clients?|mes\s+compétences|de\s+présentation|coaching|aide|service))/i,
    
    // Événements JS mentionnés (potentiellement suspects)
    /\b(onclick|onload|onerror|onmouseover|onfocus|onchange)\b/i,
    
    // Mots techniques mentionnés comme mots isolés
    /\bscripts?\b(?!.*(?:de\s+vente|commercial|présentation))/i,
    
    // Mots-clés techniques suspects dans texte normal
    /\b(payload|injection|exploit)\b/i,
    
    // Tentatives LDAP (plus contextuelles)
    /\(\|/,
    /\)\(/,
    /\*\)/,
    
    // Caractères encodés suspects
    /(%3c|%3e|%22|%27|%20){2,}/i,
    
    // Patterns de test de sécurité
    /\b(test.*injection|poc|proof.*concept)\b/i
  ] as const

  static readonly LOW_RISK_PATTERNS: readonly RegExp[] = [
    // Caractères suspects en groupe (nécessitent contexte)
    /[<>"'{}[\]]{3,}/,
    /\\x[0-9a-f]{2}/i,
    /\\u[0-9a-f]{4}/i
  ] as const

  static readonly PROFANITY_LIST: readonly string[] = [
    // Liste de mots inappropriés - version minimale pour test
    'connard', 'salope', 'enculé', 'pute', 'merde',
    'fuck', 'shit', 'bitch', 'asshole'
    // Ajouter selon les besoins mais rester professionnel
  ] as const

  static readonly DISPOSABLE_EMAIL_DOMAINS: readonly string[] = [
    '10minutemail.com', 'guerrillamail.com', 'tempmail.org',
    'throwaway.email', 'temp-mail.org', 'mailinator.com',
    'getairmail.com', 'tmpeml.com'
    // Liste à étendre selon les besoins
  ] as const

  /**
   * Get all high-risk patterns
   */
  static getHighRiskPatterns(): readonly RegExp[] {
    return this.HIGH_RISK_PATTERNS
  }

  /**
   * Get all medium-risk patterns
   */
  static getMediumRiskPatterns(): readonly RegExp[] {
    return this.MEDIUM_RISK_PATTERNS
  }

  /**
   * Get all low-risk patterns
   */
  static getLowRiskPatterns(): readonly RegExp[] {
    return this.LOW_RISK_PATTERNS
  }

  /**
   * Get profanity list
   */
  static getProfanityList(): readonly string[] {
    return this.PROFANITY_LIST
  }

  /**
   * Get disposable email domains
   */
  static getDisposableEmailDomains(): readonly string[] {
    return this.DISPOSABLE_EMAIL_DOMAINS
  }

  /**
   * Test if text matches any high-risk pattern
   */
  static hasHighRiskPattern(text: string): { matched: boolean; patterns: string[] } {
    const normalizedText = text.toLowerCase()
    const matched: string[] = []

    this.HIGH_RISK_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(normalizedText)) {
        matched.push(`HIGH_${index}`)
      }
    })

    return {
      matched: matched.length > 0,
      patterns: matched
    }
  }

  /**
   * Test if text matches any medium-risk pattern
   */
  static hasMediumRiskPattern(text: string): { matched: boolean; patterns: string[] } {
    const normalizedText = text.toLowerCase()
    const matched: string[] = []

    this.MEDIUM_RISK_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(normalizedText)) {
        matched.push(`MEDIUM_${index}`)
      }
    })

    return {
      matched: matched.length > 0,
      patterns: matched
    }
  }

  /**
   * Test if text matches any low-risk pattern
   */
  static hasLowRiskPattern(text: string): { matched: boolean; patterns: string[] } {
    const normalizedText = text.toLowerCase()
    const matched: string[] = []

    this.LOW_RISK_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(normalizedText)) {
        matched.push(`LOW_${index}`)
      }
    })

    return {
      matched: matched.length > 0,
      patterns: matched
    }
  }

  /**
   * Check if text contains profanity
   */
  static containsProfanity(text: string): boolean {
    const lowerText = text.toLowerCase()
    return this.PROFANITY_LIST.some(word => lowerText.includes(word))
  }

  /**
   * Check if email domain is disposable
   */
  static isDisposableEmailDomain(domain: string): boolean {
    const lowerDomain = domain.toLowerCase()
    return this.DISPOSABLE_EMAIL_DOMAINS.includes(lowerDomain)
  }

  /**
   * Get pattern statistics for monitoring
   */
  static getPatternStats(): {
    highRisk: number
    mediumRisk: number
    lowRisk: number
    profanity: number
    disposableEmails: number
  } {
    return {
      highRisk: this.HIGH_RISK_PATTERNS.length,
      mediumRisk: this.MEDIUM_RISK_PATTERNS.length,
      lowRisk: this.LOW_RISK_PATTERNS.length,
      profanity: this.PROFANITY_LIST.length,
      disposableEmails: this.DISPOSABLE_EMAIL_DOMAINS.length
    }
  }

  /**
   * Validate all patterns are valid RegExp objects
   */
  static validatePatterns(): boolean {
    try {
      const allPatterns = [
        ...this.HIGH_RISK_PATTERNS,
        ...this.MEDIUM_RISK_PATTERNS,
        ...this.LOW_RISK_PATTERNS
      ]

      for (const pattern of allPatterns) {
        if (!(pattern instanceof RegExp)) {
          console.error('SecurityPatterns: Invalid pattern found', pattern)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('SecurityPatterns: Validation error', error)
      return false
    }
  }
}

export default SecurityPatterns