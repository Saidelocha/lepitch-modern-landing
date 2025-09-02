/**
 * Security Monitoring and Attack Detection System
 * 
 * 🔒 SÉCURITÉ: Surveillance en temps réel et détection d'attaques
 * - Détection d'intrusions et d'attaques automatisées
 * - Monitoring des patterns suspects
 * - Alertes de sécurité en temps réel
 * - Métriques de sécurité et compliance
 */

import { log, LogContext } from '@/lib/logger'
import { envValidator } from './env-validator'
import { SecureEncryptionUtils } from './encryption-service'

// Types pour le monitoring
interface SecurityEvent {
  type: SecurityEventType
  severity: SecuritySeverity
  source: string
  ip: string
  userAgent?: string
  details: Record<string, unknown>
  timestamp: number
  sessionId?: string
}

enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_PATTERN = 'suspicious_pattern',
  ATTACK_ATTEMPT = 'attack_attempt',
  AUTHENTICATION_FAILURE = 'auth_failure',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  SYSTEM_INTEGRITY = 'system_integrity',
  ENVIRONMENT_BREACH = 'environment_breach'
}

enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface ThreatProfile {
  ip: string
  riskScore: number
  events: SecurityEvent[]
  firstSeen: number
  lastSeen: number
  isBlocked: boolean
  blockedUntil?: number
}

interface SecurityMetrics {
  totalEvents: number
  eventsByType: Record<SecurityEventType, number>
  eventsBySeverity: Record<SecuritySeverity, number>
  uniqueThreats: number
  blockedIPs: number
  averageRiskScore: number
  complianceScore: number
}

export class SecurityMonitor {
  private static instance: SecurityMonitor | null = null
  private threatProfiles = new Map<string, ThreatProfile>()
  private securityEvents: SecurityEvent[] = []
  private readonly maxEvents = 10000 // Limite en mémoire
  private readonly isDevelopment = process.env.NODE_ENV === 'development'
  private readonly riskThresholds = {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
    critical: 0.95
  }
  
  // Liste des IPs de développement à ne jamais bloquer
  private readonly developmentIPs = new Set([
    '127.0.0.1',
    '::1',
    'localhost',
    '0.0.0.0',
    '::',
    '192.168.0.1', // Common router IPs
    '10.0.0.1'
  ])

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }

  /**
   * Vérifie si une IP est une IP de développement/localhost
   */
  private isLocalhostIP(ip: string): boolean {
    if (this.developmentIPs.has(ip)) {
      return true
    }
    
    // Vérifier les plages IPv4 privées
    const ipv4Match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (ipv4Match) {
      const [, a, b, _c, _d] = ipv4Match.map(Number)
      // 192.168.x.x, 10.x.x.x, 172.16-31.x.x
      return (a === 192 && b === 168) ||
             (a === 10) ||
             (a === 172 && b! >= 16 && b! <= 31)
    }
    
    // Vérifier les plages IPv6 privées
    return ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')
  }

  /**
   * Vérifie si un événement doit être ignoré en développement
   */
  private shouldIgnoreInDevelopment(ip: string, eventType: SecurityEventType, severity: SecuritySeverity): boolean {
    if (!this.isDevelopment) {
      return false
    }
    
    // En développement, ignorer les événements de localhost
    if (this.isLocalhostIP(ip)) {
      // Permettre seulement les événements vraiment critiques
      return !(eventType === SecurityEventType.ATTACK_ATTEMPT && severity === SecuritySeverity.CRITICAL)
    }
    
    return false
  }

  /**
   * Enregistre un événement de sécurité
   */
  recordSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    }

    // En développement, ignorer les événements de localhost non critiques
    if (this.shouldIgnoreInDevelopment(fullEvent.ip, fullEvent.type, fullEvent.severity)) {
      return
    }

    // Ajouter à la liste des événements
    this.securityEvents.push(fullEvent)
    this.trimEventHistory()

    // Mettre à jour le profil de menace
    this.updateThreatProfile(fullEvent)

    // Analyser et réagir
    this.analyzeAndRespond(fullEvent)

    // Log sécurisé
    this.logSecurityEvent(fullEvent)
  }

  /**
   * Détection automatique d'attaques par brute force
   */
  detectBruteForceAttack(ip: string, sessionId?: string): boolean {
    const recentEvents = this.getRecentEventsByIP(ip, 300000) // 5 minutes
    const failureEvents = recentEvents.filter(e => 
      e.type === SecurityEventType.AUTHENTICATION_FAILURE ||
      e.type === SecurityEventType.RATE_LIMIT_EXCEEDED
    )

    if (failureEvents.length >= 10) {
      const event: any = {
        type: SecurityEventType.ATTACK_ATTEMPT,
        severity: SecuritySeverity.HIGH,
        source: 'brute_force_detector',
        ip,
        details: {
          attack_type: 'brute_force',
          failure_count: failureEvents.length,
          time_window: '5_minutes'
        }
      }
      
      if (sessionId) {
        event.sessionId = sessionId
      }
      
      this.recordSecurityEvent(event)
      return true
    }

    return false
  }

  /**
   * Détection de patterns suspects dans les requêtes
   */
  detectSuspiciousPatterns(ip: string, userAgent: string, payload?: unknown): void {
    const suspiciousPatterns = [
      // SQL Injection
      {
        pattern: /union.*select|drop.*table|insert.*into/i,
        type: 'sql_injection',
        severity: SecuritySeverity.HIGH
      },
      // XSS
      {
        pattern: /<script.*?>|javascript:|on\w+\s*=/i,
        type: 'xss_attempt',
        severity: SecuritySeverity.HIGH
      },
      // Path Traversal
      {
        pattern: /\.\.\/|\.\.\\|%2e%2e/i,
        type: 'path_traversal',
        severity: SecuritySeverity.MEDIUM
      },
      // Command Injection
      {
        pattern: /;\s*(rm|del|format|shutdown)/i,
        type: 'command_injection',
        severity: SecuritySeverity.CRITICAL
      }
    ]

    const content = JSON.stringify({ userAgent, payload })

    for (const { pattern, type, severity } of suspiciousPatterns) {
      if (pattern.test(content)) {
        this.recordSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_PATTERN,
          severity,
          source: 'pattern_detector',
          ip,
          userAgent,
          details: {
            pattern_type: type,
            matched_content: content.substring(0, 200) // Limiter pour le log
          }
        })
      }
    }
  }

  /**
   * Surveillance de l'intégrité du système
   */
  monitorSystemIntegrity(): void {
    try {
      // Vérifier les variables d'environnement
      const envValidation = envValidator.validateAll()
      if (!envValidation.isValid || envValidation.securityIssues.length > 0) {
        // En développement, réduire la sévérité pour les problèmes d'environnement
        const severity = this.isDevelopment ? SecuritySeverity.LOW : SecuritySeverity.CRITICAL
        
        this.recordSecurityEvent({
          type: SecurityEventType.SYSTEM_INTEGRITY,
          severity,
          source: 'system_monitor',
          ip: 'localhost',
          details: {
            integrity_check: 'environment_variables',
            issues: envValidation.securityIssues,
            errors: envValidation.errors,
            environment: process.env.NODE_ENV
          }
        })
      }

      // Vérifier la configuration des headers de sécurité
      this.validateSecurityConfiguration()

    } catch (error) {
      this.recordSecurityEvent({
        type: SecurityEventType.SYSTEM_INTEGRITY,
        severity: SecuritySeverity.HIGH,
        source: 'system_monitor',
        ip: 'localhost',
        details: {
          error: 'system_integrity_check_failed',
          message: error instanceof Error ? error.message : String(error)
        }
      })
    }
  }

  /**
   * Calcul du score de risque pour une IP
   */
  calculateRiskScore(ip: string): number {
    const profile = this.threatProfiles.get(ip)
    if (!profile) return 0

    let score = 0
    const recentEvents = profile.events.filter(e => 
      Date.now() - e.timestamp < 3600000 // 1 heure
    )

    // Facteurs de risque
    for (const event of recentEvents) {
      switch (event.severity) {
        case SecuritySeverity.CRITICAL:
          score += 0.4
          break
        case SecuritySeverity.HIGH:
          score += 0.2
          break
        case SecuritySeverity.MEDIUM:
          score += 0.1
          break
        case SecuritySeverity.LOW:
          score += 0.05
          break
      }
    }

    // Bonus de risque pour certains types d'événements
    const attackAttempts = recentEvents.filter(e => 
      e.type === SecurityEventType.ATTACK_ATTEMPT
    ).length
    score += attackAttempts * 0.3

    return Math.min(score, 1.0) // Plafond à 1.0
  }

  /**
   * Détermine si une IP doit être bloquée
   */
  shouldBlockIP(ip: string): boolean {
    // Ne jamais bloquer les IPs de développement/localhost
    if (this.isLocalhostIP(ip)) {
      return false
    }
    
    const riskScore = this.calculateRiskScore(ip)
    return riskScore >= this.riskThresholds.high
  }

  /**
   * Obtient les métriques de sécurité
   */
  getSecurityMetrics(): SecurityMetrics {
    const eventsByType = {} as Record<SecurityEventType, number>
    const eventsBySeverity = {} as Record<SecuritySeverity, number>

    // Initialiser les compteurs
    Object.values(SecurityEventType).forEach(type => {
      eventsByType[type] = 0
    })
    Object.values(SecuritySeverity).forEach(severity => {
      eventsBySeverity[severity] = 0
    })

    // Compter les événements récents (24h)
    const recent = this.getRecentEvents(86400000) // 24 heures
    for (const event of recent) {
      eventsByType[event.type]++
      eventsBySeverity[event.severity]++
    }

    // Calculer les métriques
    const totalRiskScore = Array.from(this.threatProfiles.values())
      .reduce((sum, profile) => sum + this.calculateRiskScore(profile.ip), 0)
    
    const averageRiskScore = this.threatProfiles.size > 0 ? 
      totalRiskScore / this.threatProfiles.size : 0

    // Score de compliance (inversement proportionnel aux événements critiques)
    const criticalEvents = eventsBySeverity[SecuritySeverity.CRITICAL]
    const complianceScore = Math.max(0, 1 - (criticalEvents * 0.1))

    return {
      totalEvents: recent.length,
      eventsByType,
      eventsBySeverity,
      uniqueThreats: this.threatProfiles.size,
      blockedIPs: Array.from(this.threatProfiles.values())
        .filter(p => p.isBlocked).length,
      averageRiskScore,
      complianceScore
    }
  }

  /**
   * Génère un rapport de sécurité
   */
  generateSecurityReport(): {
    timestamp: number
    metrics: SecurityMetrics
    topThreats: Array<{
      ip: string
      riskScore: number
      eventCount: number
      isBlocked: boolean
    }>
    systemStatus: {
      environmentSecure: boolean
      totalThreats: number
      activeBlocks: number
    }
  } {
    const metrics = this.getSecurityMetrics()
    const topThreats = Array.from(this.threatProfiles.values())
      .sort((a, b) => this.calculateRiskScore(b.ip) - this.calculateRiskScore(a.ip))
      .slice(0, 10)
      .map(profile => ({
        ip: profile.ip,
        riskScore: this.calculateRiskScore(profile.ip),
        eventCount: profile.events.length,
        isBlocked: profile.isBlocked
      }))

    return {
      timestamp: Date.now(),
      metrics,
      topThreats,
      systemStatus: {
        environmentSecure: envValidator.validateAll().isValid,
        totalThreats: this.threatProfiles.size,
        activeBlocks: metrics.blockedIPs
      }
    }
  }

  // === Méthodes privées ===

  private updateThreatProfile(event: SecurityEvent): void {
    const { ip } = event
    let profile = this.threatProfiles.get(ip)

    if (!profile) {
      profile = {
        ip,
        riskScore: 0,
        events: [],
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        isBlocked: false
      }
      this.threatProfiles.set(ip, profile)
    }

    profile.events.push(event)
    profile.lastSeen = event.timestamp
    profile.riskScore = this.calculateRiskScore(ip)

    // Nettoyer les anciens événements (garder seulement 24h)
    profile.events = profile.events.filter(e => 
      Date.now() - e.timestamp < 86400000
    )
  }

  private analyzeAndRespond(event: SecurityEvent): void {
    const { ip, severity, type } = event

    // Réponse automatique aux événements critiques (sauf localhost)
    if (severity === SecuritySeverity.CRITICAL && !this.isLocalhostIP(ip)) {
      const profile = this.threatProfiles.get(ip)
      if (profile && !profile.isBlocked) {
        profile.isBlocked = true
        profile.blockedUntil = Date.now() + 3600000 // 1 heure
        
        // VULN-004 FIX: Secure logging for automatic blocking
        log.error('🚨 IP automatically blocked for critical activity', {
          ip: this.maskIP(ip)
        }, {
          eventType: type,
          riskScore: this.calculateRiskScore(ip),
          blockDuration: '1_hour',
          automated: true
        })
      }
    }

    // Alertes pour les attaques coordonnées
    if (type === SecurityEventType.ATTACK_ATTEMPT) {
      this.checkForCoordinatedAttack(event)
    }
  }

  private checkForCoordinatedAttack(_event: SecurityEvent): void {
    const recentAttacks = this.getRecentEvents(300000) // 5 minutes
      .filter(e => e.type === SecurityEventType.ATTACK_ATTEMPT)

    const uniqueIPs = new Set(recentAttacks.map(e => e.ip))

    if (uniqueIPs.size >= 5) { // 5 IPs différentes
      // VULN-004 FIX: Secure logging for coordinated attacks
      log.error('🚨 COORDINATED ATTACK DETECTED', {}, {
        attackingIPs: Array.from(uniqueIPs).map(ip => this.maskIP(ip)),
        eventCount: recentAttacks.length,
        timeWindow: '5_minutes',
        threatLevel: 'high',
        recommendedAction: 'immediate_investigation'
      })
    }
  }

  private getRecentEventsByIP(ip: string, timeWindow: number): SecurityEvent[] {
    const cutoff = Date.now() - timeWindow
    return this.securityEvents.filter(e => 
      e.ip === ip && e.timestamp > cutoff
    )
  }

  private getRecentEvents(timeWindow: number): SecurityEvent[] {
    const cutoff = Date.now() - timeWindow
    return this.securityEvents.filter(e => e.timestamp > cutoff)
  }

  private trimEventHistory(): void {
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents = this.securityEvents.slice(-this.maxEvents)
    }
  }

  /**
   * VULN-004 FIX: Secure logging with PII masking and data classification
   */
  private logSecurityEvent(event: SecurityEvent): void {
    // Create sanitized log data with secure masking
    const logData = {
      eventId: this.generateEventId(),
      type: event.type,
      severity: event.severity,
      ip: this.maskIP(event.ip),
      source: event.source,
      eventTimestamp: event.timestamp, // Renamed to avoid LogContext conflict
      sessionId: event.sessionId ? SecureEncryptionUtils.maskForLogs(event.sessionId) : undefined,
      userAgent: event.userAgent ? this.maskUserAgent(event.userAgent) : undefined,
      details: this.sanitizeLogDetails(event.details)
    }

    // Add structured metadata for SIEM integration
    const metadata = {
      environment: process.env['NODE_ENV'],
      nodeId: process.env['NODE_ID'] || 'unknown',
      version: process.env['npm_package_version'] || 'unknown',
      category: 'security_event',
      classification: this.classifyEventSensitivity(event)
    }

    // Create audit trail entry
    this.createAuditTrail(event, logData)

    switch (event.severity) {
      case SecuritySeverity.CRITICAL:
        log.error('🚨 CRITICAL SECURITY EVENT', logData as any, metadata as any)
        this.sendSecurityAlert(event, logData)
        break
      case SecuritySeverity.HIGH:
        log.warn('⚠️  HIGH SEVERITY SECURITY EVENT', logData as any, metadata as any)
        break
      case SecuritySeverity.MEDIUM:
        log.warn('⚠️  MEDIUM SECURITY EVENT', logData as any, metadata as any)
        break
      case SecuritySeverity.LOW:
        log.info('ℹ️  LOW SECURITY EVENT', logData as any, metadata as any)
        break
    }
  }

  /**
   * Generate unique event ID for audit correlation
   */
  private generateEventId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `sec_${timestamp}_${random}`
  }

  /**
   * VULN-004 FIX: Secure IP masking preserving geographic info
   */
  private maskIP(ip: string): string {
    if (!ip || ip === 'localhost' || ip === '127.0.0.1') {
      return '[localhost]'
    }

    // IPv4 masking: keep first two octets for geographic correlation
    const ipv4Match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (ipv4Match) {
      return `${ipv4Match[1]}.${ipv4Match[2]}.xxx.xxx`
    }

    // IPv6 masking: keep first 32 bits
    const ipv6Match = ip.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4}):(.+)$/i)
    if (ipv6Match) {
      return `${ipv6Match[1]}:${ipv6Match[2]}:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx`
    }

    return '[masked_ip]'
  }

  /**
   * VULN-004 FIX: Secure User-Agent masking
   */
  private maskUserAgent(userAgent: string): string {
    if (!userAgent || userAgent.length < 10) {
      return '[masked_ua]'
    }

    // Preserve browser/OS info while masking identifying details
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/i)
    const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/i)
    
    const browser = browserMatch ? `${browserMatch[1]}/${browserMatch[2]}` : 'Unknown'
    const os = osMatch ? osMatch[1] : 'Unknown'
    
    return `${browser} on ${os} [masked]`
  }

  /**
   * VULN-004 FIX: Sanitize log details to remove sensitive information
   */
  private sanitizeLogDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth', 'session', 'credit', 'ssn', 'email', 'phone']

    for (const [key, value] of Object.entries(details)) {
      const keyLower = key.toLowerCase()
      
      // Check if key is sensitive
      if (sensitiveKeys.some(sensitive => keyLower.includes(sensitive))) {
        sanitized[key] = '[REDACTED]'
        continue
      }

      // Handle different value types
      if (typeof value === 'string') {
        // Check if value contains sensitive data
        if (SecureEncryptionUtils.containsSensitiveData(value)) {
          sanitized[key] = `[SENSITIVE_DATA:${value.length}chars]`
        } else if (value.length > 200) {
          // Truncate long strings
          sanitized[key] = value.substring(0, 197) + '...'
        } else {
          sanitized[key] = value
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeLogDetails(value as Record<string, unknown>)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  /**
   * Classify event sensitivity for compliance
   */
  private classifyEventSensitivity(event: SecurityEvent): 'public' | 'internal' | 'confidential' | 'restricted' {
    // Critical security events are always restricted
    if (event.severity === SecuritySeverity.CRITICAL) {
      return 'restricted'
    }

    // Attack attempts and system integrity issues are confidential
    if (event.type === SecurityEventType.ATTACK_ATTEMPT || 
        event.type === SecurityEventType.SYSTEM_INTEGRITY) {
      return 'confidential'
    }

    // Authentication and privilege events are internal
    if (event.type === SecurityEventType.AUTHENTICATION_FAILURE ||
        event.type === SecurityEventType.PRIVILEGE_ESCALATION) {
      return 'internal'
    }

    return 'public'
  }

  /**
   * Create audit trail entry for compliance
   */
  private createAuditTrail(event: SecurityEvent, _sanitizedData: Record<string, unknown>): void {
    const auditEntry = {
      auditId: this.generateEventId(),
      auditTimestamp: new Date().toISOString(), // Renamed to avoid LogContext conflict
      eventType: 'security_event',
      severity: event.severity,
      actor: {
        ip: this.maskIP(event.ip),
        userAgent: event.userAgent ? this.maskUserAgent(event.userAgent) : undefined,
        sessionId: event.sessionId ? SecureEncryptionUtils.maskForLogs(event.sessionId) : undefined
      },
      action: event.type,
      resource: event.source,
      outcome: event.severity === SecuritySeverity.CRITICAL ? 'blocked' : 'logged',
      metadata: {
        classification: this.classifyEventSensitivity(event),
        retention: this.getRetentionPeriod(event.severity),
        tags: this.generateEventTags(event)
      }
    }

    // In production, this would be sent to a secure audit log system
    if (process.env.NODE_ENV === 'production') {
      // Send to secure audit system via structured logging
      const logContext: LogContext = {}
      if (auditEntry.actor.sessionId) {
        logContext.sessionId = auditEntry.actor.sessionId
      }
      
      log.security('AUDIT_TRAIL', logContext, {
        ...auditEntry,
        environment: 'production',
        nodeId: process.env['NODE_ID'] || 'unknown',
        version: process.env['npm_package_version'] || '0.1.0'
      } as any)
    }
  }

  /**
   * Send security alerts for critical events
   */
  private sendSecurityAlert(event: SecurityEvent, sanitizedData: Record<string, unknown>): void {
    const alert = {
      alertId: this.generateEventId(),
      alertTimestamp: new Date().toISOString(), // Renamed to avoid LogContext conflict
      severity: 'CRITICAL',
      title: `Security Alert: ${event.type}`,
      description: `Critical security event detected from ${this.maskIP(event.ip)}`,
      metadata: sanitizedData,
      recommendedActions: this.getRecommendedActions(event.type)
    }

    // In production, send to security operations center
    if (process.env.NODE_ENV === 'production') {
      // Send to SOC/SIEM system via security event logging
      log.security('SOC_ALERT', {}, {
        ...alert,
        category: 'security_event',
        classification: 'restricted'
      } as any)
      log.error('🚨 SECURITY_ALERT', {}, alert as any)
    }
  }

  /**
   * Get retention period based on event severity
   */
  private getRetentionPeriod(severity: SecuritySeverity): string {
    switch (severity) {
      case SecuritySeverity.CRITICAL:
        return '7_years' // Regulatory compliance
      case SecuritySeverity.HIGH:
        return '3_years'
      case SecuritySeverity.MEDIUM:
        return '1_year'
      case SecuritySeverity.LOW:
        return '6_months'
      default:
        return '3_months'
    }
  }

  /**
   * Generate tags for event categorization
   */
  private generateEventTags(event: SecurityEvent): string[] {
    const tags = ['security']
    
    switch (event.type) {
      case SecurityEventType.ATTACK_ATTEMPT:
        tags.push('attack', 'threat', 'incident')
        break
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        tags.push('rate_limit', 'abuse', 'prevention')
        break
      case SecurityEventType.AUTHENTICATION_FAILURE:
        tags.push('auth', 'access', 'failure')
        break
      case SecurityEventType.SYSTEM_INTEGRITY:
        tags.push('system', 'integrity', 'configuration')
        break
      default:
        tags.push('general')
    }
    
    tags.push(event.severity.toLowerCase())
    return tags
  }

  /**
   * Get recommended actions for different event types
   */
  private getRecommendedActions(eventType: SecurityEventType): string[] {
    switch (eventType) {
      case SecurityEventType.ATTACK_ATTEMPT:
        return [
          'Block IP address',
          'Review attack patterns',
          'Update security rules',
          'Notify security team'
        ]
      case SecurityEventType.SYSTEM_INTEGRITY:
        return [
          'Verify system configuration',
          'Check for unauthorized changes',
          'Review access logs',
          'Update security policies'
        ]
      case SecurityEventType.DATA_BREACH_ATTEMPT:
        return [
          'Immediate investigation',
          'Data access audit',
          'Notify compliance team',
          'Review data protection measures'
        ]
      default:
        return [
          'Monitor situation',
          'Document incident',
          'Review security posture'
        ]
    }
  }

  private validateSecurityConfiguration(): void {
    // Cette fonction pourrait vérifier la configuration des headers
    // de sécurité, mais dans Next.js ils sont définis statiquement
    // dans next.config.js, donc on fait juste une vérification basique
    
    const requiredEnvVars = [
      'CHAT_ENCRYPTION_KEY',
      'OPENROUTER_API_KEY'
    ]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        this.recordSecurityEvent({
          type: SecurityEventType.ENVIRONMENT_BREACH,
          severity: SecuritySeverity.HIGH,
          source: 'config_validator',
          ip: 'localhost',
          details: {
            missing_variable: envVar,
            check_type: 'required_environment_variable'
          }
        })
      }
    }
  }
}

// Instance singleton
export const securityMonitor = SecurityMonitor.getInstance()

// Fonctions utilitaires
export function recordSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
  securityMonitor.recordSecurityEvent(event)
}

export function getSecurityMetrics() {
  return securityMonitor.getSecurityMetrics()
}

export function generateSecurityReport() {
  return securityMonitor.generateSecurityReport()
}

// Démarrage du monitoring système
if (process.env.NODE_ENV === 'production') {
  // Vérification périodique de l'intégrité (toutes les heures)
  setInterval(() => {
    securityMonitor.monitorSystemIntegrity()
  }, 3600000)
}

// Export des types pour utilisation externe
export { SecurityEventType, SecuritySeverity, type SecurityEvent, type SecurityMetrics }