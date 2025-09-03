import Image from 'next/image'
import { TESTIMONIALS, STATS } from '@/lib/constants'

export default function Testimonials() {
  return (
    <section id="temoignages" className="relative py-16 lg:py-24 bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
      {/* Simple gradient transition */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-primary-50/80 to-transparent"></div>
      
      <div className="container relative z-10 px-6 sm:px-8">
        <div className="text-center mb-12 lg:mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 mb-4 break-words">
            Témoignages authentiques de nos clients
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 font-medium max-w-3xl mx-auto break-words">
            Des résultats concrets avec la méthode S.C.E.N.E. : <span className="text-primary-600 font-bold">plus de deals</span>, 
            <span className="text-secondary-600 font-bold"> plus de confiance</span>, plus de succès
          </p>
        </div>

        {/* Premium Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {TESTIMONIALS.map((testimonial, index) => (
            <article key={testimonial.id} className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg focus-within:shadow-xl transition-shadow duration-300 border border-neutral-100 focus-within:border-primary-200 animate-fade-in-up group" style={{animationDelay: `${index * 0.1}s`}} role="article" aria-labelledby={`testimonial-${testimonial.id}-name`}>
              <div className="flex items-center mb-4">
                {testimonial.image ? (
                  <Image
                    src={testimonial.image}
                    alt={`Photo de ${testimonial.name}`}
                    width={56}
                    height={56}
                    className="rounded-full ring-2 ring-primary-200 group-focus-within:ring-primary-300 transition-colors duration-300 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-600 to-secondary-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg shadow-lg flex-shrink-0" aria-hidden="true">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div className="ml-3 sm:ml-4 min-w-0">
                  <h4 id={`testimonial-${testimonial.id}-name`} className="font-bold text-neutral-900 text-base sm:text-lg group-focus-within:text-primary-600 transition-colors duration-300 break-words">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-600 leading-tight font-medium break-words">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
              
              <div className="flex mb-4" role="img" aria-label={`Note: ${testimonial.rating} étoiles sur 5`}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-warning-400 text-lg sm:text-xl" aria-hidden="true">★</span>
                ))}
              </div>
              
              <blockquote className="text-neutral-700 mb-4 italic text-sm lg:text-base leading-relaxed group-focus-within:text-neutral-800 transition-colors duration-300 break-words">
                "{testimonial.text}"
              </blockquote>
              
              <div className="bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-xl p-3 focus-within:shadow-md transition-shadow duration-300">
                <p className="text-success-800 font-semibold text-sm flex items-center gap-2 break-words">
                  <span role="img" aria-label="Argent" className="flex-shrink-0">💰</span> {testimonial.result}
                </p>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
            </article>
          ))}
        </div>


        {/* Premium Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 text-center max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-neutral-200 focus-within:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{animationDelay: '0.4s'}} role="img" aria-labelledby="stat-1">
            <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              {STATS.clientsTransformed}
            </div>
            <div id="stat-1" className="text-sm lg:text-base text-neutral-600 font-medium">
              Entrepreneurs transformés
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-neutral-200 focus-within:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{animationDelay: '0.5s'}} role="img" aria-labelledby="stat-2">
            <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              {STATS.averageClosingIncrease}
            </div>
            <div id="stat-2" className="text-sm lg:text-base text-neutral-600 font-medium">
              Taux de closing moyen
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple gradient transition */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-b from-transparent to-primary-50/80"></div>
    </section>
  )
}