'use client'

import { useEffect, useState } from 'react'
import { ClientBanManager } from '@/lib/chatbot/security'

interface BanNotificationProps {
  onClose?: () => void
  className?: string
}

export default function BanNotification({ onClose, className = '' }: BanNotificationProps) {
  const [banInfo, setBanInfo] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    // Get initial ban info
    const info = ClientBanManager.getBanInfo()
    setBanInfo(info)
    
    // Update time remaining every minute
    const updateTime = () => {
      const remaining = ClientBanManager.formatRemainingTime()
      setTimeRemaining(remaining)
      
      // If ban expired, notify parent to close
      if (!ClientBanManager.isBanned() && onClose) {
        onClose()
      }
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [onClose])

  if (!banInfo) return null

  const getBanReasonDisplay = (reason: string) => {
    switch (reason) {
      case 'Comportement inapproprié détecté par l\'IA':
        return 'Comportement inapproprié détecté'
      case 'Conversation fermée par l\'IA':
        return 'Usage non-conforme au service'
      default:
        return 'Violation des conditions d\'utilisation'
    }
  }

  const getBanIcon = () => (
    <svg 
      className="w-8 h-8 text-red-500 flex-shrink-0" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
    </svg>
  )

  return (
    <div className={`bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-6 shadow-lg ban-state-transition animate-slide-up ${className}`}>
      {/* Header with icon and title */}
      <div className="flex items-start space-x-4">
        {getBanIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-red-800">
              Accès temporairement suspendu
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-red-400 hover:text-red-600 transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Main message */}
          <div className="space-y-3">
            <p className="text-sm text-red-700 leading-relaxed">
              L'accès au chat a été temporairement suspendu suite à {getBanReasonDisplay(banInfo.reason).toLowerCase()}.
            </p>
            
            {/* Time remaining */}
            <div className="flex items-center space-x-2 bg-red-100 rounded-lg p-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-red-800 uppercase tracking-wide">
                  Temps restant
                </p>
                <p className="text-sm font-semibold text-red-900">
                  {timeRemaining || 'Calcul en cours...'}
                </p>
              </div>
            </div>
            
            {/* Next steps */}
            <div className="border-t border-red-200 pt-3">
              <p className="text-xs text-red-600 mb-2 font-medium">
                Que faire maintenant ?
              </p>
              <ul className="text-xs text-red-700 space-y-1">
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Attendez la fin de la suspension pour utiliser à nouveau le chat</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Pour des questions urgentes, utilisez les coordonnées de contact sur le site</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Ce service est exclusivement dédié au coaching professionnel</span>
                </li>
              </ul>
            </div>
            
            {/* Contact alternative */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-medium text-orange-800 mb-1">
                Contact alternatif
              </p>
              <p className="text-xs text-orange-700">
                Pour toute question urgente relative au coaching, vous pouvez nous contacter directement via le formulaire de contact du site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}