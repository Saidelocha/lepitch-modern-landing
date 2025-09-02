'use client'

import { useState } from 'react'
import { z } from 'zod'
import { surveySchema, type SurveyData } from '@/lib/chatbot/business'

interface SurveyFormProps {
  onSubmit: (data: SurveyData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  conversationContext?: string // Résumé de la conversation pour pré-remplir
}

export default function SurveyForm({
  onSubmit,
  onCancel,
  isLoading = false,
  conversationContext
}: SurveyFormProps) {
  const [formData, setFormData] = useState<Partial<SurveyData>>({})
  const [errors, setErrors] = useState<Partial<Record<keyof SurveyData, string>>>({})
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 4

  const handleInputChange = (field: keyof SurveyData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur quand l'utilisateur corrige
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Partial<Record<keyof SurveyData, string>> = {}

    switch (stepNumber) {
      case 1:
        if (!formData.nom || formData.nom.length < 2) {
          newErrors.nom = 'Le nom doit contenir au moins 2 caractères'
        }
        break
      case 2:
        if (!formData.contactMethod) {
          newErrors.contactMethod = 'Veuillez choisir un moyen de contact'
        }
        if (!formData.contact) {
          newErrors.contact = 'Ce champ est requis'
        } else if (formData.contactMethod === 'email' && !formData.contact.includes('@')) {
          newErrors.contact = 'Veuillez entrer un email valide'
        } else if (formData.contactMethod === 'telephone' && formData.contact.replace(/\s/g, '').length < 10) {
          newErrors.contact = 'Veuillez entrer un numéro de téléphone valide'
        }
        break
      case 3:
        if (!formData.urgency) {
          newErrors.urgency = 'Veuillez indiquer le niveau d\'urgence'
        }
        if (!formData.timeline) {
          newErrors.timeline = 'Veuillez indiquer votre timeline'
        }
        break
      case 4:
        if (!formData.commitment) {
          newErrors.commitment = 'Veuillez indiquer votre engagement temps'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return

    try {
      setIsSubmitting(true)
      const validatedData = surveySchema.parse(formData)
      await onSubmit(validatedData)
    } catch (error) {
      console.error('❌ Erreur lors de la soumission du formulaire:', error)
      
      if (error instanceof z.ZodError) {
        // Erreurs de validation Zod côté frontend
        const fieldErrors: Partial<Record<keyof SurveyData, string>> = {}
        error.issues.forEach((err: any) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as keyof SurveyData] = err.message
          }
        })
        setErrors(fieldErrors)
      } else if (error instanceof Error) {
        // Erreurs HTTP ou de l'API
        const errorMessage = error.message
        
        // Analyser le type d'erreur pour donner un message spécifique
        if (errorMessage.includes('HTTP 400')) {
          // Erreur de validation côté serveur
          if (errorMessage.includes('Format d\'email invalide')) {
            setErrors({ contact: 'Veuillez entrer une adresse email valide (ex: nom@domaine.com)' })
          } else if (errorMessage.includes('Format de téléphone invalide')) {
            setErrors({ contact: 'Veuillez entrer un numéro de téléphone valide (10 chiffres minimum)' })
          } else if (errorMessage.includes('Erreurs de validation')) {
            // Erreur de validation détaillée du serveur
            const detailMatch = errorMessage.match(/Erreurs de validation: (.+)/)
            const details = detailMatch ? detailMatch[1] : 'Veuillez vérifier vos informations'
            setErrors({ nom: details || 'Erreur de validation' })
          } else {
            setErrors({ nom: 'Données invalides. Veuillez vérifier toutes les informations saisies.' })
          }
        } else if (errorMessage.includes('HTTP 404')) {
          setErrors({ nom: 'Session expirée. Veuillez recommencer la conversation.' })
        } else if (errorMessage.includes('HTTP 429')) {
          setErrors({ nom: 'Trop de tentatives. Veuillez patienter quelques minutes.' })
        } else if (errorMessage.includes('HTTP 500')) {
          setErrors({ nom: 'Erreur temporaire du serveur. Veuillez réessayer dans quelques instants.' })
        } else {
          setErrors({ nom: 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.' })
        }
      } else {
        // Erreur inconnue
        setErrors({
          nom: 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Pour mieux vous accompagner</h3>
            <p className="text-sm text-gray-600">À quel nom dois-je transmettre votre demande à Léo ?</p>
            <div>
              <input
                type="text"
                placeholder="Votre nom complet"
                value={formData.nom || ''}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                  errors.nom ? 'border-red-300' : 'border-gray-300'
                }`}
                autoFocus
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Comment souhaitez-vous être recontacté ?</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="email"
                    checked={formData.contactMethod === 'email'}
                    onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">📧 Par email</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="telephone"
                    checked={formData.contactMethod === 'telephone'}
                    onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">📞 Par téléphone</span>
                </label>
                {errors.contactMethod && <p className="text-red-500 text-xs">{errors.contactMethod}</p>}
              </div>

              {formData.contactMethod && (
                <div>
                  <input
                    type={formData.contactMethod === 'email' ? 'email' : 'tel'}
                    placeholder={
                      formData.contactMethod === 'email' 
                        ? 'votre@email.com' 
                        : 'Votre numéro de téléphone'
                    }
                    value={formData.contact || ''}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                      errors.contact ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Votre situation</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Votre besoin est-il urgent ?</p>
                <div className="space-y-1">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value="urgent"
                      checked={formData.urgency === 'urgent'}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">🔥 Oui, c'est urgent</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value="non-urgent"
                      checked={formData.urgency === 'non-urgent'}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">⏰ Non, je peux planifier</span>
                  </label>
                </div>
                {errors.urgency && <p className="text-red-500 text-xs mt-1">{errors.urgency}</p>}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Quand souhaitez-vous démarrer ?</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'immédiat', label: 'Immédiatement' },
                    { value: 'semaine', label: 'Cette semaine' },
                    { value: 'mois', label: 'Ce mois-ci' },
                    { value: 'flexible', label: 'Flexible' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="timeline"
                        value={option.value}
                        checked={formData.timeline === option.value}
                        onChange={(e) => handleInputChange('timeline', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-xs">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.timeline && <p className="text-red-500 text-xs mt-1">{errors.timeline}</p>}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Votre engagement</h3>
            <div>
              <p className="text-sm text-gray-600 mb-3">Combien de temps êtes-vous prêt à investir ?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: '3h', label: '3 heures' },
                  { value: '6h', label: '6 heures' },
                  { value: '15h', label: '15 heures' },
                  { value: '15h+', label: '15h et plus' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="commitment"
                      value={option.value}
                      checked={formData.commitment === option.value}
                      onChange={(e) => handleInputChange('commitment', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.commitment && <p className="text-red-500 text-xs mt-1">{errors.commitment}</p>}
            </div>

            <div className="bg-primary-50 p-3 rounded-lg">
              <p className="text-xs text-primary-700">
                📋 Récapitulatif : {formData.nom} • {formData.contactMethod} : {formData.contact} • {formData.urgency === 'urgent' ? 'Urgent' : 'Planifiable'} • {formData.timeline} • {formData.commitment}
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white border border-primary-200 rounded-lg p-4 shadow-sm max-w-full overflow-hidden">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Étape {step} sur {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-primary-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      {renderStep()}

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 mt-6">
        {/* Bouton principal */}
        <div className="flex justify-center">
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={isSubmitting || isLoading}
              className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors duration-200"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors duration-200 font-medium"
            >
              {isSubmitting ? 'Envoi...' : '✓ Transmettre à Léo'}
            </button>
          )}
        </div>
        
        {/* Boutons secondaires */}
        <div className="flex justify-center gap-4">
          {step > 1 && (
            <button
              onClick={handlePrev}
              disabled={isSubmitting || isLoading}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              ← Précédent
            </button>
          )}
          <button
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>

      {conversationContext && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            💬 Votre conversation sera transmise avec ces informations
          </p>
        </div>
      )}
    </div>
  )
}