import { useImageRotation } from '@/hooks/useImageRotation'

export default function About() {
  const portraitImages = [
    '/images/coach/leo-barcet-about.jpg',
    '/images/coach/45195561_2223706534579537_7984128033265025024_n.webp',
    '/images/WebP/17492489_1343341509084079_1523800150050046569_o.webp',
    '/images/WebP/IMG_20190307_183033_Bokeh.webp'
  ]

  const { currentIndex, extendedImages, isTransitioning } = useImageRotation({
    images: portraitImages,
    interval: 7000,
    autoStart: true
  })

  const credentials = [
    'Seul coach comédien professionnel du marché',
    'Maîtrise des techniques d\'accompagnement',
    '5 ans de coaching spécialisé',
    '400+ personnes accompagnées'
  ]

  const expertises = [
    {
      icon: '🎭',
      title: 'L\'art du comédien',
      description: 'La maîtrise du rythme et des silences, les techniques de projection de la voix, le contrôle du langage corporel'
    },
    {
      icon: '🎪',
      title: 'L\'expertise du metteur en Scène',
      description: 'La captation immédiate de l\'attention, la construction d\'une narration impactante, l\'art de créer des moments mémorables'
    },
    {
      icon: '✍️',
      title: 'Le savoir-faire du dramaturge',
      description: 'L\'écriture pensée pour l\'oral, les mots qui résonnent et touchent, la structure qui embarque le public'
    },
    {
      icon: '🎯',
      title: 'L\'empathie du pédagogue',
      description: 'L\'adaptation au niveau de chaque apprenant, la transmission claire et bienveillante, l\'accompagnement personnalisé'
    }
  ]

  return (
    <section 
      id="about" 
      className="relative py-16 lg:py-24 bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden"
      role="main"
      aria-labelledby="about-title"
      aria-describedby="about-description"
    >
      {/* Simple gradient transition */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-primary-50/80 to-transparent"></div>
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <div className="relative">
              {/* Professional photo */}
              <div className="relative bg-gradient-light rounded-3xl p-6 shadow-2xl border border-neutral-200/50 mx-auto lg:mx-0 max-w-md">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden relative">
                  <div 
                    className={`flex h-full ${isTransitioning ? 'transition-none' : 'transition-transform duration-1000 ease-in-out'}`}
                    style={{ 
                      transform: `translateX(-${currentIndex * (100 / extendedImages.length)}%)`,
                      width: `${extendedImages.length * 100}%`
                    }}
                  >
                    {extendedImages.map((image, index) => (
                      <div 
                        key={index}
                        className="flex-shrink-0 h-full"
                        style={{ width: `${100 / extendedImages.length}%` }}
                      >
                        <img 
                          src={image}
                          alt={`Photo professionnelle de Léo Barcet, ${index + 1} sur ${extendedImages.length}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/images/coach/fallback.svg"
                            e.currentTarget.className = "w-full h-full object-contain p-8"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-semibold text-lg mb-1">Léo Barcet</p>
                    <p className="text-sm opacity-90">Formé aux Cours Florent</p>
                    <p className="text-sm opacity-90">& Sorbonne Nouvelle</p>
                  </div>
                </div>
                
                {/* Floating badges */}
                <div 
                  className="absolute -top-3 -right-3 bg-white rounded-full p-3 shadow-lg"
                  role="img"
                  aria-label="Badge d'excellence"
                >
                  <div className="text-2xl" aria-hidden="true">🏆</div>
                </div>
                <div 
                  className="absolute -bottom-3 -left-3 gradient-primary text-white rounded-full p-3 shadow-lg"
                  role="img"
                  aria-label="Plus de 5 ans d'expérience"
                >
                  <div className="text-sm font-bold" aria-hidden="true">5+</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h2 id="about-title" className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Pourquoi me faire confiance?
            </h2>
            <h3 id="about-description" className="text-xl lg:text-2xl text-gradient-primary font-semibold mb-6">
              Léo Barcet - Le comédien-coach qui révèle votre potentiel oratoire
            </h3>

            {/* Enhanced Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" role="list" aria-label="Qualifications professionnelles">
              {credentials.map((credential, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-neutral-100 focus-within:shadow-md transition-shadow duration-300 animate-fade-in-up" 
                  style={{animationDelay: `${index * 0.1}s`}}
                  role="listitem"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#F59E0B"
                    className="flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M12 2L9.19 8.63L2 9.24l5.19 4.73L5.82 21L12 17.27L18.18 21l-1.37-7.03L22 9.24l-7.19-.61L12 2z"/>
                  </svg>
                  <span className="text-neutral-700 font-medium">{credential}</span>
                </div>
              ))}
            </div>

            <p className="text-neutral-700 text-lg leading-relaxed mb-6">
              Je ne suis pas un consultant en communication classique. Je suis un <strong>artiste qui maîtrise les techniques d'accompagnement</strong>. 
              Mon regard de <strong>comédien et metteur en scène</strong>, couplé à mes compétences de <strong>coach à l'écoute</strong>, 
              vous offre une approche unique pour transformer votre prise de parole.
            </p>

            {/* Enhanced Guarantee Box */}
            <div 
              className="bg-gradient-subtle border-2 border-primary-200/50 rounded-2xl p-6 focus-within:shadow-lg transition-shadow duration-300 animate-fade-in-up" 
              style={{animationDelay: '0.4s'}}
              role="region"
              aria-labelledby="guarantee-title"
            >
              <h4 id="guarantee-title" className="font-bold text-neutral-900 mb-2">Ma garantie personnelle</h4>
              <p className="text-neutral-700">
                Si vous n'êtes pas 100% satisfait après 30 jours, je vous rembourse intégralement. 
                C'est mon engagement.
              </p>
            </div>
          </div>
        </div>

        {/* Four Expertises Section */}
        <div className="mt-16 lg:mt-24" role="region" aria-labelledby="expertises-title">
          <div className="text-center mb-12">
            <h3 id="expertises-title" className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Quatre expertises en une
            </h3>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Une approche unique qui combine l'art théâtral et les techniques de coaching pour des résultats exceptionnels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8" role="list" aria-label="Liste des expertises">
            {expertises.map((expertise, index) => (
              <article 
                key={index} 
                className="group relative bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-2xl p-6 lg:p-8 focus-within:shadow-xl transition-shadow duration-300 animate-fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
                role="listitem"
                aria-labelledby={`expertise-${index}-title`}
                aria-describedby={`expertise-${index}-desc`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-secondary-50/30 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl lg:text-5xl" role="img" aria-label={`Icône ${expertise.title}`}>{expertise.icon}</div>
                    <h4 id={`expertise-${index}-title`} className="text-xl lg:text-2xl font-bold text-neutral-900 group-focus-within:text-primary-600 transition-colors duration-300">
                      {expertise.title}
                    </h4>
                  </div>
                  <p id={`expertise-${index}-desc`} className="text-neutral-700 leading-relaxed">
                    {expertise.description}
                  </p>
                </div>

                {/* Decorative element */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary-400 rounded-full opacity-20 group-focus-within:opacity-60 transition-opacity duration-300" aria-hidden="true"></div>
              </article>
            ))}
          </div>
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