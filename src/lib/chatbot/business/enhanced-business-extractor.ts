/**
 * Enhanced Business Information Extractor - Advanced extraction with confidence scoring
 * Pre-compiled patterns, fuzzy matching, and quality scoring for better extraction
 */

import { CollectedInfo, ConversationGoals } from '../chat'

export interface ExtractionPattern {
  pattern: RegExp
  confidence: number
  weight: number
  category: string
  transform?: (match: RegExpMatchArray) => string
}

export interface ExtractionResult {
  value: string
  confidence: number
  source: string
  metadata?: Record<string, unknown>
}

export interface BusinessExtractionAnalysis {
  extractedInfo: Partial<CollectedInfo>
  confidenceScores: Record<string, number>
  qualityScore: number
  completeness: number
  recommendations: string[]
  extractionDetails: Record<string, ExtractionResult[]>
}

/**
 * Pre-compiled extraction patterns with confidence scoring
 */
export class BusinessPatterns {
  // Pre-compiled patterns for performance
  static readonly NEED_PATTERNS: ExtractionPattern[] = [
    {
      pattern: /(?:j'ai besoin d'|je veux|j'aimerais|je souhaite|il me faut)(?:\s+(?:de\s+)?(.{10,100}))/i,
      confidence: 0.9,
      weight: 1.0,
      category: 'need_expression'
    },
    {
      pattern: /(?:présentation|pitch|keynote|conférence|entretien|réunion|speech|allocution|intervention)(?:\s+(?:de|sur|pour)\s+(.{5,50}))?/i,
      confidence: 0.85,
      weight: 0.9,
      category: 'presentation_type'
    },
    {
      pattern: /(?:candidat|promotion|nouveau poste|changement|opportunité|projet|challenge)(?:\s+(.{5,50}))?/i,
      confidence: 0.7,
      weight: 0.8,
      category: 'context_motivation'
    }
  ]

  static readonly TIMELINE_PATTERNS: ExtractionPattern[] = [
    {
      pattern: /(?:demain|immédiat|urgent|ce soir|aujourd'hui)/i,
      confidence: 0.95,
      weight: 1.0,
      category: 'immediate',
      transform: () => '1_day'
    },
    {
      pattern: /(?:semaine prochaine|dans (?:une )?semaine|d'ici (?:une )?semaine)/i,
      confidence: 0.9,
      weight: 1.0,
      category: 'one_week',
      transform: () => '1_week'
    },
    {
      pattern: /(?:mois|dans (?:un )?mois|d'ici (?:un )?mois)/i,
      confidence: 0.85,
      weight: 0.9,
      category: 'one_month',
      transform: () => '1_month'
    },
    {
      pattern: /(?:fin d'année|décembre|janvier|trimestre|d'ici (?:la )?fin)/i,
      confidence: 0.8,
      weight: 0.8,
      category: 'three_months',
      transform: () => '3_months'
    }
  ]

  static readonly AVAILABILITY_PATTERNS: ExtractionPattern[] = [
    {
      pattern: /(\d+)\s*(?:heure|h)(?:s)?\s*(?:par|\/)\s*semaine/i,
      confidence: 0.95,
      weight: 1.0,
      category: 'specific_hours',
      transform: (match) => `${match[1]}h par semaine`
    },
    {
      pattern: /(?:très occupé|pas beaucoup de temps|débordé|peu de temps|time is money)/i,
      confidence: 0.85,
      weight: 0.9,
      category: 'limited_time',
      transform: () => 'Peu de temps disponible'
    },
    {
      pattern: /(?:weekend|soir|après le travail|temps libre)/i,
      confidence: 0.8,
      weight: 0.8,
      category: 'flexible_time'
    }
  ]

  static readonly EXPERIENCE_PATTERNS: ExtractionPattern[] = [
    {
      pattern: /(?:débutant|jamais fait|première fois|peur|stress|timide|novice)/i,
      confidence: 0.9,
      weight: 1.0,
      category: 'beginner',
      transform: () => 'débutant'
    },
    {
      pattern: /(?:expérience|déjà fait|habitué|à l'aise|professionnel|expert)/i,
      confidence: 0.9,
      weight: 1.0,
      category: 'experienced',
      transform: () => 'expérimenté'
    },
    {
      pattern: /(?:moyen|quelques fois|parfois|ça va|correct)/i,
      confidence: 0.8,
      weight: 0.8,
      category: 'intermediate',
      transform: () => 'intermédiaire'
    }
  ]

  static readonly CONTACT_PATTERNS: ExtractionPattern[] = [
    {
      pattern: /(?:je m'appelle|mon nom est|je suis)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/i,
      confidence: 0.95,
      weight: 1.0,
      category: 'name',
      transform: (match) => match[1] || ''
    },
    {
      pattern: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      confidence: 0.98,
      weight: 1.0,
      category: 'email',
      transform: (match) => match[1] || ''
    },
    {
      pattern: /((?:\+33|0)[1-9](?:\d{8}|\s\d{2}\s\d{2}\s\d{2}\s\d{2}))/i,
      confidence: 0.95,
      weight: 1.0,
      category: 'phone',
      transform: (match) => match[1] || ''
    }
  ]

  /**
   * Get all patterns for a specific category
   */
  static getPatternsForCategory(category: string): ExtractionPattern[] {
    switch (category) {
      case 'need': return this.NEED_PATTERNS
      case 'timeline': return this.TIMELINE_PATTERNS
      case 'availability': return this.AVAILABILITY_PATTERNS
      case 'experience': return this.EXPERIENCE_PATTERNS
      case 'contact': return this.CONTACT_PATTERNS
      default: return []
    }
  }

  /**
   * Get all patterns combined
   */
  static getAllPatterns(): Record<string, ExtractionPattern[]> {
    return {
      need: this.NEED_PATTERNS,
      timeline: this.TIMELINE_PATTERNS,
      availability: this.AVAILABILITY_PATTERNS,
      experience: this.EXPERIENCE_PATTERNS,
      contact: this.CONTACT_PATTERNS
    }
  }
}

/**
 * Fuzzy matching utilities for better extraction
 */
export class FuzzyMatcher {
  /**
   * Calculate Levenshtein distance between two strings
   */
  static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0))

    for (let i = 0; i <= str1.length; i++) matrix[0]![i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j]![0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1, // deletion
          matrix[j - 1]![i]! + 1, // insertion
          matrix[j - 1]![i - 1]! + indicator // substitution
        )
      }
    }

    return matrix[str2.length]![str1.length]!
  }

  /**
   * Calculate fuzzy match score (0-1, higher is better)
   */
  static fuzzyScore(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
    const maxLength = Math.max(str1.length, str2.length)
    return maxLength === 0 ? 1 : 1 - distance / maxLength
  }

  /**
   * Find best fuzzy match from a list of candidates
   */
  static findBestMatch(input: string, candidates: string[], threshold: number = 0.6): {
    match: string | null
    score: number
    index: number
  } {
    let bestScore = 0
    let bestMatch: string | null = null
    let bestIndex = -1

    candidates.forEach((candidate, index) => {
      const score = this.fuzzyScore(input, candidate)
      if (score > bestScore && score >= threshold) {
        bestScore = score
        bestMatch = candidate
        bestIndex = index
      }
    })

    return {
      match: bestMatch,
      score: bestScore,
      index: bestIndex
    }
  }

  /**
   * Extract keywords with fuzzy matching
   */
  static extractKeywords(text: string, keywords: string[], threshold: number = 0.7): Array<{
    keyword: string
    score: number
    position: number
  }> {
    const words = text.toLowerCase().split(/\s+/)
    const matches: Array<{ keyword: string; score: number; position: number }> = []

    words.forEach((word, position) => {
      const match = this.findBestMatch(word, keywords, threshold)
      if (match.match) {
        matches.push({
          keyword: match.match,
          score: match.score,
          position
        })
      }
    })

    return matches.sort((a, b) => b.score - a.score)
  }
}

/**
 * Enhanced Business Information Extractor with advanced features
 */
export class EnhancedBusinessExtractor {
  /**
   * Enhanced business information extraction with confidence scoring
   */
  static extractBusinessInfo(
    userMessage: string,
    existingInfo: Partial<CollectedInfo> = {}
  ): BusinessExtractionAnalysis {
    const text = userMessage.toLowerCase()
    const extractionDetails: Record<string, ExtractionResult[]> = {}
    const confidenceScores: Record<string, number> = {}
    const extracted: Partial<CollectedInfo> = { ...existingInfo }

    // Extract each category of information
    this.extractWithPatterns('need', text, extracted, extractionDetails, confidenceScores)
    this.extractWithPatterns('timeline', text, extracted, extractionDetails, confidenceScores)
    this.extractWithPatterns('availability', text, extracted, extractionDetails, confidenceScores)
    this.extractWithPatterns('experience', text, extracted, extractionDetails, confidenceScores)
    this.extractWithPatterns('contact', text, extracted, extractionDetails, confidenceScores)

    // Calculate quality metrics
    const qualityScore = this.calculateQualityScore(extracted, confidenceScores)
    const completeness = this.calculateCompleteness(extracted)
    const recommendations = this.generateRecommendations(extracted, confidenceScores, qualityScore)

    return {
      extractedInfo: extracted,
      confidenceScores,
      qualityScore,
      completeness,
      recommendations,
      extractionDetails
    }
  }

  /**
   * Extract information using pattern matching with confidence scoring
   */
  private static extractWithPatterns(
    category: string,
    lowerMessage: string,
    extracted: Partial<CollectedInfo>,
    extractionDetails: Record<string, ExtractionResult[]>,
    confidenceScores: Record<string, number>
  ): void {
    const patterns = BusinessPatterns.getPatternsForCategory(category)
    const results: ExtractionResult[] = []

    patterns.forEach(pattern => {
      const matches = lowerMessage.match(pattern.pattern)
      if (matches) {
        const value = pattern.transform ? pattern.transform(matches) : (matches[1] || matches[0])
        
        if (value && value.trim().length > 0) {
          results.push({
            value: value.trim(),
            confidence: pattern.confidence * pattern.weight,
            source: pattern.category,
            metadata: {
              matchedText: matches[0],
              patternType: pattern.category
            }
          })
        }
      }
    })

    // Store extraction details
    extractionDetails[category] = results

    // Apply best extraction to the extracted info
    if (results.length > 0) {
      const bestResult = results.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      )

      // Apply to extracted info based on category
      this.applyExtractionResult(category, bestResult, extracted)
      confidenceScores[category] = bestResult.confidence
    }
  }

  /**
   * Apply extraction result to the collected information
   */
  private static applyExtractionResult(
    category: string,
    result: ExtractionResult,
    extracted: Partial<CollectedInfo>
  ): void {
    switch (category) {
      case 'need':
        if (!extracted.need || result.confidence > 0.8) {
          extracted.need = result.value
          extracted.problematique = result.value // Legacy compatibility
        }
        break
      
      case 'timeline':
        if (!extracted.timeline || result.confidence > 0.8) {
          extracted.timeline = result.value as string
        }
        break
      
      case 'availability':
        if (!extracted.availability || result.confidence > 0.8) {
          extracted.availability = result.value
        }
        break
      
      case 'experience':
        if (!extracted.experience || result.confidence > 0.8) {
          extracted.experience = result.value as string
        }
        break
      
      case 'contact':
        // Handle contact information specially
        if (result.source === 'name' && (!extracted.name || result.confidence > 0.9)) {
          extracted.name = result.value
        } else if (result.source === 'email' && (!extracted.contactInfo || result.confidence > 0.9)) {
          extracted.contactInfo = result.value
          extracted.contactPreference = 'email'
        } else if (result.source === 'phone' && (!extracted.contactInfo || result.confidence > 0.9)) {
          extracted.contactInfo = result.value
          extracted.contactPreference = 'telephone'
        }
        break
    }
  }

  /**
   * Calculate overall quality score for extracted information
   */
  private static calculateQualityScore(
    extracted: Partial<CollectedInfo>,
    confidenceScores: Record<string, number>
  ): number {
    const weights = {
      need: 0.3,
      timeline: 0.2,
      contact: 0.25,
      experience: 0.15,
      availability: 0.1
    }

    let totalScore = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([category, weight]) => {
      const confidence = confidenceScores[category]
      if (confidence !== undefined) {
        totalScore += confidence * weight
        totalWeight += weight
      }
    })

    // Bonus for completeness
    const completeness = this.calculateCompleteness(extracted)
    const completenessBonus = completeness > 0.8 ? 0.1 : 0

    return totalWeight > 0 ? Math.min(1, (totalScore / totalWeight) + completenessBonus) : 0
  }

  /**
   * Calculate completeness percentage
   */
  private static calculateCompleteness(extracted: Partial<CollectedInfo>): number {
    const importantFields = ['need', 'timeline', 'name', 'contactInfo', 'experience']
    const presentFields = importantFields.filter(field => 
      extracted[field as keyof CollectedInfo] !== undefined &&
      extracted[field as keyof CollectedInfo] !== null &&
      extracted[field as keyof CollectedInfo] !== ''
    )

    return presentFields.length / importantFields.length
  }

  /**
   * Generate recommendations for improving extraction
   */
  private static generateRecommendations(
    extracted: Partial<CollectedInfo>,
    confidenceScores: Record<string, number>,
    qualityScore: number
  ): string[] {
    const recommendations: string[] = []

    // Check confidence scores
    Object.entries(confidenceScores).forEach(([category, confidence]) => {
      if (confidence < 0.7) {
        recommendations.push(`Précisez davantage votre ${category === 'need' ? 'besoin' : category}`)
      }
    })

    // Check missing important information
    if (!extracted.need) {
      recommendations.push('Décrivez votre besoin en coaching plus précisément')
    }
    
    if (!extracted.timeline) {
      recommendations.push('Indiquez vos délais ou échéances')
    }
    
    if (!extracted.name && !extracted.contactInfo) {
      recommendations.push('Fournissez vos coordonnées pour être recontacté')
    }

    // Check quality score
    if (qualityScore < 0.6) {
      recommendations.push('Donnez plus de détails sur votre situation professionnelle')
    }

    return recommendations
  }

  /**
   * Enhanced fuzzy matching for business terms
   */
  static fuzzyMatchBusinessTerms(text: string): {
    businessTerms: string[]
    confidence: number
    relevance: number
  } {
    const businessKeywords = [
      'présentation', 'pitch', 'vente', 'commercial', 'négociation',
      'client', 'prospect', 'entreprise', 'startup', 'business',
      'leadership', 'management', 'équipe', 'projet', 'stratégie'
    ]

    const extractedKeywords = FuzzyMatcher.extractKeywords(text, businessKeywords, 0.7)
    const uniqueTerms = Array.from(new Set(extractedKeywords.map(k => k.keyword)))
    
    const avgConfidence = extractedKeywords.length > 0 
      ? extractedKeywords.reduce((sum, k) => sum + k.score, 0) / extractedKeywords.length
      : 0

    const relevance = uniqueTerms.length / businessKeywords.length

    return {
      businessTerms: uniqueTerms,
      confidence: avgConfidence,
      relevance
    }
  }

  /**
   * Goal achievement tracking with dependency management
   */
  static updateConversationGoals(
    analysis: BusinessExtractionAnalysis,
    existingGoals: Partial<ConversationGoals> = {}
  ): {
    goals: Partial<ConversationGoals>
    completionScore: number
    nextPriorities: string[]
    dependencies: Record<string, string[]>
  } {
    const goals: Partial<ConversationGoals> = { ...existingGoals }
    const { extractedInfo, confidenceScores } = analysis

    // Map extracted info to goals with confidence thresholds
    if (extractedInfo['need'] && confidenceScores['need'] && confidenceScores['need'] > 0.7) {
      goals.understand_need = true
    }
    
    if (extractedInfo['timeline'] && confidenceScores['timeline'] && confidenceScores['timeline'] > 0.7) {
      goals.get_timeline = true
    }
    
    if (extractedInfo.name && confidenceScores['contact'] && confidenceScores['contact'] > 0.8) {
      goals.collect_identity = true
    }
    
    if (extractedInfo.contactInfo && confidenceScores['contact'] && confidenceScores['contact'] > 0.8) {
      goals.get_contact = true
    }

    // Calculate completion score
    const totalGoals = ['understand_need', 'get_timeline', 'collect_identity', 'get_contact']
    const completedGoals = totalGoals.filter(goal => goals[goal as keyof ConversationGoals] === true)
    const completionScore = completedGoals.length / totalGoals.length

    // Determine next priorities
    const nextPriorities = this.determineNextPriorities(goals, confidenceScores)

    // Define goal dependencies
    const dependencies = {
      get_contact: ['collect_identity', 'understand_need'],
      assess_urgency: ['understand_need', 'get_timeline'],
      qualify_lead: ['understand_need', 'collect_identity', 'get_contact']
    }

    return {
      goals,
      completionScore,
      nextPriorities,
      dependencies
    }
  }

  /**
   * Determine next priorities based on current state
   */
  private static determineNextPriorities(
    goals: Partial<ConversationGoals>,
    confidenceScores: Record<string, number>
  ): string[] {
    const priorities: string[] = []

    if (!goals.understand_need || (confidenceScores['need'] && confidenceScores['need'] < 0.7)) {
      priorities.push('Clarifier le besoin en coaching')
    }

    if (!goals.collect_identity || (confidenceScores['contact'] && confidenceScores['contact'] < 0.8)) {
      priorities.push('Collecter les informations de contact')
    }

    if (!goals.get_timeline || (confidenceScores['timeline'] && confidenceScores['timeline'] < 0.7)) {
      priorities.push('Définir les échéances')
    }

    if (!goals.get_contact) {
      priorities.push('Obtenir les coordonnées pour le suivi')
    }

    return priorities
  }

  /**
   * Performance benchmark for extraction system
   */
  static performanceBenchmark(iterations: number = 1000): {
    avgExtractionTime: number
    avgConfidenceScore: number
    patternCoverage: number
    fuzzyMatchAccuracy: number
  } {
    const testMessages = [
      "Bonjour, je m'appelle Jean Dupont et j'ai besoin d'aide pour ma présentation demain",
      "Je voudrais améliorer mes compétences en pitch pour dans un mois",
      "Mon email est test@example.com et je suis débutant en prise de parole",
      "J'ai une réunion importante la semaine prochaine, pouvez-vous m'aider ?",
      "Je suis expérimenté mais j'aimerais perfectionner ma technique"
    ]

    const startTime = Date.now()
    let totalConfidence = 0
    let extractionCount = 0

    for (let i = 0; i < iterations; i++) {
      const message = testMessages[i % testMessages.length]
      if (!message) continue
      const analysis = this.extractBusinessInfo(message)
      
      const avgConfidence = Object.values(analysis.confidenceScores)
        .reduce((sum, conf) => sum + conf, 0) / Object.keys(analysis.confidenceScores).length || 0
      
      totalConfidence += avgConfidence
      extractionCount++
    }

    const avgExtractionTime = (Date.now() - startTime) / iterations
    const avgConfidenceScore = totalConfidence / extractionCount

    // Pattern coverage test
    const allPatterns = BusinessPatterns.getAllPatterns()
    const totalPatterns = Object.values(allPatterns).flat().length

    // Fuzzy match accuracy test
    const fuzzyTest = FuzzyMatcher.findBestMatch('présentation', ['presentation', 'pitch', 'meeting'], 0.7)
    const fuzzyMatchAccuracy = fuzzyTest.score

    return {
      avgExtractionTime,
      avgConfidenceScore,
      patternCoverage: totalPatterns,
      fuzzyMatchAccuracy
    }
  }
}

export default EnhancedBusinessExtractor