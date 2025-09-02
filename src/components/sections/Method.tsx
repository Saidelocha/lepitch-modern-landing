import { METHOD_STEPS } from '@/lib/constants'
import Image from 'next/image'

export default function Method() {
  const methodImages: Record<string, string> = {
    'S': '/images/modules/Module3.webp', // Structure
    'C': '/images/modules/Module2.webp', // Charisme
    'E': '/images/modules/Module8.png', // Émotion
    'N': '/images/modules/Module4.webp', // Naturel
    'Efficacité': '/images/modules/Module5-2.jpeg'  // Efficacité (5ème étape)
  }

  const pillars = [
    {
      image: '/images/WebP/24059333_10214717046581939_7407227478473215458_o.webp',
      title: 'Techniques de respiration Metge-Sandra',
      description: 'pour gérer le stress'
    },
    {
      image: '/images/WebP/IMG_20190501_212804.webp',
      title: 'Méthode Meisner',
      description: 'pour une authenticité naturelle'
    },
    {
      image: '/images/WebP/IMG_20201001_192111.webp',
      title: 'Technique Actorpitch™',
      description: 'pour une diction et un corps fluide'
    },
    {
      image: '/images/WebP/LESOLEILNESTPASUNEBOULE-16.webp',
      title: 'Storytelling TEDx',
      description: 'et dramaturgie théâtrale'
    },
    {
      image: '/images/coach/45195561_2223706534579537_7984128033265025024_n.webp',
      title: 'Psychologie cognitive',
      description: 'stratégie d\'adaptation et gestion émotionnelle'
    }
  ]
  return (
    <section id="methode" className="relative py-16 lg:py-24 bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
      {/* Wave transition top */}
      <div className="absolute top-0 left-0 w-full">
        <svg className="w-full h-12 lg:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,120V73.71C47.79,94.87,95.58,106.55,163.36,106.55C228.21,106.55,276,94.87,344.78,73.71C413.57,52.55,461.35,40.87,530.14,40.87C598.92,40.87,646.71,52.55,715.49,73.71C784.28,94.87,832.06,106.55,900.85,106.55C968.63,106.55,1016.42,94.87,1085.2,73.71C1154,52.55,1201.76,40.87,1235.65,40.87L1200,0L0,0Z" fill="white"></path>
        </svg>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-12 lg:mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 mb-4">
            La Méthode <span className="text-gradient-primary">S.C.E.N.E.</span> - Votre arme secrète
          </h2>
          <p className="text-xl text-neutral-600 font-medium">
            Stratégie de Communication Émotionnelle Naturelle et Efficace
          </p>
        </div>

        {/* S.C.E.N.E. Letters Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 mb-16">
          {METHOD_STEPS.map((step, index) => {
            // Map each step to its specific image
            const imageMapping: Record<number, string> = {
              0: 'S', // Structure
              1: 'C', // Charisme  
              2: 'E', // Émotion
              3: 'N', // Naturel
              4: 'Efficacité' // Efficacité
            }
            const key = imageMapping[index] || 'C'
            const imageSrc = methodImages[key] || '/images/modules/Module1.webp'
            
            return (
              <div key={step.id} className="text-center group animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}} role="article" aria-labelledby={`method-${step.id}-title`} aria-describedby={`method-${step.id}-desc`}>
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-white rounded-2xl mx-auto shadow-lg focus-within:shadow-xl transition-shadow duration-300 overflow-hidden relative">
                    <Image
                      src={imageSrc}
                      alt={`Icône ${step.title}`}
                      fill
                      className={`object-cover rounded-2xl ${key === 'N' ? 'object-top' : 'object-center'}`}
                      sizes="(min-width: 1024px) 128px, (min-width: 768px) 112px, 96px"
                      quality={100}
                      priority={index < 2}
                    />
                    <div className="absolute bottom-1 right-1 bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg" aria-label={`Étape ${step.number}`}>
                      {step.number}
                    </div>
                  </div>
                </div>
                <h3 id={`method-${step.id}-title`} className="text-xl font-bold text-neutral-900 mb-3 group-focus-within:text-primary-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p id={`method-${step.id}-desc`} className="text-neutral-600 text-sm lg:text-base leading-relaxed group-focus-within:text-neutral-700 transition-colors duration-300">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* 5 Pillars Section */}
        <div className="mt-16 lg:mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-4">
              Cette méthode unique se base sur <span className="text-primary-600">5 piliers</span>
            </h3>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Basée sur 15 ans d'expérience comme acteur, metteur en scène et professeur de théâtre
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Première rangée - 3 éléments */}
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              {pillars.slice(0, 3).map((pillar, index) => (
                <article 
                  key={index}
                  className="group relative bg-white/70 backdrop-blur-sm border border-neutral-200/50 rounded-2xl p-6 focus-within:shadow-xl transition-shadow duration-300 animate-fade-in-up w-full sm:w-80 lg:w-72"
                  style={{animationDelay: `${index * 0.1}s`}}
                  role="article"
                  aria-labelledby={`pillar-${index}-title`}
                >
                  <div className="absolute inset-0 bg-gradient-subtle rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden bg-white shadow-md">
                      <Image
                        src={pillar.image}
                        alt={`Icône ${pillar.title}`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 96px, (min-width: 768px) 80px, 64px"
                        quality={95}
                        priority={index < 2}
                      />
                    </div>
                    <h4 id={`pillar-${index}-title`} className="text-lg font-bold text-neutral-900 mb-2 group-focus-within:text-primary-600 transition-colors duration-300">
                      {pillar.title}
                    </h4>
                    <p className="text-neutral-600 text-sm">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Arrow pointer */}
                  <div className="absolute top-4 right-4 text-primary-300 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" aria-hidden="true">
                    👉
                  </div>
                </article>
              ))}
            </div>

            {/* Deuxième rangée - 2 éléments centrés */}
            <div className="flex flex-wrap justify-center gap-6">
              {pillars.slice(3).map((pillar, index) => (
                <article 
                  key={index + 3}
                  className="group relative bg-white/70 backdrop-blur-sm border border-neutral-200/50 rounded-2xl p-6 focus-within:shadow-xl transition-shadow duration-300 animate-fade-in-up w-full sm:w-80 lg:w-72"
                  style={{animationDelay: `${(index + 3) * 0.1}s`}}
                  role="article"
                  aria-labelledby={`pillar-${index + 3}-title`}
                >
                  <div className="absolute inset-0 bg-gradient-subtle rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden bg-white shadow-md">
                      <Image
                        src={pillar.image}
                        alt={`Icône ${pillar.title}`}
                        fill
                        className={`object-cover ${pillar.title === 'Psychologie cognitive' ? 'object-left-bottom' : 'object-center'}`}
                        style={pillar.title === 'Psychologie cognitive' ? { objectPosition: '80% 20%' } : {}}
                        sizes="(min-width: 1024px) 96px, (min-width: 768px) 80px, 64px"
                        quality={95}
                        priority={index < 2}
                      />
                    </div>
                    <h4 id={`pillar-${index + 3}-title`} className="text-lg font-bold text-neutral-900 mb-2 group-focus-within:text-primary-600 transition-colors duration-300">
                      {pillar.title}
                    </h4>
                    <p className="text-neutral-600 text-sm">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Arrow pointer */}
                  <div className="absolute top-4 right-4 text-primary-300 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" aria-hidden="true">
                    👉
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple gradient transition */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-b from-transparent to-primary-50/80"></div>
    </section>
  )
}