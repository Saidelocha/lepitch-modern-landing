/**
 * Input Sanitizer - Specialized class for HTML sanitization and input cleaning
 * Handles secure input processing with performance optimizations
 */

import * as DOMPurify from 'isomorphic-dompurify'

export interface SanitizationConfig {
  allowedTags: string[]
  allowedAttributes: string[]
  maxLength: number
  preserveWhitespace: boolean
  allowDataAttributes: boolean
}

export interface SanitizationResult {
  sanitized: string
  changed: boolean
  removedTags: string[]
  removedAttributes: string[]
  truncated: boolean
  originalLength: number
}

/**
 * High-performance input sanitizer with detailed reporting
 */
export class InputSanitizer {
  // Default configurations for different use cases
  private static readonly CONFIGS = {
    CHAT_MESSAGE: {
      allowedTags: [], // No HTML tags allowed in chat
      allowedAttributes: [],
      maxLength: 1000,
      preserveWhitespace: false,
      allowDataAttributes: false
    } as SanitizationConfig,

    CONTACT_INFO: {
      allowedTags: [], // No HTML in contact info
      allowedAttributes: [],
      maxLength: 200,
      preserveWhitespace: false,
      allowDataAttributes: false
    } as SanitizationConfig,

    RICH_TEXT: {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
      allowedAttributes: ['class'],
      maxLength: 2000,
      preserveWhitespace: true,
      allowDataAttributes: false
    } as SanitizationConfig,

    STRICT: {
      allowedTags: [],
      allowedAttributes: [],
      maxLength: 500,
      preserveWhitespace: false,
      allowDataAttributes: false
    } as SanitizationConfig
  }

  /**
   * Sanitize input with default chat message configuration
   */
  static sanitizeChatMessage(input: string): SanitizationResult {
    return this.sanitize(input, this.CONFIGS.CHAT_MESSAGE)
  }

  /**
   * Sanitize contact information
   */
  static sanitizeContactInfo(input: string): SanitizationResult {
    return this.sanitize(input, this.CONFIGS.CONTACT_INFO)
  }

  /**
   * Sanitize rich text content
   */
  static sanitizeRichText(input: string): SanitizationResult {
    return this.sanitize(input, this.CONFIGS.RICH_TEXT)
  }

  /**
   * Strict sanitization for security-critical inputs
   */
  static sanitizeStrict(input: string): SanitizationResult {
    return this.sanitize(input, this.CONFIGS.STRICT)
  }

  /**
   * Main sanitization method with detailed analysis
   */
  static sanitize(input: string, config: SanitizationConfig): SanitizationResult {
    if (!input || typeof input !== 'string') {
      return {
        sanitized: '',
        changed: false,
        removedTags: [],
        removedAttributes: [],
        truncated: false,
        originalLength: 0
      }
    }

    const originalLength = input.length
    let processed = input
    const removedTags: string[] = []
    const removedAttributes: string[] = []
    let truncated = false

    // Track original HTML tags and attributes for reporting
    const originalTags = this.extractHtmlTags(input)
    const originalAttributes = this.extractHtmlAttributes(input)

    // 1. Trim whitespace unless preserving
    if (!config.preserveWhitespace) {
      processed = processed.trim()
    }

    // 2. Length truncation
    if (processed.length > config.maxLength) {
      processed = processed.substring(0, config.maxLength)
      truncated = true
    }

    // 3. HTML sanitization
    const domPurifyConfig = {
      ALLOWED_TAGS: config.allowedTags,
      ALLOWED_ATTR: config.allowedAttributes,
      ALLOW_DATA_ATTR: config.allowDataAttributes,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      SANITIZE_DOM: true,
      KEEP_CONTENT: true
    }

    processed = (DOMPurify as unknown as { sanitize: (input: string, config: object) => string }).sanitize(processed, domPurifyConfig)

    // 4. Additional character sanitization
    processed = this.sanitizeCharacters(processed, config.preserveWhitespace)

    // 5. Calculate what was removed
    const finalTags = this.extractHtmlTags(processed)
    const finalAttributes = this.extractHtmlAttributes(processed)

    removedTags.push(...originalTags.filter(tag => !finalTags.includes(tag)))
    removedAttributes.push(...originalAttributes.filter(attr => !finalAttributes.includes(attr)))

    const changed = processed !== input

    return {
      sanitized: processed,
      changed,
      removedTags: Array.from(new Set(removedTags)), // Remove duplicates
      removedAttributes: Array.from(new Set(removedAttributes)),
      truncated,
      originalLength
    }
  }

  /**
   * Sanitize dangerous characters and control sequences
   */
  private static sanitizeCharacters(input: string, preserveWhitespace: boolean): string {
    let sanitized = input

    // Remove control characters except common whitespace
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

    // Normalize whitespace unless preserving
    if (!preserveWhitespace) {
      sanitized = sanitized.replace(/\s+/g, ' ')
    }

    // Escape potentially dangerous characters
    sanitized = this.escapeHtmlChars(sanitized)

    return sanitized
  }

  /**
   * Escape HTML characters for security
   */
  private static escapeHtmlChars(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Extract HTML tags from text for analysis
   */
  private static extractHtmlTags(html: string): string[] {
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi
    const matches = html.match(tagRegex) || []
    return matches.map(tag => {
      const tagName = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/i)
      return tagName ? tagName[1]?.toLowerCase() || '' : ''
    }).filter(Boolean)
  }

  /**
   * Extract HTML attributes from text for analysis
   */
  private static extractHtmlAttributes(html: string): string[] {
    const attrRegex = /\s([a-zA-Z-]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi
    const matches = html.match(attrRegex) || []
    return matches.map(attr => {
      const attrName = attr.match(/\s([a-zA-Z-]+)/i)
      return attrName ? attrName[1]?.toLowerCase() || '' : ''
    }).filter(Boolean)
  }

  /**
   * Validate input meets security requirements
   */
  static validateSanitization(result: SanitizationResult): {
    isSecure: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    if (result.removedTags.length > 0) {
      issues.push(`Removed HTML tags: ${result.removedTags.join(', ')}`)
      recommendations.push('Consider using plain text input')
    }

    if (result.removedAttributes.length > 0) {
      issues.push(`Removed attributes: ${result.removedAttributes.join(', ')}`)
      recommendations.push('Avoid HTML attributes in user input')
    }

    if (result.truncated) {
      issues.push(`Input truncated from ${result.originalLength} characters`)
      recommendations.push('Implement client-side length validation')
    }

    if (result.changed && result.removedTags.length === 0 && result.removedAttributes.length === 0) {
      issues.push('Input was modified during sanitization')
      recommendations.push('Check for control characters or encoding issues')
    }

    const isSecure = issues.length === 0 || 
      issues.every(issue => 
        issue.includes('truncated') || 
        issue.includes('modified during sanitization')
      )

    return {
      isSecure,
      issues,
      recommendations
    }
  }

  /**
   * Batch sanitize multiple inputs
   */
  static sanitizeBatch(
    inputs: Array<{ text: string; config?: SanitizationConfig }>,
    defaultConfig: SanitizationConfig = this.CONFIGS.CHAT_MESSAGE
  ): SanitizationResult[] {
    return inputs.map(input => 
      this.sanitize(input.text, input.config || defaultConfig)
    )
  }

  /**
   * Get sanitization statistics for monitoring
   */
  static analyzeSanitizationNeeds(texts: string[]): {
    totalTexts: number
    containsHtml: number
    containsScripts: number
    containsUrls: number
    averageLength: number
    maxLength: number
    riskScore: number
  } {
    if (texts.length === 0) {
      return {
        totalTexts: 0,
        containsHtml: 0,
        containsScripts: 0,
        containsUrls: 0,
        averageLength: 0,
        maxLength: 0,
        riskScore: 0
      }
    }

    let containsHtml = 0
    let containsScripts = 0
    let containsUrls = 0
    let totalLength = 0
    let maxLength = 0

    texts.forEach(text => {
      if (/<[^>]+>/i.test(text)) containsHtml++
      if (/<script/i.test(text)) containsScripts++
      if (/(https?|ftp):\/\/[^\s]+/i.test(text)) containsUrls++
      
      totalLength += text.length
      maxLength = Math.max(maxLength, text.length)
    })

    const averageLength = totalLength / texts.length
    const riskScore = (containsScripts * 0.5 + containsHtml * 0.3 + containsUrls * 0.1) / texts.length

    return {
      totalTexts: texts.length,
      containsHtml,
      containsScripts,
      containsUrls,
      averageLength: Math.round(averageLength),
      maxLength,
      riskScore: Math.round(riskScore * 100) / 100
    }
  }

  /**
   * Performance test for sanitization
   */
  static performanceTest(iterations: number = 1000): {
    averageTime: number
    throughput: number
    memoryEfficient: boolean
  } {
    const testInputs = [
      'Simple text message',
      '<script>alert("xss")</script>Hello',
      'Text with <b>bold</b> and <i>italic</i>',
      'Long text ' + 'word '.repeat(200),
      '<div onclick="malicious()">Click me</div>'
    ]

    const startTime = Date.now()
    let totalChars = 0

    for (let i = 0; i < iterations; i++) {
      const input = testInputs[i % testInputs.length]
      if (input) {
        totalChars += input.length
        this.sanitizeChatMessage(input)
      }
    }

    const endTime = Date.now()
    const totalTime = endTime - startTime
    const averageTime = totalTime / iterations
    const throughput = totalChars / (totalTime / 1000) // chars per second

    return {
      averageTime,
      throughput: Math.round(throughput),
      memoryEfficient: averageTime < 1 // Less than 1ms per operation
    }
  }
}

export default InputSanitizer