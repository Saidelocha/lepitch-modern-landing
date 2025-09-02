/**
 * Server-Side Security Validation Middleware
 * 
 * 🔒 SÉCURITÉ: Validation complète côté serveur uniquement
 * - Validation des sessions sans dépendance client
 * - Vérification de l'intégrité des requêtes  
 * - Contrôles de sécurité renforcés
 * - Logging sécurisé des tentatives d'intrusion
 */

import { NextRequest } from 'next/server'
import { log } from '@/lib/logger'

// Types pour la validation
interface SecurityValidationResult {
  isValid: boolean
  errors: string[]
  securityIssues: string[]
  clientInfo: ClientSecurityInfo
}

interface ClientSecurityInfo {
  ip: string
  userAgent: string
  origin?: string
  referer?: string
  contentType?: string
  timestamp: number
}

export class ServerValidationMiddleware {
  private static instance: ServerValidationMiddleware | null = null
  private readonly maxRequestSize = 1024 * 1024 // 1MB
  private readonly allowedOrigins = new Set([
    'https://lepitchquilvousfaut.fr',
    'https://www.lepitchquilvousfaut.fr',
    'http://localhost:3000', // Development only
    'https://localhost:3000' // Development HTTPS
  ])

  static getInstance(): ServerValidationMiddleware {
    if (!ServerValidationMiddleware.instance) {
      ServerValidationMiddleware.instance = new ServerValidationMiddleware()
    }
    return ServerValidationMiddleware.instance
  }

  /**
   * Validation complète d'une requête
   */
  async validateRequest(request: NextRequest): Promise<SecurityValidationResult> {
    const result: SecurityValidationResult = {
      isValid: true,
      errors: [],
      securityIssues: [],
      clientInfo: this.extractClientInfo(request)
    }

    // 1. Validation de l'origine
    this.validateOrigin(request, result)

    // 2. Validation des headers de sécurité
    this.validateSecurityHeaders(request, result)

    // 3. Validation de la taille de la requête
    await this.validateRequestSize(request, result)

    // 4. Validation du contenu
    this.validateContentType(request, result)

    // 5. Détection d'attaques courantes
    this.detectCommonAttacks(request, result)

    // 6. Validation de l'intégrité de session
    this.validateSessionIntegrity(request, result)

    // Log des résultats de sécurité  
    this.logSecurityValidation(result)

    return result
  }

  /**
   * Extraction sécurisée des informations client
   */
  private extractClientInfo(request: NextRequest): ClientSecurityInfo {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0]?.trim() || '127.0.0.1' : 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'

    const clientInfo: ClientSecurityInfo = {
      ip: this.sanitizeIP(ip),
      userAgent: this.sanitizeUserAgent(request.headers.get('user-agent') || ''),
      timestamp: Date.now()
    }

    const origin = request.headers.get('origin')
    if (origin) {
      clientInfo.origin = origin
    }

    const referer = request.headers.get('referer')
    if (referer) {
      clientInfo.referer = referer
    }

    const contentType = request.headers.get('content-type')
    if (contentType) {
      clientInfo.contentType = contentType
    }

    return clientInfo
  }

  /**
   * Validation de l'origine des requêtes
   */
  private validateOrigin(request: NextRequest, result: SecurityValidationResult) {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')

    // En production, vérifier l'origine strictement
    if (process.env.NODE_ENV === 'production') {
      if (origin && !this.allowedOrigins.has(origin)) {
        result.isValid = false
        result.securityIssues.push(`🚨 Origine non autorisée: ${origin}`)
      }

      if (referer) {
        const refererOrigin = new URL(referer).origin
        if (!this.allowedOrigins.has(refererOrigin)) {
          result.securityIssues.push(`⚠️  Referer suspect: ${refererOrigin}`)
        }
      }
    }
  }

  /**
   * Validation des headers de sécurité
   */
  private validateSecurityHeaders(request: NextRequest, result: SecurityValidationResult) {
    // Vérifier la présence de headers obligatoires pour certaines requêtes
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        result.securityIssues.push('⚠️  Content-Type manquant ou incorrect pour POST')
      }
    }

    // Détecter les user-agents suspects
    const userAgent = request.headers.get('user-agent')
    if (userAgent) {
      if (this.isSuspiciousUserAgent(userAgent)) {
        result.securityIssues.push(`🚨 User-Agent suspect: ${this.sanitizeUserAgent(userAgent)}`)
      }
    }
  }

  /**
   * Validation de la taille des requêtes
   */
  private async validateRequestSize(request: NextRequest, result: SecurityValidationResult) {
    try {
      const contentLength = request.headers.get('content-length')
      if (contentLength) {
        const size = parseInt(contentLength, 10)
        if (size > this.maxRequestSize) {
          result.isValid = false
          result.errors.push(`❌ Requête trop grande: ${size} bytes (max: ${this.maxRequestSize})`)
        }
      }
    } catch (error) {
      result.securityIssues.push('⚠️  Erreur lors de la validation de la taille')
    }
  }

  /**
   * Validation du type de contenu
   */
  private validateContentType(request: NextRequest, result: SecurityValidationResult) {
    if (request.method === 'POST' || request.method === 'PUT') {
      const contentType = request.headers.get('content-type')
      if (!contentType) {
        result.errors.push('❌ Content-Type manquant')
        return
      }

      const allowedTypes = [
        'application/json',
        'application/x-www-form-urlencoded',
        'multipart/form-data'
      ]

      const isValidType = allowedTypes.some(type => contentType.includes(type))
      if (!isValidType) {
        result.securityIssues.push(`🚨 Content-Type non autorisé: ${contentType}`)
      }
    }
  }

  /**
   * Détection d'attaques courantes
   */
  private detectCommonAttacks(request: NextRequest, result: SecurityValidationResult) {
    const url = request.url
    const userAgent = request.headers.get('user-agent') || ''

    // Détection de path traversal
    if (url.includes('../') || url.includes('..\\')) {
      result.isValid = false
      result.securityIssues.push('🚨 Tentative de path traversal détectée')
    }

    // Détection de SQL injection basique
    const sqlPatterns = [
      /union.*select/i,
      /drop.*table/i,
      /insert.*into/i,
      /'.*or.*'/i,
      /exec.*xp_/i
    ]

    for (const pattern of sqlPatterns) {
      if (pattern.test(url) || pattern.test(userAgent)) {
        result.isValid = false
        result.securityIssues.push('🚨 Tentative d\'injection SQL détectée')
        break
      }
    }

    // Détection de XSS basique
    const xssPatterns = [
      /<script.*?>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i
    ]

    for (const pattern of xssPatterns) {
      if (pattern.test(url)) {
        result.isValid = false
        result.securityIssues.push('🚨 Tentative de XSS détectée')
        break
      }
    }
  }

  /**
   * Validation de l'intégrité de session
   */
  private validateSessionIntegrity(request: NextRequest, result: SecurityValidationResult) {
    // Vérifier la cohérence des headers de session
    const cookies = request.headers.get('cookie')
    if (cookies) {
      // Détecter les tentatives de manipulation de cookies
      if (cookies.includes('admin=true') || cookies.includes('role=admin')) {
        result.securityIssues.push('🚨 Tentative de manipulation de privilèges détectée')
      }
    }
  }

  /**
   * Détection d'user-agents suspects
   */
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scanner/i,
      /curl/i,
      /wget/i,
      /python/i,
      /perl/i,
      /php/i,
      /java/i,
      /go-http/i,
      /postman/i,
      /insomnia/i
    ]

    // Exclure les bots légitimes
    const legitimateBots = [
      /googlebot/i,
      /bingbot/i,
      /slurp/i,
      /duckduckbot/i
    ]

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent))
    const isLegitimate = legitimateBots.some(pattern => pattern.test(userAgent))

    return isSuspicious && !isLegitimate
  }

  /**
   * Nettoyage sécurisé des adresses IP
   */
  private sanitizeIP(ip: string): string {
    // Valider le format IPv4/IPv6
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

    if (ipv4Pattern.test(ip) || ipv6Pattern.test(ip)) {
      return ip
    }

    // IP invalide, utiliser une valeur par défaut sécurisée
    return '0.0.0.0'
  }

  /**
   * Nettoyage sécurisé des user-agents
   */
  private sanitizeUserAgent(userAgent: string): string {
    // Limiter la longueur et nettoyer les caractères dangereux
    return userAgent
      .slice(0, 500) // Limiter à 500 caractères
      .replace(/[<>'"]/g, '') // Supprimer les caractères XSS
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim()
  }

  /**
   * Logging sécurisé des validations
   */
  private logSecurityValidation(result: SecurityValidationResult) {
    if (result.securityIssues.length > 0) {
      log.warn('🚨 Problèmes de sécurité détectés:', {
        ip: result.clientInfo.ip,
        userAgent: result.clientInfo.userAgent
      }, {
        issues: result.securityIssues,
        requestTimestamp: result.clientInfo.timestamp
      } as any)
    }

    if (!result.isValid) {
      log.error('❌ Validation de sécurité échouée:', {
        ip: result.clientInfo.ip
      }, {
        errors: result.errors,
        securityIssues: result.securityIssues
      } as any)
    }
  }

  /**
   * Génération de réponse d'erreur sécurisée
   */
  createSecurityErrorResponse(_result: SecurityValidationResult): Response {
    // Ne pas révéler d'informations sensibles dans la réponse
    const genericMessage = 'Request validation failed'
    
    return new Response(
      JSON.stringify({
        error: genericMessage,
        timestamp: Date.now()
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        }
      }
    )
  }
}

// Instance singleton
export const serverValidation = ServerValidationMiddleware.getInstance()

// Fonction utilitaire pour validation rapide
export async function validateServerRequest(request: NextRequest) {
  return await serverValidation.validateRequest(request)
}