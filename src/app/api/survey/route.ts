import { NextRequest, NextResponse } from 'next/server'
import { EnhancedSurveyHandler } from '@/lib/chatbot/business'
import { RateLimitMiddleware } from '@/lib/chatbot/rate-limiter'
import { log } from '@/lib/logger'

// Simple in-memory session store (same as chat API)
const getSessionsStore = () => {
  if (!global.questionnaireSessions) {
    global.questionnaireSessions = new Map()
  }
  return global.questionnaireSessions
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting préliminaire
    const preliminaryRateLimit = await RateLimitMiddleware.checkRequest(request)
    
    if (!preliminaryRateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Trop de requêtes. Veuillez patienter.',
        rateLimit: true,
        retryAfter: preliminaryRateLimit.result.retryAfter
      }, { 
        status: 429,
        headers: preliminaryRateLimit.headers
      })
    }

    const body = await request.json()
    
    log.survey('Données reçues pour traitement', {
      sessionId: body.sessionId
    }, {
      hasSessionId: !!body.sessionId,
      hasSurveyData: !!body.surveyData,
      surveyDataKeys: body.surveyData ? Object.keys(body.surveyData) : null,
      metadata: { operation: 'data_received' }
    })
    
    // Validation des données reçues
    const { sessionId, surveyData } = body
    
    if (!sessionId || !surveyData) {
      log.error('Données requises manquantes', {
        sessionId: sessionId || 'missing'
      }, {
        hasSessionId: !!sessionId,
        hasSurveyData: !!surveyData,
        metadata: { operation: 'validation_failed' }
      })
      return NextResponse.json({
        success: false,
        error: 'Données manquantes'
      }, { status: 400 })
    }

    // Validation simple du sessionId pour survey (bypass de la validation stricte)
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10 || sessionId.length > 100) {
      log.security('Session ID format invalide', {
        sessionId: sessionId || 'undefined',
        metadata: { operation: 'simple_session_validation_failed' }
      })
      return NextResponse.json({
        success: false,
        error: 'Session ID invalide'
      }, { status: 400 })
    }
    
    log.survey('Session ID validation passed', {
      sessionId,
      metadata: { operation: 'simple_session_validation_success' }
    })

    // Validation et sanitisation des données du formulaire
    log.survey('Validation des données formulaire', {
      sessionId,
      metadata: { operation: 'form_validation', hasData: !!surveyData }
    })
    const validation = EnhancedSurveyHandler.validateAndSanitize(surveyData)
    
    if (!validation.success) {
      log.error('Validation formulaire échouée', {
        sessionId,
        error: validation.error || 'Erreur de validation inconnue',
        metadata: { operation: 'form_validation_failed' }
      })
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 })
    }
    
    log.survey('Validation formulaire réussie', {
      sessionId,
      metadata: { operation: 'form_validation_success', hasValidatedData: !!validation.data }
    })

    const validatedSurveyData = validation.data!

    // Récupération de la session de chat pour obtenir le contexte conversationnel
    const sessionsStore = getSessionsStore()
    log.survey('Recherche session chat', {
      sessionId,
      metadata: { operation: 'chat_session_lookup', totalSessions: sessionsStore.size }
    })
    const chatSession = sessionsStore.get(sessionId)
    
    if (!chatSession) {
      log.error('Session de chat non trouvée', {
        sessionId,
        metadata: { operation: 'chat_session_not_found', totalAvailableSessions: Array.from(sessionsStore.keys()).length }
      })
      return NextResponse.json({
        success: false,
        error: 'Session de chat non trouvée'
      }, { status: 404 })
    }
    
    log.survey('Session chat trouvée', {
      sessionId,
      metadata: { 
        operation: 'chat_session_found',
        messagesCount: chatSession.messages?.length || 0,
        hasUserInfo: !!chatSession.userInfo
      }
    })

    // Génération du contexte conversationnel
    const conversationContext = chatSession.messages
      .filter((msg: { isBot: boolean }) => !msg.isBot) // Messages utilisateur seulement
      .map((msg: { text: string }) => msg.text)
      .join(' ')

    // Sauvegarde des données du formulaire avec analyse business
    const saveResult = await EnhancedSurveyHandler.saveSurveyData(
      sessionId, 
      validatedSurveyData, 
      conversationContext
    )

    if (!saveResult.success) {
      return NextResponse.json({
        success: false,
        error: saveResult.error
      }, { status: 500 })
    }

    // 🔄 CRITICAL: Mise à jour de la session de chat avec logs détaillés
    log.survey('📧 SURVEY: Updating chat session state', {
      sessionId,
      metadata: { operation: 'session_state_update' }
    }, {
      beforeUpdate: {
        surveyFormCompleted: chatSession.surveyFormCompleted,
        completed: chatSession.completed,
        hasUserInfo: !!chatSession.userInfo
      }
    })
    
    chatSession.surveyFormCompleted = true
    chatSession.completed = true
    chatSession.userInfo = {
      ...chatSession.userInfo,
      nom: validatedSurveyData.nom,
      contactMethod: validatedSurveyData.contactMethod,
      contact: validatedSurveyData.contact
    }
    
    // 🔄 FORCE: Explicitement sauvegarder la session mise à jour dans le store
    sessionsStore.set(sessionId, chatSession)
    
    log.survey('📧 SURVEY: Chat session state updated', {
      sessionId,
      metadata: { operation: 'session_state_updated' }
    }, {
      afterUpdate: {
        surveyFormCompleted: chatSession.surveyFormCompleted,
        completed: chatSession.completed,
        userInfoNom: chatSession.userInfo.nom,
        userInfoContact: chatSession.userInfo.contact,
        sessionSavedToStore: true
      }
    })

    // Conversion des données pour l'email avec analyse business
    const collectedInfo = EnhancedSurveyHandler.surveyToCollectedInfo(
      validatedSurveyData, 
      conversationContext,
      saveResult.analysis
    )
    chatSession.collectedInfo = collectedInfo

    // Génération de la qualification du prospect avec analyse enrichie
    const qualification = EnhancedSurveyHandler.generateEnhancedQualificationSummary(
      validatedSurveyData, 
      conversationContext,
      saveResult.analysis
    )

    // 📧 EMAIL GÉRÉ PAR L'API CHAT - Skip envoi pour éviter les doublons
    log.survey('📧 Email géré par API chat - pas d\'envoi depuis survey API', {
      sessionId,
      metadata: { 
        operation: 'email_skipped_handled_by_chat_api',
        prospectName: validatedSurveyData.nom
      }
    })

    // Nettoyage des données sensibles du formulaire
    setTimeout(() => {
      EnhancedSurveyHandler.clearSurveyData(sessionId)
    }, 5000) // Attendre 5 secondes pour s'assurer que tout est traité

    // Réponse de succès - email géré par l'API chat
    const finalResponse = {
      success: true,
      message: 'Vos informations ont été transmises avec succès à Léo !',
      leadSubmitted: true, // Toujours true car l'API chat gère l'email
      qualification: {
        grade: qualification.grade,
        score: qualification.score,
        recommendation: qualification.recommendation
      }
    }
    
    log.survey('Réponse API finale envoyée', {
      sessionId,
      metadata: { 
        operation: 'final_response',
        success: finalResponse.success,
        leadSubmitted: finalResponse.leadSubmitted
      }
    })
    
    return NextResponse.json(finalResponse, {
      headers: preliminaryRateLimit.headers
    })

  } catch (error) {
    log.error('Erreur Survey API', {
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: { 
        operation: 'survey_api_error',
        stack: error instanceof Error ? error.stack : undefined
      }
    })
    
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors du traitement de votre demande'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting pour GET
  const getRateLimit = await RateLimitMiddleware.checkRequest(request, {
    windowMs: 1 * 60 * 1000,    // 1 minute
    maxRequests: 10,             // 10 requêtes GET max par minute
    blockDurationMs: 2 * 60 * 1000 // Blocage 2 minutes
  })
  
  if (!getRateLimit.allowed) {
    return NextResponse.json({
      success: false,
      error: 'Trop de requêtes. Veuillez patienter.',
      rateLimit: true,
      retryAfter: getRateLimit.result.retryAfter
    }, { 
      status: 429,
      headers: getRateLimit.headers
    })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  // Endpoint pour obtenir les statistiques (monitoring/debug)
  if (action === 'stats') {
    try {
      const stats = EnhancedSurveyHandler.getEnhancedStats()
      
      return NextResponse.json({
        success: true,
        stats
      }, {
        headers: getRateLimit.headers
      })
    } catch (error) {
      log.error('Erreur récupération statistiques survey', {
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: { operation: 'get_stats_error' }
      })
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      }, { 
        status: 500,
        headers: getRateLimit.headers
      })
    }
  }

  // Endpoint pour nettoyer les données expirées (maintenance)
  if (action === 'cleanup') {
    try {
      EnhancedSurveyHandler.cleanupExpiredData()
      
      return NextResponse.json({
        success: true,
        message: 'Nettoyage des données expirées effectué'
      }, {
        headers: getRateLimit.headers
      })
    } catch (error) {
      log.error('Erreur durant le nettoyage', {
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: { operation: 'cleanup_error' }
      })
      return NextResponse.json({
        success: false,
        error: 'Erreur lors du nettoyage'
      }, { 
        status: 500,
        headers: getRateLimit.headers
      })
    }
  }

  return NextResponse.json({
    success: false,
    error: 'Action non reconnue'
  }, { 
    status: 400,
    headers: getRateLimit.headers
  })
}