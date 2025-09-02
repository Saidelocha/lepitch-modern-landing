/**
 * Language Detector - Enhanced French language detection for better validation accuracy
 * Reduces false positives by understanding linguistic context
 */

export interface LanguageAnalysis {
  isFrench: boolean
  confidence: number
  indicators: string[]
  score: number
}

/**
 * Enhanced Language Detector with improved French pattern recognition
 */
export class LanguageDetector {
  // French language indicators with confidence weights
  private static readonly FRENCH_INDICATORS = {
    // Common French words (high confidence)
    COMMON_WORDS: {
      patterns: [
        /\b(je|tu|il|elle|nous|vous|ils|elles)\b/gi,
        /\b(le|la|les|un|une|des|de|du|à|et|ou|mais|donc|car|ni)\b/gi,
        /\b(avec|pour|sans|vers|chez|depuis|pendant|avant|après|dans)\b/gi,
        /\b(être|avoir|faire|aller|voir|savoir|pouvoir|vouloir|devoir)\b/gi
      ],
      weight: 0.8
    },

    // French contractions (very high confidence)
    CONTRACTIONS: {
      patterns: [
        /\b(j'|l'|d'|c'|s'|n'|m'|t'|qu')\w+/gi,
        /\b(c'est|il y a|qu'est-ce|est-ce que)\b/gi
      ],
      weight: 1.0
    },

    // French accented characters (high confidence)
    ACCENTS: {
      patterns: [
        /[àâäéèêëïîôöùûüÿç]/gi
      ],
      weight: 0.9
    },

    // French politeness and business terms (medium confidence)
    POLITENESS: {
      patterns: [
        /\b(bonjour|bonsoir|merci|s'il\s+vous\s+plaît|au\s+revoir|salut)\b/gi,
        /\b(monsieur|madame|mademoiselle|présentation|entreprise|travail)\b/gi
      ],
      weight: 0.7
    },

    // French-specific phrases (very high confidence)
    PHRASES: {
      patterns: [
        /\b(j'ai besoin|je voudrais|pourriez-vous|est-ce que vous|qu'est-ce que)\b/gi,
        /\b(en fait|par contre|tout à fait|bien sûr|d'accord)\b/gi
      ],
      weight: 1.0
    },

    // French question patterns (high confidence)
    QUESTIONS: {
      patterns: [
        /\b(comment|pourquoi|quand|où|que|qui|quel|quelle)\b/gi,
        /\?\s*$/gm
      ],
      weight: 0.8
    }
  }

  // Anti-patterns that indicate non-French text
  private static readonly NON_FRENCH_INDICATORS = {
    ENGLISH_WORDS: {
      patterns: [
        /\b(the|and|or|but|with|for|from|to|at|by|in|on|of|as|is|are|was|were)\b/gi,
        /\b(hello|goodbye|please|thank you|yes|no|good|bad|new|old)\b/gi
      ],
      weight: -0.6
    },
    
    TECHNICAL_TERMS: {
      patterns: [
        /\b(select|insert|update|delete|drop|create|table|database)\b/gi,
        /\b(script|function|variable|class|object|method)\b/gi
      ],
      weight: -0.3
    }
  }

  private static readonly MIN_TEXT_LENGTH = 10
  private static readonly FRENCH_THRESHOLD = 0.4

  /**
   * Analyze text to determine if it's French with confidence scoring
   */
  static analyzeLanguage(text: string): LanguageAnalysis {
    if (!text || typeof text !== 'string' || text.length < this.MIN_TEXT_LENGTH) {
      return {
        isFrench: false,
        confidence: 0,
        indicators: [],
        score: 0
      }
    }

    const normalizedText = text.toLowerCase().trim()
    let totalScore = 0
    let maxPossibleScore = 0
    const foundIndicators: string[] = []

    // Check French indicators
    Object.entries(this.FRENCH_INDICATORS).forEach(([category, config]) => {
      config.patterns.forEach((pattern, index) => {
        const matches = normalizedText.match(pattern)
        if (matches) {
          const score = matches.length * config.weight
          totalScore += score
          foundIndicators.push(`${category}_${index}`)
        }
        maxPossibleScore += config.weight
      })
    })

    // Check anti-patterns (non-French indicators)
    Object.entries(this.NON_FRENCH_INDICATORS).forEach(([category, config]) => {
      config.patterns.forEach((pattern, index) => {
        const matches = normalizedText.match(pattern)
        if (matches) {
          const score = matches.length * config.weight
          totalScore += score // weight is negative, so this reduces score
          foundIndicators.push(`NOT_${category}_${index}`)
        }
      })
    })

    // Normalize score (0-1 range)
    const normalizedScore = Math.max(0, totalScore / Math.max(1, normalizedText.split(/\s+/).length))
    
    // Calculate confidence based on number of indicators and text length
    const indicatorConfidence = Math.min(1, foundIndicators.length / 3)
    const lengthConfidence = Math.min(1, text.length / 50)
    const confidence = (indicatorConfidence + lengthConfidence) / 2

    const isFrench = normalizedScore >= this.FRENCH_THRESHOLD

    return {
      isFrench,
      confidence,
      indicators: foundIndicators,
      score: normalizedScore
    }
  }

  /**
   * Simple boolean check for French text (backwards compatibility)
   */
  static isFrenchText(text: string): boolean {
    return this.analyzeLanguage(text).isFrench
  }

  /**
   * Get French confidence score only
   */
  static getFrenchConfidence(text: string): number {
    const analysis = this.analyzeLanguage(text)
    return analysis.isFrench ? analysis.confidence : 0
  }

  /**
   * Check if text is likely business/coaching related in French
   */
  static isBusinessFrench(text: string): boolean {
    const businessPatterns = [
      /\b(présentation|pitch|entreprise|business|commercial|vente)\b/gi,
      /\b(client|clientèle|projet|objectif|stratégie|marketing)\b/gi,
      /\b(formation|coaching|accompagnement|conseil|expertise)\b/gi,
      /\b(réunion|entretien|négociation|proposition|offre)\b/gi
    ]

    const analysis = this.analyzeLanguage(text)
    if (!analysis.isFrench) return false

    return businessPatterns.some(pattern => pattern.test(text.toLowerCase()))
  }

  /**
   * Detect language mix (French + other languages)
   */
  static detectLanguageMix(text: string): {
    isMixed: boolean
    languages: string[]
    primaryLanguage: string
  } {
    const frenchAnalysis = this.analyzeLanguage(text)
    
    // Simple English detection
    const englishPatterns = this.NON_FRENCH_INDICATORS.ENGLISH_WORDS.patterns
    const hasEnglish = englishPatterns.some(pattern => pattern.test(text.toLowerCase()))
    
    const languages: string[] = []
    if (frenchAnalysis.isFrench) languages.push('french')
    if (hasEnglish) languages.push('english')
    
    return {
      isMixed: languages.length > 1,
      languages,
      primaryLanguage: frenchAnalysis.isFrench ? 'french' : (hasEnglish ? 'english' : 'unknown')
    }
  }

  /**
   * Get detailed language statistics for debugging
   */
  static getLanguageStats(text: string): {
    french: LanguageAnalysis
    wordCount: number
    characterCount: number
    hasAccents: boolean
    hasContractions: boolean
  } {
    const french = this.analyzeLanguage(text)
    const words = text.trim().split(/\s+/)
    
    return {
      french,
      wordCount: words.length,
      characterCount: text.length,
      hasAccents: /[àâäéèêëïîôöùûüÿç]/i.test(text),
      hasContractions: /\b(j'|l'|d'|c'|s'|n'|m'|t'|qu')\w+/i.test(text)
    }
  }

  /**
   * Test language detector performance
   */
  static performanceTest(): {
    accuracy: number
    testCases: Array<{
      text: string
      expected: boolean
      actual: boolean
      correct: boolean
    }>
  } {
    const testCases = [
      { text: 'Bonjour, je voudrais améliorer ma présentation', expected: true },
      { text: 'Hello, I need help with my presentation', expected: false },
      { text: 'SELECT * FROM users WHERE id = 1', expected: false },
      { text: 'Comment puis-je améliorer mes compétences ?', expected: true },
      { text: 'J\'ai besoin d\'aide pour mon pitch', expected: true },
      { text: '<script>alert("test")</script>', expected: false },
      { text: 'Météo et actualités du jour', expected: true },
      { text: 'C\'est un test pour vérifier la détection', expected: true }
    ]

    const results = testCases.map(testCase => {
      const actual = this.isFrenchText(testCase.text)
      return {
        ...testCase,
        actual,
        correct: actual === testCase.expected
      }
    })

    const accuracy = results.filter(r => r.correct).length / results.length

    return { accuracy, testCases: results }
  }
}

export default LanguageDetector