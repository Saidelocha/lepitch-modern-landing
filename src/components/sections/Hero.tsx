'use client'

import Link from 'next/link'
import { TRUST_INDICATORS, CONTACT } from '@/lib/constants'
import SpotsLeftBadge from '@/components/ui/SpotsLeftBadge'

export default function Hero() {
  return (
    <section 
      className="relative pt-6 pb-12 lg:pt-8 lg:pb-20 overflow-hidden z-10"
      role="banner"
      aria-labelledby="hero-headline"
      aria-describedby="hero-description"
    >
      
      <div className="container relative z-10 px-6 sm:px-8">
        {/* Urgency Banner - Compact */}
        <div className="text-center mb-6 animate-fade-in-down">
          <SpotsLeftBadge variant="hero" />
        </div>

        {/* Main Headline - Centered */}
        <div className="text-center max-w-4xl mx-auto mb-8 animate-fade-in-up">
          <h1 id="hero-headline" className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg break-words">
            <span className="text-gradient-primary break-words">+40% de deals</span> dès le mois prochain
          </h1>
          <p id="hero-description" className="text-lg sm:text-xl lg:text-2xl text-white/90 font-medium drop-shadow-md break-words">
            Méthode exclusive garantie 30 jours ou remboursé
          </p>
        </div>

        {/* Coach credentials with photo - Compact */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <article 
            className="flex items-center gap-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl max-w-md focus-within:shadow-2xl transition-shadow duration-300"
            role="article"
            aria-labelledby="coach-name"
            aria-describedby="coach-credentials"
          >
            <div className="relative">
              <img 
                src="/images/coach/leo-barcet-hero.jpg"
                alt="Photo de profil de Léo Barcet"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary-200 shadow-md"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.src = "/images/coach/fallback.svg"
                }}
              />
              <div 
                className="absolute -bottom-1 -right-1 gradient-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                role="img"
                aria-label="Coach certifié"
              >
                ✓
              </div>
            </div>
            <div>
              <p id="coach-name" className="font-bold text-neutral-900">Léo Barcet</p>
              <p id="coach-credentials" className="text-sm text-neutral-600">Comédien professionnel • Coach unique</p>
              <p className="text-xs text-primary-600 font-semibold">5 ans de coaching spécialisé</p>
            </div>
          </article>
        </div>

        {/* Premium CTA Button - Priority Position */}
        <div className="text-center mb-8 animate-fade-in-up px-4" style={{animationDelay: '0.2s'}}>
          <Link
            href={CONTACT.bookingUrl}
            className="group relative inline-block gradient-cta hover:gradient-cta-hover focus:gradient-cta-hover text-white font-bold py-4 px-6 sm:py-6 sm:px-12 lg:py-8 lg:px-16 rounded-2xl text-base sm:text-xl lg:text-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl focus:shadow-3xl ring-primary-glow focus:outline-none min-h-[48px] min-w-[48px]"
            aria-label="Réserver votre séance de coaching gratuite de 30 minutes maintenant"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 break-words">
              🎯 <span className="break-words">Réservez votre séance GRATUITE</span>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-2 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" aria-hidden="true"></div>
          </Link>
          <p className="text-sm text-white/80 mt-4 animate-fade-in drop-shadow-md break-words">⚡ Séance de 30 min • Sans engagement</p>
        </div>

        {/* Enhanced Benefits */}
        <div className="max-w-2xl mx-auto mb-8 animate-fade-in" role="region" aria-labelledby="benefits-title">
          <div className="flex flex-wrap justify-center gap-4 text-neutral-700">
            <h2 id="benefits-title" className="sr-only">Avantages de la méthode</h2>
            {[
              '📈 Résultats en 30 jours',
              '🎯 Méthode S.C.E.N.E.',
              '🔒 100% personnalisé'
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg focus-within:shadow-xl transition-shadow duration-300 animate-fade-in-up" 
                style={{animationDelay: `${index * 0.1}s`}}
                role="listitem"
              >
                <span className="font-medium text-sm lg:text-base">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-2xl mx-auto animate-fade-in-up px-4" style={{animationDelay: '0.6s'}} role="region" aria-labelledby="trust-indicators-title">
          <h2 id="trust-indicators-title" className="sr-only">Indicateurs de confiance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8 text-center">
            {TRUST_INDICATORS.map((indicator, index) => (
              <article 
                key={index} 
                className="text-center p-4 rounded-xl bg-white/95 backdrop-blur-md border border-white/20 shadow-lg focus-within:shadow-xl transition-shadow duration-300 animate-fade-in-up" 
                style={{animationDelay: `${index * 0.1}s`}}
                role="article"
                aria-labelledby={`trust-${index}-value`}
                aria-describedby={`trust-${index}-label`}
              >
                <div 
                  id={`trust-${index}-value`}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient-primary mb-2 break-words"
                >
                  {indicator.value}
                </div>
                <div 
                  id={`trust-${index}-label`}
                  className="text-sm lg:text-base text-neutral-600 font-medium break-words"
                >
                  {indicator.label}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}