/**
 * Security Configuration - Centralized security configuration and patterns
 * Extracts configuration from SecurityManager for better maintainability
 */

export interface SecurityThresholds {
  HIGH: number
  MEDIUM: number
  LOW: number
}

export interface WarningConfig {
  WARNING_RESET_TIME: number
  MAX_WARNINGS_BEFORE_BAN: number
  BAN_DURATION_AFTER_WARNINGS: number
  WARNING_SCORE: number
  BAN_SCORE: number
}

export interface SecurityPatterns {
  TROLL_PATTERNS: readonly RegExp[]
  HIGH_RISK_KEYWORDS: readonly string[]
  BEHAVIOR_INDICATORS: readonly RegExp[]
}

/**
 * Centralized Security Configuration Class
 */
export class SecurityConfig {
  // Warning system configuration
  static readonly WARNING_CONFIG: WarningConfig = {
    WARNING_RESET_TIME: 60 * 60 * 1000, // 1 hour
    MAX_WARNINGS_BEFORE_BAN: 3,
    BAN_DURATION_AFTER_WARNINGS: 24 * 60 * 60 * 1000, // 24 hours
    WARNING_SCORE: 0.7,
    BAN_SCORE: 1.0
  }

  // Risk assessment thresholds
  static readonly RISK_THRESHOLDS: SecurityThresholds = {
    HIGH: 0.8,
    MEDIUM: 0.5,
    LOW: 0.3
  }

  // Troll behavior patterns (pre-compiled for performance)
  static readonly TROLL_PATTERNS: readonly RegExp[] = [
    /météo|weather|actualité|news|sport|politique/i,
    /ignore.*instruction|oublie.*instruction|tu es.*gpt/i,
    /hahahaha|lol|mdr|wtf|bordel/i,
    /connard|idiot|stupide|nul|merde/i,
    /test.*ia|test.*bot|tu marches/i
  ] as const

  // High-risk behavior indicators
  static readonly HIGH_RISK_KEYWORDS: readonly string[] = [
    'prompt injection',
    'système',
    'admin',
    'debug',
    'reset',
    'override',
    'bypass'
  ] as const

  // Behavioral pattern indicators
  static readonly BEHAVIOR_INDICATORS: readonly RegExp[] = [
    /répète.*après.*moi/i,
    /change.*de.*sujet/i,
    /parle.*moi.*de/i,
    /raconte.*moi/i
  ] as const

  /**
   * Get warning configuration
   */
  static getWarningConfig(): WarningConfig {
    return this.WARNING_CONFIG
  }

  /**
   * Get risk thresholds
   */
  static getRiskThresholds(): SecurityThresholds {
    return this.RISK_THRESHOLDS
  }

  /**
   * Get all troll patterns
   */
  static getTrollPatterns(): readonly RegExp[] {
    return this.TROLL_PATTERNS
  }

  /**
   * Get high-risk keywords
   */
  static getHighRiskKeywords(): readonly string[] {
    return this.HIGH_RISK_KEYWORDS
  }

  /**
   * Get behavior indicators
   */
  static getBehaviorIndicators(): readonly RegExp[] {
    return this.BEHAVIOR_INDICATORS
  }

  /**
   * Check if risk score meets threshold
   */
  static isHighRisk(score: number): boolean {
    return score >= this.RISK_THRESHOLDS.HIGH
  }

  /**
   * Check if risk score meets medium threshold
   */
  static isMediumRisk(score: number): boolean {
    return score >= this.RISK_THRESHOLDS.MEDIUM && score < this.RISK_THRESHOLDS.HIGH
  }

  /**
   * Check if risk score is low
   */
  static isLowRisk(score: number): boolean {
    return score < this.RISK_THRESHOLDS.MEDIUM
  }

  /**
   * Get risk level from score
   */
  static getRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (this.isHighRisk(score)) return 'high'
    if (this.isMediumRisk(score)) return 'medium'
    return 'low'
  }

  /**
   * Validate configuration integrity
   */
  static validateConfig(): boolean {
    try {
      // Validate thresholds are in order
      const thresholds = this.RISK_THRESHOLDS
      if (thresholds.LOW >= thresholds.MEDIUM || thresholds.MEDIUM >= thresholds.HIGH) {
        console.error('SecurityConfig: Invalid threshold ordering')
        return false
      }

      // Validate warning config
      const warningConfig = this.WARNING_CONFIG
      if (warningConfig.MAX_WARNINGS_BEFORE_BAN <= 0 || 
          warningConfig.WARNING_RESET_TIME <= 0 ||
          warningConfig.BAN_DURATION_AFTER_WARNINGS <= 0) {
        console.error('SecurityConfig: Invalid warning configuration')
        return false
      }

      // Validate patterns are valid regex
      for (let index = 0; index < this.TROLL_PATTERNS.length; index++) {
        const pattern = this.TROLL_PATTERNS[index]
        if (!(pattern instanceof RegExp)) {
          console.error(`SecurityConfig: Invalid pattern at index ${index}`)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('SecurityConfig: Validation error', error)
      return false
    }
  }
}

export default SecurityConfig