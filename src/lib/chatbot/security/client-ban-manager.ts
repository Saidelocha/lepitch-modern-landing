/**
 * Client-side Ban Manager - Secure ban management for browser environment
 * Integrates with the refactored security system
 */

import { logger } from '@/lib/logger'

interface BanRecord {
  bannedAt: number
  expiresAt: number
  reason: string
  sessionId: string
}

interface BanState {
  isBanned: boolean
  timeRemaining: string
}

const BAN_STORAGE_KEY = 'lepitch_chat_ban'
const BAN_STORAGE_KEY_BACKUP = 'lepitch_chat_ban_backup' // Double stockage pour éviter contournement
const DEFAULT_BAN_DURATION = 24 * 60 * 60 * 1000 // 24 heures en millisecondes

/**
 * Génère un identifiant unique pour le navigateur
 * Basé sur des caractéristiques stables du navigateur
 */
function generateBrowserId(): string {
  if (typeof window === 'undefined') return 'server-side'
  
  const nav = window.navigator
  const screen = window.screen
  
  // Combiner plusieurs caractéristiques pour créer une empreinte
  const fingerprint = [
    nav.userAgent,
    nav.language,
    nav.hardwareConcurrency || 'unknown',
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    nav.cookieEnabled ? 'cookies' : 'no-cookies',
    // Ajouter un salt aléatoire stocké pour cette session
    localStorage.getItem('lepitch_device_salt') || generateDeviceSalt()
  ].join('|')
  
  // Créer un hash simple (en production, utiliser une vraie fonction de hash)
  return btoa(fingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
}

/**
 * Génère un salt unique pour ce dispositif
 */
function generateDeviceSalt(): string {
  if (typeof window === 'undefined') return 'server-salt'
  
  const salt = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  localStorage.setItem('lepitch_device_salt', salt)
  return salt
}

export class ClientBanManager {
  /**
   * Vérifie si l'utilisateur est actuellement banni (avec double vérification)
   */
  static isBanned(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      // Vérifier les deux stockages pour éviter le contournement
      const banData = localStorage.getItem(BAN_STORAGE_KEY)
      const banDataBackup = sessionStorage.getItem(BAN_STORAGE_KEY_BACKUP)
      
      // Si l'un des deux est présent, considérer comme banni
      const hasMainBan = banData ? this.isValidBan(JSON.parse(banData)) : false
      const hasBackupBan = banDataBackup ? this.isValidBan(JSON.parse(banDataBackup)) : false
      
      return hasMainBan || hasBackupBan
    } catch (error) {
      logger.error('Erreur lors de la vérification du ban', {}, { error: error instanceof Error ? error.message : String(error) })
      return false
    }
  }

  /**
   * Valide si un ban est encore actif
   */
  private static isValidBan(ban: BanRecord): boolean {
    const now = Date.now()
    
    // Vérifier si le ban a expiré
    if (now >= ban.expiresAt) {
      this.clearBan()
      return false
    }
    
    return true
  }

  /**
   * Récupère les informations du ban actuel
   */
  static getBanInfo(): BanRecord | null {
    if (typeof window === 'undefined') return null
    
    try {
      const banData = localStorage.getItem(BAN_STORAGE_KEY)
      if (!banData) return null
      
      const ban: BanRecord = JSON.parse(banData)
      const now = Date.now()
      
      if (now >= ban.expiresAt) {
        this.clearBan()
        return null
      }
      
      return ban
    } catch (error) {
      logger.error('Erreur lors de la récupération du ban', {}, { error: error instanceof Error ? error.message : String(error) })
      return null
    }
  }

  /**
   * Crée un nouveau bannissement (avec double stockage renforcé)
   */
  static createBan(sessionId: string, reason: string, durationMs: number = DEFAULT_BAN_DURATION): void {
    if (typeof window === 'undefined') return
    
    try {
      const now = Date.now()
      const ban: BanRecord = {
        bannedAt: now,
        expiresAt: now + durationMs,
        reason,
        sessionId
      }
      
      const banString = JSON.stringify(ban)
      
      // Double stockage pour éviter le contournement facile
      localStorage.setItem(BAN_STORAGE_KEY, banString)
      sessionStorage.setItem(BAN_STORAGE_KEY_BACKUP, banString)
      
      // Stocker aussi l'ID du navigateur avec timestamp
      const browserId = generateBrowserId()
      localStorage.setItem('lepitch_browser_id', browserId)
      localStorage.setItem('lepitch_ban_timestamp', now.toString())
      
      logger.security('Client ban created', { sessionId }, {
        duration: durationMs,
        reason,
        expiresAt: new Date(now + durationMs).toISOString()
      })
      
      // Force un refresh de la page pour activer immédiatement le ban
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }, 500)
    } catch (error) {
      logger.error('Erreur lors de la création du ban', { sessionId }, { 
        error: error instanceof Error ? error.message : String(error),
        reason,
        duration: durationMs
      })
    }
  }

  /**
   * Supprime le bannissement (tous les stockages)
   */
  static clearBan(): void {
    if (typeof window === 'undefined') return
    
    try {
      // Nettoyer tous les stockages de ban
      localStorage.removeItem(BAN_STORAGE_KEY)
      sessionStorage.removeItem(BAN_STORAGE_KEY_BACKUP)
      localStorage.removeItem('lepitch_browser_id')
      localStorage.removeItem('lepitch_ban_timestamp')
      
      logger.security('Client ban cleared')
    } catch (error) {
      logger.error('Erreur lors de la suppression du ban', {}, { error: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * Obtient le temps restant avant expiration du ban
   */
  static getRemainingBanTime(): number {
    const ban = this.getBanInfo()
    if (!ban) return 0
    
    const remaining = ban.expiresAt - Date.now()
    return remaining > 0 ? remaining : 0
  }

  /**
   * Formate le temps restant en texte lisible
   */
  static formatRemainingTime(): string {
    const remaining = this.getRemainingBanTime()
    if (remaining <= 0) return ''
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
    }
    return `${minutes} minutes`
  }

  /**
   * Obtient l'ID unique du navigateur
   */
  static getBrowserId(): string {
    return generateBrowserId()
  }

  /**
   * Obtient l'état de ban actuel pour l'UI
   */
  static getBanState(): BanState {
    return {
      isBanned: this.isBanned(),
      timeRemaining: this.formatRemainingTime()
    }
  }

  /**
   * Fonction de debug pour réinitialiser un ban (utile en développement)
   */
  static resetBan(): void {
    this.clearBan()
    logger.security('Ban reset successfully (dev mode)')
    
    // Recharger la page pour mettre à jour l'état
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  /**
   * Fonction de debug pour afficher les informations de ban
   */
  static showBanInfo(): void {
    const ban = this.getBanInfo()
    if (!ban) {
      logger.debug('Aucun ban actif')
      return
    }
    
    logger.debug('Ban information', { sessionId: ban.sessionId }, {
      reason: ban.reason,
      bannedAt: new Date(ban.bannedAt).toLocaleString(),
      expiresAt: new Date(ban.expiresAt).toLocaleString(),
      timeRemaining: this.formatRemainingTime(),
      timeRemainingMs: this.getRemainingBanTime()
    })
  }
}

// Ajouter les commandes globales pour le debug en développement
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).resetChatBan = () => {
    ClientBanManager.resetBan()
  }
  
  (window as any).showBanInfo = () => {
    ClientBanManager.showBanInfo()
  }
  
  (window as any).createTestBan = (reason: string = 'Test ban', durationMinutes: number = 60) => {
    const sessionId = `test-session-${Date.now()}`
    ClientBanManager.createBan(sessionId, reason, durationMinutes * 60 * 1000)
    logger.debug('Test ban created', { sessionId }, { reason, durationMinutes })
    window.location.reload()
  }
  
  logger.devOnly(() => {
    logger.info('Client Ban Manager Debug commands available')
    logger.info('  - resetChatBan(): Reset current ban')
    logger.info('  - showBanInfo(): Show current ban information')
    logger.info('  - createTestBan(reason, minutes): Create a test ban')
  })
}

export default ClientBanManager