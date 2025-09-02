/**
 * Performance Monitor - Cross-module performance monitoring and optimization
 * Tracks performance metrics, bottlenecks, and provides optimization recommendations
 */

import { 
  MonitoringMetrics, 
  ModuleStatus, 
  RequestContext
} from '../interfaces/common-types'

export interface PerformanceThresholds {
  responseTime: {
    warning: number
    critical: number
  }
  memoryUsage: {
    warning: number
    critical: number
  }
  errorRate: {
    warning: number
    critical: number
  }
  cacheHitRatio: {
    warning: number
    critical: number
  }
}

export interface PerformanceBenchmark {
  operation: string
  module: string
  averageTime: number
  percentiles: {
    p50: number
    p90: number
    p95: number
    p99: number
  }
  errorRate: number
  throughput: number
  lastUpdated: number
}

export interface PerformanceReport {
  summary: {
    overallHealth: 'healthy' | 'degraded' | 'critical'
    totalRequests: number
    averageResponseTime: number
    errorRate: number
    cacheHitRatio: number
  }
  modules: ModuleStatus[]
  bottlenecks: Array<{
    module: string
    operation: string
    severity: 'low' | 'medium' | 'high'
    impact: string
    recommendation: string
  }>
  trends: Array<{
    metric: string
    trend: 'improving' | 'stable' | 'degrading'
    change: number
  }>
  recommendations: string[]
}

/**
 * Performance monitoring and optimization system
 */
export class PerformanceMonitor {
  private static metrics = new Map<string, MonitoringMetrics[]>()
  private static benchmarks = new Map<string, PerformanceBenchmark>()
  private static thresholds: PerformanceThresholds = {
    responseTime: { warning: 500, critical: 2000 },
    memoryUsage: { warning: 100 * 1024 * 1024, critical: 500 * 1024 * 1024 },
    errorRate: { warning: 0.05, critical: 0.1 },
    cacheHitRatio: { warning: 0.6, critical: 0.4 }
  }
  private static moduleStatuses = new Map<string, ModuleStatus>()

  /**
   * Record performance metric for an operation
   */
  static recordMetric(metric: MonitoringMetrics): void {
    const key = `${metric.module}:${metric.operation}`
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const metrics = this.metrics.get(key)!
    metrics.push(metric)
    
    // Keep only last 1000 metrics per operation
    if (metrics.length > 1000) {
      metrics.shift()
    }
    
    // Update real-time benchmarks
    this.updateBenchmark(key, metric)
    
    // Check for threshold violations
    this.checkThresholds(metric)
  }

  /**
   * Start performance tracking for an operation
   */
  static startTracking(
    module: string,
    operation: string,
    _context?: RequestContext
  ): () => MonitoringMetrics {
    const startTime = Date.now()
    const startMemory = this.getMemoryUsage()
    
    return (success: boolean = true, errorType?: string, customMetrics?: Record<string, number>) => {
      const duration = Date.now() - startTime
      const endMemory = this.getMemoryUsage()
      
      const metric: any = {
        module,
        operation,
        duration,
        success,
        resourceUsage: {
          memory: endMemory - startMemory,
          cpu: 0 // Placeholder - would need actual CPU monitoring
        }
      }
      
      if (errorType) {
        metric.errorType = errorType
      }
      
      if (customMetrics) {
        metric.customMetrics = customMetrics
      }
      
      const finalMetric = metric as MonitoringMetrics
      
      this.recordMetric(finalMetric)
      return finalMetric
    }
  }

  /**
   * Batch record multiple metrics
   */
  static recordBatch(metrics: MonitoringMetrics[]): void {
    metrics.forEach(metric => this.recordMetric(metric))
  }

  /**
   * Get performance report for specific module or overall
   */
  static getPerformanceReport(module?: string): PerformanceReport {
    const relevantMetrics = module 
      ? Array.from(this.metrics.entries()).filter(([key]) => key.startsWith(`${module}:`))
      : Array.from(this.metrics.entries())
    
    const allMetrics = relevantMetrics.flatMap(([, metrics]) => metrics)
    
    // Calculate summary
    const totalRequests = allMetrics.length
    const averageResponseTime = allMetrics.length > 0 
      ? allMetrics.reduce((sum, m) => sum + m.duration, 0) / allMetrics.length
      : 0
    const errorRate = allMetrics.length > 0
      ? allMetrics.filter(m => !m.success).length / allMetrics.length
      : 0
    
    // Determine overall health
    let overallHealth: 'healthy' | 'degraded' | 'critical' = 'healthy'
    if (averageResponseTime > this.thresholds.responseTime.critical || 
        errorRate > this.thresholds.errorRate.critical) {
      overallHealth = 'critical'
    } else if (averageResponseTime > this.thresholds.responseTime.warning || 
               errorRate > this.thresholds.errorRate.warning) {
      overallHealth = 'degraded'
    }
    
    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(relevantMetrics)
    
    // Analyze trends
    const trends = this.analyzeTrends(relevantMetrics)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(allMetrics, bottlenecks.map(b => ({
      type: `${b.module}:${b.operation}`,
      severity: b.severity,
      description: b.impact,
      recommendation: b.recommendation
    })))
    
    return {
      summary: {
        overallHealth,
        totalRequests,
        averageResponseTime,
        errorRate,
        cacheHitRatio: this.calculateCacheHitRatio(allMetrics)
      },
      modules: Array.from(this.moduleStatuses.values()),
      bottlenecks,
      trends,
      recommendations
    }
  }

  /**
   * Get real-time performance metrics
   */
  static getRealTimeMetrics(timeWindow: number = 5 * 60 * 1000): {
    [module: string]: {
      operations: {
        [operation: string]: {
          avgDuration: number
          requestCount: number
          errorRate: number
          throughput: number
        }
      }
      overallHealth: 'healthy' | 'degraded' | 'critical'
    }
  } {
    const now = Date.now()
    const result: Record<string, unknown> = {}
    
    this.metrics.forEach((metrics, key) => {
      const [module, operation] = key.split(':')
      
      // Filter metrics within time window
      const recentMetrics = metrics.filter(m => 
        ('timestamp' in m ? m.timestamp as number : now) > now - timeWindow
      )
      
      if (recentMetrics.length === 0) return
      
      if (!result[module!]) {
        result[module!] = { operations: {}, overallHealth: 'healthy' }
      }
      
      const avgDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
      const errorRate = recentMetrics.filter(m => !m.success).length / recentMetrics.length
      const throughput = recentMetrics.length / (timeWindow / 1000) // requests per second
      
      const moduleResult = result[module!] as any
      moduleResult.operations[operation!] = {
        avgDuration,
        requestCount: recentMetrics.length,
        errorRate,
        throughput
      }
      
      // Update module health
      if (avgDuration > this.thresholds.responseTime.critical || 
          errorRate > this.thresholds.errorRate.critical) {
        moduleResult.overallHealth = 'critical'
      } else if (avgDuration > this.thresholds.responseTime.warning || 
                 errorRate > this.thresholds.errorRate.warning) {
        if (moduleResult.overallHealth === 'healthy') {
          moduleResult.overallHealth = 'degraded'
        }
      }
    })
    
    return result as any
  }

  /**
   * Set performance thresholds
   */
  static setThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds }
  }

  /**
   * Register module status
   */
  static registerModule(status: ModuleStatus): void {
    this.moduleStatuses.set(status.name, status)
  }

  /**
   * Update module status
   */
  static updateModuleStatus(
    moduleName: string, 
    updates: Partial<ModuleStatus>
  ): void {
    const existing = this.moduleStatuses.get(moduleName)
    if (existing) {
      this.moduleStatuses.set(moduleName, { ...existing, ...updates })
    }
  }

  /**
   * Optimize performance based on current metrics
   */
  static optimizePerformance(): {
    optimizations: Array<{
      module: string
      operation: string
      optimization: string
      expectedImprovement: number
    }>
    prioritizedActions: string[]
  } {
    const optimizations: Array<{
      module: string
      operation: string
      optimization: string
      expectedImprovement: number
    }> = []
    
    // Analyze each operation for optimization opportunities
    this.benchmarks.forEach((benchmark, key) => {
      const [module, operation] = key.split(':')
      
      // High response time optimization
      if (benchmark.averageTime > this.thresholds.responseTime.warning) {
        optimizations.push({
          module: module!,
          operation: operation!,
          optimization: 'Implement caching for frequently accessed data',
          expectedImprovement: 0.3 // 30% improvement
        })
      }
      
      // Low throughput optimization
      if (benchmark.throughput < 10) { // Less than 10 requests/second
        optimizations.push({
          module: module!,
          operation: operation!,
          optimization: 'Optimize algorithm or add parallel processing',
          expectedImprovement: 0.5 // 50% improvement
        })
      }
      
      // High error rate optimization
      if (benchmark.errorRate > this.thresholds.errorRate.warning) {
        optimizations.push({
          module: module!,
          operation: operation!,
          optimization: 'Improve error handling and input validation',
          expectedImprovement: 0.8 // 80% error reduction
        })
      }
    })
    
    // Sort by expected improvement
    optimizations.sort((a, b) => b.expectedImprovement - a.expectedImprovement)
    
    // Generate prioritized actions
    const prioritizedActions = [
      ...optimizations.slice(0, 3).map(o => o.optimization),
      'Enable performance monitoring alerts',
      'Implement automated performance testing',
      'Set up performance budgets for critical operations'
    ]
    
    return { optimizations, prioritizedActions }
  }

  /**
   * Export performance data for analysis
   */
  static exportMetrics(format: 'json' | 'csv' = 'json'): string {
    const data = {
      timestamp: new Date().toISOString(),
      thresholds: this.thresholds,
      benchmarks: Object.fromEntries(this.benchmarks),
      moduleStatuses: Object.fromEntries(this.moduleStatuses),
      recentMetrics: Object.fromEntries(
        Array.from(this.metrics.entries()).map(([key, metrics]) => [
          key,
          metrics.slice(-100) // Last 100 metrics per operation
        ])
      )
    }
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else {
      // CSV format (simplified)
      const csvRows = ['Module,Operation,AvgDuration,ErrorRate,Throughput']
      this.benchmarks.forEach((benchmark, key) => {
        const [module, operation] = key.split(':')
        csvRows.push(`${module!},${operation!},${benchmark.averageTime},${benchmark.errorRate},${benchmark.throughput}`)
      })
      return csvRows.join('\n')
    }
  }

  /**
   * Clear metrics data
   */
  static clearMetrics(olderThan?: number): void {
    if (olderThan) {
      const cutoff = Date.now() - olderThan
      this.metrics.forEach((metrics, key) => {
        const filtered = metrics.filter(m => 
          ('timestamp' in m ? m.timestamp as number : Date.now()) > cutoff
        )
        this.metrics.set(key, filtered)
      })
    } else {
      this.metrics.clear()
      this.benchmarks.clear()
    }
  }

  // Private helper methods

  private static updateBenchmark(key: string, metric: MonitoringMetrics): void {
    let benchmark = this.benchmarks.get(key)
    const [module, operation] = key.split(':')
    
    if (!benchmark) {
      benchmark = {
        operation: operation!,
        module: module!,
        averageTime: metric.duration,
        percentiles: { p50: 0, p90: 0, p95: 0, p99: 0 },
        errorRate: metric.success ? 0 : 1,
        throughput: 1,
        lastUpdated: Date.now()
      }
    }
    
    // Update rolling averages
    const alpha = 0.1 // Smoothing factor
    benchmark.averageTime = benchmark.averageTime * (1 - alpha) + metric.duration * alpha
    benchmark.errorRate = benchmark.errorRate * (1 - alpha) + (metric.success ? 0 : 1) * alpha
    benchmark.lastUpdated = Date.now()
    
    // Update percentiles (simplified)
    const recentMetrics = this.metrics.get(key) || []
    if (recentMetrics.length >= 20) {
      const sorted = recentMetrics.slice(-100).map(m => m.duration).sort((a, b) => a - b)
      benchmark.percentiles.p50 = sorted[Math.floor(sorted.length * 0.5)]!
      benchmark.percentiles.p90 = sorted[Math.floor(sorted.length * 0.9)]!
      benchmark.percentiles.p95 = sorted[Math.floor(sorted.length * 0.95)]!
      benchmark.percentiles.p99 = sorted[Math.floor(sorted.length * 0.99)]!
    }
    
    this.benchmarks.set(key, benchmark)
  }

  private static checkThresholds(metric: MonitoringMetrics): void {
    const alerts: string[] = []
    
    if (metric.duration > this.thresholds.responseTime.critical) {
      alerts.push(`Critical response time: ${metric.duration}ms in ${metric.module}:${metric.operation}`)
    }
    
    if (metric.resourceUsage?.memory && 
        metric.resourceUsage.memory > this.thresholds.memoryUsage.critical) {
      alerts.push(`Critical memory usage: ${metric.resourceUsage.memory} bytes in ${metric.module}:${metric.operation}`)
    }
    
    // Log alerts (in production, this would trigger actual alerts)
    alerts.forEach(alert => console.warn(`Performance Alert: ${alert}`))
  }

  private static identifyBottlenecks(
    relevantMetrics: Array<[string, MonitoringMetrics[]]>
  ): Array<{
    module: string
    operation: string
    severity: 'low' | 'medium' | 'high'
    impact: string
    recommendation: string
  }> {
    const bottlenecks: Array<{
      module: string
      operation: string
      severity: 'low' | 'medium' | 'high'
      impact: string
      recommendation: string
    }> = []
    
    relevantMetrics.forEach(([key, metrics]) => {
      const [module, operation] = key.split(':')
      const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
      const errorRate = metrics.filter(m => !m.success).length / metrics.length
      
      let severity: 'low' | 'medium' | 'high' = 'low'
      let impact = ''
      let recommendation = ''
      
      if (avgDuration > this.thresholds.responseTime.critical) {
        severity = 'high'
        impact = 'Critical impact on user experience'
        recommendation = 'Immediate optimization required - implement caching or optimize algorithm'
      } else if (avgDuration > this.thresholds.responseTime.warning) {
        severity = 'medium'
        impact = 'Noticeable impact on performance'
        recommendation = 'Consider optimization and performance tuning'
      }
      
      if (errorRate > this.thresholds.errorRate.warning) {
        severity = 'high'
        impact = 'High error rate affecting reliability'
        recommendation = 'Review error handling and input validation'
      }
      
      if (severity !== 'low') {
        bottlenecks.push({ module: module!, operation: operation!, severity, impact, recommendation })
      }
    })
    
    return bottlenecks.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  private static analyzeTrends(
    relevantMetrics: Array<[string, MonitoringMetrics[]]>
  ): Array<{
    metric: string
    trend: 'improving' | 'stable' | 'degrading'
    change: number
  }> {
    const trends: Array<{
      metric: string
      trend: 'improving' | 'stable' | 'degrading'
      change: number
    }> = []
    
    relevantMetrics.forEach(([key, metrics]) => {
      if (metrics.length < 10) return // Need sufficient data
      
      const halfPoint = Math.floor(metrics.length / 2)
      const firstHalf = metrics.slice(0, halfPoint)
      const secondHalf = metrics.slice(halfPoint)
      
      const firstAvg = firstHalf.reduce((sum, m) => sum + m.duration, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, m) => sum + m.duration, 0) / secondHalf.length
      
      const change = (secondAvg - firstAvg) / firstAvg
      let trend: 'improving' | 'stable' | 'degrading' = 'stable'
      
      if (change < -0.1) trend = 'improving' // 10% improvement
      else if (change > 0.1) trend = 'degrading' // 10% degradation
      
      trends.push({
        metric: key,
        trend,
        change: Math.round(change * 100) / 100
      })
    })
    
    return trends
  }

  private static generateRecommendations(
    allMetrics: MonitoringMetrics[],
    bottlenecks: Array<{
      type: string
      severity: 'low' | 'medium' | 'high'
      description: string
      recommendation: string
    }>
  ): string[] {
    const recommendations: string[] = []
    
    if (bottlenecks.length > 0) {
      recommendations.push('Address identified bottlenecks starting with highest severity')
    }
    
    const avgDuration = allMetrics.reduce((sum, m) => sum + m.duration, 0) / allMetrics.length
    if (avgDuration > this.thresholds.responseTime.warning) {
      recommendations.push('Implement performance caching strategy')
      recommendations.push('Consider code profiling to identify optimization opportunities')
    }
    
    const errorRate = allMetrics.filter(m => !m.success).length / allMetrics.length
    if (errorRate > this.thresholds.errorRate.warning) {
      recommendations.push('Improve error handling and input validation')
      recommendations.push('Implement better monitoring and alerting')
    }
    
    if (allMetrics.length > 1000) {
      recommendations.push('Consider implementing performance budgets')
      recommendations.push('Set up automated performance regression detection')
    }
    
    return recommendations
  }

  private static calculateCacheHitRatio(_metrics: MonitoringMetrics[]): number {
    // This would need integration with actual cache metrics
    return 0.75 // Placeholder
  }

  private static getMemoryUsage(): number {
    // Placeholder - in Node.js this would use process.memoryUsage()
    return 0
  }
}

export default PerformanceMonitor