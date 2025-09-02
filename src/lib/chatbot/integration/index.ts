/**
 * Integration Module Index - Cross-module integration and coordination
 * Provides unified interfaces and orchestration for all chatbot modules
 */

// Core interfaces and types
export * from '../interfaces/common-types'

// Security module integration
export {
  RefactoredSecurityManager,
  SecurityConfig,
  SecurityResultBuilder,
  SecurityCommandExecutor
} from '../security'

export type {
  SecurityResult
} from '../security'

// Validation module integration
export {
  RefactoredValidationService,
  SecurityPatternMatcher,
  InputSanitizer,
  DataValidator,
  ContactValidator,
  ValidationCacheManager
} from '../validation'

// Business module integration
export {
  EnhancedBusinessExtractor,
  BusinessPatterns,
  FuzzyMatcher
} from '../business'

// Performance monitoring integration
export {
  RequestCacheCoordinator
} from '../performance/request-cache-coordinator'

export { PerformanceMonitor } from '../performance/performance-monitor'

// Unified service interface
export { UnifiedChatbotService } from './unified-service'

// Default export for convenience
export { UnifiedChatbotService as default } from './unified-service'