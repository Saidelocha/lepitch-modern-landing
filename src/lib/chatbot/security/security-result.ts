/**
 * Security Result Types and Builders
 * Standardized security result handling with builder pattern
 */

export type SecurityLevel = 'clean' | 'suspicious' | 'troll' | 'banned'
export type SecurityAction = 'none' | 'warning' | 'ban'

export interface RiskAnalysis {
  level: 'low' | 'medium' | 'high'
  score: number
  patterns: string[]
  confidence: number
  allowWithWarning: boolean
}

export interface SecurityResult {
  isAllowed: boolean
  level: SecurityLevel
  score: number
  action: SecurityAction
  reason?: string
  riskAnalysis?: RiskAnalysis
  metadata?: Record<string, unknown>
  timestamp: number
}

/**
 * Security Result Builder - Provides fluent API for creating security results
 */
export class SecurityResultBuilder {
  private result: Partial<SecurityResult> = {
    timestamp: Date.now()
  }

  /**
   * Set whether the action is allowed
   */
  setAllowed(allowed: boolean): SecurityResultBuilder {
    this.result.isAllowed = allowed
    return this
  }

  /**
   * Set security level
   */
  setLevel(level: SecurityLevel): SecurityResultBuilder {
    this.result.level = level
    return this
  }

  /**
   * Set risk score
   */
  setScore(score: number): SecurityResultBuilder {
    this.result.score = Math.max(0, Math.min(1, score)) // Clamp between 0-1
    return this
  }

  /**
   * Set recommended action
   */
  setAction(action: SecurityAction): SecurityResultBuilder {
    this.result.action = action
    return this
  }

  /**
   * Set reason for the security decision
   */
  setReason(reason: string): SecurityResultBuilder {
    this.result.reason = reason
    return this
  }

  /**
   * Set risk analysis details
   */
  setRiskAnalysis(analysis: RiskAnalysis): SecurityResultBuilder {
    this.result.riskAnalysis = analysis
    return this
  }

  /**
   * Add metadata
   */
  setMetadata(metadata: Record<string, unknown>): SecurityResultBuilder {
    this.result.metadata = metadata
    return this
  }

  /**
   * Add a single metadata field
   */
  addMetadata(key: string, value: unknown): SecurityResultBuilder {
    if (!this.result.metadata) {
      this.result.metadata = {}
    }
    this.result.metadata[key] = value
    return this
  }

  /**
   * Build the final security result
   */
  build(): SecurityResult {
    // Validate required fields
    if (this.result.isAllowed === undefined) {
      throw new Error('SecurityResult: isAllowed is required')
    }
    if (!this.result.level) {
      throw new Error('SecurityResult: level is required')
    }
    if (this.result.score === undefined) {
      throw new Error('SecurityResult: score is required')
    }
    if (!this.result.action) {
      throw new Error('SecurityResult: action is required')
    }

    return this.result as SecurityResult
  }

  /**
   * Create a clean result (no security issues)
   */
  static createClean(): SecurityResultBuilder {
    return new SecurityResultBuilder()
      .setAllowed(true)
      .setLevel('clean')
      .setScore(0)
      .setAction('none')
  }

  /**
   * Create a suspicious result (minor security concerns)
   */
  static createSuspicious(score: number, reason?: string): SecurityResultBuilder {
    return new SecurityResultBuilder()
      .setAllowed(true)
      .setLevel('suspicious')
      .setScore(score)
      .setAction('warning')
      .setReason(reason || 'Suspicious content detected')
  }

  /**
   * Create a troll result (troll behavior detected)
   */
  static createTroll(score: number, reason?: string): SecurityResultBuilder {
    return new SecurityResultBuilder()
      .setAllowed(true)
      .setLevel('troll')
      .setScore(score)
      .setAction('warning')
      .setReason(reason || 'Troll behavior detected')
  }

  /**
   * Create a banned result (security violation)
   */
  static createBanned(score: number, reason?: string): SecurityResultBuilder {
    return new SecurityResultBuilder()
      .setAllowed(false)
      .setLevel('banned')
      .setScore(score)
      .setAction('ban')
      .setReason(reason || 'Security violation detected')
  }
}

/**
 * Risk Analysis Builder - Provides fluent API for creating risk analysis
 */
export class RiskAnalysisBuilder {
  private analysis: Partial<RiskAnalysis> = {
    patterns: [],
    confidence: 1.0
  }

  /**
   * Set risk level
   */
  setLevel(level: 'low' | 'medium' | 'high'): RiskAnalysisBuilder {
    this.analysis.level = level
    return this
  }

  /**
   * Set risk score
   */
  setScore(score: number): RiskAnalysisBuilder {
    this.analysis.score = Math.max(0, Math.min(1, score))
    return this
  }

  /**
   * Add detected pattern
   */
  addPattern(pattern: string): RiskAnalysisBuilder {
    if (!this.analysis.patterns) {
      this.analysis.patterns = []
    }
    this.analysis.patterns.push(pattern)
    return this
  }

  /**
   * Set all patterns at once
   */
  setPatterns(patterns: string[]): RiskAnalysisBuilder {
    this.analysis.patterns = [...patterns]
    return this
  }

  /**
   * Set confidence level
   */
  setConfidence(confidence: number): RiskAnalysisBuilder {
    this.analysis.confidence = Math.max(0, Math.min(1, confidence))
    return this
  }

  /**
   * Set whether content is allowed with warning
   */
  setAllowWithWarning(allow: boolean): RiskAnalysisBuilder {
    this.analysis.allowWithWarning = allow
    return this
  }

  /**
   * Build the final risk analysis
   */
  build(): RiskAnalysis {
    // Validate required fields
    if (!this.analysis.level) {
      throw new Error('RiskAnalysis: level is required')
    }
    if (this.analysis.score === undefined) {
      throw new Error('RiskAnalysis: score is required')
    }
    if (this.analysis.allowWithWarning === undefined) {
      this.analysis.allowWithWarning = this.analysis.level !== 'high'
    }

    return this.analysis as RiskAnalysis
  }

  /**
   * Create low-risk analysis
   */
  static createLowRisk(score: number = 0): RiskAnalysisBuilder {
    return new RiskAnalysisBuilder()
      .setLevel('low')
      .setScore(score)
      .setAllowWithWarning(true)
      .setConfidence(0.8)
  }

  /**
   * Create medium-risk analysis
   */
  static createMediumRisk(score: number, patterns: string[] = []): RiskAnalysisBuilder {
    return new RiskAnalysisBuilder()
      .setLevel('medium')
      .setScore(score)
      .setPatterns(patterns)
      .setAllowWithWarning(true)
      .setConfidence(0.9)
  }

  /**
   * Create high-risk analysis
   */
  static createHighRisk(score: number, patterns: string[] = []): RiskAnalysisBuilder {
    return new RiskAnalysisBuilder()
      .setLevel('high')
      .setScore(score)
      .setPatterns(patterns)
      .setAllowWithWarning(false)
      .setConfidence(0.95)
  }
}

/**
 * Utility functions for security results
 */
export class SecurityResultUtils {
  /**
   * Check if result indicates a security block
   */
  static isBlocked(result: SecurityResult): boolean {
    return !result.isAllowed || result.action === 'ban'
  }

  /**
   * Check if result indicates a warning
   */
  static isWarning(result: SecurityResult): boolean {
    return result.action === 'warning'
  }

  /**
   * Check if result is clean
   */
  static isClean(result: SecurityResult): boolean {
    return result.level === 'clean' && result.action === 'none'
  }

  /**
   * Get severity level as number (for sorting/comparison)
   */
  static getSeverityLevel(result: SecurityResult): number {
    switch (result.level) {
      case 'clean': return 0
      case 'suspicious': return 1
      case 'troll': return 2
      case 'banned': return 3
      default: return 0
    }
  }

  /**
   * Merge multiple security results (takes highest severity)
   */
  static mergeResults(results: SecurityResult[]): SecurityResult {
    if (results.length === 0) {
      return SecurityResultBuilder.createClean().build()
    }

    if (results.length === 1) {
      return results[0]!
    }

    // Find result with highest severity
    const highest = results.reduce((prev, current) => {
      return this.getSeverityLevel(current) > this.getSeverityLevel(prev) ? current : prev
    })

    // Combine patterns from all results
    const allPatterns = results
      .filter(r => r.riskAnalysis?.patterns)
      .flatMap(r => r.riskAnalysis!.patterns)

    const mergedRiskAnalysis = highest.riskAnalysis ? {
      ...highest.riskAnalysis,
      patterns: Array.from(new Set(allPatterns)) // Remove duplicates
    } : undefined

    const result: SecurityResult = {
      ...highest,
      metadata: {
        ...highest.metadata,
        mergedFromCount: results.length,
        allSeverities: results.map(r => r.level)
      }
    }

    if (mergedRiskAnalysis) {
      result.riskAnalysis = mergedRiskAnalysis
    }

    return result
  }
}

export default SecurityResultBuilder