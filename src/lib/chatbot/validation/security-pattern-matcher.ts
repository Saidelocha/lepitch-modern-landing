/**
 * Security Pattern Matcher - Specialized class for security pattern detection
 * Handles the core logic of matching text against security patterns with caching
 */

import { SecurityPatterns } from './security-patterns'
import { LanguageDetector } from './language-detector'

export interface PatternMatchResult {
  level: 'low' | 'medium' | 'high'
  patterns: string[]
  score: number
  confidence: number
  allowWithWarning: boolean
  metadata?: Record<string, unknown>
}

export interface CacheEntry {
  result: PatternMatchResult
  timestamp: number
}

/**
 * LRU Cache implementation for pattern matching results
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  getStats(): { size: number; maxSize: number; hitRatio?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    }
  }
}

/**
 * Security Pattern Matcher with advanced caching and confidence scoring
 */
export class SecurityPatternMatcher {
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private static readonly CACHE_MAX_SIZE = 100
  private static cache = new LRUCache<string, CacheEntry>(this.CACHE_MAX_SIZE)
  private static stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  }

  /**
   * Main pattern matching method with caching and confidence scoring
   */
  static analyzeText(text: string): PatternMatchResult {
    if (!text || typeof text !== 'string') {
      return this.createResult('low', [], 0, 1.0, true)
    }

    const normalizedText = text.toLowerCase().trim()
    const cacheKey = this.hashText(normalizedText)
    
    // Check cache first
    const cached = this.checkCache(cacheKey)
    if (cached) {
      this.stats.hits++
      return cached
    }

    this.stats.misses++

    // Perform pattern matching
    const result = this.performPatternMatching(normalizedText, text)
    
    // Cache the result
    this.cacheResult(cacheKey, result)
    
    return result
  }

  /**
   * Perform the actual pattern matching logic
   */
  private static performPatternMatching(normalizedText: string, originalText: string): PatternMatchResult {
    const detectedPatterns: string[] = []
    let riskScore = 0
    let confidence = 0.8 // Base confidence

    // Language context analysis for reducing false positives
    const isLikelyFrench = LanguageDetector.isFrenchText(normalizedText)
    let languageAdjustment = 1.0

    if (isLikelyFrench) {
      // Reduce false positives for French text
      languageAdjustment = 0.3
      confidence += 0.1
    }

    // Check high-risk patterns
    const highRiskResult = SecurityPatterns.hasHighRiskPattern(normalizedText)
    if (highRiskResult.matched) {
      detectedPatterns.push(...highRiskResult.patterns)
      riskScore += 10 * highRiskResult.patterns.length
      confidence = 0.95 // High confidence for definitive patterns
    }

    // Check medium-risk patterns
    const mediumRiskResult = SecurityPatterns.hasMediumRiskPattern(normalizedText)
    if (mediumRiskResult.matched) {
      detectedPatterns.push(...mediumRiskResult.patterns)
      riskScore += 3 * mediumRiskResult.patterns.length
      confidence = Math.max(confidence, 0.85)
    }

    // Check low-risk patterns
    const lowRiskResult = SecurityPatterns.hasLowRiskPattern(normalizedText)
    if (lowRiskResult.matched) {
      detectedPatterns.push(...lowRiskResult.patterns)
      riskScore += 1 * lowRiskResult.patterns.length
      confidence = Math.max(confidence, 0.7)
    }

    // Apply language adjustment
    riskScore *= languageAdjustment

    // Determine level and confidence
    const level = this.calculateRiskLevel(riskScore)
    const finalConfidence = this.calculateConfidence(confidence, detectedPatterns.length, isLikelyFrench)
    const allowWithWarning = level !== 'high'

    // Log high-risk detections for security monitoring
    if (level === 'high') {
      console.warn('🚨 SECURITY ALERT - High-risk pattern detected:', {
        message: originalText.substring(0, 100) + (originalText.length > 100 ? '...' : ''),
        score: riskScore,
        patterns: detectedPatterns,
        confidence: finalConfidence,
        timestamp: new Date().toISOString()
      })
    }

    return this.createResult(level, detectedPatterns, riskScore, finalConfidence, allowWithWarning, {
      languageDetected: isLikelyFrench ? 'french' : 'other',
      languageAdjustment,
      originalScore: riskScore / languageAdjustment
    })
  }

  /**
   * Calculate risk level from score
   */
  private static calculateRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 10) return 'high'
    if (score >= 3) return 'medium'
    return 'low'
  }

  /**
   * Calculate confidence based on various factors
   */
  private static calculateConfidence(
    baseConfidence: number, 
    patternCount: number, 
    isFrench: boolean
  ): number {
    let confidence = baseConfidence

    // More patterns = higher confidence
    confidence += patternCount * 0.05

    // French text with patterns might be less suspicious
    if (isFrench && patternCount > 0) {
      confidence -= 0.1
    }

    // Clamp between 0.5 and 1.0
    return Math.max(0.5, Math.min(1.0, confidence))
  }

  /**
   * Create standardized result object
   */
  private static createResult(
    level: 'low' | 'medium' | 'high',
    patterns: string[],
    score: number,
    confidence: number,
    allowWithWarning: boolean,
    metadata?: Record<string, unknown>
  ): PatternMatchResult {
    const result: PatternMatchResult = {
      level,
      patterns,
      score,
      confidence,
      allowWithWarning
    }

    if (metadata) {
      result.metadata = metadata
    }

    return result
  }

  /**
   * Check cache for existing result
   */
  private static checkCache(key: string): PatternMatchResult | null {
    const cached = this.cache.get(key)
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.result
    }
    
    if (cached) {
      // Expired entry
      this.cache.set(key, cached) // This will remove it from LRU cache naturally
      this.stats.evictions++
    }
    
    return null
  }

  /**
   * Cache a pattern matching result
   */
  private static cacheResult(key: string, result: PatternMatchResult): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    })
  }

  /**
   * Generate simple hash for cache key
   */
  private static hashText(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredCache(): number {
    let cleared = 0

    // Note: With LRU cache, we can't iterate easily
    // This is a simplified version - in practice, 
    // LRU cache handles eviction automatically
    this.cache.clear()
    cleared = this.cache.size()
    
    return cleared
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number
    maxSize: number
    hits: number
    misses: number
    evictions: number
    hitRatio: number
  } {
    const cacheStats = this.cache.getStats()
    const totalRequests = this.stats.hits + this.stats.misses
    
    return {
      ...cacheStats,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRatio: totalRequests > 0 ? this.stats.hits / totalRequests : 0
    }
  }

  /**
   * Reset cache and statistics
   */
  static resetCache(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0 }
  }

  /**
   * Test pattern matching performance
   */
  static performanceTest(iterations: number = 1000): {
    averageTime: number
    cacheHitRatio: number
    patternCoverage: number
  } {
    const testTexts = [
      'Hello, I need help with my presentation',
      '<script>alert("xss")</script>',
      'SELECT * FROM users WHERE id = 1',
      'météo et actualités du jour',
      'Je voudrais améliorer mes compétences en pitch'
    ]

    const startTime = Date.now()
    let cacheHits = 0

    for (let i = 0; i < iterations; i++) {
      const text = testTexts[i % testTexts.length]
      if (text) {
        this.analyzeText(text)
        if (this.checkCache(this.hashText(text.toLowerCase()))) {
          cacheHits++
        }
      }
    }

    const endTime = Date.now()
    const averageTime = (endTime - startTime) / iterations

    const stats = this.getCacheStats()
    
    return {
      averageTime,
      cacheHitRatio: stats.hitRatio,
      patternCoverage: SecurityPatterns.getPatternStats().highRisk
    }
  }
}

export default SecurityPatternMatcher