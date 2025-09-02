import { useState, useEffect, useRef, useCallback } from 'react'
import { ChatMessage, QuestionnaireSession, ChatApiResponse } from '@/lib/chatbot/chat'
import { ClientBanManager } from '@/lib/chatbot/security'
import { SurveyData } from '@/lib/chatbot/business'
import { log } from '@/lib/logger'

interface BanState {
  isBanned: boolean
  timeRemaining: string
  reason?: string
  severity?: 'warning' | 'moderate' | 'severe'
}

interface ChatState {
  isOpen: boolean
  message: string
  messages: ChatMessage[]
  isLoading: boolean
  session: Partial<QuestionnaireSession> | null
  isCompleted: boolean
  closedByAI: boolean
  quickReplies: string[]
  banState: BanState
  showSurveyForm: boolean
  surveyContext: string
  surveySubmitting: boolean
  showConsentRequest: boolean
  consentContext: string
  consentProcessing: boolean
}

interface ChatActions {
  toggleChat: () => void
  sendMessage: (messageText: string, isQuickReply?: boolean) => Promise<void>
  handleSurveySubmit: (surveyData: SurveyData) => Promise<void>
  handleSurveyCancel: () => void
  handleConsentAccept: () => Promise<void>
  handleConsentDecline: () => Promise<void>
  handleConsentCancel: () => void
  setMessage: (message: string) => void
  checkBanStatus: () => void
}

export function useChatLogic(sessionId: string): ChatState & ChatActions {
  // États
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<Partial<QuestionnaireSession> | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [closedByAI, setClosedByAI] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [banState, setBanState] = useState<BanState>({
    isBanned: false,
    timeRemaining: ''
  })
  const [showSurveyForm, setShowSurveyForm] = useState(false)
  const [surveyContext, setSurveyContext] = useState('')
  const [surveySubmitting, setSurveySubmitting] = useState(false)
  const [showConsentRequest, setShowConsentRequest] = useState(false)
  const [consentContext, setConsentContext] = useState('')
  const [consentProcessing, setConsentProcessing] = useState(false)

  // Simplified client configuration
  const MAX_CLIENT_MESSAGES = 50 // Reduced for better performance
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const quickReplyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Simplified memory optimization
  const optimizeClientMemory = useCallback((newMessages: ChatMessage[]) => {
    if (newMessages.length > MAX_CLIENT_MESSAGES) {
      const welcomeMessage = newMessages.find(msg => msg.id.startsWith('welcome-'))
      const recentMessages = newMessages.slice(-(MAX_CLIENT_MESSAGES - 1))
      
      return welcomeMessage 
        ? [welcomeMessage, ...recentMessages.filter(msg => !msg.id.startsWith('welcome-'))]
        : recentMessages
    }
    return newMessages
  }, [])

  // Simplified context management
  const saveContextToStorage = useCallback((msgs: ChatMessage[]) => {
    try {
      const contextData = {
        sessionId,
        timestamp: Date.now(),
        messageCount: msgs.length,
        isCompleted
      }
      localStorage.setItem(`chat-${sessionId}`, JSON.stringify(contextData))
    } catch (error) {
      console.warn('Storage save failed:', error)
    }
  }, [sessionId, isCompleted])

  // Simplified chat initialization
  const initializeChat = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`)
      if (response.ok) {
        const data: ChatApiResponse = await response.json()
        if (data.success) {
          if (data.completed) {
            setIsCompleted(true)
            if (data.closedByAI) setClosedByAI(true)
          }
          if (data.session?.messages) {
            const optimizedMessages = optimizeClientMemory(data.session.messages)
            setMessages(optimizedMessages)
            setSession(data.session)
            saveContextToStorage(optimizedMessages)
          }
        }
      }
    } catch (error) {
      console.error('Chat init error:', error)
    }
  }, [sessionId, optimizeClientMemory, saveContextToStorage])

  // Vérifier le statut de bannissement
  const checkBanStatus = useCallback(() => {
    const isBanned = ClientBanManager.isBanned()
    const timeRemaining = ClientBanManager.formatRemainingTime()
    const banInfo = ClientBanManager.getBanInfo()
    
    // Determine severity based on ban reason and duration
    let severity: 'warning' | 'moderate' | 'severe' = 'moderate'
    if (banInfo) {
      const remainingMs = ClientBanManager.getRemainingBanTime()
      if (remainingMs < 4 * 60 * 60 * 1000) { // Less than 4 hours
        severity = 'warning'
      } else if (remainingMs > 12 * 60 * 60 * 1000) { // More than 12 hours
        severity = 'severe'
      }
    }
    
    const newBanState: BanState = {
      isBanned,
      timeRemaining,
      severity
    }

    if (banInfo?.reason) {
      newBanState.reason = banInfo.reason
    }

    setBanState(newBanState)
  }, [])

  // Afficher notification de ban
  const showBanNotification = useCallback(() => {
    const banInfo = ClientBanManager.getBanInfo()
    const timeRemaining = ClientBanManager.formatRemainingTime()
    const message = `Chat temporairement bloqué.\\nRaison: ${banInfo?.reason || 'Comportement inapproprié'}\\nTemps restant: ${timeRemaining}`
    alert(message)
  }, [])

  // Simplified message sending
  const sendMessage = useCallback(async (messageText: string, isQuickReply: boolean = false) => {
    if (!messageText.trim() || isLoading || banState.isBanned) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      text: messageText.trim(),
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => {
      const newMessages = optimizeClientMemory([...prev, userMessage])
      saveContextToStorage(newMessages)
      return newMessages
    })
    
    if (!isQuickReply) setMessage('')
    setIsLoading(true)
    setQuickReplies([])
    
    if (quickReplyTimeoutRef.current) {
      clearTimeout(quickReplyTimeoutRef.current)
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          sessionId
        })
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data: ChatApiResponse = await response.json()
      
      if (data.success) {
        if (data.completed) {
          setIsCompleted(true)
          setIsLoading(false)
          if (data.closedByAI) {
            setClosedByAI(true)
            
            // Appliquer le ban approprié selon le type de fermeture
            if (data.inappropriateBehavior) {
              // Ban court (2h) pour comportement inapproprié détecté par l'IA
              ClientBanManager.createBan(sessionId, 'Comportement inapproprié détecté par l\'IA', 2 * 60 * 60 * 1000)
            } else {
              // Ban standard (24h) pour autres fermetures par l'IA
              ClientBanManager.createBan(sessionId, 'Conversation fermée par l\'IA')
            }
            
            setBanState(ClientBanManager.getBanState())
          }
        } else if (data.message) {
          // Simplified typing delay
          const delay = Math.min(data.message.text.length * 30, 2000)
          
          typingTimeoutRef.current = setTimeout(() => {
            setMessages(prev => {
              const newMessages = optimizeClientMemory([...prev, data.message!])
              saveContextToStorage(newMessages)
              return newMessages
            })
            setIsLoading(false)
            
            // Handle consent request
            if (data.message!.showConsentRequest && !showConsentRequest) {
              setShowConsentRequest(true)
              setConsentContext(data.message!.consentContext || 'Consentement pour coordonnées')
            }
            
            // Handle survey form
            if (data.message!.showSurveyForm && !showSurveyForm) {
              setShowSurveyForm(true)
              setSurveyContext(data.message!.surveyContext || 'Coordonnées')
            }
            
            // Handle quick replies
            if (data.message!.quickReplies?.length) {
              setQuickReplies(data.message!.quickReplies)
              quickReplyTimeoutRef.current = setTimeout(() => setQuickReplies([]), 30000)
            }
            
            typingTimeoutRef.current = null
          }, delay)
        }
        
        if (data.session) setSession(data.session)
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Send message error:', error)
      
      // Check if user got banned during this request
      const currentBanState = ClientBanManager.getBanState()
      if (currentBanState.isBanned) {
        const newBanState: BanState = {
          ...currentBanState,
          severity: 'moderate'
        }

        const banReason = ClientBanManager.getBanInfo()?.reason
        if (banReason) {
          newBanState.reason = banReason
        }

        setBanState(newBanState)
        setIsLoading(false)
        return // Don't show error message, let ban UI take over
      }
      
      // Show appropriate error message for non-ban errors
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        text: "Erreur de connexion. Veuillez réessayer dans quelques instants.",
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => {
        const newMessages = optimizeClientMemory([...prev, errorMessage])
        saveContextToStorage(newMessages)
        return newMessages
      })
      setIsLoading(false)
    }
  }, [isLoading, banState.isBanned, sessionId, showSurveyForm, showConsentRequest, optimizeClientMemory, saveContextToStorage])

  // Toggle chat
  const toggleChat = useCallback(() => {
    if (!isOpen && banState.isBanned) {
      showBanNotification()
      return
    }
    setIsOpen(!isOpen)
  }, [isOpen, banState.isBanned, showBanNotification])

  // Simplified survey handling
  const handleSurveySubmit = useCallback(async (surveyData: SurveyData) => {
    if (surveySubmitting) return
    
    try {
      setSurveySubmitting(true)
      
      log.survey('📧 SURVEY: Starting form submission', { sessionId }, {
        surveyData: {
          nom: surveyData.nom,
          contactMethod: surveyData.contactMethod,
          urgency: surveyData.urgency,
          timeline: surveyData.timeline,
          commitment: surveyData.commitment
        },
        step: 'submission_start'
      })

      // 🚀 FORCE EMAIL SEND - Appel direct à l'API chat pour garantir l'envoi d'email
      log.info('🚀 FORCE EMAIL: Forcing email send via chat API', { sessionId })
      try {
        const forceEmailResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId, 
            message: '[FORCE_EMAIL_SEND]',
            surveyData: surveyData // Pass survey data to construct email
          })
        })
        
        log.info('🚀 FORCE EMAIL: Response received', { 
          sessionId, 
          metadata: { status: forceEmailResponse.status, ok: forceEmailResponse.ok }
        })
        
        if (forceEmailResponse.ok) {
          log.info('🚀 FORCE EMAIL: Email send forced successfully', { sessionId })
        } else {
          log.error('🚀 FORCE EMAIL: Failed to force email send', { sessionId })
        }
      } catch (emailError) {
        log.error('🚀 FORCE EMAIL: Exception during forced send', { 
          sessionId, 
          error: emailError instanceof Error ? emailError.message : 'Unknown error' 
        })
      }
      
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, surveyData })
      })

      log.survey('📧 SURVEY: API response received', { 
        sessionId,
        metadata: { 
          step: 'api_response',
          responseOk: response.ok,
          responseStatus: response.status
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Erreur survey API:', { 
          status: response.status, 
          errorData,
          sessionId,
          surveyData 
        })
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Erreur inconnue'}`)
      }

      const result = await response.json()
      log.survey('📧 SURVEY: Processing API result', { 
        sessionId, 
        metadata: { 
          step: 'processing_result',
          resultSuccess: result.success,
          leadSubmitted: result.leadSubmitted,
          hasMessage: !!result.message
        }
      })
      
      if (result.success) {
        log.survey('📧 SURVEY: Success - updating UI state', { 
          sessionId, 
          metadata: {
            step: 'ui_update_start',
            leadSubmitted: result.leadSubmitted,
            message: result.message
          }
        })
        
        setShowSurveyForm(false)
        setIsCompleted(true)
        
        const confirmationMessage: ChatMessage = {
          id: `msg-${Date.now()}-confirmation`,
          text: "✅ Parfait ! Vos informations ont été transmises à Léo. Il vous recontactera dans les plus brefs délais. 📧",
          isBot: true,
          timestamp: new Date()
        }
        
        log.survey('📧 SURVEY: Adding confirmation message to chat', { 
          sessionId, 
          metadata: {
            step: 'adding_confirmation',
            confirmationText: confirmationMessage.text,
            messageId: confirmationMessage.id
          }
        })
        
        setMessages(prev => {
          const newMessages = optimizeClientMemory([...prev, confirmationMessage])
          saveContextToStorage(newMessages)
          log.survey('📧 SURVEY: Messages updated successfully', { 
            sessionId, 
            metadata: {
              step: 'messages_updated',
              totalMessages: newMessages.length,
              lastMessageId: confirmationMessage.id
            }
          })
          return newMessages
        })
        
        // ✅ Email est géré par /api/survey - pas de synchronisation nécessaire
        log.survey('📧 SURVEY: Form submission complete - email handled by survey API', { sessionId }, {
          step: 'survey_complete',
          leadSubmitted: result.leadSubmitted
        })
        
        // 🔍 DEBUG: Tester l'état de session après soumission pour diagnostic
        setTimeout(async () => {
          try {
            const debugResponse = await fetch(`/api/chat?action=debug-session&sessionId=${sessionId}`)
            if (debugResponse.ok) {
              const debugData = await debugResponse.json()
              log.survey('📧 DEBUG: Session state after survey submission', { sessionId }, {
                step: 'post_survey_debug',
                sessionExists: debugData.sessionExists,
                surveyFormCompleted: debugData.sessionState?.surveyFormCompleted,
                completed: debugData.sessionState?.completed,
                totalSessions: debugData.totalSessions
              })
            }
          } catch (debugError) {
            log.survey('📧 DEBUG: Failed to check session state', { sessionId }, {
              step: 'debug_error',
              error: debugError instanceof Error ? debugError.message : String(debugError)
            })
          }
        }, 1000) // Attendre 1 seconde pour que la session soit mise à jour
        
      } else {
        log.survey('📧 SURVEY: API returned failure', { sessionId }, {
          step: 'api_failure',
          error: result.error,
          success: result.success
        })
        throw new Error(result.error || 'Submission error')
      }
      
    } catch (error) {
      console.error('❌ Survey error:', error)
      log.survey('📧 SURVEY: Error during submission', { sessionId }, {
        step: 'error_handling',
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      })
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        text: "Erreur lors de l'envoi. Réessayez ?",
        isBot: true,
        timestamp: new Date()
      }
      
      log.survey('📧 SURVEY: Adding error message to chat', { sessionId }, {
        step: 'adding_error_message',
        errorText: errorMessage.text,
        messageId: errorMessage.id
      })
      
      setMessages(prev => {
        const newMessages = optimizeClientMemory([...prev, errorMessage])
        saveContextToStorage(newMessages)
        return newMessages
      })
      
    } finally {
      log.survey('📧 SURVEY: Submission complete', { sessionId }, {
        step: 'submission_complete',
        wasSubmitting: surveySubmitting
      })
      setSurveySubmitting(false)
    }
  }, [surveySubmitting, sessionId, optimizeClientMemory, saveContextToStorage])

  // Simplified survey cancel
  const handleSurveyCancel = useCallback(() => {
    setShowSurveyForm(false)
    
    const cancelMessage: ChatMessage = {
      id: `msg-${Date.now()}-cancel`,
      text: "D'accord, continuons notre conversation.",
      isBot: true,
      timestamp: new Date()
    }
    setMessages(prev => {
      const newMessages = optimizeClientMemory([...prev, cancelMessage])
      saveContextToStorage(newMessages)
      return newMessages
    })
  }, [optimizeClientMemory, saveContextToStorage])

  // Simplified consent handling
  const handleConsentAccept = useCallback(async () => {
    if (consentProcessing) return
    
    try {
      setConsentProcessing(true)
      setShowConsentRequest(false)
      
      // Envoyer un message pour déclencher le survey
      await sendMessage("Oui, je souhaite être recontacté(e) par Léo", true)
      
    } catch (error) {
      console.error('Consent accept error:', error)
    } finally {
      setConsentProcessing(false)
    }
  }, [consentProcessing, sendMessage])

  const handleConsentDecline = useCallback(async () => {
    if (consentProcessing) return
    
    try {
      setConsentProcessing(true)
      setShowConsentRequest(false)
      
      // Envoyer un message pour continuer la conversation
      await sendMessage("Non merci, continuons la conversation", true)
      
    } catch (error) {
      console.error('Consent decline error:', error)
    } finally {
      setConsentProcessing(false)
    }
  }, [consentProcessing, sendMessage])

  const handleConsentCancel = useCallback(() => {
    setShowConsentRequest(false)
    
    const cancelMessage: ChatMessage = {
      id: `msg-${Date.now()}-consent-cancel`,
      text: "Vous pouvez me dire si vous souhaitez être recontacté(e) plus tard.",
      isBot: true,
      timestamp: new Date()
    }
    setMessages(prev => {
      const newMessages = optimizeClientMemory([...prev, cancelMessage])
      saveContextToStorage(newMessages)
      return newMessages
    })
  }, [optimizeClientMemory, saveContextToStorage])

  // Effects
  useEffect(() => {
    checkBanStatus()
    const interval = setInterval(checkBanStatus, 60000)
    return () => clearInterval(interval)
  }, [checkBanStatus])

  useEffect(() => {
    if (isOpen && messages.length === 0 && !isCompleted && !banState.isBanned) {
      initializeChat()
    }
  }, [isOpen, initializeChat, messages.length, isCompleted, banState.isBanned])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (quickReplyTimeoutRef.current) {
        clearTimeout(quickReplyTimeoutRef.current)
      }
    }
  }, [])

  return {
    // État
    isOpen,
    message,
    messages,
    isLoading,
    session,
    isCompleted,
    closedByAI,
    quickReplies,
    banState,
    showSurveyForm,
    surveyContext,
    surveySubmitting,
    showConsentRequest,
    consentContext,
    consentProcessing,
    
    // Actions
    toggleChat,
    sendMessage,
    handleSurveySubmit,
    handleSurveyCancel,
    handleConsentAccept,
    handleConsentDecline,
    handleConsentCancel,
    setMessage,
    checkBanStatus
  }
}