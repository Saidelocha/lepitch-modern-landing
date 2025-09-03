import Link from 'next/link'
import Image from 'next/image'
import { CONTACT, PERSONALIZED_PROCESS_STEPS, PERSONALIZED_BENEFITS } from '@/lib/constants'
import type { ProcessStep } from '@/types'
import SpotsLeftBadge from '@/components/ui/SpotsLeftBadge'

export default function PricingPersonalized() {
  return (
    <section id="offres" className="relative py-12 lg:py-16 bg-white overflow-hidden">
      {/* Wave transition top */}
      <div className="absolute top-0 left-0 w-full">
        <svg className="w-full h-12 lg:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,120V73.71C47.79,94.87,95.58,106.55,163.36,106.55C228.21,106.55,276,94.87,344.78,73.71C413.57,52.55,461.35,40.87,530.14,40.87C598.92,40.87,646.71,52.55,715.49,73.71C784.28,94.87,832.06,106.55,900.85,106.55C968.63,106.55,1016.42,94.87,1085.2,73.71C1154,52.55,1201.76,40.87,1235.65,40.87L1200,0L0,0Z" fill="white"></path>
        </svg>
      </div>
      
      <div className="container relative z-10 px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 leading-tight break-words">
            Un accompagnement 100% sur-mesure
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed break-words">
            Chaque entrepreneur est unique, votre solution pitch aussi. Découvrez l'approche personnalisée qui s'adapte à vos besoins exacts.
          </p>
          <SpotsLeftBadge variant="pricing" />
        </div>

        {/* Main Process Card */}
        <div className="max-w-5xl mx-auto mb-8 md:mb-12 lg:mb-16">
          <div className="relative bg-gradient-to-br from-white to-primary-50/30 rounded-2xl md:rounded-3xl shadow-2xl border-2 border-primary-200 p-6 md:p-8 lg:p-12 transition-all duration-500 hover:shadow-3xl hover:border-primary-300 overflow-hidden">
            
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src="/images/modules/Module6.webp"
                alt="Background"
                fill
                className="object-cover object-center"
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-white/60 md:bg-white/50 lg:bg-white/45"></div>
            </div>
            
            {/* Content wrapper with relative positioning */}
            <div className="relative z-10">
            
            {/* Badge */}
            <div className="text-center mb-6 md:mb-8">
              <span className="inline-block bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 text-white text-xs md:text-sm font-bold px-4 md:px-8 lg:px-10 py-3 md:py-4 rounded-full shadow-2xl border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-3xl max-w-full">
                <span className="block sm:hidden">✨ DIAGNOSTIC GRATUIT ✨</span>
                <span className="hidden sm:inline">✨ DIAGNOSTIC GRATUIT • SOLUTION PERSONNALISÉE ✨</span>
              </span>
            </div>

            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12 mt-6 md:mt-8">
              {PERSONALIZED_PROCESS_STEPS.map((step: ProcessStep) => (
                <div key={step.number} className="text-center group relative">
                  
                  {/* Step Content Box */}
                  <div className="relative bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 shadow-2xl border border-white/70 transition-all duration-500 group-hover:bg-white/98 group-hover:shadow-3xl md:group-hover:scale-105 group-hover:border-white/90">
                    
                    {/* Step Number & Icon */}
                    <div className="relative mb-4 md:mb-6">
                      <div className="w-16 md:w-20 h-16 md:h-20 mx-auto rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-lg transition-all duration-500 group-hover:shadow-xl md:group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary-200 group-hover:to-secondary-200 md:group-hover:rotate-3">
                        <span className="text-2xl md:text-3xl transition-transform duration-300 md:group-hover:scale-110">{step.icon}</span>
                      </div>
                      <div className="absolute -top-1 md:-top-2 -right-1 md:-right-2 w-7 md:w-8 h-7 md:h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg">
                        {step.number}
                      </div>
                    </div>

                    {/* Step Content */}
                    <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300 leading-tight break-words">
                      {step.title}
                    </h3>
                    <p className="text-primary-600 font-semibold mb-3 text-xs md:text-sm uppercase tracking-wide break-words">
                      {step.duration}
                    </p>
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base break-words">
                      {step.description}
                    </p>
                    
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-6 md:mt-8 px-4">
              <Link
                href={CONTACT.bookingUrl}
                className="inline-block bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 hover:from-primary-700 hover:via-primary-800 hover:to-secondary-700 text-white font-bold text-base md:text-lg px-6 sm:px-8 md:px-14 py-3 sm:py-4 md:py-5 rounded-xl md:rounded-2xl transition-all duration-300 transform md:hover:scale-105 shadow-2xl hover:shadow-3xl border border-white/20 backdrop-blur-sm relative overflow-hidden group min-h-[48px] min-w-[48px] touch-manipulation"
              >
                <span className="relative z-10 break-words">🚀 Démarrer mon diagnostic gratuit</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <p className="text-gray-600 text-sm md:text-base mt-4 font-medium break-words">
                🔒 Gratuit • Sans engagement • 30 minutes
              </p>
            </div>
            
            </div> {/* End relative z-10 wrapper */}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-6 md:mb-8 leading-tight break-words">
            Pourquoi une approche personnalisée ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {PERSONALIZED_BENEFITS.map((benefit: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 md:space-x-4 group">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#00D26A"
                    className="md:w-6 md:h-6 transition-transform duration-300 group-hover:scale-110"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <span className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-300 text-sm md:text-base break-words">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Payment Info */}
        <div className="text-center mt-6 md:mt-8 lg:mt-12 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="inline-flex items-center justify-center space-x-2 md:space-x-4 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 shadow-lg">
            <p className="text-neutral-600 font-medium text-sm md:text-base text-center">
              💳 Paiement sécurisé via PayPal | 🛡️ Garantie satisfait ou remboursé 30 jours
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}