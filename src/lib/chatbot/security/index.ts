/**
 * Security Module Index - Centralized exports for the refactored security system
 */

// Core security classes
export { SecurityConfig } from './security-config'
export { 
  SecurityResultBuilder, 
  RiskAnalysisBuilder,
  SecurityResultUtils
} from './security-result'

export {
  SecurityCommandExecutor,
  BanCheckCommand,
  TrollDetectionCommand,
  ContentValidationCommand,
  RateLimitCommand
} from './security-commands'

export type { 
  SecurityResult, 
  SecurityLevel, 
  SecurityAction, 
  RiskAnalysis
} from './security-result'

export type { 
  SecurityCommand, 
  SecurityContext
} from './security-commands'
export { RefactoredSecurityManager } from './refactored-security-manager'
export { ClientBanManager } from './client-ban-manager'
export { 
  EnhancedEncryptionService, 
  getEnhancedEncryptionService,
  getSecureEncryptionService,
  EncryptionUtils,
  SecureEncryptionUtils 
} from './encryption-service'

// Backwards compatibility note: Old SecurityManager has been replaced by RefactoredSecurityManager

// Type exports for external use
export type {
  SecurityThresholds,
  WarningConfig,
  SecurityPatterns
} from './security-config'

// Default export for convenience
export { RefactoredSecurityManager as default } from './refactored-security-manager'