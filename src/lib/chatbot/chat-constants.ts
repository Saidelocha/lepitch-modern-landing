/**
 * Chat Engine Constants - Centralized configuration values
 * Eliminates magic numbers and provides type-safe constants
 */

// AI Configuration Constants - Optimized for Google's 2M context
export const AI_CONFIG_DEFAULTS = {
  MAX_TOKENS: 3000,  // Increased from 1500 for better response quality
  TEMPERATURE: 0.7,
  MODEL: 'deepseek/deepseek-chat',
  BASE_URL: 'https://openrouter.ai/api/v1/chat/completions',
  // Context management for large conversations
  MAX_CONTEXT_TOKENS: 150000,  // Safe limit within 2M context window
  CONTEXT_TRUNCATION_THRESHOLD: 120000  // When to start truncating old messages
} as const

// Warning System Constants
export const WARNING_SYSTEM = {
  FIRST_WARNING: 1,
  SECOND_WARNING: 2,
  THIRD_WARNING: 3,
  DEFAULT_WARNING_COUNT: 1
} as const

// Warning Messages - Centralized and optimized
export const WARNING_MESSAGES = {
  [WARNING_SYSTEM.FIRST_WARNING]: "Recentrons-nous sur votre projet de coaching. Comment puis-je vous aider avec vos besoins en prise de parole ?",
  [WARNING_SYSTEM.SECOND_WARNING]: "Je suis là pour vous aider avec la prise de parole uniquement. Parlons de votre projet de coaching.",
  [WARNING_SYSTEM.THIRD_WARNING]: "Dernière tentative - parlons de coaching ou je dois fermer cette conversation.",
  default: "Restons concentrés sur votre projet de coaching en prise de parole."
} as const

// System Prompt Configuration
export const SYSTEM_PROMPT_CONFIG = {
  REQUIRED_INFO_COUNT: 6,
  TRIGGER_KEYWORD: '[TRIGGER_FORM_NOW]',
  REQUEST_CONSENT_KEYWORD: '[REQUEST_CONSENT]'
} as const

// System Prompt Templates - Optimized for reuse
export const SYSTEM_PROMPT_TEMPLATES = {
  REQUEST_CONSENT: 'DEMANDE CONSENTEMENT: Tu as les 6 informations ! Demande maintenant la permission de recueillir ses coordonnées.',
  TRIGGER_FORM: 'DÉCLENCHEMENT FORMULAIRE: Le prospect a accepté ! Déclenche maintenant le formulaire de coordonnées.',
  CONTINUE_QUALIFICATION: 'CONTINUE QUALIFICATION: Il te manque des informations parmi les 6 obligatoires.'
} as const

// API Response Parsing Constants
export const API_RESPONSE = {
  CHOICES_INDEX: 0,
  MESSAGE_CONTENT_PATH: 'choices.0.message.content'
} as const

// Process Steps - Documentation for flow clarity
export const PROCESS_STEPS = {
  SECURITY_CHECK: 1,
  EXTRACT_BUSINESS_INFO: 2,
  GENERATE_AI_RESPONSE: 3,
  CHECK_SURVEY_TRIGGER: 4,
  CLEAN_RESPONSE: 5,
  GENERATE_QUALIFICATION: 6,
  HANDLE_SECURITY_WARNING: 7,
  RETURN_RESULT: 8
} as const

// Survey Processing Steps
export const SURVEY_PROCESS_STEPS = {
  VALIDATE_AND_SAVE: 1,
  GENERATE_QUALIFICATION: 2
} as const

// HTTP Headers for AI API
export const AI_API_HEADERS = {
  CONTENT_TYPE: 'application/json',
  HTTP_REFERER_HEADER: 'HTTP-Referer',
  X_TITLE_HEADER: 'X-Title',
  AUTHORIZATION_HEADER: 'Authorization',
  DEFAULT_SITE_URL: 'https://lepitchquilvousfaut.fr',
  X_TITLE_VALUE: 'Le Pitch Qu\'il Vous Faut - Assistant IA'
} as const

// Chat Decision Default Messages
export const DEFAULT_MESSAGES = {
  SECURITY_BLOCKED: "Je ne peux pas continuer cette conversation. Veuillez adopter un ton respectueux.",
  TECHNICAL_ERROR: "Je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?",
  FALLBACK_TRIGGER_SURVEY: "Parfait ! J'ai bien compris votre besoin. Pour que Léo puisse vous recontacter et vous proposer un accompagnement personnalisé, puis-je recueillir vos coordonnées ?",
  FALLBACK_CONTINUE: "Merci pour votre message. Pouvez-vous me décrire plus précisément votre situation et le type d'accompagnement que vous recherchez ?"
} as const

// Error Handling Constants
export const ERROR_HANDLING = {
  API_ERROR_PREFIX: 'API error: ',
  UNKNOWN_ERROR: 'Unknown error',
  PROSPECT_QUALIFICATION_FAILED: 'Prospect qualification failed',
  SURVEY_PROCESSING_FAILED: 'Erreur lors du traitement du formulaire'
} as const

// Type-safe constants for magic numbers elimination
export type WarningLevel = typeof WARNING_SYSTEM[keyof typeof WARNING_SYSTEM]
export type ProcessStep = typeof PROCESS_STEPS[keyof typeof PROCESS_STEPS]
export type SurveyStep = typeof SURVEY_PROCESS_STEPS[keyof typeof SURVEY_PROCESS_STEPS]