/**
 * Business Module Index - Centralized exports for business information extraction
 */

// Enhanced business extractor
export {
  EnhancedBusinessExtractor,
  BusinessPatterns,
  FuzzyMatcher
} from './enhanced-business-extractor'

// Enhanced prospect qualification service
export {
  EnhancedProspectQualificationService,
  enhancedProspectQualificationService
} from './prospect-qualification-service'

// Enhanced survey handler
export {
  EnhancedSurveyHandler,
  enhancedSurveyHandler,
  surveySchema
} from './enhanced-survey-handler'

// Type exports
export type {
  ExtractionPattern,
  ExtractionResult,
  BusinessExtractionAnalysis
} from './enhanced-business-extractor'

export type {
  ProspectQualification
} from './prospect-qualification-service'

export type {
  SurveyData
} from './enhanced-survey-handler'

// Backwards compatibility note: Old BusinessInfoExtractor has been replaced by EnhancedBusinessExtractor

// Default export for convenience
export { EnhancedBusinessExtractor as default } from './enhanced-business-extractor'