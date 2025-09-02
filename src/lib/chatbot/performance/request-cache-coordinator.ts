/**
 * Request Cache Coordinator - Cross-module caching coordination
 * Manages request-level caching and performance optimization across modules
 */

import { RequestContext, PerformanceMetrics, CacheMetadata } from '../interfaces/common-types'
import { ValidationCacheManager } from '../validation/validation-cache'

export interface RequestCacheEntry {
  data: unknown
  metadata: CacheMetadata
  performance: PerformanceMetrics
  dependencies: string[]
  invalidationTriggers: string[]
}

export interface CacheCoordinationConfig {
  enableRequestLevelCache: boolean
  enableCrossDependencyInvalidation: boolean
  maxRequestCacheSize: number
  defaultTTL: number
  compressionEnabled: boolean
  metricsCollectionEnabled: boolean
}

export interface CacheHierarchy {
  level: 'request' | 'session' | 'global'
  priority: number
  ttl: number
  dependencies: string[]
}

/**
 * Request-level cache coordinator for performance optimization
 */
export class RequestCacheCoordinator {
  private static requestCaches = new Map<string, Map<string, RequestCacheEntry>>()
  private static config: CacheCoordinationConfig = {
    enableRequestLevelCache: true,
    enableCrossDependencyInvalidation: true,
    maxRequestCacheSize: 100,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    compressionEnabled: false,
    metricsCollectionEnabled: true
  }
  private static metrics = {
    requests: 0,
    hits: 0,
    misses: 0,
    invalidations: 0,
    memoryUsage: 0
  }

  /**
   * Configure cache coordination
   */
  static configure(newConfig: Partial<CacheCoordinationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Initialize request cache for a new request
   */
  static initializeRequestCache(context: RequestContext): void {
    if (!this.config.enableRequestLevelCache) return

    if (!this.requestCaches.has(context.requestId)) {
      this.requestCaches.set(context.requestId, new Map())
    }

    // Cleanup old request caches
    this.cleanupExpiredRequestCaches()
  }

  /**
   * Get cached result for a specific operation within a request
   */
  static getCachedResult<T>(
    context: RequestContext,
    operation: string,
    key: string
  ): T | null {
    if (!this.config.enableRequestLevelCache) return null

    const requestCache = this.requestCaches.get(context.requestId)
    if (!requestCache) return null

    const cacheKey = `${operation}:${key}`
    const entry = requestCache.get(cacheKey)

    if (!entry) {
      this.metrics.misses++
      return null
    }

    // Check TTL
    if (Date.now() - entry.metadata.ttl > entry.performance.duration) {
      requestCache.delete(cacheKey)
      this.metrics.misses++
      return null
    }

    this.metrics.hits++
    return entry.data as T
  }

  /**
   * Cache result for a specific operation within a request
   */
  static cacheResult<T>(
    context: RequestContext,
    operation: string,
    key: string,
    data: T,
    options: {
      ttl?: number
      dependencies?: string[]
      invalidationTriggers?: string[]
      tags?: string[]
    } = {}
  ): void {
    if (!this.config.enableRequestLevelCache) return

    let requestCache = this.requestCaches.get(context.requestId)
    if (!requestCache) {
      requestCache = new Map()
      this.requestCaches.set(context.requestId, requestCache)
    }

    const cacheKey = `${operation}:${key}`
    const entry: RequestCacheEntry = {
      data,
      metadata: {
        key: cacheKey,
        ttl: options.ttl || this.config.defaultTTL,
        tags: options.tags || []
      },
      performance: {
        duration: Date.now(),
        cacheHit: false
      },
      dependencies: options.dependencies || [],
      invalidationTriggers: options.invalidationTriggers || []
    }

    requestCache.set(cacheKey, entry)

    // Enforce cache size limit
    this.enforceCacheSizeLimit(requestCache)
  }

  /**
   * Coordinate caching across multiple modules
   */
  static coordinateMultiModuleCache(
    context: RequestContext,
    operations: Array<{
      module: string
      operation: string
      key: string
      data: unknown
      hierarchy: CacheHierarchy
    }>
  ): void {
    // Sort by cache hierarchy priority
    operations.sort((a, b) => a.hierarchy.priority - b.hierarchy.priority)

    operations.forEach(op => {
      switch (op.hierarchy.level) {
        case 'request':
          this.cacheResult(context, `${op.module}:${op.operation}`, op.key, op.data, {
            ttl: op.hierarchy.ttl,
            dependencies: op.hierarchy.dependencies
          })
          break

        case 'session':
          // Cache in session-level cache
          const sessionCache = ValidationCacheManager.getCache(`session:${context.sessionId}`)
          sessionCache.set(op.key, op.data, op.hierarchy.ttl)
          break

        case 'global':
          // Cache in global module cache
          const globalCache = ValidationCacheManager.getCache(op.module)
          globalCache.set(op.key, op.data, op.hierarchy.ttl)
          break
      }
    })
  }

  /**
   * Invalidate cache entries based on dependencies
   */
  static invalidateDependentCaches(
    context: RequestContext,
    changedDependency: string
  ): number {
    if (!this.config.enableCrossDependencyInvalidation) return 0

    let invalidatedCount = 0
    const requestCache = this.requestCaches.get(context.requestId)

    if (requestCache) {
      const keysToInvalidate: string[] = []

      requestCache.forEach((entry, key) => {
        if (entry.dependencies.includes(changedDependency) ||
            entry.invalidationTriggers.includes(changedDependency)) {
          keysToInvalidate.push(key)
        }
      })

      keysToInvalidate.forEach(key => {
        requestCache.delete(key)
        invalidatedCount++
      })

      this.metrics.invalidations += invalidatedCount
    }

    return invalidatedCount
  }

  /**
   * Get cache performance analytics
   */
  static getCacheAnalytics(context?: RequestContext): {
    overall: typeof RequestCacheCoordinator.metrics
    request?: {
      cacheSize: number
      hitRatio: number
      entries: Array<{
        key: string
        age: number
        size: number
        dependencies: string[]
      }>
    }
    recommendations: string[]
  } {
    const recommendations: string[] = []
    const hitRatio = this.metrics.requests > 0 ? this.metrics.hits / this.metrics.requests : 0

    if (hitRatio < 0.6) {
      recommendations.push('Consider increasing cache TTL for better hit ratio')
    }

    if (this.metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Memory usage is high, consider cache size optimization')
    }

    let requestAnalytics
    if (context) {
      const requestCache = this.requestCaches.get(context.requestId)
      if (requestCache) {
        const entries = Array.from(requestCache.entries()).map(([key, entry]) => ({
          key,
          age: Date.now() - entry.performance.duration,
          size: this.estimateSize(entry.data),
          dependencies: entry.dependencies
        }))

        const requestHitRatio = entries.length > 0 ? 
          entries.filter(e => e.age < 60000).length / entries.length : 0

        requestAnalytics = {
          cacheSize: requestCache.size,
          hitRatio: requestHitRatio,
          entries
        }
      }
    }

    const result: any = {
      overall: { ...this.metrics },
      recommendations
    }
    
    if (requestAnalytics) {
      result.request = requestAnalytics
    }
    
    return result
  }

  /**
   * Optimize cache performance
   */
  static optimizeCache(context: RequestContext): {
    optimizations: string[]
    beforeStats: ReturnType<typeof RequestCacheCoordinator.getCacheAnalytics>
    afterStats: ReturnType<typeof RequestCacheCoordinator.getCacheAnalytics>
  } {
    const beforeStats = this.getCacheAnalytics(context)
    const optimizations: string[] = []
    const requestCache = this.requestCaches.get(context.requestId)

    if (requestCache) {
      // Remove expired entries
      const now = Date.now()
      const expiredKeys: string[] = []

      requestCache.forEach((entry, key) => {
        if (now - entry.performance.duration > entry.metadata.ttl) {
          expiredKeys.push(key)
        }
      })

      expiredKeys.forEach(key => requestCache.delete(key))
      if (expiredKeys.length > 0) {
        optimizations.push(`Removed ${expiredKeys.length} expired entries`)
      }

      // Compress large entries if compression is enabled
      if (this.config.compressionEnabled) {
        let compressedCount = 0
        requestCache.forEach((entry) => {
          const size = this.estimateSize(entry.data)
          if (size > 1024) { // 1KB threshold
            // Placeholder for compression logic
            compressedCount++
          }
        })

        if (compressedCount > 0) {
          optimizations.push(`Compressed ${compressedCount} large entries`)
        }
      }

      // Remove least recently used entries if cache is too large
      if (requestCache.size > this.config.maxRequestCacheSize) {
        const sortedEntries = Array.from(requestCache.entries())
          .sort((a, b) => a[1].performance.duration - b[1].performance.duration)

        const toRemove = requestCache.size - this.config.maxRequestCacheSize
        for (let i = 0; i < toRemove; i++) {
          requestCache.delete(sortedEntries[i]![0])
        }

        optimizations.push(`Removed ${toRemove} LRU entries`)
      }
    }

    const afterStats = this.getCacheAnalytics(context)

    return {
      optimizations,
      beforeStats,
      afterStats
    }
  }

  /**
   * Cleanup request cache when request is complete
   */
  static cleanupRequestCache(context: RequestContext): void {
    const deleted = this.requestCaches.delete(context.requestId)
    if (deleted && this.config.metricsCollectionEnabled) {
      // Update metrics
      this.updateMemoryUsage()
    }
  }

  /**
   * Get cache warmup suggestions
   */
  static getCacheWarmupSuggestions(context: RequestContext): {
    suggestions: Array<{
      operation: string
      key: string
      priority: number
      reason: string
    }>
    estimatedBenefit: number
  } {
    // Common patterns that benefit from warmup
    const commonOperations = [
      {
        operation: 'security:pattern-match',
        key: 'common-phrases',
        priority: 1,
        reason: 'Frequently used security patterns'
      },
      {
        operation: 'validation:contact-info',
        key: 'format-validation',
        priority: 2,
        reason: 'Standard contact validation rules'
      },
      {
        operation: 'business:extraction',
        key: 'business-terms',
        priority: 3,
        reason: 'Common business terminology extraction'
      }
    ]

    // Calculate estimated benefit based on hit ratio
    const analytics = this.getCacheAnalytics(context)
    const currentHitRatio = analytics.overall.requests > 0 ? 
      analytics.overall.hits / analytics.overall.requests : 0
    
    const estimatedBenefit = Math.max(0, (0.8 - currentHitRatio) * 100) // Target 80% hit ratio

    return {
      suggestions: commonOperations,
      estimatedBenefit
    }
  }

  // Private helper methods

  private static enforceCacheSizeLimit(cache: Map<string, RequestCacheEntry>): void {
    if (cache.size > this.config.maxRequestCacheSize) {
      // Remove oldest entry (LRU)
      const oldestKey = Array.from(cache.keys())[0]
      if (oldestKey) cache.delete(oldestKey)
    }
  }

  private static cleanupExpiredRequestCaches(): void {
    const now = Date.now()
    const expiredRequestIds: string[] = []

    this.requestCaches.forEach((_, requestId) => {
      // Remove request caches older than 1 hour
      const cacheAge = now - this.extractTimestampFromRequestId(requestId)
      if (cacheAge > 60 * 60 * 1000) {
        expiredRequestIds.push(requestId)
      }
    })

    expiredRequestIds.forEach(id => {
      this.requestCaches.delete(id)
    })
  }

  private static extractTimestampFromRequestId(requestId: string): number {
    // Extract timestamp from request ID format: prefix_timestamp_random
    const parts = requestId.split('_')
    if (parts.length >= 2) {
      const timestamp = parseInt(parts[1]!, 10)
      if (!isNaN(timestamp)) {
        return timestamp
      }
    }
    // Fallback to 30 minutes ago if extraction fails
    return Date.now() - 30 * 60 * 1000
  }

  private static estimateSize(data: unknown): number {
    try {
      return JSON.stringify(data).length * 2 // Rough estimation
    } catch {
      return 100 // Fallback
    }
  }

  private static updateMemoryUsage(): void {
    let totalSize = 0
    this.requestCaches.forEach(cache => {
      cache.forEach(entry => {
        totalSize += this.estimateSize(entry)
      })
    })
    this.metrics.memoryUsage = totalSize
  }

  /**
   * Get cache coordination statistics
   */
  static getCoordinationStats(): {
    activeRequests: number
    totalCacheSize: number
    crossModuleHits: number
    invalidationEfficiency: number
    config: CacheCoordinationConfig
  } {
    return {
      activeRequests: this.requestCaches.size,
      totalCacheSize: Array.from(this.requestCaches.values())
        .reduce((sum, cache) => sum + cache.size, 0),
      crossModuleHits: this.metrics.hits,
      invalidationEfficiency: this.metrics.invalidations > 0 ? 
        this.metrics.hits / this.metrics.invalidations : 1,
      config: this.config
    }
  }
}

export default RequestCacheCoordinator