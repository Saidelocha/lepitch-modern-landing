export interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  quickReplies?: string[]
  showSurveyForm?: boolean // Nouveau champ pour déclencher l'affichage du formulaire
  surveyContext?: string // Contexte pour le formulaire
  showConsentRequest?: boolean // Nouveau champ pour demander le consentement
  consentContext?: string // Contexte pour la demande de consentement
}

// Legacy types - kept for backward compatibility during migration
export interface QuestionnaireStep {
  id: number
  question: string
  type: 'text' | 'binary' | 'multiple'
  options?: string[]
}

export interface QuestionnaireResponse {
  stepId: number
  answer: string
  timestamp: Date
}

// New conversation model types
export interface ConversationGoals {
  understand_need: boolean
  assess_urgency: boolean
  get_timeline: boolean
  understand_commitment: boolean
  collect_identity: boolean
  get_contact: boolean
}

export interface CollectedInfo {
  need?: string              // BESOIN précis (quel type de prise de parole ?)
  context?: string           // CONTEXTE (pourquoi maintenant, situation actuelle ?)
  timeline?: string          // DEADLINE (échéance du projet ?)
  availability?: string      // DISPONIBILITÉ (combien de temps peut investir ?)
  rhythm?: string           // RYTHME (préférence intensif vs étalé ?)
  experience?: string       // EXPÉRIENCE (niveau actuel en prise de parole ?)
  
  // Champs legacy - maintenus pour compatibilité
  urgency?: boolean
  previousCoaching?: boolean
  commitment?: string
  name?: string
  contactPreference?: 'email' | 'telephone'
  contactInfo?: string
  problematique?: string // Description complète du besoin
}

export interface ConversationMemory {
  botMessages: string[]
  mentionedConcepts: Set<string>
  lastBotResponse?: string
  conversationTone?: 'professional' | 'empathetic' | 'urgent'
  // Nouveau: suivi des informations utilisateur pour éviter les questions répétitives
  userProvidedInfo: Map<string, {
    value: string
    timestamp: Date
    source: string // message original où l'info a été mentionnée
  }>
  // Nouveau: contexte émotionnel détecté
  emotionalContext?: {
    frustratedWithRepeatedQuestions?: boolean
    showsAnxiety?: boolean
    expressesUrgency?: boolean
    lastFrustrationMessage?: string
  }
}

// Types pour la gestion mémoire côté client
export interface ClientMemoryConfig {
  maxMessages: number
  maxStorageAge: number // en millisecondes
  enableLocalStorage: boolean
}

export interface ChatContextData {
  sessionId: string
  timestamp: number
  messageCount: number
  lastMessageId: string
  isCompleted: boolean
}

// Enhanced session type supporting both old and new models
export interface QuestionnaireSession {
  id: string
  currentStep?: number // Optional for new model
  responses: QuestionnaireResponse[] // Legacy responses
  messages: ChatMessage[]
  conversationMemory: ConversationMemory
  
  // Configuration mémoire pour cette session
  memoryConfig?: {
    maxMessages: number
    lastCleanup: Date
    messagesBeforeCleanup: number
  }
  
  // New fields for conversation model
  conversationGoals?: ConversationGoals
  collectedInfo?: CollectedInfo
  mode?: 'questionnaire' | 'conversation' // Default to 'questionnaire' for backward compatibility
  
  // Survey form state
  surveyFormTriggered?: boolean // L'IA a-t-elle déclenché le formulaire ?
  surveyFormCompleted?: boolean // Le formulaire a-t-il été complété ?
  readyForSurvey?: boolean // L'IA considère-t-elle que c'est le moment pour le formulaire ?
  consentRequested?: boolean // L'IA a-t-elle demandé le consentement ?
  consentGiven?: boolean // Le prospect a-t-il donné son accord ?
  
  userInfo: {
    nom?: string
    contactMethod?: 'email' | 'telephone'
    contact?: string
    closedByAI?: boolean
    startTime?: Date
    aiMetadata?: {
      warningsReceived: number
      closedByAI: boolean
      seriousnessScore: 'high' | 'medium' | 'low'
      lastWarningReason?: string
    }
    [key: string]: unknown
  }
  completed: boolean
}

export interface ChatApiResponse {
  success: boolean
  message?: ChatMessage
  session?: Partial<QuestionnaireSession>
  completed?: boolean
  closedByAI?: boolean
  inappropriateBehavior?: boolean
  error?: string
  guidance?: string
  riskLevel?: 'low' | 'medium' | 'high'
  warning?: {
    level: 'medium'
    message: string
    guidance: string
  }
  // Survey form related responses
  surveyFormTriggered?: boolean
  surveyFormSubmitted?: boolean
  surveyError?: string
}

// Types pour l'API du formulaire
export interface SurveySubmissionRequest {
  sessionId: string
  surveyData: {
    nom: string
    contactMethod: 'email' | 'telephone'
    contact: string
    urgency: 'urgent' | 'non-urgent'
    timeline: 'immédiat' | 'semaine' | 'mois' | 'flexible'
    commitment: '3h' | '6h' | '15h' | '+de 15h'
  }
}

export interface SurveySubmissionResponse {
  success: boolean
  message?: string
  error?: string
  leadSubmitted?: boolean // L'email a-t-il été envoyé à Léo ?
}