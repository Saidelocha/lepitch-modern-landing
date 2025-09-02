'use client'

import { useState, useEffect, useRef } from 'react'
import { useExitIntent } from '@/hooks/useExitIntent'

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useExitIntent({
    enabled: !isSubmitted,
    onExitIntent: () => {
      // Store current focus before opening dialog
      previousFocusRef.current = document.activeElement as HTMLElement
      setIsVisible(true)
    }
  })

  // Focus management and keyboard handling
  useEffect(() => {
    if (isVisible) {
      // Focus the close button when dialog opens
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose()
        }
      }

      // Trap focus within dialog
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && dialogRef.current) {
          const focusableElements = dialogRef.current.querySelectorAll(
            'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
          )
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTabKey)
      document.body.style.overflow = 'hidden' // Prevent background scroll

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleTabKey)
        document.body.style.overflow = 'unset'
      }
    }
    // No cleanup needed when not visible
    return () => {}
  }, [isVisible])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return

    // Simulate form submission
    try {
      // In a real app, you would send this to your API
      // Email submission handled silently in production
      setIsSubmitted(true)
      
      // Show success message and close popup after delay
      setTimeout(() => {
        setIsVisible(false)
      }, 2000)
    } catch (error) {
      console.error('Error submitting email:', error)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    // Restore focus to previous element
    if (previousFocusRef.current) {
      previousFocusRef.current.focus()
    }
  }

  // Handle click outside dialog
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 min-h-screen"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      aria-describedby="popup-description"
    >
      <div 
        ref={dialogRef}
        className="bg-white rounded-xl w-full max-w-sm sm:max-w-md p-6 lg:p-8 relative animate-fade-in mx-auto my-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button with improved accessibility */}
        <button
          ref={closeButtonRef}
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-200"
          aria-label="Fermer la popup"
          type="button"
        >
          <span className="text-xl leading-none" aria-hidden="true">&times;</span>
        </button>

        {!isSubmitted ? (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4" role="img" aria-label="Livre">📚</div>
              <h2 id="popup-title" className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Une seconde ! 💡
              </h2>
              <p id="popup-description" className="text-lg text-gray-600">
                Avant de partir, récupérez notre guide d'expert
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                📖 "Les 5 erreurs qui tuent votre pitch"
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span>L'erreur la plus courante qui sabote les presentations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span>Comment capter l'attention en 7 secondes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span>La structure secrète des pitchs qui convertissent</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span>Les mots interdits qui sabotent vos chances</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span>Les techniques psychologiques qui facilitent l'adhésion</span>
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email-input" className="sr-only">
                  Votre email professionnel
                </label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="Votre email professionnel"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-describedby="email-help"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 min-h-[44px]"
                />
                <div id="email-help" className="sr-only">
                  Entrez votre email pour recevoir le guide gratuit
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[44px]"
                aria-describedby="submit-help"
              >
                Recevoir le guide gratuit
              </button>
              <div id="submit-help" className="sr-only">
                Cliquez pour soumettre votre email et recevoir le guide
              </div>
            </form>

            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                🔒 100% gratuit. Vos données sont protégées.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4" role="img" aria-label="Succès">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Merci !
            </h3>
            <p className="text-gray-600">
              Vérifiez votre email dans quelques minutes pour recevoir votre guide gratuit.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}