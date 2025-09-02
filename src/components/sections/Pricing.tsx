import Link from 'next/link'
import { PRICING_OFFERS, SCARCITY } from '@/lib/constants'
import SpotsLeftBadge from '@/components/ui/SpotsLeftBadge'

export default function Pricing() {
  const offerIcons: Record<string, string> = {
    'L\'ESSENTIEL': '🎯',
    'LE PITCH': '⚡',
    'L\'ORATEUR': '🏆'
  }

  const offerDescriptions: Record<string, string> = {
    'L\'ESSENTIEL': 'Une présentation importante à venir ? Une séance pour identifier l\'essentiel et structurer votre message avec impact.',
    'LE PITCH': 'L\'accompagnement intensif pour transformer vos présentations. Écriture personnalisée de vos interventions + 6h de coaching pour des résultats durables.',
    'L\'ORATEUR': 'Vous voulez devenir véritablement inoubliable ? Rédaction complète de vos keynotes et discours + accompagnement 7/7 pendant 3 mois pour une transformation complète.'
  }

  return (
    <section 
      id="offres" 
      className="relative py-12 lg:py-16 bg-white overflow-hidden"
      role="region"
      aria-labelledby="pricing-title"
      aria-describedby="pricing-description"
    >
      {/* Wave transition top */}
      <div className="absolute top-0 left-0 w-full">
        <svg className="w-full h-12 lg:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,120V73.71C47.79,94.87,95.58,106.55,163.36,106.55C228.21,106.55,276,94.87,344.78,73.71C413.57,52.55,461.35,40.87,530.14,40.87C598.92,40.87,646.71,52.55,715.49,73.71C784.28,94.87,832.06,106.55,900.85,106.55C968.63,106.55,1016.42,94.87,1085.2,73.71C1154,52.55,1201.76,40.87,1235.65,40.87L1200,0L0,0Z" fill="white"></path>
        </svg>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-12 lg:mb-16">
          <h2 id="pricing-title" className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
            Choisissez votre parcours
          </h2>
          <p id="pricing-description" className="text-xl text-gray-600 mb-4">
            {SCARCITY.qualityFocus}
          </p>
          <SpotsLeftBadge variant="pricing" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start" role="list" aria-label="Options de tarification">
          {PRICING_OFFERS.map((offer) => {
            const icon = offerIcons[offer.name] || '✨'
            const description = offerDescriptions[offer.name] || offer.duration
            
            return (
              <article
                key={offer.id}
                className={`group relative bg-white rounded-2xl shadow-xl p-6 lg:p-8 transition-all duration-300 focus-within:shadow-2xl ${
                  offer.featured 
                    ? 'border-2 border-primary-600 transform scale-105 bg-gradient-to-br from-white to-primary-50/30 focus-within:border-primary-700' 
                    : 'border border-gray-200 focus-within:border-primary-300'
                } flex flex-col`}
                role="listitem"
                aria-labelledby={`offer-${offer.id}-name`}
                aria-describedby={`offer-${offer.id}-description`}
              >
                {/* Badge */}
                {offer.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span 
                      className={`text-white text-sm font-semibold px-6 py-2 rounded-full whitespace-nowrap shadow-lg transition-all duration-300 ${
                        offer.featured 
                          ? 'bg-gradient-to-r from-primary-600 to-secondary-600 group-focus-within:from-primary-700 group-focus-within:to-secondary-700' 
                          : 'bg-gradient-to-r from-primary-600 to-secondary-600'
                      }`}
                      role="img"
                      aria-label={`Badge: ${offer.badge}`}
                    >
                      {offer.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="text-center mb-4">
                  <div 
                    className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl shadow-lg transition-all duration-300 ${
                      offer.featured 
                        ? 'bg-gradient-to-br from-primary-100 to-secondary-100 group-focus-within:from-primary-200 group-focus-within:to-secondary-200 group-focus-within:shadow-xl' 
                        : 'bg-gradient-to-br from-primary-100 to-secondary-100 group-focus-within:shadow-xl'
                    }`}
                    role="img"
                    aria-label={`Icône de l'offre ${offer.name}`}
                  >
                    <span aria-hidden="true">{icon}</span>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-4">
                  <h3 id={`offer-${offer.id}-name`} className="text-2xl font-bold text-gray-900 mb-3 group-focus-within:text-primary-600 transition-colors duration-300">
                    {offer.name}
                  </h3>
                  <div className="mb-3">
                    <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent" aria-label={`Prix: ${offer.price} euros`}>
                      {offer.price}€
                    </span>
                  </div>
                  <p id={`offer-${offer.id}-description`} className="text-gray-600 text-sm leading-relaxed mx-auto">{description}</p>
                </div>

                {/* Features */}
                <div className="mb-4" role="list" aria-label={`Caractéristiques de l'offre ${offer.name}`}>
                  {offer.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3 mb-2" role="listitem">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#00D26A"
                        className="flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span className="text-gray-700 text-sm lg:text-base leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Bonus */}
                {offer.bonus && (
                  <div 
                    className={`border rounded-xl p-4 mb-4 shadow-sm transition-all duration-300 ${
                      offer.featured 
                        ? 'bg-gradient-to-r from-yellow-50 to-warning-50 border-yellow-200 group-focus-within:from-yellow-100 group-focus-within:to-warning-100 group-focus-within:border-yellow-300' 
                        : 'bg-gradient-to-r from-yellow-50 to-warning-50 border-yellow-200'
                    }`}
                    role="region"
                    aria-labelledby={`bonus-${offer.id}`}
                  >
                    <p className="text-yellow-800 font-medium text-sm flex items-center gap-2">
                      <span role="img" aria-label="Cadeau">🎁</span> 
                      <span id={`bonus-${offer.id}`} className="font-bold">BONUS:</span> {offer.bonus}
                    </p>
                  </div>
                )}

                {/* CTA */}
                <Link
                  href={offer.ctaLink}
                  className={`block w-full text-center font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[44px] ${
                    offer.featured
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:from-primary-700 focus:to-secondary-700 text-white'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-primary-100 hover:to-secondary-100 focus:from-primary-100 focus:to-secondary-100 text-gray-900 hover:text-primary-700 focus:text-primary-700'
                  }`}
                  aria-label={`${offer.ctaText} pour l'offre ${offer.name} à ${offer.price} euros`}
                >
                  {offer.ctaText}
                </Link>
              </article>
            )
          })}
        </div>

        {/* Enhanced Payment Info */}
        <div className="text-center mt-8 lg:mt-12 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="inline-flex items-center justify-center space-x-4 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-2xl px-8 py-4 shadow-lg">
            <p className="text-neutral-600 font-medium">
              💳 Paiement sécurisé via PayPal | 🛡️ Garantie satisfait ou remboursé 30 jours
            </p>
          </div>
        </div>
      </div>
      
    </section>
  )
}