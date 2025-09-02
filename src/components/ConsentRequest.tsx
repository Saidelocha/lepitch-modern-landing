'use client'

import { useState } from 'react'

interface ConsentRequestProps {
  onAccept: () => Promise<void>
  onDecline: () => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  context?: string // Contexte de la demande
}

export default function ConsentRequest({
  onAccept,
  onDecline,
  onCancel,
  isLoading = false,
  context
}: ConsentRequestProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAccept = async () => {
    try {
      setIsProcessing(true)
      await onAccept()
    } catch (error) {
      console.error('❌ Erreur lors de l\'acceptation du consentement:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    try {
      setIsProcessing(true)
      await onDecline()
    } catch (error) {
      console.error('❌ Erreur lors du refus du consentement:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white border border-primary-200 rounded-lg p-4 shadow-sm max-w-full overflow-hidden">
      {/* En-tête */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">📋 Étape suivante</h3>
        <p className="text-xs text-gray-600 mt-1">
          {context || 'Pour mieux vous accompagner'}
        </p>
      </div>

      {/* Message principal */}
      <div className="mb-6">
        <p className="text-sm text-gray-800">
          Souhaitez-vous que <strong>Léo vous recontacte</strong> pour discuter de votre projet de coaching en prise de parole ?
        </p>
        
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700">
            ✅ <strong>Si oui</strong> : Un bref formulaire vous permettra de transmettre vos coordonnées
          </p>
        </div>
        
        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💬 <strong>Si non</strong> : Nous pouvons continuer notre conversation pour vous donner plus de conseils
          </p>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-col gap-3">
        {/* Bouton principal - Accepter */}
        <button
          onClick={handleAccept}
          disabled={isProcessing || isLoading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors duration-200 font-medium"
        >
          {isProcessing ? 'Préparation...' : '✅ Oui, je souhaite être recontacté(e)'}
        </button>

        {/* Bouton secondaire - Refuser */}
        <button
          onClick={handleDecline}
          disabled={isProcessing || isLoading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors duration-200"
        >
          {isProcessing ? 'Traitement...' : '💬 Non merci, continuons la conversation'}
        </button>

        {/* Bouton tertiaire - Annuler */}
        <div className="flex justify-center">
          <button
            onClick={onCancel}
            disabled={isProcessing || isLoading}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Plus tard
          </button>
        </div>
      </div>

      {/* Information RGPD */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          🔒 Vos données personnelles sont protégées conformément au RGPD. 
          Elles seront uniquement utilisées pour vous recontacter concernant votre projet de coaching.
        </p>
      </div>
    </div>
  )
}