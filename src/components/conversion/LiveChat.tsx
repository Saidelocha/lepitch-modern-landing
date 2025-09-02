'use client'

import { useEffect, useRef } from 'react'
import SurveyForm from '../SurveyForm'
import ConsentRequest from '../ConsentRequest'
import BanNotification from '../BanNotification'
import { useChatLogic } from '@/lib/chatbot/useChatLogic'


export default function LiveChat() {
  // FIXÉ: sessionId généré une seule fois avec useRef pour persister entre les re-renders
  const sessionIdRef = useRef<string>()
  if (!sessionIdRef.current) {
    sessionIdRef.current = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  const sessionId = sessionIdRef.current
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const {
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
    toggleChat,
    sendMessage,
    handleSurveySubmit,
    handleSurveyCancel,
    handleConsentAccept,
    handleConsentDecline,
    handleConsentCancel,
    setMessage,
    checkBanStatus
  } = useChatLogic(sessionId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(message, false)
  }

  const handleQuickReply = async (reply: string) => {
    if (isLoading) return
    await sendMessage(reply, true)
  }

  // Get appropriate styling based on ban state
  const getChatButtonStyling = () => {
    if (banState.isBanned) {
      switch (banState.severity) {
        case 'severe':
          return 'bg-red-600 hover:bg-red-700 cursor-not-allowed'
        case 'moderate':
          return 'bg-red-500 hover:bg-red-600 cursor-not-allowed'
        case 'warning':
          return 'bg-orange-500 hover:bg-orange-600 cursor-not-allowed'
        default:
          return 'bg-red-500 hover:bg-red-600 cursor-not-allowed'
      }
    }
    return 'bg-primary-600 hover:bg-primary-700 hover:scale-110'
  }

  const getChatButtonTitle = () => {
    if (banState.isBanned) {
      return `Chat suspendu - ${banState.timeRemaining} restantes`
    }
    return 'Ouvrir le chat'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`${getChatButtonStyling()} text-white rounded-full p-4 shadow-lg ban-state-transition transform relative`}
          title={getChatButtonTitle()}
        >
          {banState.isBanned ? (
            // Banned icon
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
            </svg>
          ) : (
            // Normal chat icon
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          )}
          
          {/* Badge */}
          <span className={`absolute -top-1 -right-1 ${banState.isBanned ? 'bg-red-700' : 'bg-danger-500'} text-white text-xs rounded-full w-5 h-5 flex items-center justify-center`}>
            {banState.isBanned ? '🚫' : '1'}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-xl flex flex-col animate-slide-up ${
          (showSurveyForm || showConsentRequest) && !isCompleted && !closedByAI && !banState.isBanned
            ? 'w-96 h-[32rem]' // Plus grand pour le formulaire ou le consentement
            : 'w-80 h-96'      // Taille normale pour le chat
        }`} style={{ zIndex: 9999 }}>
          {/* Header */}
          <div className={`${
            banState.isBanned 
              ? 'bg-red-600 border-b-2 border-red-700' 
              : 'bg-primary-600'
          } text-white p-4 rounded-t-lg flex justify-between items-center ban-state-transition`}>
            <div className="flex items-center space-x-2">
              {banState.isBanned && (
                <svg className="w-5 h-5 text-red-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
                </svg>
              )}
              <h4 className="font-semibold">
                {banState.isBanned ? 'Chat temporairement suspendu' : 'Posez vos questions en direct'}
              </h4>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {/* Ban Notification */}
            {banState.isBanned && (
              <div className="ban-enter-active">
                <BanNotification 
                  className="mb-4"
                  onClose={() => {
                    // Ban expired, refresh ban state
                    checkBanStatus?.()
                  }}
                />
              </div>
            )}
            
            {!banState.isBanned && messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                Commencez la conversation...
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  {msg.text}
                  <div className={`text-xs mt-1 opacity-70 ${
                    msg.isBot ? 'text-gray-500' : 'text-primary-100'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      Réflexion...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick Replies */}
            {quickReplies.length > 0 && !isLoading && (
              <div className="flex flex-wrap gap-2 mt-3">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs border border-primary-200 transition-colors duration-200 hover:scale-105 transform"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
            
            {/* Consent Request - Affiché quand l'IA demande le consentement */}
            {showConsentRequest && !isCompleted && !closedByAI && !banState.isBanned && (
              <div className="mt-4">
                <ConsentRequest
                  onAccept={handleConsentAccept}
                  onDecline={handleConsentDecline}
                  onCancel={handleConsentCancel}
                  isLoading={consentProcessing}
                  context={consentContext}
                />
              </div>
            )}
            
            {/* Survey Form - Affiché quand déclenché par l'IA */}
            {showSurveyForm && !isCompleted && !closedByAI && !banState.isBanned && (
              <div className="mt-4">
                <SurveyForm
                  onSubmit={handleSurveySubmit}
                  onCancel={handleSurveyCancel}
                  isLoading={surveySubmitting}
                  conversationContext={surveyContext}
                />
              </div>
            )}
            
            {/* Completion CTA */}
            {isCompleted && !closedByAI && (
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-3 rounded-lg border border-primary-200">
                <p className="text-sm text-primary-800 mb-2">
                  🎯 Parfait ! Toutes vos informations ont été transmises à Léo qui va vous recontacter personnellement.
                </p>
                <button
                  onClick={() => window.open('https://calendar.app.google/DgYzJrMyj1FGfwvP7', '_blank')}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  📅 Ou réservez directement votre créneau (30 min)
                </button>
              </div>
            )}
            
            {/* AI Closed Message */}
            {closedByAI && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 mb-2">
                  🚫 Cette conversation a été fermée automatiquement.
                </p>
                <p className="text-xs text-red-600">
                  Ce service est réservé exclusivement aux demandes de coaching professionnel.
                </p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* User Info Summary */}
          {(session?.userInfo?.nom || session?.userInfo?.contact) && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              {session.userInfo.nom && <span>👤 {session.userInfo.nom}</span>}
              {session.userInfo.contact && <span className="ml-2">📞 {session.userInfo.contact}</span>}
            </div>
          )}

          {/* Input */}
          {!isCompleted && !closedByAI && !banState.isBanned && (
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder={isLoading ? "En cours..." : "Écrivez votre message..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm min-w-[80px]"
                >
                  {isLoading ? '...' : 'Envoyer'}
                </button>
              </div>
            </form>
          )}
          
          {/* Blocked Input */}
          {(closedByAI || banState.isBanned) && (
            <div className={`p-4 border-t-2 ${
              banState.isBanned 
                ? 'border-red-300 bg-gradient-to-r from-red-50 to-orange-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                {banState.isBanned ? (
                  <>
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
                    </svg>
                    <div className="text-center">
                      <p className="text-sm font-medium text-red-800">
                        Saisie désactivée - Chat suspendu
                      </p>
                      <p className="text-xs text-red-600">
                        {banState.timeRemaining} restantes
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
                    </svg>
                    <p className="text-sm text-red-600">
                      Cette conversation est fermée. Rechargez la page pour une nouvelle session.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}