/**
 * Service de Rate Limiting Infrastructure - Sécurisé
 * Protection contre les abus, spam et attaques DDoS
 * 
 * 🔒 SÉCURITÉ RENFORCÉE:
 * - Validation stricte des IP avec protection anti-spoofing
 * - Détection avancée des patterns suspects
 * - Système de trust scoring pour les clients
 * - Rate limiting adaptatif basé sur le comportement
 */

import { log } from '@/lib/logger'
import * as crypto from 'crypto'

export interface RateLimitConfig {
  windowMs: number        // Fenêtre de temps en millisecondes
  maxRequests: number     // Nombre maximum de requêtes par fenêtre
  blockDurationMs: number // Durée de blocage en cas de dépassement
  skipSuccessfulRequests?: boolean // Ne compter que les requêtes échouées
  skipFailedRequests?: boolean     // Ne compter que les requêtes réussies
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
  blocked?: boolean
  reason?: string
}

export interface ClientInfo {
  requestCount: number
  windowStart: number
  blockedUntil?: number
  suspiciousActivity: number
  lastRequestTime: number
  userAgent?: string
  fingerprint?: string
  // 🔒 SÉCURITÉ: Trust score pour validation anti-spoofing
  trustScore: number
  ipValidationPassed: boolean
}

// === CONFIGURATIONS RATE LIMITING ===

const isDevelopment = process.env.NODE_ENV === 'development'

export const RATE_LIMIT_CONFIGS = {
  // Configuration globale (par IP)
  global: {
    windowMs: 15 * 60 * 1000,    // 15 minutes
    maxRequests: isDevelopment ? 300 : 100,  // 300 en dev, 100 en prod
    blockDurationMs: isDevelopment ? 1 * 60 * 1000 : 30 * 60 * 1000 // 1min en dev, 30min en prod
  } as RateLimitConfig,

  // Configuration API Chat (plus restrictive)
  chat: {
    windowMs: 1 * 60 * 1000,     // 1 minute
    maxRequests: isDevelopment ? 30 : 10,     // 30 en dev, 10 en prod
    blockDurationMs: isDevelopment ? 2 * 60 * 1000 : 5 * 60 * 1000 // 2min en dev, 5min en prod
  } as RateLimitConfig,

  // Configuration session (par session)
  session: {
    windowMs: 10 * 60 * 1000,    // 10 minutes
    maxRequests: 50,              // 50 requêtes max par session
    blockDurationMs: 15 * 60 * 1000 // Blocage 15 minutes
  } as RateLimitConfig,

  // Configuration création de session
  sessionCreation: {
    windowMs: 60 * 60 * 1000,    // 1 heure
    maxRequests: 5,               // 5 nouvelles sessions max par heure
    blockDurationMs: 60 * 60 * 1000 // Blocage 1 heure
  } as RateLimitConfig,

  // Configuration pour comportement suspect
  suspicious: {
    windowMs: 5 * 60 * 1000,     // 5 minutes
    maxRequests: 3,               // 3 tentatives suspectes max
    blockDurationMs: 60 * 60 * 1000 // Blocage 1 heure
  } as RateLimitConfig
}

// === SERVICE PRINCIPAL ===

export class RateLimiterService {
  private static instance: RateLimiterService
  private clients: Map<string, ClientInfo> = new Map()
  private globalStats: Map<string, number> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  private readonly isDevelopment = process.env.NODE_ENV === 'development'
  
  // 🔒 SÉCURITÉ: Trust proxies connus et validés (for future use)
  // private _trustedProxies: Set<string> = new Set(['127.0.0.1', '::1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'])
  
  // Liste des IPs de développement à traiter avec des limites relaxées
  private developmentIPs: Set<string> = new Set([
    '127.0.0.1',
    '::1', 
    'localhost',
    '0.0.0.0',
    '::'
  ])

  private constructor() {
    // Nettoyage automatique toutes les 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  public static getInstance(): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService()
    }
    return RateLimiterService.instance
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
      const [, a, b] = ipv4Match.map(Number)
      if (a === undefined || b === undefined) return false
      return (a === 192 && b === 168) || (a === 10) || (a === 172 && b >= 16 && b <= 31)
    }
    
    // Vérifier les plages IPv6 privées
    return ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')
  }

  /**
   * 🔒 SÉCURITÉ: Validation stricte des IP avec protection anti-spoofing
   */
  private validateIPAuthenticity(ip: string, headers: Record<string, string>): boolean {
    // En développement, toujours valider les IPs localhost
    if (this.isDevelopment && this.isLocalhostIP(ip)) {
      return true
    }
    
    // Vérifier que l'IP n'est pas privée si elle vient d'un header externe
    const forwardedFor = headers['x-forwarded-for']
    const realIP = headers['x-real-ip']
    
    if (forwardedFor || realIP) {
      // Si c'est une IP privée dans un header public, c'est suspect (sauf en dev)
      if (this.isPrivateIP(ip) && !this.isDevelopment) {
        log.security('Suspicious private IP in public header', {}, {
          ip: this.hashIP(ip),
          forwardedFor: forwardedFor?.substring(0, 20),
          realIP: realIP?.substring(0, 20)
        })
        return false
      }
    }
    
    return true
  }

  /**
   * 🔒 SÉCURITÉ: Génération de fingerprint sécurisé
   */
  private generateSecureFingerprint(ip: string, userAgent?: string, additional?: Record<string, string>): string {
    const data = JSON.stringify({
      ip: this.hashIP(ip),
      ua: userAgent ? crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16) : 'unknown',
      additional: additional ? crypto.createHash('sha256').update(JSON.stringify(additional)).digest('hex').substring(0, 8) : null,
      salt: process.env['RATE_LIMIT_SALT'] || 'default-salt'
    })
    
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32)
  }

  /**
   * Vérifie et applique le rate limiting avec sécurité renforcée
   */
  public checkRateLimit(
    clientId: string,
    config: RateLimitConfig,
    metadata?: {
      userAgent?: string
      fingerprint?: string
      suspicious?: boolean
      ip?: string
      headers?: Record<string, string>
    }
  ): RateLimitResult {
    // En développement, utiliser des limites plus généreuses pour localhost
    if (this.isDevelopment && metadata?.ip && this.isLocalhostIP(metadata.ip)) {
      config = {
        ...config,
        maxRequests: Math.max(config.maxRequests * 3, 100), // Limites dev généreuses
        blockDurationMs: Math.min(config.blockDurationMs, 30000) // Blocage max 30s en dev
      }
    }
    
    // 🔒 SÉCURITÉ: Rate limiting toujours actif même en test
    const isTestMode = process.env.NODE_ENV === 'test'
    if (isTestMode) {
      // En mode test, utiliser des limites réduites mais maintenir la logique de sécurité
      config = {
        ...config,
        maxRequests: Math.min(config.maxRequests * 2, 100), // Limites test plus généreuses mais raisonnables
        windowMs: Math.min(config.windowMs, 60000)
      }
    }

    const now = Date.now()
    const client = this.getOrCreateClient(clientId, metadata)

    // 🔒 SÉCURITÉ: Validation IP si disponible
    if (metadata?.ip && metadata?.headers) {
      if (!this.validateIPAuthenticity(metadata.ip, metadata.headers)) {
        client.trustScore = Math.max(0, client.trustScore - 20)
        client.ipValidationPassed = false
        
        return {
          allowed: false,
          limit: config.maxRequests,
          remaining: 0,
          resetTime: now + config.blockDurationMs,
          retryAfter: Math.ceil(config.blockDurationMs / 1000),
          blocked: true,
          reason: 'IP validation failed - potential spoofing detected'
        }
      } else {
        client.ipValidationPassed = true
        client.trustScore = Math.min(100, client.trustScore + 1)
      }
    }

    // Vérifier si le client est actuellement bloqué
    if (client.blockedUntil && now < client.blockedUntil) {
      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: client.blockedUntil,
        retryAfter: Math.ceil((client.blockedUntil - now) / 1000),
        blocked: true,
        reason: 'Client temporairement bloqué'
      }
    }

    // Réinitialiser la fenêtre si nécessaire
    if (now - client.windowStart >= config.windowMs) {
      client.requestCount = 0
      client.windowStart = now
      delete client.blockedUntil
    }

    // Incrémenter le compteur
    client.requestCount++
    client.lastRequestTime = now

    // Marquer activité suspecte si applicable
    if (metadata?.suspicious) {
      client.suspiciousActivity++
      client.trustScore = Math.max(0, client.trustScore - 10)
    }

    // 🔒 SÉCURITÉ: Appliquer des limites adaptatives basées sur le trust score
    const effectiveLimit = this.calculateEffectiveLimit(config.maxRequests, client.trustScore)

    // Vérifier les limites
    if (client.requestCount > effectiveLimit) {
      // Appliquer le blocage
      const blockDuration = this.calculateBlockDuration(config.blockDurationMs, client.trustScore, client.suspiciousActivity)
      client.blockedUntil = now + blockDuration

      // Log de sécurité avec données masquées
      log.security('Rate limit exceeded', {
        sessionId: this.maskClientId(clientId)
      }, {
        requestCount: client.requestCount,
        effectiveLimit,
        trustScore: client.trustScore,
        blockDurationMs: blockDuration,
        suspiciousActivity: client.suspiciousActivity,
        ipValidated: client.ipValidationPassed
      })

      return {
        allowed: false,
        limit: effectiveLimit,
        remaining: 0,
        resetTime: client.blockedUntil,
        retryAfter: Math.ceil(blockDuration / 1000),
        blocked: true,
        reason: client.trustScore < 50 ? 'Untrusted client blocked' : 'Rate limit exceeded'
      }
    }

    const remaining = Math.max(0, effectiveLimit - client.requestCount)
    const resetTime = client.windowStart + config.windowMs

    return {
      allowed: true,
      limit: effectiveLimit,
      remaining,
      resetTime,
      blocked: false
    }
  }

  /**
   * 🔒 SÉCURITÉ: Calcul de limite effective basée sur le trust score
   */
  private calculateEffectiveLimit(baseLimit: number, trustScore: number): number {
    if (trustScore >= 80) return baseLimit // Client de confiance
    if (trustScore >= 50) return Math.floor(baseLimit * 0.8) // Client normal
    if (trustScore >= 20) return Math.floor(baseLimit * 0.5) // Client suspect
    return Math.floor(baseLimit * 0.2) // Client non fiable
  }

  /**
   * 🔒 SÉCURITÉ: Calcul de durée de blocage adaptatif
   */
  private calculateBlockDuration(baseDuration: number, trustScore: number, suspiciousCount: number): number {
    let multiplier = 1
    
    if (trustScore < 20) multiplier *= 3 // Client non fiable
    else if (trustScore < 50) multiplier *= 2 // Client suspect
    
    if (suspiciousCount > 5) multiplier *= 2 // Trop d'activité suspecte
    else if (suspiciousCount > 2) multiplier *= 1.5
    
    return Math.min(baseDuration * multiplier, 24 * 60 * 60 * 1000) // Max 24h
  }

  /**
   * Vérifie spécifiquement l'API Chat avec sécurité renforcée
   */
  public checkChatRateLimit(
    ip: string,
    sessionId: string,
    metadata?: {
      userAgent?: string
      message?: string
      suspicious?: boolean
      headers?: Record<string, string>
    }
  ): RateLimitResult {
    // Vérification par IP (global) avec validation
    const ipResult = this.checkRateLimit(
      `ip:${ip}`,
      RATE_LIMIT_CONFIGS.chat,
      { ...metadata, ip, ...(metadata?.headers && { headers: metadata.headers }) }
    )

    if (!ipResult.allowed) {
      return ipResult
    }

    // Vérification par session
    const sessionResult = this.checkRateLimit(
      `session:${sessionId}`,
      RATE_LIMIT_CONFIGS.session,
      metadata
    )

    if (!sessionResult.allowed) {
      return sessionResult
    }

    // Vérification activité suspecte renforcée
    if (metadata?.suspicious) {
      const suspiciousResult = this.checkRateLimit(
        `suspicious:${ip}`,
        RATE_LIMIT_CONFIGS.suspicious,
        { ...metadata, suspicious: true }
      )

      if (!suspiciousResult.allowed) {
        return {
          ...suspiciousResult,
          reason: 'Activité suspecte détectée - Blocage préventif'
        }
      }
    }

    // Retourner le résultat le plus restrictif
    return {
      allowed: true,
      limit: Math.min(ipResult.limit, sessionResult.limit),
      remaining: Math.min(ipResult.remaining, sessionResult.remaining),
      resetTime: Math.max(ipResult.resetTime, sessionResult.resetTime)
    }
  }

  /**
   * Marque une activité comme suspecte avec scoring
   */
  public markSuspicious(
    clientId: string,
    reason: string,
    metadata?: {
      userAgent?: string
      fingerprint?: string
      severity?: 'low' | 'medium' | 'high'
    }
  ): void {
    const client = this.getOrCreateClient(clientId, metadata)
    const severity = metadata?.severity || 'medium'
    
    client.suspiciousActivity++
    
    // Réduire le trust score selon la sévérité
    const scoreReduction = { low: 5, medium: 15, high: 30 }[severity]
    client.trustScore = Math.max(0, client.trustScore - scoreReduction)

    log.security('Suspicious activity marked', {
      sessionId: this.maskClientId(clientId)
    }, {
      reason,
      severity,
      totalSuspicious: client.suspiciousActivity,
      newTrustScore: client.trustScore
    })

    // Auto-bloquer si trust score trop bas
    if (client.trustScore <= 10) {
      client.blockedUntil = Date.now() + (2 * 60 * 60 * 1000) // 2 heures
      
      log.error('Client auto-blocked for low trust score', {
        sessionId: this.maskClientId(clientId)
      }, {
        trustScore: client.trustScore,
        suspiciousCount: client.suspiciousActivity,
        blockedUntil: new Date(client.blockedUntil)
      })
    }
  }

  /**
   * 🔒 SÉCURITÉ: Vérification si une IP est privée
   */
  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^127\./, // Loopback
      /^10\./, // Private class A
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private class B
      /^192\.168\./, // Private class C
      /^::1$/, // IPv6 loopback
      /^fc00:/, // IPv6 private
      /^fe80:/ // IPv6 link-local
    ]
    
    return privateRanges.some(range => range.test(ip))
  }

  /**
   * 🔒 SÉCURITÉ: Hash sécurisé d'IP pour les logs
   */
  private hashIP(ip: string): string {
    const salt = process.env['IP_HASH_SALT'] || 'default-ip-salt'
    return crypto.createHash('sha256').update(ip + salt).digest('hex').substring(0, 16)
  }

  /**
   * Obtient les statistiques d'un client
   */
  public getClientStats(clientId: string): ClientInfo | null {
    return this.clients.get(clientId) || null
  }

  /**
   * Obtient les statistiques globales
   */
  public getGlobalStats(): {
    totalClients: number
    blockedClients: number
    suspiciousClients: number
    totalRequests: number
    averageTrustScore: number
  } {
    const now = Date.now()
    let blockedClients = 0
    let suspiciousClients = 0
    let totalRequests = 0
    let totalTrustScore = 0

    this.clients.forEach(client => {
      if (client.blockedUntil && now < client.blockedUntil) {
        blockedClients++
      }
      if (client.suspiciousActivity > 0) {
        suspiciousClients++
      }
      totalRequests += client.requestCount
      totalTrustScore += client.trustScore
    })

    return {
      totalClients: this.clients.size,
      blockedClients,
      suspiciousClients,
      totalRequests,
      averageTrustScore: this.clients.size > 0 ? Math.round(totalTrustScore / this.clients.size) : 0
    }
  }

  /**
   * Réinitialise le rate limiting pour un client
   */
  public resetClient(clientId: string): void {
    this.clients.delete(clientId)
    log.info('Rate limit reset for client', {
      sessionId: this.maskClientId(clientId)
    })
  }

  /**
   * Bloque manuellement un client
   */
  public blockClient(
    clientId: string,
    durationMs: number,
    reason: string
  ): void {
    const client = this.getOrCreateClient(clientId)
    client.blockedUntil = Date.now() + durationMs
    client.trustScore = 0 // Reset trust score

    log.warn('Client manually blocked', {
      sessionId: this.maskClientId(clientId)
    }, {
      durationMs,
      reason,
      blockedUntil: new Date(client.blockedUntil)
    })
  }

  /**
   * Débloque manuellement un client
   */
  public unblockClient(clientId: string): void {
    const client = this.clients.get(clientId)
    if (client) {
      delete client.blockedUntil
      client.suspiciousActivity = 0
      client.trustScore = 50 // Reset to neutral trust score
      log.info('Client manually unblocked', {
        sessionId: this.maskClientId(clientId)
      })
    }
  }

  /**
   * Nettoyage automatique des données expirées
   */
  private cleanup(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 heures
    let cleaned = 0

    this.clients.forEach((client, clientId) => {
      // Supprimer les clients inactifs depuis plus de 24h
      if (now - client.lastRequestTime > maxAge) {
        this.clients.delete(clientId)
        cleaned++
      }
      // Récupération graduelle du trust score pour les clients inactifs récents
      else if (now - client.lastRequestTime > 60 * 60 * 1000) { // 1 heure
        client.trustScore = Math.min(100, client.trustScore + 1)
        client.suspiciousActivity = Math.max(0, client.suspiciousActivity - 1)
      }
    })

    if (cleaned > 0) {
      log.debug(`Rate limiter cleanup: ${cleaned} expired clients removed`)
    }
  }

  /**
   * Obtient ou crée un client avec trust score initial
   */
  private getOrCreateClient(
    clientId: string,
    metadata?: {
      userAgent?: string
      fingerprint?: string
      ip?: string
    }
  ): ClientInfo {
    if (!this.clients.has(clientId)) {
      const fingerprint = metadata?.fingerprint || this.generateSecureFingerprint(
        metadata?.ip || clientId,
        metadata?.userAgent
      )
      
      const clientInfo: ClientInfo = {
        requestCount: 0,
        windowStart: Date.now(),
        suspiciousActivity: 0,
        lastRequestTime: Date.now(),
        fingerprint,
        trustScore: 50, // Score neutre initial
        ipValidationPassed: true // Par défaut, assume validation OK
      }
      
      // Ajouter userAgent seulement s'il existe
      if (metadata?.userAgent) {
        clientInfo.userAgent = metadata.userAgent
      }
      
      this.clients.set(clientId, clientInfo)
    }
    return this.clients.get(clientId)!
  }

  /**
   * Masque l'ID client pour les logs
   */
  private maskClientId(clientId: string): string {
    if (clientId.length <= 8) {
      return '***masked***'
    }
    return `${clientId.substring(0, 4)}***${clientId.substring(clientId.length - 4)}`
  }

  /**
   * Détruit l'instance (pour les tests)
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clients.clear()
    this.globalStats.clear()
  }
}

// === MIDDLEWARE RATE LIMITING SÉCURISÉ ===

export class RateLimitMiddleware {
  private static rateLimiter = RateLimiterService.getInstance()

  /**
   * Middleware pour Next.js API routes avec sécurité renforcée
   */
  static async checkRequest(
    request: Request,
    config: RateLimitConfig = RATE_LIMIT_CONFIGS.global
  ): Promise<{
    allowed: boolean
    result: RateLimitResult
    headers: Record<string, string>
  }> {
    // 🔒 SÉCURITÉ: Extraction d'IP avec validation stricte
    const ip = this.extractClientIPSecure(request)
    const userAgent = request.headers.get('user-agent') || undefined
    const headers = this.extractRelevantHeaders(request)
    
    const fingerprint = this.generateSecureFingerprint(ip, userAgent, headers)

    // Construire les metadata en ajoutant seulement les propriétés définies
    const metadata: {
      userAgent?: string
      fingerprint?: string
      ip?: string
      headers?: Record<string, string>
    } = { fingerprint, ip, headers }
    
    if (userAgent) {
      metadata.userAgent = userAgent
    }

    const result = this.rateLimiter.checkRateLimit(
      `ip:${ip}`,
      config,
      metadata
    )

    // Headers de réponse conformes aux standards
    const responseHeaders: Record<string, string> = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    }

    if (result.retryAfter) {
      responseHeaders['Retry-After'] = result.retryAfter.toString()
    }

    return {
      allowed: result.allowed,
      result,
      headers: responseHeaders
    }
  }

  /**
   * Middleware spécialisé pour l'API Chat avec sécurité renforcée
   */
  static async checkChatRequest(
    request: Request,
    sessionId: string,
    messageContent?: string
  ): Promise<{
    allowed: boolean
    result: RateLimitResult
    headers: Record<string, string>
    suspicious: boolean
  }> {
    const ip = this.extractClientIPSecure(request)
    const userAgent = request.headers.get('user-agent') || undefined
    const headers = this.extractRelevantHeaders(request)

    // 🔒 SÉCURITÉ: Détection d'activité suspecte renforcée
    const suspicious = this.detectSuspiciousActivityEnhanced(messageContent, userAgent, headers)

    // Construire les metadata en ajoutant seulement les propriétés définies
    const chatMetadata: {
      userAgent?: string
      message?: string
      suspicious?: boolean
      headers?: Record<string, string>
    } = { suspicious, headers }
    
    if (userAgent) {
      chatMetadata.userAgent = userAgent
    }
    
    if (messageContent) {
      chatMetadata.message = messageContent
    }

    const result = this.rateLimiter.checkChatRateLimit(
      ip,
      sessionId,
      chatMetadata
    )

    // Marquer comme suspect si détecté
    if (suspicious) {
      const suspiciousMetadata: {
        userAgent?: string
        fingerprint?: string
        severity?: 'high' | 'medium' | 'low'
      } = { severity: 'medium' }
      
      if (userAgent) {
        suspiciousMetadata.userAgent = userAgent
      }
      
      this.rateLimiter.markSuspicious(
        `ip:${ip}`,
        'Suspicious message content or behavior pattern detected',
        suspiciousMetadata
      )
    }

    const responseHeaders: Record<string, string> = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    }

    if (result.retryAfter) {
      responseHeaders['Retry-After'] = result.retryAfter.toString()
    }

    return {
      allowed: result.allowed,
      result,
      headers: responseHeaders,
      suspicious
    }
  }

  /**
   * 🔒 SÉCURITÉ: Extraction d'IP sécurisée avec validation anti-spoofing
   */
  private static extractClientIPSecure(request: Request): string {
    // Ordre de priorité pour l'extraction d'IP avec validation
    const ipHeaders = [
      'cf-connecting-ip',      // Cloudflare (plus fiable)
      'x-real-ip',            // Nginx
      'x-forwarded-for',      // Standard mais spoofable
      'x-client-ip',          // Moins fiable
      'true-client-ip'        // Akamai
    ]

    for (const header of ipHeaders) {
      const value = request.headers.get(header)
      if (value) {
        // Prendre la première IP si plusieurs
        const ip = value.split(',')[0]?.trim()
        if (ip && this.isValidIP(ip) && !this.isPrivateIP(ip)) {
          return ip
        }
      }
    }

    // Fallback sécurisé
    return '127.0.0.1'
  }

  /**
   * 🔒 SÉCURITÉ: Extraction des headers pertinents pour fingerprinting
   */
  private static extractRelevantHeaders(request: Request): Record<string, string> {
    const relevantHeaders = [
      'x-forwarded-for',
      'x-real-ip', 
      'cf-connecting-ip',
      'accept-language',
      'accept-encoding'
    ]
    
    const headers: Record<string, string> = {}
    relevantHeaders.forEach(header => {
      const value = request.headers.get(header)
      if (value) {
        headers[header] = value.substring(0, 100) // Limiter la taille
      }
    })
    
    return headers
  }

  /**
   * 🔒 SÉCURITÉ: Génération de fingerprint sécurisé
   */
  private static generateSecureFingerprint(ip: string, userAgent?: string, headers?: Record<string, string>): string {
    const data = JSON.stringify({
      ip_hash: crypto.createHash('sha256').update(ip + (process.env['IP_HASH_SALT'] || 'default')).digest('hex').substring(0, 16),
      ua_hash: userAgent ? crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16) : 'unknown',
      headers_hash: headers ? crypto.createHash('sha256').update(JSON.stringify(headers)).digest('hex').substring(0, 8) : null
    })
    
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32)
  }

  /**
   * 🔒 SÉCURITÉ: Détection d'activité suspecte renforcée
   */
  private static detectSuspiciousActivityEnhanced(
    message?: string,
    userAgent?: string,
    headers?: Record<string, string>
  ): boolean {
    if (!message) return false

    // Patterns suspects élargis
    const suspiciousPatterns = [
      // Messages très courts répétitifs
      /^(.)\1{5,}$/,
      /^(..)\1{3,}$/,
      
      // Caractères suspects en masse
      /[!@#$%^&*()]{5,}/,
      /[0-9]{10,}/,
      
      // Patterns de bot
      /^(test|debug|admin|root|bot|crawler)/i,
      
      // Tentatives d'injection
      /(<script|javascript:|data:)/i,
      /(\${|{{|\[\[)/,
      
      // Messages de spam typiques
      /^(spam|test|aaa|zzz|xxx|hello|hi){3,}/i,
      
      // Patterns d'automation
      /^(message|text|content)\s*\d+$/i
    ]

    const isSuspiciousMessage = suspiciousPatterns.some(pattern => 
      pattern.test(message)
    )

    // User-Agent suspects renforcés
    const suspiciousUserAgents = [
      /bot|crawler|spider|scraper/i,
      /curl|wget|postman|insomnia/i,
      /python|perl|php|java|node/i,
      /automated|script|tool/i
    ]

    const isSuspiciousUA = userAgent ? suspiciousUserAgents.some(pattern =>
      pattern.test(userAgent)
    ) : false

    // 🔒 SÉCURITÉ: Vérification de headers suspects
    const suspiciousHeaders = headers ? (
      // Trop de headers X-Forwarded-For (tentative de confusion)
      (headers['x-forwarded-for']?.split(',').length || 0) > 3 ||
      // Headers contradictoires
      (headers['x-real-ip'] && headers['cf-connecting-ip'] && 
       headers['x-real-ip'] !== headers['cf-connecting-ip'])
    ) : false

    return isSuspiciousMessage || isSuspiciousUA || Boolean(suspiciousHeaders)
  }

  /**
   * Valide un format d'IP
   */
  private static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  /**
   * 🔒 SÉCURITÉ: Vérification si une IP est privée
   */
  private static isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^127\./, // Loopback
      /^10\./, // Private class A
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private class B
      /^192\.168\./, // Private class C
      /^::1$/, // IPv6 loopback
      /^fc00:/, // IPv6 private
      /^fe80:/ // IPv6 link-local
    ]
    
    return privateRanges.some(range => range.test(ip))
  }
}

// Instance singleton pour export
export const rateLimiter = RateLimiterService.getInstance()

// Utilitaires d'export sécurisés
export const RateLimitUtils = {
  /**
   * Crée des headers de rate limiting pour la réponse
   */
  createHeaders: (result: RateLimitResult): Record<string, string> => {
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    }

    if (result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString()
    }

    return headers
  },

  /**
   * Vérifie si une requête devrait être loggée comme suspecte
   */
  shouldLogSuspicious: (result: RateLimitResult): boolean => {
    return result.blocked || (result.remaining <= 2 && result.remaining > 0)
  },

  /**
   * 🔒 SÉCURITÉ: Masque les données sensibles pour les logs
   */
  maskSensitiveData: (data: unknown): unknown => {
    if (!data || typeof data !== 'object') return data
    const masked = { ...data as Record<string, any> }
    
    // Masquer les IPs
    if (masked['ip']) {
      masked['ip'] = masked['ip'].substring(0, 8) + '***'
    }
    
    // Masquer les User-Agents
    if (masked['userAgent']) {
      masked['userAgent'] = masked['userAgent'].substring(0, 20) + '***'
    }
    
    // Masquer les messages
    if (masked['message']) {
      masked['message'] = masked['message'].substring(0, 10) + '***'
    }
    
    return masked
  }
}