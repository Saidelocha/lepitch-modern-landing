import { CONSEQUENCES_OF_INACTION, INACTION_STATS, CONTACT } from '@/lib/constants'

export default function ConsequencesOfInaction() {
  return (
    <section className="relative py-12 lg:py-16 bg-white overflow-hidden">
      <div className="container relative z-10">
        {/* Main container card */}
        <div className="bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 rounded-3xl shadow-xl border border-neutral-100 p-8 lg:p-12 mx-4 lg:mx-8">
        {/* Header with impact */}
        <div className="text-center mb-10 lg:mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">⚠️</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 mb-6">
            Le coût <span className="bg-gradient-to-r from-danger-600 to-danger-700 bg-clip-text text-transparent">RÉEL</span> de l'inaction
          </h2>
          
          <p className="text-xl text-neutral-600 font-medium max-w-3xl mx-auto mb-8">
            Pendant que vous hésitez, voici ce qui se passe <span className="text-danger-600 font-bold">réellement</span> dans votre business
          </p>

          {/* Urgency Counter */}
          <div className="bg-gradient-to-r from-danger-700 to-danger-800 text-white p-6 rounded-2xl max-w-2xl mx-auto shadow-xl border border-danger-200">
            <p className="text-lg font-bold mb-2">
              💸 Coût estimé de l'attente par mois :
            </p>
            <div className="text-3xl lg:text-4xl font-bold">
              {INACTION_STATS.dealsLostPerMonth} deals × {INACTION_STATS.averageDealLost} = <span className="text-danger-400">175K€ perdus</span>
            </div>
          </div>
        </div>

        {/* Consequences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {CONSEQUENCES_OF_INACTION.map((consequence, index) => (
            <div 
              key={consequence.id} 
              className="bg-white/95 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-500 border border-neutral-100 hover:border-danger-200 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up group"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Warning indicator */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-danger-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                !
              </div>
              
              <div className="mb-6">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {consequence.icon}
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                  {consequence.title}
                </h3>
                <p className="text-neutral-700 text-base leading-relaxed mb-4 group-hover:text-neutral-800 transition-colors duration-300">
                  {consequence.description}
                </p>
              </div>

              {/* Impact metrics */}
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-danger-50 to-danger-100 border border-danger-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-danger-700">Impact:</span>
                    <span className="text-sm font-bold text-danger-800">{consequence.impact}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-neutral-700">Délai:</span>
                    <span className="text-sm font-bold text-neutral-800">{consequence.timeframe}</span>
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Timeline visualization */}
        <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-lg border border-neutral-200 hover:shadow-xl transition-all duration-500 mb-10">
          <h3 className="text-2xl lg:text-3xl font-bold text-center text-neutral-900 mb-8">
            Que se passe-t-il si vous attendez ?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-warning-400 to-warning-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                1M
              </div>
              <h4 className="font-bold text-lg text-neutral-900 mb-2">Dans 1 mois</h4>
              <p className="text-neutral-600 text-sm">3-5 deals perdus, confiance en baisse, concurrents qui avancent</p>
            </div>
            
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-danger-400 to-danger-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                6M
              </div>
              <h4 className="font-bold text-lg text-neutral-900 mb-2">Dans 6 mois</h4>
              <p className="text-neutral-600 text-sm">300K€+ perdus, paralysie totale, réputation endommagée</p>
            </div>
            
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-danger-500 to-danger-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                1A
              </div>
              <h4 className="font-bold text-lg text-neutral-900 mb-2">Dans 1 an</h4>
              <p className="text-neutral-600 text-sm">Business en déclin, stress chronique, opportunités définitivement perdues</p>
            </div>
          </div>
        </div>

        {/* Solution redirect */}
        <div className="text-center bg-gradient-to-r from-primary-50 to-primary-100 p-8 rounded-2xl border border-primary-200 shadow-lg hover:shadow-xl transition-all duration-500">
          <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-4">
            🛡️ Il est encore temps d'éviter ce scénario
          </h3>
          <p className="text-xl text-neutral-600 mb-6 max-w-2xl mx-auto font-medium">
            L'inaction a un coût réel et mesurable. Mais vous avez le pouvoir de <span className="text-primary-600 font-bold">changer la donne maintenant</span>.
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center">
            <a 
              href={CONTACT.bookingUrl}
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg ring-4 ring-primary-100 hover:ring-primary-200"
            >
              <span className="mr-2">🚀</span>
              <span>Je réserve mon audit stratégique</span>
            </a>
            <div className="text-sm text-neutral-600 font-medium text-center">
              Premier audit dès demain • Résultats en 30 jours
            </div>
          </div>
        </div>
        </div>
      </div>
      
      {/* Simple gradient transition */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-b from-transparent to-white/80"></div>
    </section>
  )
}