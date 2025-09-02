/**
 * Environment Variable Security Validator
 * 
 * 🔒 SÉCURITÉ: Validation et protection des variables d'environnement
 * - Validation des clés requises
 * - Détection des valeurs par défaut dangereuses
 * - Masquage sécurisé pour les logs
 * - Validation des formats (API keys, URLs, etc.)
 */

import { log } from '@/lib/logger'

// Types pour la validation
interface EnvRule {
  required: boolean
  pattern?: RegExp
  minLength?: number
  maxLength?: number
  validValues?: string[]
  sensitive?: boolean
  description?: string
}

interface EnvValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  securityIssues: string[]
}

// Règles de validation pour chaque variable d'environnement
const ENV_VALIDATION_RULES: Record<string, EnvRule> = {
  // Variables de sécurité critiques
  CHAT_MASTER_SECRET: {
    required: true, // En production
    minLength: 32,
    maxLength: 128,
    sensitive: true,
    description: 'Clé maîtresse de sécurité (minimum 32 caractères) - génère toutes les clés opérationnelles'
  },

  // API Keys sensibles
  OPENROUTER_API_KEY: {
    required: true,
    pattern: /^sk-or-v1-[a-zA-Z0-9]{64}$/,
    minLength: 70,
    sensitive: true,
    description: 'Clé API OpenRouter (format: sk-or-v1-...)'
  },

  RESEND_API_KEY: {
    required: false, // Optionnel
    pattern: /^re_[a-zA-Z0-9_]{20,}$/,
    minLength: 23,
    sensitive: true,
    description: 'Clé API Resend (format: re_...)'
  },

  // Configuration email
  LEAD_NOTIFICATION_EMAIL: {
    required: false, // Optionnel si RESEND_API_KEY présent
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    maxLength: 254,
    sensitive: false,
    description: 'Email de notification pour les leads'
  },

  // Configuration système
  NODE_ENV: {
    required: true,
    validValues: ['development', 'production', 'test'],
    sensitive: false,
    description: 'Environnement d\'exécution'
  },

  LOG_LEVEL: {
    required: false,
    validValues: ['error', 'warn', 'info', 'debug'],
    sensitive: false,
    description: 'Niveau de logging'
  },

  // Configuration chat
  NEXT_PUBLIC_CHAT_ENABLED: {
    required: false,
    validValues: ['true', 'false'],
    sensitive: false,
    description: 'Activation du chat côté client'
  },

  OPENROUTER_MODEL: {
    required: false,
    pattern: /^[a-zA-Z0-9_/.-]+$/,
    maxLength: 100,
    sensitive: false,
    description: 'Modèle OpenRouter à utiliser'
  },

  SITE_URL: {
    required: false,
    pattern: /^https?:\/\/[a-zA-Z0-9.-]+/,
    maxLength: 255,
    sensitive: false,
    description: 'URL du site pour les headers API'
  }
}

class EnvironmentValidator {
  private static instance: EnvironmentValidator | null = null
  private validationCache: Map<string, { isValid: boolean; errors: string[]; timestamp: number }> = new Map()
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator()
    }
    return EnvironmentValidator.instance
  }

  /**
   * Valide toutes les variables d'environnement critiques
   */
  validateAll(): EnvValidationResult {
    const result: EnvValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      securityIssues: []
    }

    log.info('🔍 Validation des variables d\'environnement...')

    for (const [envKey, rule] of Object.entries(ENV_VALIDATION_RULES)) {
      const envValue = process.env[envKey]
      const validation = this.validateVariable(envKey, envValue, rule)

      if (!validation.isValid) {
        result.isValid = false
        result.errors.push(...validation.errors)
      }
      
      result.warnings.push(...validation.warnings)
      result.securityIssues.push(...validation.securityIssues)
    }

    // Validation spéciale pour les dépendances
    this.validateDependencies(result)

    // Log des résultats
    this.logValidationResults(result)

    return result
  }

  /**
   * Valide une variable d'environnement spécifique
   */
  private validateVariable(key: string, value: string | undefined, rule: EnvRule) {
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      securityIssues: [] as string[]
    }

    // Vérifier si la variable est requise
    const isRequiredInThisEnv = rule.required && this.isProduction
    const isEncryptionKeyRequired = this.isProduction && key === 'CHAT_ENCRYPTION_KEY'
    
    if (isRequiredInThisEnv || isEncryptionKeyRequired) {
      if (!value || value.trim() === '') {
        result.isValid = false
        result.errors.push(`❌ Variable requise manquante en production: ${key}`)
        return result
      }
    }
    
    // En développement, générer des warnings au lieu d'erreurs pour les variables manquantes
    if (!this.isProduction && rule.required && (!value || value.trim() === '')) {
      result.warnings.push(`⚠️  Variable recommandée manquante en développement: ${key}`)
      return result
    }

    // Si pas de valeur et pas requise, ok
    if (!value) {
      return result
    }

    // Validation du pattern - relaxée en développement
    if (rule.pattern && !rule.pattern.test(value)) {
      if (this.isProduction) {
        result.isValid = false
        result.errors.push(`❌ Format invalide pour ${key}: ${rule.description || 'Format incorrect'}`)
      } else {
        result.warnings.push(`⚠️  Format non-standard pour ${key} en développement: ${rule.description || 'Format incorrect'}`)
      }
    }

    // Validation de la longueur - relaxée en développement  
    if (rule.minLength && value.length < rule.minLength) {
      if (this.isProduction) {
        result.isValid = false
        result.errors.push(`❌ ${key} trop courte: ${value.length} caractères (minimum: ${rule.minLength})`)
      } else {
        result.warnings.push(`⚠️  ${key} courte en développement: ${value.length} caractères (recommandé: ${rule.minLength})`)
      }
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      result.isValid = false
      result.errors.push(`❌ ${key} trop longue: ${value.length} caractères (maximum: ${rule.maxLength})`)
    }

    // Validation des valeurs autorisées
    if (rule.validValues && !rule.validValues.includes(value)) {
      result.isValid = false
      result.errors.push(`❌ Valeur invalide pour ${key}: '${value}' (valeurs autorisées: ${rule.validValues.join(', ')})`)
    }

    // Détection de valeurs par défaut dangereuses
    this.checkForDangerousDefaults(key, value, result)

    return result
  }

  /**
   * Détecte les valeurs par défaut dangereuses
   */
  private checkForDangerousDefaults(key: string, value: string, result: { isValid: boolean; errors: string[]; securityIssues?: string[] }) {
    // Initialiser securityIssues si nécessaire
    if (!result.securityIssues) {
      result.securityIssues = []
    }
    
    const dangerousPatterns = [
      /your_.*_here/i,
      /example\.com/i,
      /test.*key/i,
      /123456/,
      /password/i,
      /admin/i,
      /default/i
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(value)) {
        result.securityIssues.push(`🚨 Valeur par défaut détectée pour ${key}: Ne pas utiliser en production`)
        if (this.isProduction) {
          result.isValid = false
          result.errors.push(`❌ Production: Valeur par défaut interdite pour ${key}`)
        }
        break
      }
    }
  }

  /**
   * Valide les dépendances entre variables
   */
  private validateDependencies(result: EnvValidationResult) {
    // Si RESEND_API_KEY est défini, LEAD_NOTIFICATION_EMAIL devrait l'être aussi
    if (process.env['RESEND_API_KEY'] && !process.env['LEAD_NOTIFICATION_EMAIL']) {
      result.warnings.push('⚠️  RESEND_API_KEY défini mais pas LEAD_NOTIFICATION_EMAIL')
    }

    // En développement, juste des warnings pour les dépendances importantes
    if (!this.isProduction) {
      if (!process.env['OPENROUTER_API_KEY']) {
        result.warnings.push('⚠️  OPENROUTER_API_KEY manquante - fonctionnalités IA limitées en développement')
      }
    }
  }

  /**
   * Log sécurisé des résultats de validation
   */
  private logValidationResults(result: EnvValidationResult) {
    if (result.errors.length > 0) {
      log.error('❌ Validation échouée:', {}, { errors: result.errors })
    }

    if (result.warnings.length > 0) {
      log.warn('⚠️  Avertissements:', {}, { warnings: result.warnings })
    }

    if (result.securityIssues.length > 0) {
      log.warn('🚨 Problèmes de sécurité:', {}, { securityIssues: result.securityIssues })
    }

    if (result.isValid && result.errors.length === 0) {
      log.info('✅ Validation des variables d\'environnement réussie')
    }
  }

  /**
   * Obtient une variable d'environnement de manière sécurisée
   */
  getEnvVar(key: string, defaultValue?: string): string | undefined {
    const value = process.env[key] || defaultValue
    const rule = ENV_VALIDATION_RULES[key]

    if (rule && value) {
      const validation = this.validateVariable(key, value, rule)
      if (!validation.isValid) {
        log.error(`❌ Variable d'environnement invalide: ${key}`, {}, {
          errors: validation.errors
        })
        if (rule.required || this.isProduction) {
          throw new Error(`Variable d'environnement invalide: ${key}`)
        }
      }
    }

    // Cache du résultat de validation si la valeur existe et a été validée
    if (rule && value) {
      const validation = this.validateVariable(key, value, rule)
      this.validationCache.set(key, {
        isValid: validation.isValid,
        errors: validation.errors,
        timestamp: Date.now()
      })
    }
    
    return value
  }

  /**
   * Masque les valeurs sensibles pour les logs
   */
  maskSensitiveValue(key: string, value: string): string {
    const rule = ENV_VALIDATION_RULES[key]
    if (!rule?.sensitive || !value) {
      return value
    }

    if (value.length <= 8) {
      return '***'
    }

    return `${value.substring(0, 4)}***${value.substring(value.length - 4)}`
  }

  /**
   * Obtient un rapport sécurisé de la configuration
   */
  getConfigReport(): Record<string, unknown> {
    const report: Record<string, unknown> = {}

    for (const [key, rule] of Object.entries(ENV_VALIDATION_RULES)) {
      const value = process.env[key]
      report[key] = {
        defined: !!value,
        required: rule.required || (this.isProduction && key === 'CHAT_ENCRYPTION_KEY'),
        sensitive: rule.sensitive || false,
        description: rule.description,
        maskedValue: value ? this.maskSensitiveValue(key, value) : undefined
      }
    }

    return report
  }
}

// Factory function to prevent client-side initialization
export function getEnvValidator(): EnvironmentValidator {
  return EnvironmentValidator.getInstance()
}

// Fonction utilitaire pour validation rapide
export function validateEnvironment(): EnvValidationResult {
  return getEnvValidator().validateAll()
}

// Fonction utilitaire pour obtenir une variable sécurisée
export function getSecureEnvVar(key: string, defaultValue?: string): string | undefined {
  return getEnvValidator().getEnvVar(key, defaultValue)
}