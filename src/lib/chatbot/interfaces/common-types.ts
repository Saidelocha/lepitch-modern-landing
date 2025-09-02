/**
 * Common Types - Standardized interfaces for cross-module integration
 * Provides consistent type definitions across all chatbot modules
 */

import { ErrorContext, ModuleConfiguration, CustomRuleFunction, AuthenticationConfig } from '@/types/chatbot'

// Base result interface used across all modules
export interface BaseResult {
  success: boolean
  timestamp: number
  version?: string
}

// Performance metrics interface
export interface PerformanceMetrics {
  duration: number
  cacheHit: boolean
  memoryUsage?: number
  operationCount?: number
}

// Error handling interface
export interface ErrorDetails {
  code: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: ErrorContext
  stackTrace?: string
}

// Cache interface for consistent caching across modules
export interface CacheMetadata {
  key: string
  ttl: number
  size?: number
  tags?: string[]
}

// Confidence scoring interface
export interface ConfidenceScore {
  value: number // 0-1 range
  source: string
  methodology: string
  factors?: Record<string, number>
}

// Security assessment interface
export interface SecurityAssessment {
  level: 'clean' | 'suspicious' | 'dangerous' | 'blocked'
  score: number // 0-1 range
  patterns: string[]
  confidence: ConfidenceScore
  recommendations: string[]
}

// Validation metadata interface
export interface ValidationMetadata {
  validationType: string
  rulesApplied: string[]
  skipValidation?: boolean
  customRules?: boolean
  performance: PerformanceMetrics
}

// Language analysis interface
export interface LanguageMetadata {
  language: string
  confidence: ConfidenceScore
  dialect?: string
  businessContext?: boolean
}

// Business context interface
export interface BusinessContext {
  industry?: string
  role?: string
  company?: string
  experience?: 'beginner' | 'intermediate' | 'expert'
  urgency?: 'low' | 'medium' | 'high'
  budget?: 'low' | 'medium' | 'high'
}

// Request context interface for tracking requests across modules
export interface RequestContext {
  requestId: string
  sessionId: string
  userId?: string
  timestamp: number
  userAgent?: string
  ipAddress?: string
  metadata?: Record<string, string | number | boolean>
}

// Module status interface for health monitoring
export interface ModuleStatus {
  name: string
  version: string
  status: 'healthy' | 'degraded' | 'error' | 'offline'
  lastCheck: number
  metrics?: {
    uptime: number
    requestCount: number
    errorRate: number
    avgResponseTime: number
  }
  dependencies?: string[]
}

// Configuration interface for modules
export interface ModuleConfig {
  enabled: boolean
  version: string
  settings: ModuleConfiguration
  dependencies: string[]
  healthCheck?: {
    interval: number
    timeout: number
    retries: number
  }
}

// Standard response interface
export interface StandardResponse<T = unknown> extends BaseResult {
  data?: T
  errors: ErrorDetails[]
  warnings: string[]
  metadata: {
    requestId: string
    performance: PerformanceMetrics
    moduleVersion: string
    [key: string]: string | number | boolean | PerformanceMetrics
  }
}

// Analytics event interface
export interface AnalyticsEvent {
  eventType: string
  category: string
  action: string
  label?: string
  value?: number
  timestamp: number
  context: RequestContext
  customData?: Record<string, string | number | boolean>
}

// Monitoring metrics interface
export interface MonitoringMetrics {
  module: string
  operation: string
  duration: number
  success: boolean
  errorType?: string
  resourceUsage?: {
    memory: number
    cpu: number
  }
  customMetrics?: Record<string, number>
}

// Feature flag interface
export interface FeatureFlag {
  name: string
  enabled: boolean
  rolloutPercentage: number
  conditions?: {
    userSegments?: string[]
    timeRange?: { start: Date; end: Date }
    customRules?: Record<string, CustomRuleFunction>
  }
}

// Rate limiting interface
export interface RateLimit {
  identifier: string
  window: number // time window in ms
  maxRequests: number
  currentCount: number
  resetTime: number
  blocked: boolean
}

// Pagination interface
export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Filter interface for data querying
export interface DataFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith'
  value: string | number | boolean | Date | (string | number | boolean | Date)[]
  caseSensitive?: boolean
}

// Sort interface for data ordering
export interface DataSort {
  field: string
  direction: 'asc' | 'desc'
  priority?: number
}

// Data query interface
export interface DataQuery {
  filters?: DataFilter[]
  sort?: DataSort[]
  pagination?: Pagination
  include?: string[]
  exclude?: string[]
}

// Audit trail interface
export interface AuditTrail {
  id: string
  timestamp: number
  userId?: string
  sessionId: string
  action: string
  resource: string
  changes?: {
    before: Record<string, unknown>
    after: Record<string, unknown>
  }
  context: RequestContext
}

// Health check result interface
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: number
  duration: number
  checks: Record<string, {
    status: 'pass' | 'warn' | 'fail'
    message?: string
    duration?: number
  }>
  version: string
}

// Integration point interface
export interface IntegrationPoint {
  name: string
  type: 'inbound' | 'outbound' | 'bidirectional'
  protocol: 'http' | 'websocket' | 'event' | 'database'
  endpoint?: string
  authentication?: {
    type: 'none' | 'api-key' | 'oauth' | 'jwt'
    config?: AuthenticationConfig
  }
  rateLimit?: RateLimit
  timeout?: number
  retries?: number
}

// Message queue interface
export interface QueueMessage<T = unknown> {
  id: string
  payload: T
  timestamp: number
  priority: number
  attempts: number
  maxAttempts: number
  delay?: number
  tags?: string[]
}

// Workflow step interface
export interface WorkflowStep {
  id: string
  name: string
  type: 'validation' | 'transformation' | 'enrichment' | 'notification' | 'storage'
  config: ModuleConfiguration
  dependencies: string[]
  timeout?: number
  retries?: number
  errorHandling?: 'stop' | 'continue' | 'retry'
}

// Workflow definition interface
export interface WorkflowDefinition {
  id: string
  name: string
  version: string
  description?: string
  steps: WorkflowStep[]
  triggers: {
    events?: string[]
    schedule?: string
    manual?: boolean
  }
  timeout?: number
  metadata?: Record<string, string | number | boolean>
}

// Security policy interface
export interface SecurityPolicy {
  id: string
  name: string
  rules: Array<{
    condition: string
    action: 'allow' | 'deny' | 'warn'
    priority: number
  }>
  scope: string[]
  enforcement: 'strict' | 'lenient'
  exceptions?: string[]
}

// Export utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Constants for common values
export const COMMON_CONSTANTS = {
  CACHE_TTL: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000 // 24 hours
  },
  CONFIDENCE_THRESHOLDS: {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4
  },
  ERROR_CODES: {
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    SECURITY_VIOLATION: 'SECURITY_VIOLATION',
    RATE_LIMITED: 'RATE_LIMITED',
    TIMEOUT: 'TIMEOUT',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  },
  MODULE_VERSIONS: {
    SECURITY: '2.0.0',
    VALIDATION: '2.0.0',
    BUSINESS: '2.0.0',
    COMMON: '1.0.0'
  }
} as const