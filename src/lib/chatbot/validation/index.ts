/**
 * Validation Module Index - Centralized exports for the refactored validation system
 */

// Core validation classes
export { SecurityPatterns } from './security-patterns'
export { SecurityPatternMatcher } from './security-pattern-matcher'
export { LanguageDetector } from './language-detector'
export { InputSanitizer } from './input-sanitizer'
export { DataValidator } from './data-validator'
export { ContactValidator } from './contact-validator'
export { ValidationCache, ValidationCacheManager } from './validation-cache'

// Type exports
export type { 
  PatternMatchResult,
  CacheEntry as PatternCacheEntry 
} from './security-pattern-matcher'

export type { 
  LanguageAnalysis 
} from './language-detector'

export type { 
  SanitizationConfig,
  SanitizationResult 
} from './input-sanitizer'

export type { 
  ValidationResult,
  ValidationContext 
} from './data-validator'

export type { 
  ContactInfo,
  ContactValidationResult,
  ContactValidationConfig 
} from './contact-validator'

export type { 
  CacheEntry,
  CacheStats,
  CacheConfig 
} from './validation-cache'

// Original validation service has been migrated to RefactoredValidationService
// For backwards compatibility, use RefactoredValidationService instead

// Create unified validation service that uses the new modular system
export { RefactoredValidationService } from './refactored-validation-service'

// Default export for convenience
export { RefactoredValidationService as default } from './refactored-validation-service'