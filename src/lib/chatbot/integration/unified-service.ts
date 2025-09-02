/**
 * Unified Chatbot Service - Main integration service coordinating all modules
 * Provides a single entry point for all chatbot functionality with optimized performance
 */

import { RefactoredSecurityManager } from '../security/refactored-security-manager'
import { RefactoredValidationService } from '../validation/refactored-validation-service'
import { EnhancedBusinessExtractor } from '../business/enhanced-business-extractor'
import { RequestCacheCoordinator } from '../performance/request-cache-coordinator'
import { PerformanceMonitor } from '../performance/performance-monitor'
import { 
  RequestContext, 
  StandardResponse, 
  PerformanceMetrics,
  ModuleStatus,
  COMMON_CONSTANTS
} from '../interfaces/common-types'
import { CollectedInfo } from '../chat'
import { log } from '@/lib/logger'
import { 
  UnifiedContextMetadata, 
  SecurityResult, 
  ValidationServiceResult, 
  BusinessAnalysisResult, 
  ServiceHealthStats, 
  OptimizationResult
} from '@/types/chatbot'

export interface UnifiedChatRequest {
  message: string
  sessionId: string
  browserId?: string
  context?: UnifiedContextMetadata
}

export interface UnifiedChatResponse extends StandardResponse<{
  allowed: boolean
  extractedInfo?: Partial<CollectedInfo>
  sanitizedMessage?: string
  businessAnalysis?: {
    qualityScore: number
    completeness: number
    confidenceScores: Record<string, number>
  } | null
  securityLevel?: string
  recommendations?: string[]
}> {
  // Additional chatbot-specific fields will be included in data
}

export interface ServiceConfiguration {
  security: {
    enabled: boolean
    strictMode: boolean
    customCommands?: string[]
  }
  validation: {
    enabled: boolean
    enableCaching: boolean
    enableLanguageDetection: boolean
    strictMode: boolean
  }
  business: {
    enabled: boolean
    confidenceThreshold: number
    fuzzyMatchEnabled: boolean
  }
  performance: {
    enableRequestCaching: boolean
    enablePerformanceMonitoring: boolean
    cacheOptimization: boolean
  }
}

/**
 * Unified service coordinating all chatbot modules
 */
export class UnifiedChatbotService {
  private static config: ServiceConfiguration = {
    security: {
      enabled: true,
      strictMode: false
    },
    validation: {
      enabled: true,
      enableCaching: true,
      enableLanguageDetection: true,
      strictMode: false
    },
    business: {
      enabled: true,
      confidenceThreshold: 0.6,
      fuzzyMatchEnabled: true
    },
    performance: {
      enableRequestCaching: true,
      enablePerformanceMonitoring: true,
      cacheOptimization: true
    }
  }

  private static initialized = false

  /**
   * Initialize the unified chatbot service
   */
  static async initialize(configuration?: Partial<ServiceConfiguration>): Promise<void> {
    if (this.initialized) return

    // Merge configuration
    if (configuration) {
      this.config = { ...this.config, ...configuration }
    }

    // Configure individual modules
    if (this.config.validation.enabled) {
      RefactoredValidationService.configure({
        enableCaching: this.config.validation.enableCaching,
        enableLanguageDetection: this.config.validation.enableLanguageDetection,
        strictMode: this.config.validation.strictMode
      })
    }

    if (this.config.performance.enableRequestCaching) {
      RequestCacheCoordinator.configure({
        enableRequestLevelCache: true,
        enableCrossDependencyInvalidation: true,
        compressionEnabled: this.config.performance.cacheOptimization
      })
    }

    // Register modules with performance monitor
    if (this.config.performance.enablePerformanceMonitoring) {
      this.registerModules()
    }

    this.initialized = true
    log.info('Unified chatbot service initialized', {}, { config: this.config })
  }

  /**
   * Process a complete chat message through all modules
   */
  static async processChatMessage(
    request: UnifiedChatRequest
  ): Promise<UnifiedChatResponse> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()
    
    // Create request context
    const context: RequestContext = {
      requestId,
      sessionId: request.sessionId,
      timestamp: startTime,
      ...(request.context?.userAgent && { userAgent: request.context.userAgent }),
      ...(request.context?.ipAddress && { ipAddress: request.context.ipAddress }),
      ...(request.context?.metadata && { metadata: request.context.metadata })
    }

    // Initialize request cache
    if (this.config.performance.enableRequestCaching) {
      RequestCacheCoordinator.initializeRequestCache(context)
    }

    // Start performance tracking
    let performanceTracker: ((success?: boolean, errorType?: string, customMetrics?: Record<string, number>) => void) | undefined
    if (this.config.performance.enablePerformanceMonitoring) {
      performanceTracker = PerformanceMonitor.startTracking('unified', 'processChatMessage', context)
    }

    try {
      // Phase 1: Security Check
      let securityResult: SecurityResult = { isAllowed: true, level: 'clean' }
      if (this.config.security.enabled) {
        securityResult = await this.executeSecurityCheck(request, context)
        if (!securityResult.isAllowed) {
          return this.createResponse(context, {
            success: false,
            errors: [{
              code: COMMON_CONSTANTS.ERROR_CODES.SECURITY_VIOLATION,
              message: securityResult.reason || 'Security violation detected',
              severity: 'high'
            }],
            data: {
              allowed: false,
              securityLevel: securityResult.level
            }
          }, startTime)
        }
      }

      // Phase 2: Validation
      let validationResult: ValidationServiceResult = { success: true, errors: [] }
      if (this.config.validation.enabled) {
        validationResult = await this.executeValidation(request, context)
        if (!validationResult.success) {
          return this.createResponse(context, {
            success: false,
            errors: validationResult.errors.map((error: string) => ({
              code: COMMON_CONSTANTS.ERROR_CODES.VALIDATION_FAILED,
              message: error,
              severity: 'medium'
            })),
            data: {
              allowed: false,
              ...(validationResult.sanitized?.message && { sanitizedMessage: validationResult.sanitized.message })
            }
          }, startTime)
        }
      }

      // Phase 3: Business Information Extraction
      let businessAnalysis: BusinessAnalysisResult | null = null
      if (this.config.business.enabled) {
        businessAnalysis = await this.executeBusinessExtraction(request, context)
      }

      // Create successful response
      const response = this.createResponse(context, {
        success: true,
        errors: [],
        warnings: [
          ...(validationResult.warnings || []),
          ...(businessAnalysis?.recommendations || [])
        ],
        data: {
          allowed: true,
          ...(businessAnalysis?.extractedInfo && { extractedInfo: businessAnalysis.extractedInfo as Partial<CollectedInfo> }),
          ...(validationResult.sanitized?.message && { sanitizedMessage: validationResult.sanitized.message }),
          ...((validationResult.sanitized?.message || request.message) && { sanitizedMessage: validationResult.sanitized?.message || request.message }),
          ...(businessAnalysis && { businessAnalysis: {
            qualityScore: businessAnalysis.qualityScore,
            completeness: businessAnalysis.completeness,
            confidenceScores: businessAnalysis.confidenceScores
          }}),
          ...(securityResult.level && { securityLevel: securityResult.level }),
          ...(validationResult.warnings?.length || businessAnalysis?.recommendations?.length) && { recommendations: [
            ...(validationResult.warnings || []),
            ...(businessAnalysis?.recommendations || [])
          ]}
        }
      }, startTime)

      // Record successful performance metric
      if (performanceTracker) {
        performanceTracker(true)
      }

      return response

    } catch (error) {
      // Record failed performance metric
      if (performanceTracker) {
        performanceTracker(false, error instanceof Error ? error.constructor.name : 'UnknownError')
      }

      log.error('Chat message processing failed', { requestId }, {
        error: error instanceof Error ? error.message : 'Unknown error',
        request: { sessionId: request.sessionId, messageLength: request.message.length }
      })

      return this.createResponse(context, {
        success: false,
        errors: [{
          code: COMMON_CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
          message: 'Internal processing error',
          severity: 'critical'
        }],
        data: {
          allowed: false
        }
      }, startTime)

    } finally {
      // Cleanup request cache
      if (this.config.performance.enableRequestCaching) {
        RequestCacheCoordinator.cleanupRequestCache(context)
      }
    }
  }

  /**
   * Get service health status
   */
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'critical'
    modules: ModuleStatus[]
    performance: PerformanceMetrics | null
    uptime: number
    version: string
  }> {
    const modules: ModuleStatus[] = []
    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy'

    // Check security module
    if (this.config.security.enabled) {
      const securityHealth = this.checkSecurityModuleHealth()
      modules.push(securityHealth)
      if (securityHealth.status === 'error') overallStatus = 'critical'
      else if (securityHealth.status === 'degraded' && overallStatus === 'healthy') overallStatus = 'degraded'
    }

    // Check validation module
    if (this.config.validation.enabled) {
      const validationHealth = this.checkValidationModuleHealth()
      modules.push(validationHealth)
      if (validationHealth.status === 'error') overallStatus = 'critical'
      else if (validationHealth.status === 'degraded' && overallStatus === 'healthy') overallStatus = 'degraded'
    }

    // Check business module
    if (this.config.business.enabled) {
      const businessHealth = this.checkBusinessModuleHealth()
      modules.push(businessHealth)
      if (businessHealth.status === 'error') overallStatus = 'critical'
      else if (businessHealth.status === 'degraded' && overallStatus === 'healthy') overallStatus = 'degraded'
    }

    const performance = this.config.performance.enablePerformanceMonitoring 
      ? PerformanceMonitor.getPerformanceReport() as unknown as PerformanceMetrics
      : null

    return {
      status: overallStatus,
      modules,
      performance,
      uptime: Date.now() - (this.initialized ? Date.now() - 60000 : Date.now()), // Placeholder
      version: COMMON_CONSTANTS.MODULE_VERSIONS.COMMON
    }
  }

  /**
   * Get service statistics and metrics
   */
  static getServiceStats(): ServiceHealthStats & { config: ServiceConfiguration } {
    return {
      config: this.config,
      performance: this.config.performance.enablePerformanceMonitoring 
        ? PerformanceMonitor.getPerformanceReport() as any
        : null,
      cacheStats: this.config.performance.enableRequestCaching
        ? RequestCacheCoordinator.getCoordinationStats()
        : null,
      uptime: Date.now() - (this.initialized ? Date.now() - 60000 : Date.now())
    }
  }

  /**
   * Optimize service performance
   */
  static async optimizePerformance(): Promise<{
    optimizations: string[]
    performance: {
      before: ServiceHealthStats & { config: ServiceConfiguration }
      after: ServiceHealthStats & { config: ServiceConfiguration }
    }
  }> {
    const beforeStats = this.getServiceStats()
    const optimizations: string[] = []

    // Optimize validation caches
    if (this.config.validation.enabled && this.config.validation.enableCaching) {
      RefactoredValidationService.cleanup()
      optimizations.push('Cleaned up validation caches')
    }

    // Optimize performance monitoring
    if (this.config.performance.enablePerformanceMonitoring) {
      const perfOptimization: OptimizationResult = PerformanceMonitor.optimizePerformance()
      optimizations.push(...perfOptimization.prioritizedActions.slice(0, 3))
    }

    const afterStats = this.getServiceStats()

    return {
      optimizations,
      performance: {
        before: beforeStats,
        after: afterStats
      }
    }
  }

  // Private helper methods

  private static async executeSecurityCheck(
    request: UnifiedChatRequest,
    context: RequestContext
  ): Promise<SecurityResult> {
    const result = RequestCacheCoordinator.getCachedResult(context, 'security', request.message) ||
      await RefactoredSecurityManager.checkUserSecurity(
        request.sessionId,
        request.message,
        undefined, // request object would be passed here in real implementation
        { requestId: context.requestId }
      )
    return result as SecurityResult
  }

  private static async executeValidation(
    request: UnifiedChatRequest,
    context: RequestContext
  ): Promise<ValidationServiceResult> {
    const cacheKey = `${request.sessionId}:${request.message}`
    const cachedResult = RequestCacheCoordinator.getCachedResult(context, 'validation', cacheKey)
    if (cachedResult) return cachedResult as ValidationServiceResult
    
    const validationResult = await RefactoredValidationService.validateChatMessage(
      {
        message: request.message,
        sessionId: request.sessionId,
        browserId: request.browserId
      },
      request.sessionId
    )
    
    return validationResult as ValidationServiceResult
  }

  private static async executeBusinessExtraction(
    request: UnifiedChatRequest,
    context: RequestContext
  ): Promise<BusinessAnalysisResult> {
    const cacheKey = `business:${request.message}`
    
    let cachedResult = RequestCacheCoordinator.getCachedResult(context, 'business', cacheKey)
    if (cachedResult) return cachedResult as BusinessAnalysisResult

    const analysis = EnhancedBusinessExtractor.extractBusinessInfo(request.message)
    
    // Transform to BusinessAnalysisResult format
    const businessResult: BusinessAnalysisResult = {
      extractedInfo: analysis.extractedInfo as any,
      qualityScore: analysis.qualityScore || 0,
      completeness: analysis.completeness || 0,
      confidenceScores: analysis.confidenceScores || {},
      recommendations: analysis.recommendations
    }
    
    // Cache if above confidence threshold
    if (businessResult.qualityScore >= this.config.business.confidenceThreshold) {
      RequestCacheCoordinator.cacheResult(context, 'business', cacheKey, businessResult, {
        ttl: COMMON_CONSTANTS.CACHE_TTL.MEDIUM,
        dependencies: ['business-patterns']
      })
    }

    return businessResult
  }

  private static createResponse(
    context: RequestContext,
    responseData: {
      success: boolean
      errors: Array<{ code: string; message: string; severity: string }>
      warnings?: string[]
      data: {
        allowed: boolean
        extractedInfo?: Partial<CollectedInfo>
        sanitizedMessage?: string
        businessAnalysis?: {
          qualityScore: number
          completeness: number
          confidenceScores: Record<string, number>
        } | null
        securityLevel?: string
        recommendations?: string[]
      }
    },
    startTime: number
  ): UnifiedChatResponse {
    const performance: PerformanceMetrics = {
      duration: Date.now() - startTime,
      cacheHit: false // This would be determined by cache usage
    }

    return {
      success: responseData.success,
      data: responseData.data,
      errors: responseData.errors.map(error => ({
        code: error.code,
        message: error.message,
        severity: error.severity as 'low' | 'medium' | 'high' | 'critical'
      })),
      warnings: responseData.warnings || [],
      timestamp: Date.now(),
      metadata: {
        requestId: context.requestId,
        performance,
        moduleVersion: COMMON_CONSTANTS.MODULE_VERSIONS.COMMON,
        sessionId: context.sessionId,
        processingPhases: this.getEnabledPhases().join(',')
      }
    }
  }

  private static getEnabledPhases(): string[] {
    const phases: string[] = []
    if (this.config.security.enabled) phases.push('security')
    if (this.config.validation.enabled) phases.push('validation')
    if (this.config.business.enabled) phases.push('business')
    return phases
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static registerModules(): void {
    const modules = [
      {
        name: 'security',
        version: COMMON_CONSTANTS.MODULE_VERSIONS.SECURITY,
        status: 'healthy' as const,
        lastCheck: Date.now(),
        dependencies: ['validation']
      },
      {
        name: 'validation',
        version: COMMON_CONSTANTS.MODULE_VERSIONS.VALIDATION,
        status: 'healthy' as const,
        lastCheck: Date.now(),
        dependencies: []
      },
      {
        name: 'business',
        version: COMMON_CONSTANTS.MODULE_VERSIONS.BUSINESS,
        status: 'healthy' as const,
        lastCheck: Date.now(),
        dependencies: ['validation']
      }
    ]

    modules.forEach(module => PerformanceMonitor.registerModule(module))
  }

  private static checkSecurityModuleHealth(): ModuleStatus {
    // This would perform actual health checks
    return {
      name: 'security',
      version: COMMON_CONSTANTS.MODULE_VERSIONS.SECURITY,
      status: 'healthy',
      lastCheck: Date.now(),
      dependencies: ['validation']
    }
  }

  private static checkValidationModuleHealth(): ModuleStatus {
    return {
      name: 'validation',
      version: COMMON_CONSTANTS.MODULE_VERSIONS.VALIDATION,
      status: 'healthy',
      lastCheck: Date.now(),
      dependencies: []
    }
  }

  private static checkBusinessModuleHealth(): ModuleStatus {
    return {
      name: 'business',
      version: COMMON_CONSTANTS.MODULE_VERSIONS.BUSINESS,
      status: 'healthy',
      lastCheck: Date.now(),
      dependencies: ['validation']
    }
  }

}

export default UnifiedChatbotService