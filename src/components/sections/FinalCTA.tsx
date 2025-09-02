import Link from 'next/link'
import { CONTACT } from '@/lib/constants'
import SpotsLeftBadge from '@/components/ui/SpotsLeftBadge'

export default function FinalCTA() {
  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
      {/* Wave transition top */}
      <div className="absolute top-0 left-0 w-full">
        <svg className="w-full h-12 lg:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,120V73.71C47.79,94.87,95.58,106.55,163.36,106.55C228.21,106.55,276,94.87,344.78,73.71C413.57,52.55,461.35,40.87,530.14,40.87C598.92,40.87,646.71,52.55,715.49,73.71C784.28,94.87,832.06,106.55,900.85,106.55C968.63,106.55,1016.42,94.87,1085.2,73.71C1154,52.55,1201.76,40.87,1235.65,40.87L1200,0L0,0Z" fill="white"></path>
        </svg>
      </div>
      
      <div className="container text-center relative z-10">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 text-neutral-900">
          Prêt à transformer votre business avec le <span className="text-gradient-primary">pitch parfait</span>?
        </h2>
        
        <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-neutral-700">
          Ne laissez plus jamais un mauvais pitch vous coûter un deal.<br/>
          Rejoignez les 500+ entrepreneurs qui closent avec confiance.
        </p>

        <div className="mb-8">
          <SpotsLeftBadge variant="pricing" />
        </div>

        <div className="mb-8">
          <Link
            href={CONTACT.bookingUrl}
            className="inline-block gradient-cta hover:gradient-cta-hover focus:gradient-cta-hover text-white font-bold py-5 px-12 rounded-2xl text-xl transition-all duration-300 shadow-2xl hover:shadow-3xl focus:shadow-3xl ring-primary-glow focus:outline-none"
            aria-label="Réserver votre séance de coaching gratuite maintenant"
          >
            Réservez votre séance GRATUITE maintenant
          </Link>
        </div>

        <div className="flex items-center justify-center space-x-3 text-lg text-neutral-700">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#00D26A"
            className="flex-shrink-0"
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          <span>Garantie satisfait ou remboursé 30 jours - Zéro risque</span>
        </div>
      </div>
      
      {/* Wave transition bottom */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-12 lg:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29C47.79,25.13,95.58,13.45,163.36,13.45C228.21,13.45,276,25.13,344.78,46.29C413.57,67.45,461.35,79.13,530.14,79.13C598.92,79.13,646.71,67.45,715.49,46.29C784.28,25.13,832.06,13.45,900.85,13.45C968.63,13.45,1016.42,25.13,1085.2,46.29C1154,67.45,1201.76,79.13,1235.65,79.13L1200,120L0,120Z" fill="white"></path>
        </svg>
      </div>
    </section>
  )
}