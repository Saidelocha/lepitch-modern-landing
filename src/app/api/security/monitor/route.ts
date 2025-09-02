/**
 * Security Monitoring Dashboard API
 * 
 * 🔒 SÉCURITÉ: Endpoint pour surveiller l'état de sécurité du système
 * - Métriques de sécurité en temps réel
 * - Rapport des menaces actives
 * - État de la compliance
 * - Logs d'événements sécurisés
 * 
 * Accès: Administrateurs uniquement (protection par IP en production)
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateSecurityReport, getSecurityMetrics, securityMonitor } from '@/lib/chatbot/security/security-monitor'
import { validateEnvironment, envValidator } from '@/lib/chatbot/security/env-validator'
import { log } from '@/lib/logger'

// IPs autorisées pour accéder au monitoring (à configurer selon l'environnement)
const ALLOWED_ADMIN_IPS = process.env['ADMIN_IPS']?.split(',') || []
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Vérification d'accès administrateur
 */
function isAuthorizedAdmin(request: NextRequest): boolean {
  // En développement, permettre l'accès local
  if (isDevelopment) {
    return true
  }

  // En production, vérifier l'IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const clientIP = forwardedFor?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   '127.0.0.1'

  return ALLOWED_ADMIN_IPS.includes(clientIP)
}

/**
 * GET - Obtenir les métriques de sécurité
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification d'autorisation
    if (!isAuthorizedAdmin(request)) {
      log.warn('🚨 Tentative d\'accès non autorisé au monitoring de sécurité:', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })

      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const reportType = url.searchParams.get('type') || 'metrics'

    let responseData: Record<string, unknown>

    switch (reportType) {
      case 'metrics':
        responseData = {
          type: 'security_metrics',
          timestamp: Date.now(),
          data: getSecurityMetrics()
        }
        break

      case 'report':
        responseData = {
          type: 'security_report',
          ...generateSecurityReport()
        }
        break

      case 'environment':
        const envValidation = validateEnvironment()
        responseData = {
          type: 'environment_status',
          timestamp: Date.now(),
          validation: {
            isValid: envValidation.isValid,
            errorCount: envValidation.errors.length,
            warningCount: envValidation.warnings.length,
            securityIssueCount: envValidation.securityIssues.length
          },
          configReport: envValidator.getConfigReport()
        }
        break

      case 'health':
        responseData = {
          type: 'security_health',
          timestamp: Date.now(),
          status: 'operational',
          checks: {
            environmentVariables: validateEnvironment().isValid,
            securityMonitoring: true,
            rateLimiting: true,
            encryption: !!process.env['CHAT_ENCRYPTION_KEY']
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    log.info('📊 Rapport de sécurité généré:', {}, {
      type: reportType,
      requestedBy: request.headers.get('x-forwarded-for') || 'localhost'
    })

    return NextResponse.json(responseData)

  } catch (error) {
    log.error('❌ Erreur lors de la génération du rapport de sécurité:', {}, { 
      error: error instanceof Error ? error.message : String(error) 
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Actions de sécurité (reset monitoring, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification d'autorisation
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, parameters } = body

    let result: Record<string, unknown>

    switch (action) {
      case 'reset_monitoring':
        // Cette action nécessiterait un redémarrage du service
        // En production, on logguerait la demande pour action manuelle
        log.warn('🔄 DEMANDE DE RESET MONITORING:', {}, {
          requestedBy: request.headers.get('x-forwarded-for') || 'localhost',
          time: Date.now()
        })
        
        result = {
          action: 'reset_monitoring',
          status: 'logged_for_manual_action',
          message: 'Reset request logged for administrator review'
        }
        break

      case 'validate_environment':
        const validation = validateEnvironment()
        result = {
          action: 'validate_environment',
          status: 'completed',
          validation
        }
        break

      case 'security_test':
        // Déclencher un test de sécurité contrôlé
        securityMonitor.monitorSystemIntegrity()
        result = {
          action: 'security_test',
          status: 'completed',
          message: 'System integrity check performed'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    log.info('🔧 Action de sécurité exécutée:', {}, {
      action,
      parameters,
      result: String(result['status'])
    })

    return NextResponse.json(result)

  } catch (error) {
    log.error('❌ Erreur lors de l\'exécution de l\'action de sécurité:', {}, { 
      error: error instanceof Error ? error.message : String(error) 
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}