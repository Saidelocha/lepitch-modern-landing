import Link from 'next/link'
import { CONTACT } from '@/lib/constants'

export default function ProblemSolution() {
  const problems = [
    {
      text: 'Perdre des opportunités à cause d\'un pitch mal structuré',
      emotion: 'Votre cœur s\'emballe, vous commencez à trembler...'
    },
    {
      text: 'Voir vos concurrents décrocher les deals que vous méritez',
      emotion: 'Vous rougissez puis, penaud, vous vous excusez...'
    },
    {
      text: 'Jeter votre charisme à l\'eau en 3 secondes',
      emotion: 'Vos mots s\'éparpillent, vous ne savez plus quoi dire...'
    },
    {
      text: 'Entrer dans un cercle vicieux de souffrances psychologiques',
      emotion: 'Cela détruit votre confiance en vous-même...'
    }
  ]

  const solutions = [
    {
      text: 'Captiver votre audience dès les 7 premières secondes',
      benefit: 'Impact immédiat garanti'
    },
    {
      text: 'Closer 40% de deals en plus chaque mois',
      benefit: 'ROI mesurable et concret'
    },
    {
      text: 'Maîtriser votre stress et rayonner de confiance',
      benefit: 'Transformation personnelle'
    },
    {
      text: 'Créer une représentation vertueuse qui attire le succès',
      benefit: 'Cercle vertueux permanent'
    }
  ]

  return (
    <section id="problem-solution" className="relative py-16 lg:py-24 bg-white overflow-hidden">
      
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Le moment de vérité : <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Subir ou Agir ?</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-medium">
            Vous avez le choix : continuer à vivre cette frustration ou transformer 
            définitivement votre rapport à la prise de parole.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:items-stretch">
          {/* Problems */}
          <div className="bg-gradient-to-br from-danger-50 to-danger-100 p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border-l-4 border-danger-500 h-full flex flex-col animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
              Vous en avez marre de...
            </h3>
            <p className="text-danger-600 font-medium mb-6 italic">
              "Cette situation humiliante qui se répète encore et encore"
            </p>
            <ul className="space-y-3 flex-grow">
              {problems.slice(0, 3).map((problem, index) => (
                <li key={index} className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-danger-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102 animate-fade-in-up" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                  <div className="flex items-start space-x-3 mb-2">
                    <span className="text-danger-500 text-lg flex-shrink-0 mt-1">❌</span>
                    <span className="text-neutral-900 font-semibold text-sm lg:text-base leading-tight">{problem.text}</span>
                  </div>
                  <p className="text-xs lg:text-sm text-danger-600 italic ml-8 leading-relaxed">
                    {problem.emotion}
                  </p>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 p-4 bg-danger-50 rounded-xl border border-danger-200 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <p className="text-danger-800 font-semibold text-center">
                💔 Combien d'opportunités allez-vous encore perdre ?
              </p>
            </div>
          </div>

          {/* Solutions */}
          <div className="bg-gradient-to-br from-success-50 to-success-100 p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border-l-4 border-success-500 h-full flex flex-col animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
              Imaginez plutôt...
            </h3>
            <p className="text-success-600 font-medium mb-6 italic">
              "Être fier de vous, rayonner de confiance"
            </p>
            <ul className="space-y-3 flex-grow">
              {solutions.slice(0, 3).map((solution, index) => (
                <li key={index} className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-success-400 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102 animate-fade-in-up" style={{animationDelay: `${0.5 + index * 0.1}s`}}>
                  <div className="flex items-start space-x-3 mb-2">
                    <span className="text-success-500 text-lg flex-shrink-0 mt-1">✅</span>
                    <span className="font-semibold text-neutral-900 text-sm lg:text-base leading-tight">{solution.text}</span>
                  </div>
                  <p className="text-xs lg:text-sm text-success-600 font-medium ml-8 leading-relaxed">
                    {solution.benefit}
                  </p>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 p-4 bg-success-50 rounded-xl border border-success-200 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <p className="text-success-800 font-semibold text-center">
                🚀 Ensemble, nous pouvons faire de grandes choses !
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Action Section */}
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up" style={{animationDelay: '0.9s'}}>
          <div className="bg-gradient-to-r from-warning-50 via-secondary-50 to-warning-50 border-2 border-warning-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500">
            <h4 className="text-2xl font-bold text-neutral-900 mb-4">
              La différence ? <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Un vrai professionnel</span>
            </h4>
            <p className="text-lg text-neutral-700 mb-6">
              Vous avez besoin d'être accompagné par quelqu'un dont le métier est celui de l'art de dire, 
              de représenter, de transmettre des émotions et des messages.
            </p>
            <p className="text-neutral-600 mb-6">
              <strong>Ce n'est pas inné, cela s'apprend !</strong> Tout comme on ne devient pas joueur de tennis 
              professionnel sans un bon coach.
            </p>
            <Link
              href={CONTACT.bookingUrl}
              className="group relative inline-block bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 hover:from-primary-700 hover:via-primary-800 hover:to-secondary-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl ring-2 ring-primary-200/50 hover:ring-primary-300/60 animate-pulse-glow"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                ⚡ Stop à cette frustration ! Agissez maintenant
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-2 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </Link>
            
          </div>
        </div>
      </div>
    </section>
  )
}