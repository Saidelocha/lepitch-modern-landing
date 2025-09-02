import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { QuestionnaireStep, QuestionnaireSession, ChatMessage, ConversationGoals } from '@/lib/chatbot/chat'
import { sendLeadNotification } from '@/lib/chatbot/email'
import { ChatEngine } from '@/lib/chatbot/chat-engine'
import { enhancedProspectQualificationService } from '@/lib/chatbot/business'
import { RefactoredValidationService } from '@/lib/chatbot/validation'
import { RateLimitMiddleware, RateLimitUtils } from '@/lib/chatbot/rate-limiter'
import { log } from '@/lib/logger'
import { validateEnvironment } from '@/lib/chatbot/security/env-validator'
import { validateServerRequest } from '@/lib/chatbot/security/server-validation-middleware'
import { securityMonitor, SecurityEventType, SecuritySeverity } from '@/lib/chatbot/security/security-monitor'

// 🔒 VALIDATION DE SÉCURITÉ: Vérifier les variables d'environnement au démarrage
const isDevelopment = process.env.NODE_ENV === 'development'
let envValidationResult: { isValid: boolean; errors: string[]; securityIssues: string[] } | null = null
try {
  envValidationResult = validateEnvironment()
  if (!envValidationResult.isValid) {
    // En développement, logger comme warning, en production comme error
    const logLevel = isDevelopment ? 'warn' : 'error'
    const message = isDevelopment ? 
      '⚠️  Variables d\'environnement invalides en développement' : 
      '🚨 ÉCHEC CRITIQUE: Variables d\'environnement invalides'
    
    log[logLevel](message, {}, {
      errors: envValidationResult.errors,
      securityIssues: envValidationResult.securityIssues,
      environment: process.env.NODE_ENV
    })
    
    // Enregistrer l'événement de sécurité avec sévérité adaptée
    const severity = isDevelopment ? SecuritySeverity.LOW : SecuritySeverity.CRITICAL
    securityMonitor.recordSecurityEvent({
      type: SecurityEventType.ENVIRONMENT_BREACH,
      severity,
      source: 'startup_validation',
      ip: 'localhost',
      details: {
        errors: envValidationResult.errors,
        securityIssues: envValidationResult.securityIssues,
        environment: process.env.NODE_ENV
      }
    })
  }
} catch (error) {
  const message = isDevelopment ? 
    '⚠️  Validation des variables d\'environnement échouée en développement' :
    '🚨 ÉCHEC CRITIQUE: Validation des variables d\'environnement échouée'
  log[isDevelopment ? 'warn' : 'error'](message, {}, { 
    error: error instanceof Error ? error.message : String(error)
  })
}

// Validation gérée par RefactoredValidationService - voir src/lib/chatbot/validation/

/**
 * Détecte si la fermeture par l'IA est due à un comportement inapproprié
 * Analyse le message de fermeture pour identifier les patterns de ban
 */
function detectInappropriateBehaviorClosure(botMessage: string): boolean {
  const inappropriateClosurePatterns = [
    /cette conversation est terminée/i,
    /je ne peux pas continuer cette conversation/i,
    /veuillez adopter un ton respectueux/i,
    /comportement inapproprié/i,
    /uniquement là pour accompagner les personnes ayant un réel besoin/i,
    /parlons de coaching ou je dois fermer/i,
    /dernière tentative/i
  ]
  
  return inappropriateClosurePatterns.some(pattern => pattern.test(botMessage))
}

// Define the 10-step questionnaire structure from docs/chat.md  
// Note: This structure is used by the chat engine for step validation
// Exporting for potential future use in testing or validation
export const QUESTIONNAIRE_STEPS: QuestionnaireStep[] = [
  {
    id: 1,
    question: "👋 Bonjour ! En quoi puis-je vous aider ? Décrivez votre situation et vos besoins en détails.",
    type: "text"
  },
  {
    id: 2,
    question: "Très bien, c'est noté ! Avez-vous d'autres choses à ajouter à votre situation ?",
    type: "text"
  },
  {
    id: 3,
    question: "Je comprends. Votre besoin est-il urgent ?",
    type: "binary",
    options: ["Oui", "Non"]
  },
  {
    id: 4,
    question: "Parfait ! Quand souhaitez-vous démarrer ?",
    type: "multiple",
    options: ["Dans les plus brefs délais", "Dans la semaine", "Dans le mois", "Un jour"]
  },
  {
    id: 5,
    question: "D'accord. Avez-vous déjà fait appel à un coach auparavant ?",
    type: "binary",
    options: ["Oui", "Non"]
  },
  {
    id: 6,
    question: "Bien noté ! Combien de temps êtes-vous prêt à investir dans votre progression (ou celle de votre équipe) ?",
    type: "multiple",
    options: ["3h", "6h", "15h", "+de 15h"]
  },
  {
    id: 7,
    question: "Merci pour ces précisions ! Pour mieux cadrer les choses pour Léo, quel rythme aimeriez-vous suivre ?",
    type: "multiple",
    options: ["1 séance par semaine", "2 séances par semaine", "1 séance par mois", "À définir ensemble"]
  },
  {
    id: 8,
    question: "Parfait ! À quel nom dois-je transmettre votre message ?",
    type: "text"
  },
  {
    id: 9,
    question: "Merci ! Comment préférez-vous que l'on vous re-contacte ?",
    type: "binary",
    options: ["Mail", "Téléphone"]
  },
  {
    id: 10,
    question: "Quel est votre numéro/email ?",
    type: "text"
  },
  {
    id: 11,
    question: "Parfait ! Je transmets maintenant toutes vos informations à Léo qui prendra personnellement contact avec vous dans les plus brefs délais. Belle journée à vous ! 😊",
    type: "text"
  }
]

// Unified session store - same as survey API
declare global {
  var questionnaireSessions: Map<string, QuestionnaireSession> | undefined
}

const getSessionsStore = () => {
  if (!global.questionnaireSessions) {
    global.questionnaireSessions = new Map()
  }
  return global.questionnaireSessions
}

// Simplified conversation configuration
const CONVERSATION_CONFIG = {
  mode: 'conversation' as const,
  maxMessagesInMemory: 100, // Optimized memory management
  inactivityTimeout: 10 * 60 * 1000
}

const getOrCreateSession = (sessionId: string): QuestionnaireSession => {
  // Validation sécurisée du sessionId - simple pattern check
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10 || sessionId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
    throw new Error('Session ID invalide')
  }

  const sessionsStore = getSessionsStore()
  if (!sessionsStore.has(sessionId)) {
    const session: QuestionnaireSession = {
      id: sessionId,
      responses: [],
      messages: [],
      conversationMemory: {
        botMessages: [],
        mentionedConcepts: new Set(),
        conversationTone: 'professional',
        userProvidedInfo: new Map(),
        emotionalContext: {}
      },
      mode: CONVERSATION_CONFIG.mode,
      userInfo: {
        startTime: new Date()
      },
      completed: false
    }

    // Initialize based on mode
    // Initialize conversation mode
    session.conversationGoals = {
      understand_need: false,
      assess_urgency: false,
      get_timeline: false,
      understand_commitment: false,
      collect_identity: false,
      get_contact: false
    }
    session.collectedInfo = {}
    session.surveyFormTriggered = false
    session.surveyFormCompleted = false
    session.readyForSurvey = false

    sessionsStore.set(sessionId, session)
  }
  return sessionsStore.get(sessionId)!
}

// Legacy function - no longer used in simplified architecture

// Simplified memory management
const limitSessionMessages = (session: QuestionnaireSession): void => {
  if (session.messages.length > CONVERSATION_CONFIG.maxMessagesInMemory) {
    // Keep welcome message + recent messages
    const welcomeMessage = session.messages.find(msg => msg.id.startsWith('welcome-'))
    const recentMessages = session.messages.slice(-(CONVERSATION_CONFIG.maxMessagesInMemory - 1))
    
    session.messages = welcomeMessage 
      ? [welcomeMessage, ...recentMessages.filter(msg => !msg.id.startsWith('welcome-'))]
      : recentMessages
      
    log.debug('Limited session messages', { sessionId: session.id }, {
      newCount: session.messages.length
    })
  }
}

// Legacy functions removed - now using simplified ChatEngine

const generateWelcomeMessage = (): ChatMessage => {
  return {
    id: `welcome-${Date.now()}`,
    text: "Bonjour ! Je suis l'assistante de Léo Barcet, coach spécialisé en prise de parole. Je peux vous donner quelques premiers conseils et recueillir vos besoins pour que Léo puisse vous accompagner au mieux. Qu'est-ce qui vous amène aujourd'hui ?",
    isBot: true,
    timestamp: new Date()
  }
}

// Simplified conversation processing using new ChatEngine
const processConversationWithAI = async (
  session: QuestionnaireSession,
  userMessage: string
): Promise<{
  success: boolean,
  botMessage?: ChatMessage,
  completed?: boolean,
  closeChat?: boolean,
  error?: string,
  surveyFormTriggered?: boolean
}> => {
  try {
    // Add user message to history
    const userChatMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      text: userMessage.trim(),
      isBot: false,
      timestamp: new Date()
    }
    session.messages.push(userChatMessage)

    // Process with simplified ChatEngine
    const chatDecision = await ChatEngine.processConversation(userMessage, session)
    
    // Update session state
    if (chatDecision.extractedInfo) {
      session.collectedInfo = {
        ...session.collectedInfo,
        ...chatDecision.extractedInfo
      }
    }
    
    if (chatDecision.achievedGoals && session.conversationGoals) {
      session.conversationGoals = {
        ...session.conversationGoals,
        ...chatDecision.achievedGoals
      } as ConversationGoals
    }
    
    // Update consent state
    if (chatDecision.shouldRequestConsent && !session.consentRequested) {
      session.consentRequested = true
    }

    // Handle completion - UNIQUEMENT si le survey est complété
    if (session.surveyFormCompleted) {
      session.completed = true
      log.info('Conversation marked as completed', {
        sessionId: session.id
      }, {
        surveyFormCompleted: session.surveyFormCompleted,
        chatDecisionComplete: chatDecision.isComplete,
        shouldTriggerSurvey: chatDecision.shouldTriggerSurvey
      })
      
      // Transfer collected info to userInfo for email sending
      if (session.collectedInfo) {
        session.userInfo = {
          ...session.userInfo,
          ...(session.collectedInfo.name && { nom: session.collectedInfo.name }),
          ...(session.collectedInfo.contactPreference && { contactMethod: session.collectedInfo.contactPreference }),
          ...(session.collectedInfo.contactInfo && { contact: session.collectedInfo.contactInfo })
        }
      }
    }
    
    // Create bot message
    const botMessage: ChatMessage = {
      id: `msg-${Date.now()}-bot`,
      text: chatDecision.botMessage,
      isBot: true,
      timestamp: new Date(),
      showSurveyForm: Boolean(chatDecision.shouldTriggerSurvey && !session.surveyFormCompleted),
      ...(chatDecision.surveyReason && { surveyContext: chatDecision.surveyReason }),
      showConsentRequest: Boolean(chatDecision.shouldRequestConsent && !session.consentRequested),
      ...(chatDecision.shouldRequestConsent && { consentContext: 'Demande de consentement pour recueillir vos coordonnées' })
    }
    
    session.messages.push(botMessage)
    limitSessionMessages(session)
    
    const surveyTriggered = chatDecision.shouldTriggerSurvey && !session.surveyFormCompleted
    
    // 📧 CRITICAL: Mettre à jour la session quand le formulaire est déclenché
    if (surveyTriggered) {
      session.surveyFormTriggered = true
      session.readyForSurvey = true
      log.email('Survey form triggered by AI', {
        sessionId: session.id
      }, {
        botMessageContainsTrigger: true,
        sessionUpdated: true,
        surveyFormTriggered: session.surveyFormTriggered,
        readyForSurvey: session.readyForSurvey
      })
    }
    
    return {
      success: true,
      botMessage,
      completed: session.completed,
      ...(chatDecision.closeChat && { closeChat: chatDecision.closeChat }),
      ...(surveyTriggered && { surveyFormTriggered: surveyTriggered })
    }
    
  } catch (error) {
    log.error('Error in processConversationWithAI', {}, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 🔒 VALIDATION DE SÉCURITÉ: Vérification préliminaire
    const serverValidation = await validateServerRequest(request)
    if (!serverValidation.isValid) {
      // Enregistrer l'incident de sécurité
      securityMonitor.recordSecurityEvent({
        type: SecurityEventType.ATTACK_ATTEMPT,
        severity: SecuritySeverity.HIGH,
        source: 'server_validation',
        ip: serverValidation.clientInfo.ip,
        userAgent: serverValidation.clientInfo.userAgent,
        details: {
          errors: serverValidation.errors,
          securityIssues: serverValidation.securityIssues
        }
      })

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Request validation failed',
          timestamp: Date.now()
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff'
          }
        }
      )
    }

    const body = await request.json()
    
    // 🚀 FORCE EMAIL SEND - Détection du message spécial pour forcer l'envoi d'email
    if (body.message === '[FORCE_EMAIL_SEND]' && body.surveyData) {
      log.info('🚀 FORCE EMAIL: Detected force email send request', { sessionId: body.sessionId })
      
      try {
        // Récupérer la session existante
        const sessionsStore = getSessionsStore()
        const session = sessionsStore.get(body.sessionId)
        
        if (session && body.surveyData) {
          // Mettre à jour la session avec les données du survey
          session.userInfo = {
            ...session.userInfo,
            nom: body.surveyData.nom,
            contactMethod: body.surveyData.contactMethod,
            contact: body.surveyData.contact
          }
          session.surveyFormCompleted = true
          session.completed = true
          sessionsStore.set(body.sessionId, session)
          
          // Forcer l'envoi de l'email via sendLeadNotification
          const { sendLeadNotification } = await import('@/lib/chatbot/email')
          const emailSession = {
            id: body.sessionId,
            messages: session.messages,
            userInfo: {
              nom: body.surveyData.nom,
              telephone: body.surveyData.contactMethod === 'telephone' ? body.surveyData.contact : undefined,
              email: body.surveyData.contactMethod === 'email' ? body.surveyData.contact : undefined,
              problematique: session.messages
                .filter((msg: { isBot: boolean }) => !msg.isBot)
                .map((msg: { text: string }) => msg.text)
                .join(' ') || 'Prospect qualifié via formulaire'
            },
            stage: 'completed',
            aiMetadata: {
              warningsReceived: 0,
              closedByAI: false,
              seriousnessScore: 'high' as const,
              lastWarningReason: undefined
            },
            qualification: {
              grade: 'A' as 'A+' | 'A' | 'B' | 'C' | 'D',
              score: 85,
              priority: 'HIGH' as 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW',
              callbackDelay: 'Contact immédiat recommandé',
              globalScore: 85,
              factors: ['Formulaire complété', 'Contact fourni'],
              details: {
                businessNeedAnalysis: `Besoin: ${body.surveyData.urgency === 'urgent' ? 'URGENT' : 'Standard'}`,
                urgencyAnalysis: `Urgence: ${body.surveyData.urgency}`,
                budgetAnalysis: `Engagement: ${body.surveyData.commitment}`,
                experienceAnalysis: 'Non collecté',
                seriousnessAnalysis: 'Formulaire complété = sérieux',
                overallRecommendation: 'Contact immédiat - Lead qualifié'
              },
              businessNeedScore: 80,
              urgencyScore: body.surveyData.urgency === 'urgent' ? 90 : 60,
              budgetIndicator: 75,
              experienceScore: 50,
              seriousnessScore: 85,
              approach: `Contacter ${body.surveyData.contactMethod === 'email' ? 'par email' : 'par téléphone'}`
            }
          }
          
          const emailResult = await sendLeadNotification({
            session: emailSession as any,
            completedAt: new Date()
          })
          
          log.info('🚀 FORCE EMAIL: Email send result', {
            sessionId: body.sessionId,
            metadata: { 
              success: emailResult.success,
              messageId: emailResult.messageId
            }
          })
          
          return NextResponse.json({
            success: true,
            message: 'Email envoyé avec succès',
            emailSent: emailResult.success,
            messageId: emailResult.messageId
          })
        } else {
          log.error('🚀 FORCE EMAIL: Session not found or missing survey data', { sessionId: body.sessionId })
          return NextResponse.json({
            success: false,
            error: 'Session non trouvée ou données manquantes'
          }, { status: 404 })
        }
      } catch (error) {
        log.error('🚀 FORCE EMAIL: Exception during forced email send', {
          sessionId: body.sessionId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        return NextResponse.json({
          success: false,
          error: 'Erreur lors de l\'envoi forcé'
        }, { status: 500 })
      }
    }
    
    // Détection de patterns suspects dans le payload
    securityMonitor.detectSuspiciousPatterns(
      serverValidation.clientInfo.ip,
      serverValidation.clientInfo.userAgent || '',
      body
    )
    
    // Rate limiting préliminaire (avant validation pour économiser les ressources)
    const preliminaryRateLimit = await RateLimitMiddleware.checkRequest(request)
    
    if (!preliminaryRateLimit.allowed) {
      const clientIP = serverValidation.clientInfo.ip
      
      // Enregistrer l'événement de rate limiting
      securityMonitor.recordSecurityEvent({
        type: SecurityEventType.RATE_LIMIT_EXCEEDED,
        severity: SecuritySeverity.MEDIUM,
        source: 'rate_limiter',
        ip: clientIP,
        userAgent: serverValidation.clientInfo.userAgent,
        details: {
          limit: preliminaryRateLimit.result.limit,
          remaining: preliminaryRateLimit.result.remaining,
          retryAfter: preliminaryRateLimit.result.retryAfter
        }
      })

      // Détecter les attaques par brute force
      const isBruteForce = securityMonitor.detectBruteForceAttack(clientIP)
      
      console.warn('🚨 Rate limit exceeded (preliminary):', {
        result: preliminaryRateLimit.result,
        ip: clientIP,
        bruteForceDetected: isBruteForce
      })
      
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
    
    // Validation et sanitisation renforcée
    const validationResult = await RefactoredValidationService.validateChatMessage(body)
    
    if (!validationResult.success) {
      // Analyser le risque pour logging détaillé
      const riskAnalysis = RefactoredValidationService.analyzeTextSecurity(body.message || '')
      
      console.warn('🚨 Validation failed:', {
        errors: validationResult.errors,
        riskAnalysis: {
          level: riskAnalysis.level,
          score: riskAnalysis.score,
          patterns: riskAnalysis.patterns
        },
        messagePreview: (body.message || '').substring(0, 50) + '...',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      
      // Messages d'erreur personnalisés selon le niveau de risque
      let userMessage = 'Votre message ne peut pas être envoyé'
      let userGuidance = ''
      
      if (riskAnalysis.level === 'high') {
        userMessage = 'Message bloqué pour des raisons de sécurité'
        userGuidance = 'Votre message contient des éléments non autorisés. Veuillez reformuler votre demande sans caractères spéciaux.'
      } else if (riskAnalysis.level === 'medium') {
        userMessage = 'Message envoyé avec des réserves'
        userGuidance = 'Certains éléments de votre message ont été détectés comme potentiellement problématiques, mais il a été accepté.'
      } else {
        userMessage = 'Format de message non valide'
        userGuidance = 'Vérifiez que votre message respecte les formats attendus (longueur, caractères autorisés).'
      }
      
      return NextResponse.json({
        success: false,
        error: userMessage,
        guidance: userGuidance,
        details: validationResult.errors,
        riskLevel: riskAnalysis.level
      }, { 
        status: riskAnalysis.level === 'high' ? 403 : 400
      })
    }

    const chatData = validationResult.data as { message?: string; sessionId?: string; browserId?: string }
    const { message, sessionId } = chatData
    
    // Vérifier si le message a un risque moyen (warning)
    const hasWarning = validationResult.securityAnalysis?.level === 'medium'
    
    if (hasWarning && validationResult.securityAnalysis) {
      console.info('⚠️ Medium risk message accepted with warning:', {
        sessionId: sessionId,
        riskScore: validationResult.securityAnalysis.score,
        patterns: validationResult.securityAnalysis.patterns,
        messagePreview: message ? message.substring(0, 50) + '...' : 'N/A',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
    }
    
    // Rate limiting spécialisé pour le chat (avec détection d'activité suspecte)
    const chatRateLimit = await RateLimitMiddleware.checkChatRequest(
      request,
      sessionId || 'unknown',
      message || ''
    )
    
    if (!chatRateLimit.allowed) {
      console.warn('🚨 Chat rate limit exceeded:', {
        sessionId: sessionId,
        result: chatRateLimit.result,
        suspicious: chatRateLimit.suspicious,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      
      return NextResponse.json({
        success: false,
        error: chatRateLimit.suspicious 
          ? 'Activité suspecte détectée. Accès temporairement restreint.'
          : 'Trop de messages. Veuillez ralentir.',
        rateLimit: true,
        suspicious: chatRateLimit.suspicious,
        retryAfter: chatRateLimit.result.retryAfter
      }, { 
        status: 429,
        headers: chatRateLimit.headers
      })
    }
    
    // Log si activité suspecte détectée mais pas encore bloquée
    if (chatRateLimit.suspicious && RateLimitUtils.shouldLogSuspicious(chatRateLimit.result)) {
      console.warn('⚠️ Suspicious activity detected:', {
        sessionId: sessionId,
        message: message ? message.substring(0, 50) + '...' : 'N/A',
        remaining: chatRateLimit.result.remaining,
        userAgent: request.headers.get('user-agent')?.substring(0, 50)
      })
    }
    
    // Security analysis already performed by RefactoredValidationService.validateChatMessage()
    // Check if high-risk content was already detected in validation
    if (validationResult.securityAnalysis?.level === 'high') {
      console.warn('🚨 High-risk content detected:', {
        sessionId,
        message: message ? message.substring(0, 50) + '...' : 'N/A',
        securityLevel: validationResult.securityAnalysis.level,
        patterns: validationResult.securityAnalysis.patterns
      })
      
      return NextResponse.json({
        success: false,
        error: 'Message non autorisé',
        banned: true
      }, { status: 403 })
    }

    const session = getOrCreateSession(sessionId || 'unknown')
    
    // Validation de la durée de session
    if (session.userInfo?.startTime) {
      const MAX_SESSION_DURATION = 30 * 60 * 1000 // 30 minutes
      const now = new Date()
      const duration = now.getTime() - session.userInfo.startTime.getTime()
      
      if (duration > MAX_SESSION_DURATION) {
        console.warn('🚨 Session expired:', { sessionId, startTime: session.userInfo.startTime })
        
        return NextResponse.json({
          success: false,
          error: 'Session expirée. Veuillez redémarrer la conversation.',
          expired: true
        }, { status: 410 })
      }
    }
    
    // Vérifier si la session est bannie (simple vérification côté serveur)
    // Note: Dans une vraie application, on stockerait les bans dans une base de données
    if (session.userInfo?.closedByAI) {
      return NextResponse.json({
        success: false,
        error: 'Session bloquée suite à un usage non-conforme',
        banned: true
      }, { status: 403 })
    }
    
    
    // Skip processing if already completed
    if (session.completed) {
      return NextResponse.json({
        success: true,
        completed: true,
        session: {
          id: session.id,
          completed: session.completed,
          messages: session.messages
        }
      })
    }

    // Process with unified conversation mode
    const processResult = await processConversationWithAI(session, message || '')
    
    if (!processResult.success) {
      return NextResponse.json({
        success: false,
        error: processResult.error || 'Erreur de traitement'
      }, { status: 500 })
    }

    // Gérer la fermeture automatique du chat (closeChat ou security failure)
    if (processResult.closeChat || !processResult.success) {
      session.completed = true
      session.userInfo.closedByAI = true
      
      // Détecter si la fermeture est due à un comportement inapproprié et déclencher un ban court
      const botMessageText = typeof processResult.botMessage === 'object' 
        ? processResult.botMessage.text || ''
        : processResult.botMessage || ''
      const isInappropriateBehavior = detectInappropriateBehaviorClosure(botMessageText)
      if (isInappropriateBehavior) {
        // Ban automatique court (2 heures) pour empêcher la reconnexion immédiate
        // Note: Le ban sera appliqué côté client via le flag closedByAI
        // Le banManager.createBan() sera appelé dans useChatLogic.ts
        
        log.info('Auto-ban triggered after AI closure for inappropriate behavior', { sessionId: sessionId || 'unknown' }, {
          botMessage: processResult.botMessage,
          banDuration: '2 hours',
          reason: 'AI detected inappropriate behavior and closed conversation'
        })
      }
      
      return NextResponse.json({
        success: true,
        completed: true,
        closedByAI: true,
        inappropriateBehavior: isInappropriateBehavior,
        message: processResult.botMessage,
        session: {
          id: session.id,
          completed: true,
          closedByAI: true,
          messages: session.messages
        }
      })
    }

    // Si le questionnaire est terminé, envoyer l'email avec qualification
    // 🔍 DEBUG: Log détaillé pour identifier le problème de déclenchement d'email
    log.email('Email trigger condition check', {
      sessionId: session.id
    }, {
      processResultCompleted: processResult.completed,
      sessionCompleted: session.completed,
      surveyFormCompleted: session.surveyFormCompleted,
      mode: session.mode,
      conversationGoals: session.conversationGoals,
      collectedInfo: session.collectedInfo,
      readyForSurvey: session.readyForSurvey,
      shouldTriggerEmail: processResult.completed
    })

    if (processResult.completed) {
      log.email('Initiating email notification process', {
        sessionId: session.id
      }, {
        processResultCompleted: processResult.completed,
        sessionCompleted: session.completed,
        mode: session.mode,
        surveyFormCompleted: session.surveyFormCompleted,
        emailSource: session.surveyFormCompleted ? 'survey_already_sent' : 'chat_completion'
      })
      
      // 🔍 Si le formulaire a déjà été soumis, ne pas renvoyer d'email
      const shouldSendEmail = !session.surveyFormCompleted
      log.email(shouldSendEmail ? 'Email will be sent from chat API' : 'Email already sent by survey API - skipping', {
        sessionId: session.id
      }, {
        shouldSendEmail,
        surveyFormCompleted: session.surveyFormCompleted
      })
      
      if (shouldSendEmail) {
      try {
        // Générer l'évaluation du prospect selon le mode
        let qualification
        let problematique = ''
        
        if (session.mode === 'conversation') {
          // Mode conversation - créer une qualification basée sur collectedInfo
          const urgency = session.collectedInfo?.urgency ? 'urgent' : 'non-urgent'
          const timeline = session.collectedInfo?.timeline || 'non-défini'
          const need = session.collectedInfo?.need || session.collectedInfo?.problematique || ''
          
          // Qualification complète pour le mode conversation
          qualification = {
            businessNeedScore: need.length > 20 ? 80 : 60,
            urgencyScore: urgency === 'urgent' ? 90 : 60,
            budgetIndicator: session.collectedInfo?.commitment === '15h+' ? 90 : 70,
            experienceScore: 60, // Score par défaut
            seriousnessScore: 75, // Score par défaut
            globalScore: 75,
            grade: 'B' as 'A+' | 'A' | 'B' | 'C' | 'D',
            priority: urgency === 'urgent' ? 'HIGH' : 'MEDIUM' as 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW',
            callbackDelay: urgency === 'urgent' ? 'Immédiat' : '24-48h',
            approach: 'Contact prioritaire - Mode conversation',
            details: {
              businessNeedAnalysis: `Besoin: ${need.length > 20 ? 'claire' : 'vague'}`,
              urgencyAnalysis: `Urgence: ${urgency}`,
              budgetAnalysis: `Timeline: ${timeline}`,
              experienceAnalysis: 'Non évalué en mode conversation',
              seriousnessAnalysis: 'Score par défaut en mode conversation',
              overallRecommendation: `Prospect en mode conversation - ${urgency}, timeline: ${timeline}`
            }
          }
          
          problematique = need
        } else {
          // Mode questionnaire traditionnel
          qualification = enhancedProspectQualificationService.evaluateProspect(session.responses)
          problematique = session.responses.slice(0, 2).map(r => r.answer).join(' ')
        }
        
        // Convertir les données de session pour l'email
        const emailSession = {
          id: session.id,
          messages: session.messages,
          userInfo: {
            nom: session.userInfo.nom || 'Non renseigné',
            telephone: session.userInfo.contactMethod === 'telephone' ? (session.userInfo.contact || 'Non renseigné') : 'Non renseigné',
            email: session.userInfo.contactMethod === 'email' ? (session.userInfo.contact || 'Non renseigné') : 'Non renseigné',
            problematique
          },
          stage: 'completed',
          aiMetadata: {
            warningsReceived: 0,
            closedByAI: false,
            seriousnessScore: (qualification.grade === 'A+' || qualification.grade === 'A') ? 'high' as const : 
                             qualification.grade === 'B' ? 'medium' as const : 'low' as const,
            lastWarningReason: 'Aucun avertissement'
          },
          qualification: qualification // Nouvelle section qualification
        }
        
        log.email('Attempting to send lead notification email', { sessionId: session.id })
        const emailResult = await sendLeadNotification({
          session: emailSession,
          completedAt: new Date()
        })
        
        if (emailResult.success) {
          log.email('Lead notification email sent successfully', { sessionId: session.id }, {
            messageId: emailResult.messageId,
            prospectName: session.userInfo.nom,
            timestamp: new Date().toISOString()
          })
        } else {
          log.error('Failed to send lead notification email', { sessionId: session.id }, {
            error: emailResult.error,
            prospectName: session.userInfo.nom,
            timestamp: new Date().toISOString()
          })
        }
        
        // Nettoyer les données personnelles masquées après envoi de l'email (conformité RGPD)
        ChatEngine.cleanupMemoryOnCompletion(session.id)
      } catch (error) {
        log.error('Exception while sending lead notification', { sessionId: session.id }, {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
      }
      } else {
        log.email('Email NOT sent - already handled by survey API', {
          sessionId: session.id
        }, {
          surveyFormCompleted: session.surveyFormCompleted,
          processResultCompleted: processResult.completed
        })
      }
      
      const completedResponse = {
        success: true,
        completed: true,
        message: processResult.botMessage,
        session: {
          id: session.id,
          completed: session.completed,
          messages: session.messages,
          userInfo: session.userInfo
        },
        // Ajouter information de warning si nécessaire
        ...(hasWarning && {
          warning: {
            level: 'medium',
            message: 'Votre message a été accepté mais contient des éléments qui ont attiré notre attention.',
            guidance: 'Pour de futurs messages, évitez les caractères spéciaux complexes.'
          }
        })
      }
      
      return NextResponse.json(completedResponse, {
        headers: chatRateLimit.headers
      })
    } else {
      // 🔍 DEBUG: Log quand l'email ne se déclenche pas
      log.email('Email NOT triggered - analyzing why', {
        sessionId: session.id
      }, {
        processResultCompleted: processResult.completed,
        sessionCompleted: session.completed,
        surveyFormCompleted: session.surveyFormCompleted,
        surveyFormTriggered: session.surveyFormTriggered,
        mode: session.mode,
        botMessageShowsSurvey: processResult.botMessage?.showSurveyForm,
        sessionMode: session.mode || 'questionnaire',
        reasonNotCompleted: !processResult.completed ? 'processResult.completed is false' : 
                          session.surveyFormCompleted ? 'survey completed - email handled elsewhere' : 'unknown'
      })
    }

    // Retourner la réponse normale
    const response = {
      success: true,
      message: processResult.botMessage,
      session: {
        id: session.id,
        currentStep: session.currentStep,
        completed: session.completed,
        messages: session.messages
      },
      // Ajouter information de warning si nécessaire
      ...(hasWarning && {
        warning: {
          level: 'medium',
          message: 'Votre message a été accepté mais contient des éléments qui ont attiré notre attention.',
          guidance: 'Pour de futurs messages, évitez les caractères spéciaux complexes.'
        }
      })
    }
    
    return NextResponse.json(response, {
      headers: chatRateLimit.headers
    })

  } catch (error) {
    log.error('Chat API Error', {}, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting pour GET (moins restrictif)
  const getRateLimit = await RateLimitMiddleware.checkRequest(request, {
    windowMs: 1 * 60 * 1000,    // 1 minute
    maxRequests: 30,             // 30 requêtes GET max par minute
    blockDurationMs: 2 * 60 * 1000 // Blocage 2 minutes
  })
  
  if (!getRateLimit.allowed) {
    console.warn('🚨 GET rate limit exceeded:', {
      result: getRateLimit.result,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })
    
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
  const sessionId = searchParams.get('sessionId')
  const action = searchParams.get('action')

  // Debug session endpoint - pour diagnostic des problèmes de synchronisation
  if (action === 'debug-session' && sessionId) {
    const sessionsStore = getSessionsStore()
    const session = sessionsStore.get(sessionId)
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session introuvable',
        sessionId,
        totalSessions: sessionsStore.size
      }, {
        status: 404,
        headers: getRateLimit.headers
      })
    }

    return NextResponse.json({
      success: true,
      debug: {
        sessionId: session.id,
        completed: session.completed,
        surveyFormCompleted: session.surveyFormCompleted,
        surveyFormTriggered: session.surveyFormTriggered,
        messagesCount: session.messages.length,
        lastMessage: session.messages[session.messages.length - 1],
        userInfo: session.userInfo,
        collectedInfo: session.collectedInfo,
        mode: session.mode,
        currentStep: session.currentStep
      }
    }, {
      headers: getRateLimit.headers
    })
  }

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID requis' },
      { 
        status: 400,
        headers: getRateLimit.headers
      }
    )
  }

  // Validation sécurisée du sessionId
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10 || sessionId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
    return NextResponse.json(
      { error: 'Session ID invalide' },
      { 
        status: 400,
        headers: getRateLimit.headers
      }
    )
  }

  const session = getOrCreateSession(sessionId)
  
  // If session is completed, return completion status
  if (session.completed) {
    return NextResponse.json({
      success: true,
      completed: true,
      session: {
        id: session.id,
        completed: session.completed,
        messages: session.messages
      }
    }, {
      headers: getRateLimit.headers
    })
  }
  
  // If no messages yet, add welcome message
  if (session.messages.length === 0) {
    const welcomeMessage = generateWelcomeMessage()
    session.messages.push(welcomeMessage)
  }

  return NextResponse.json({
    success: true,
    session: {
      id: session.id,
      currentStep: session.currentStep,
      completed: session.completed,
      messages: session.messages
    }
  }, {
    headers: getRateLimit.headers
  })
}