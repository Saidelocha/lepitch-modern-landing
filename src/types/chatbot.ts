/**
 * Types pour le système de chatbot
 * Centralisation des interfaces pour une meilleure type safety
 */

import { PerformanceMetrics } from '@/lib/chatbot/interfaces/common-types'

export interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  showSurveyForm?: boolean
  surveyContext?: string
  showConsentRequest?: boolean
  consentContext?: string
}

export interface ContactInfo {
  nom?: string
  contactMethod?: 'email' | 'telephone'
  contact?: string
  closedByAI?: boolean
  startTime?: Date
  aiMetadata?: {
    warningsReceived: number
    closedByAI: boolean
    seriousnessScore: 'high' | 'medium' | 'low'
    lastWarningReason?: string
  }
}

export interface QuestionnaireResponse {
  step: number
  response: string
  timestamp: Date
  valid: boolean
}

export interface ValidationContext {
  sessionId?: string
  strictMode?: boolean
  userAgent?: string
  ip?: string
  requestId?: string
}

export interface PatternMatchResult {
  level: 'low' | 'medium' | 'high'
  patterns: string[]
  score: number
  confidence: number
  allowWithWarning: boolean
  metadata?: Record<string, string | number | boolean>
}

export interface LanguageAnalysis {
  language: string
  confidence: number
  isAppropriate: boolean
  concerns?: string[]
}

export interface ComprehensiveValidationResult {
  success: boolean
  data?: ContactInfo
  errors: string[]
  warnings: string[]
  sanitized: string
  securityAnalysis?: PatternMatchResult
  languageAnalysis?: LanguageAnalysis
  validationType: string
  performance: {
    startTime: number
    endTime: number
    duration: number
  }
  metadata: {
    version: string
    cacheHit: boolean
    validationSteps: string[]
  }
}

export interface ABTestEvent {
  experiment_id: string
  variant: 'A' | 'B'
  event_type: 'view' | 'click' | 'conversion'
  offer_id?: string
  timestamp: number
  user_id: string
  session_id: string
  page_url: string
  device_type: 'desktop' | 'tablet' | 'mobile'
  traffic_source: string
}

// Additional types for common-types.ts enhancement
export interface ErrorContext {
  stackTrace?: string
  userAgent?: string
  sessionId?: string
  timestamp?: number
  requestId?: string
  [key: string]: string | number | boolean | undefined
}

export interface ModuleConfiguration {
  timeout?: number
  retries?: number
  enableCache?: boolean
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  customSettings?: Record<string, string | number | boolean>
}

export interface CustomRuleFunction {
  (data: unknown): boolean
}

export interface DataFilterValue {
  value: string | number | boolean | Date | (string | number | boolean | Date)[]
}

export interface AuditTrailChange {
  field: string
  oldValue: unknown
  newValue: unknown
  timestamp: number
}

export interface AuthenticationConfig {
  apiKey?: string
  token?: string
  username?: string
  password?: string
  refreshToken?: string
  customHeaders?: Record<string, string>
}

// Enhanced types for data-validator.ts
export interface ValidationRiskAnalysis {
  level: 'low' | 'medium' | 'high'
  score: number
  patterns: string[]
  allowWithWarning: boolean
}

export interface ValidationCustomRules {
  [fieldType: string]: CustomRuleFunction
}

export interface SanitizedContactInfo {
  nom?: string
  email?: string
  telephone?: string
  problematique?: string
  [key: string]: string | undefined
}

export interface ChatMessageData {
  message: string
  sessionId: string
  browserId?: string | undefined
}

export interface FieldValidationMetadata {
  fieldType: string
  customRuleApplied: boolean
}

export interface BatchValidationData {
  validationType: 'batch'
  fieldsCount: number
  successCount: number
}

// Enhanced types for unified-service.ts
export interface UnifiedContextMetadata {
  userAgent?: string
  ipAddress?: string
  metadata?: Record<string, string | number | boolean>
}

export interface SecurityResult {
  isAllowed: boolean
  level: 'clean' | 'suspicious' | 'dangerous' | 'blocked'
  reason?: string
}

export interface ValidationServiceResult {
  success: boolean
  errors: string[]
  warnings?: string[]
  sanitized?: {
    message: string
    [key: string]: unknown
  }
}

export interface BusinessAnalysisResult {
  extractedInfo?: Partial<ContactInfo>
  qualityScore: number
  completeness: number
  confidenceScores: Record<string, number>
  recommendations?: string[]
}

export interface ServicePerformance {
  uptime: number
  requestCount: number
  errorRate: number
  avgResponseTime: number
}

export interface ServiceHealthStats {
  performance: PerformanceMetrics | null
  cacheStats: Record<string, unknown> | null
  uptime: number
}

export interface OptimizationResult {
  prioritizedActions: string[]
}

export type DeepMergeValue = string | number | boolean | Record<string, unknown> | DeepMergeValue[]