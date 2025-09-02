/**
 * Validation Cache - LRU cache with statistics for validation optimization
 * Provides intelligent caching for validation results with performance monitoring
 */

export interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  accessCount: number
  lastAccess: number
  ttl: number
  hash: string
}

export interface CacheStats {
  hits: number
  misses: number
  evictions: number
  size: number
  maxSize: number
  hitRatio: number
  avgAccessTime: number
  memoryUsage: number
}

export interface CacheConfig {
  maxSize: number
  defaultTTL: number
  cleanupInterval: number
  enableStats: boolean
  enableCompression: boolean
}

/**
 * High-performance LRU Cache with advanced features
 */
export class ValidationCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>()
  private accessOrder: string[] = []
  private stats: CacheStats
  private config: CacheConfig
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      enableStats: true,
      enableCompression: false,
      ...config
    }

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      maxSize: this.config.maxSize,
      hitRatio: 0,
      avgAccessTime: 0,
      memoryUsage: 0
    }

    // Start cleanup timer
    if (this.config.cleanupInterval > 0) {
      this.startCleanupTimer()
    }
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const startTime = Date.now()
    const entry = this.cache.get(key)

    if (!entry) {
      this.updateStats('miss', Date.now() - startTime)
      return null
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
      this.updateStats('miss', Date.now() - startTime)
      return null
    }

    // Update access information
    entry.accessCount++
    entry.lastAccess = Date.now()
    
    // Move to end of access order (most recently used)
    this.moveToEnd(key)
    
    this.updateStats('hit', Date.now() - startTime)
    return entry.data
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const effectiveTTL = ttl || this.config.defaultTTL
    const hash = this.generateHash(value)

    // Check if we need to evict
    if (!this.cache.has(key) && this.cache.size >= this.config.maxSize) {
      this.evictLRU()
    }

    // Remove existing entry from access order if updating
    if (this.cache.has(key)) {
      this.removeFromAccessOrder(key)
    }

    const entry: CacheEntry<T> = {
      data: this.config.enableCompression ? this.compress(value) : value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      ttl: effectiveTTL,
      hash
    }

    this.cache.set(key, entry)
    this.accessOrder.push(key)
    
    this.updateSize()
  }

  /**
   * Check if key exists in cache (without updating access)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.removeFromAccessOrder(key)
      this.updateSize()
    }
    return deleted
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.stats.size = 0
    this.stats.evictions = 0
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateMemoryUsage()
    return { ...this.stats }
  }

  /**
   * Get detailed cache information
   */
  getDetailedInfo(): {
    entries: Array<{
      key: string
      size: number
      accessCount: number
      age: number
      ttl: number
      expired: boolean
    }>
    config: CacheConfig
    stats: CacheStats
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: this.getEntrySize(entry),
      accessCount: entry.accessCount,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
      expired: this.isExpired(entry)
    }))

    return {
      entries,
      config: this.config,
      stats: this.getStats()
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const startSize = this.cache.size
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
    })

    const cleaned = startSize - this.cache.size
    this.updateSize()
    
    return cleaned
  }

  /**
   * Optimize cache by removing least accessed entries
   */
  optimize(): {
    entriesRemoved: number
    spaceFreed: number
  } {
    const targetSize = Math.floor(this.config.maxSize * 0.8) // Remove 20%
    let entriesRemoved = 0
    let spaceFreed = 0

    if (this.cache.size <= targetSize) {
      return { entriesRemoved: 0, spaceFreed: 0 }
    }

    // Sort by access count (ascending) to remove least accessed
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount)

    const toRemove = this.cache.size - targetSize
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      const entry_pair = entries[i]
      if (!entry_pair) continue
      const [key, entry] = entry_pair
      spaceFreed += this.getEntrySize(entry)
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
      entriesRemoved++
    }

    this.updateSize()
    return { entriesRemoved, spaceFreed }
  }

  /**
   * Get cache efficiency metrics
   */
  getEfficiencyMetrics(): {
    hitRatio: number
    avgAccessesPerEntry: number
    memoryEfficiency: number
    timeToLive: {
      avg: number
      min: number
      max: number
    }
  } {
    const entries = Array.from(this.cache.values())
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0)
    const avgAccessesPerEntry = entries.length > 0 ? totalAccesses / entries.length : 0

    const now = Date.now()
    const ttls = entries.map(entry => entry.ttl - (now - entry.timestamp))
    
    return {
      hitRatio: this.stats.hitRatio,
      avgAccessesPerEntry,
      memoryEfficiency: this.stats.size / this.stats.maxSize,
      timeToLive: {
        avg: ttls.length > 0 ? ttls.reduce((a, b) => a + b, 0) / ttls.length : 0,
        min: ttls.length > 0 ? Math.min(...ttls) : 0,
        max: ttls.length > 0 ? Math.max(...ttls) : 0
      }
    }
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }

  // Private methods

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder[0]
      if (lruKey) {
        this.cache.delete(lruKey)
        this.accessOrder.shift()
        this.stats.evictions++
      }
    }
  }

  private moveToEnd(key: string): void {
    this.removeFromAccessOrder(key)
    this.accessOrder.push(key)
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  private updateStats(type: 'hit' | 'miss', accessTime: number): void {
    if (!this.config.enableStats) return

    if (type === 'hit') {
      this.stats.hits++
    } else {
      this.stats.misses++
    }

    const totalRequests = this.stats.hits + this.stats.misses
    this.stats.hitRatio = totalRequests > 0 ? this.stats.hits / totalRequests : 0

    // Update average access time (rolling average)
    this.stats.avgAccessTime = (this.stats.avgAccessTime * 0.9) + (accessTime * 0.1)
  }

  private updateSize(): void {
    this.stats.size = this.cache.size
  }

  private updateMemoryUsage(): void {
    let totalSize = 0
    this.cache.forEach(entry => {
      totalSize += this.getEntrySize(entry)
    })
    this.stats.memoryUsage = totalSize
  }

  private getEntrySize(entry: CacheEntry<T>): number {
    try {
      // Rough estimation of memory usage
      const dataSize = JSON.stringify(entry.data).length
      const metadataSize = 64 // Approximate size of metadata
      return dataSize + metadataSize
    } catch {
      return 100 // Fallback size estimate
    }
  }

  private generateHash(value: T): string {
    try {
      const str = JSON.stringify(value)
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return hash.toString(36)
    } catch {
      return Date.now().toString(36)
    }
  }

  private compress(value: T): T {
    // Simple compression placeholder - in production, use actual compression
    return value
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }
}

/**
 * Singleton validation cache instances for different validation types
 */
export class ValidationCacheManager {
  private static instances = new Map<string, ValidationCache>()

  /**
   * Get cache instance for specific validation type
   */
  static getCache<T>(
    type: string,
    config?: Partial<CacheConfig>
  ): ValidationCache<T> {
    if (!this.instances.has(type)) {
      this.instances.set(type, new ValidationCache<T>(config))
    }
    return this.instances.get(type) as ValidationCache<T>
  }

  /**
   * Get security pattern cache
   */
  static getSecurityCache(): ValidationCache {
    return this.getCache('security', {
      maxSize: 200,
      defaultTTL: 10 * 60 * 1000, // 10 minutes for security patterns
      enableStats: true
    })
  }

  /**
   * Get contact validation cache
   */
  static getContactCache(): ValidationCache {
    return this.getCache('contact', {
      maxSize: 50,
      defaultTTL: 15 * 60 * 1000, // 15 minutes for contact validation
      enableStats: true
    })
  }

  /**
   * Get sanitization cache
   */
  static getSanitizationCache(): ValidationCache {
    return this.getCache('sanitization', {
      maxSize: 150,
      defaultTTL: 5 * 60 * 1000, // 5 minutes for sanitization
      enableStats: true
    })
  }

  /**
   * Get general validation cache
   */
  static getGeneralCache(): ValidationCache {
    return this.getCache('general', {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000,
      enableStats: true
    })
  }

  /**
   * Clear all cache instances
   */
  static clearAll(): void {
    this.instances.forEach(cache => cache.clear())
  }

  /**
   * Get combined statistics from all cache instances
   */
  static getCombinedStats(): {
    totalCaches: number
    totalEntries: number
    totalHits: number
    totalMisses: number
    avgHitRatio: number
    totalMemoryUsage: number
  } {
    const stats = Array.from(this.instances.values()).map(cache => cache.getStats())
    
    return {
      totalCaches: this.instances.size,
      totalEntries: stats.reduce((sum, s) => sum + s.size, 0),
      totalHits: stats.reduce((sum, s) => sum + s.hits, 0),
      totalMisses: stats.reduce((sum, s) => sum + s.misses, 0),
      avgHitRatio: stats.length > 0 ? 
        stats.reduce((sum, s) => sum + s.hitRatio, 0) / stats.length : 0,
      totalMemoryUsage: stats.reduce((sum, s) => sum + s.memoryUsage, 0)
    }
  }

  /**
   * Cleanup all cache instances
   */
  static cleanupAll(): number {
    let totalCleaned = 0
    this.instances.forEach(cache => {
      totalCleaned += cache.cleanup()
    })
    return totalCleaned
  }

  /**
   * Destroy all cache instances
   */
  static destroyAll(): void {
    this.instances.forEach(cache => cache.destroy())
    this.instances.clear()
  }
}

export default ValidationCache