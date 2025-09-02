/**
 * AI Warning Manager - Contrôle strict des warnings par l'IA
 * Garantit la séquence obligatoire : Warning 1 → Warning 2 → Warning 3 → Ban
 * L'IA est maître du déclenchement, le système enforce la logique
 */

import { logger } from '@/lib/logger'
import { ClientBanManager } from './client-ban-manager'
import { SecurityConfig } from './security-config'

/**
 * Interface pour l'état des warnings d'une session
 */
interface AIWarningState {
  sessionId: string
  warningCount: number
  lastWarningTime: number
  trollDetections: string[]
  canBan: boolean
}

/**
 * Mots-clés secrets que l'IA peut utiliser pour déclencher les actions
 */
export const AI_TRIGGER_KEYWORDS = {
  WARNING_1: '[TRIGGER_WARNING_1]',
  WARNING_2: '[TRIGGER_WARNING_2]',
  WARNING_3: '[TRIGGER_WARNING_3]',
  BAN_NOW: '[TRIGGER_BAN]'
} as const

/**
 * Messages correspondant à chaque niveau de warning
 */
export const AI_WARNING_MESSAGES = {
  1: "⚠️ ATTENTION - Ce chat est exclusivement dédié au coaching en prise de parole. Parlons de votre projet professionnel.",
  2: "🚨 DERNIER AVERTISSEMENT - Recentrez-vous sur votre besoin en coaching ou cette conversation se fermera.",
  3: "🚫 FERMETURE IMMINENTE - Dernière chance de parler sérieusement de coaching avant fermeture définitive."
} as const

/**
 * Gestionnaire des warnings contrôlés par l'IA
 */
export class AIWarningManager {
  private static warnings = new Map<string, AIWarningState>()

  /**
   * Détecte si la réponse de l'IA contient un mot-clé de déclenchement
   */
  static detectAITrigger(aiResponse: string): {
    action: 'warning' | 'ban' | 'none'
    level?: number
    cleanMessage: string
  } {
    let cleanMessage = aiResponse

    // Vérifier ban d'abord (priorité)
    if (aiResponse.includes(AI_TRIGGER_KEYWORDS.BAN_NOW)) {
      cleanMessage = aiResponse.replace(AI_TRIGGER_KEYWORDS.BAN_NOW, '').trim()
      return { action: 'ban', cleanMessage }
    }

    // Vérifier warnings par ordre
    if (aiResponse.includes(AI_TRIGGER_KEYWORDS.WARNING_3)) {
      cleanMessage = aiResponse.replace(AI_TRIGGER_KEYWORDS.WARNING_3, '').trim()
      return { action: 'warning', level: 3, cleanMessage }
    }

    if (aiResponse.includes(AI_TRIGGER_KEYWORDS.WARNING_2)) {
      cleanMessage = aiResponse.replace(AI_TRIGGER_KEYWORDS.WARNING_2, '').trim()
      return { action: 'warning', level: 2, cleanMessage }
    }

    if (aiResponse.includes(AI_TRIGGER_KEYWORDS.WARNING_1)) {
      cleanMessage = aiResponse.replace(AI_TRIGGER_KEYWORDS.WARNING_1, '').trim()
      return { action: 'warning', level: 1, cleanMessage }
    }

    return { action: 'none', cleanMessage }
  }

  /**
   * Obtient l'état des warnings pour une session
   */
  static getWarningState(sessionId: string): AIWarningState {
    if (!this.warnings.has(sessionId)) {
      this.warnings.set(sessionId, {
        sessionId,
        warningCount: 0,
        lastWarningTime: 0,
        trollDetections: [],
        canBan: false
      })
    }
    return this.warnings.get(sessionId)!
  }

  /**
   * Traite une action déclenchée par l'IA
   * Retourne l'action finale validée par le système
   */
  static processAIAction(
    sessionId: string,
    action: 'warning' | 'ban',
    level?: number,
    reason: string = 'AI detected inappropriate behavior'
  ): {
    finalAction: 'warning' | 'ban' | 'blocked'
    warningLevel: number
    message: string
    shouldBan: boolean
  } {
    const state = this.getWarningState(sessionId)
    const now = Date.now()

    logger.security('AI action triggered', { sessionId }, {
      action,
      level,
      currentWarnings: state.warningCount,
      reason: reason.substring(0, 100)
    })

    // Si l'IA demande un ban
    if (action === 'ban') {
      return this.processBanRequest(sessionId, state, reason)
    }

    // Si l'IA demande un warning
    if (action === 'warning' && level) {
      return this.processWarningRequest(sessionId, state, level, now, reason)
    }

    // Action non reconnue - refuser
    logger.security('Unknown AI action - request blocked', { sessionId }, { action, level })
    return {
      finalAction: 'blocked',
      warningLevel: state.warningCount,
      message: AI_WARNING_MESSAGES[1],
      shouldBan: false
    }
  }

  /**
   * Traite une demande de ban de l'IA
   */
  private static processBanRequest(
    sessionId: string,
    state: AIWarningState,
    reason: string
  ): {
    finalAction: 'warning' | 'ban' | 'blocked'
    warningLevel: number
    message: string
    shouldBan: boolean
  } {
    // RÈGLE STRICTE: Impossible de bannir sans 3 warnings
    if (state.warningCount < 3) {
      logger.security('Ban request BLOCKED - insufficient warnings', { sessionId }, {
        currentWarnings: state.warningCount,
        requiredWarnings: 3,
        reason: 'AI tried to ban without 3 warnings'
      })

      // Forcer un warning à la place
      return this.processWarningRequest(
        sessionId, 
        state, 
        state.warningCount + 1, 
        Date.now(), 
        'Forced warning instead of premature ban'
      )
    }

    // Ban autorisé après 3 warnings
    logger.security('Ban AUTHORIZED after 3 warnings', { sessionId }, {
      warningCount: state.warningCount,
      reason,
      trollDetections: state.trollDetections
    })

    // Créer le ban côté client
    if (typeof window !== 'undefined') {
      const config = SecurityConfig.getWarningConfig()
      ClientBanManager.createBan(
        sessionId,
        reason,
        config.BAN_DURATION_AFTER_WARNINGS
      )
    }

    // Nettoyer l'état
    this.warnings.delete(sessionId)

    return {
      finalAction: 'ban',
      warningLevel: 3,
      message: 'Conversation fermée pour comportement inapproprié répété.',
      shouldBan: true
    }
  }

  /**
   * Traite une demande de warning de l'IA
   */
  private static processWarningRequest(
    sessionId: string,
    state: AIWarningState,
    requestedLevel: number,
    now: number,
    reason: string
  ): {
    finalAction: 'warning' | 'ban' | 'blocked'
    warningLevel: number
    message: string
    shouldBan: boolean
  } {
    // Valider la séquence: on ne peut que passer au niveau suivant
    const expectedLevel = state.warningCount + 1

    if (requestedLevel !== expectedLevel) {
      logger.security('Warning sequence violation - correcting', { sessionId }, {
        requested: requestedLevel,
        expected: expectedLevel,
        current: state.warningCount
      })

      // Corriger en utilisant le niveau attendu
      requestedLevel = expectedLevel
    }

    // Vérifier qu'on ne dépasse pas 3 warnings
    if (requestedLevel > 3) {
      logger.security('Warning level too high - triggering ban instead', { sessionId }, {
        requestedLevel,
        maxLevel: 3
      })

      return this.processBanRequest(sessionId, state, reason)
    }

    // Mettre à jour l'état
    state.warningCount = requestedLevel
    state.lastWarningTime = now
    state.trollDetections.push(reason)
    state.canBan = (requestedLevel >= 3)

    logger.security('Warning issued', { sessionId }, {
      level: requestedLevel,
      totalWarnings: state.warningCount,
      canBanNext: state.canBan,
      reason
    })

    return {
      finalAction: 'warning',
      warningLevel: requestedLevel,
      message: AI_WARNING_MESSAGES[requestedLevel as keyof typeof AI_WARNING_MESSAGES] || AI_WARNING_MESSAGES[1],
      shouldBan: requestedLevel >= 3
    }
  }

  /**
   * Obtient le nombre de warnings pour une session
   */
  static getWarningCount(sessionId: string): number {
    return this.getWarningState(sessionId).warningCount
  }

  /**
   * Vérifie si une session peut être bannie
   */
  static canBan(sessionId: string): boolean {
    return this.getWarningState(sessionId).canBan
  }

  /**
   * Nettoie l'état des warnings pour une session
   */
  static clearWarnings(sessionId: string): void {
    this.warnings.delete(sessionId)
    logger.security('AI warnings cleared', { sessionId })
  }

  /**
   * Obtient les statistiques pour debugging
   */
  static getStats(sessionId: string): {
    warningCount: number
    lastWarningTime: number
    trollDetections: string[]
    canBan: boolean
    timeToReset: number
  } {
    const state = this.getWarningState(sessionId)
    const config = SecurityConfig.getWarningConfig()
    const timeSinceLastWarning = Date.now() - state.lastWarningTime
    const timeToReset = Math.max(0, config.WARNING_RESET_TIME - timeSinceLastWarning)

    return {
      warningCount: state.warningCount,
      lastWarningTime: state.lastWarningTime,
      trollDetections: [...state.trollDetections],
      canBan: state.canBan,
      timeToReset
    }
  }

  /**
   * Méthode de test pour forcer un état spécifique
   */
  static _forceWarningState(sessionId: string, warningCount: number): void {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('_forceWarningState only available in development')
    }

    const state = this.getWarningState(sessionId)
    state.warningCount = Math.min(3, Math.max(0, warningCount))
    state.canBan = state.warningCount >= 3
    state.lastWarningTime = Date.now()

    logger.security('Warning state forced (dev mode)', { sessionId }, {
      warningCount: state.warningCount,
      canBan: state.canBan
    })
  }

  /**
   * Méthode de debug pour afficher l'état
   */
  static debugState(sessionId: string): void {
    if (process.env.NODE_ENV !== 'development') return

    const stats = this.getStats(sessionId)
    logger.devOnly(() => {
      logger.group('AI Warning Manager Debug', () => {
        logger.debug('Session ID', { sessionId })
        logger.debug(`Warning Count: ${stats.warningCount}/3`, { sessionId })
        logger.debug(`Can Ban: ${stats.canBan}`, { sessionId })
        logger.debug(`Last Warning: ${new Date(stats.lastWarningTime).toLocaleString()}`, { sessionId })
        logger.debug(`Time to Reset: ${Math.round(stats.timeToReset / 1000)} seconds`, { sessionId })
        logger.debug('Troll Detections', { sessionId }, { detections: stats.trollDetections })
      })
    })
  }
}

// Ajouter les commandes globales de debug en développement
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugAIWarnings = (sessionId: string) => {
    AIWarningManager.debugState(sessionId)
  }

  (window as any).forceWarningLevel = (sessionId: string, level: number) => {
    AIWarningManager._forceWarningState(sessionId, level)
    logger.debug(`Warning level forced to ${level}`, { sessionId })
  }

  (window as any).clearAIWarnings = (sessionId: string) => {
    AIWarningManager.clearWarnings(sessionId)
    logger.debug('AI warnings cleared', { sessionId })
  }

  logger.devOnly(() => {
    logger.info('AI Warning Manager Debug commands available')
    logger.info('  - debugAIWarnings(sessionId): Show warning state')
    logger.info('  - forceWarningLevel(sessionId, level): Force warning level')
    logger.info('  - clearAIWarnings(sessionId): Clear all warnings')
  })
}

export default AIWarningManager