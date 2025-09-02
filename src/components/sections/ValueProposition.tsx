import { VALUE_PROPOSITIONS, SCARCITY } from '@/lib/constants'

export default function ValueProposition() {
  return (
    <section id="value-proposition" className="relative py-16 lg:py-24 bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
      {/* Wave transition top */}
      <div className="absolute top-0 left-0 w-full">
        <svg className="w-full h-12 lg:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,120V73.71C47.79,94.87,95.58,106.55,163.36,106.55C228.21,106.55,276,94.87,344.78,73.71C413.57,52.55,461.35,40.87,530.14,40.87C598.92,40.87,646.71,52.55,715.49,73.71C784.28,94.87,832.06,106.55,900.85,106.55C968.63,106.55,1016.42,94.87,1085.2,73.71C1154,52.55,1201.76,40.87,1235.65,40.87L1200,0L0,0Z" fill="white"></path>
        </svg>
      </div>
      
      {/* Wave transition bottom */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-12 lg:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29C47.79,25.13,95.58,13.45,163.36,13.45C228.21,13.45,276,25.13,344.78,46.29C413.57,67.45,461.35,79.13,530.14,79.13C598.92,79.13,646.71,67.45,715.49,46.29C784.28,25.13,832.06,13.45,900.85,13.45C968.63,13.45,1016.42,25.13,1085.2,46.29C1154,67.45,1201.76,79.13,1235.65,79.13L1200,120L0,120Z" fill="white"></path>
        </svg>
      </div>
      
      <div className="container relative z-10">
        {/* Main Title */}
        <div className="text-center mb-12 lg:mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 mb-4">
            Transformez vos présentations en{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">moment d'exception</span>
          </h2>
        </div>

        {/* Enhanced Value Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {VALUE_PROPOSITIONS.map((value, index) => (
            <div
              key={value.id}
              className="text-center p-6 lg:p-8 bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-2xl hover:shadow-xl hover:bg-white/90 hover:border-primary-200 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up group"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="text-4xl lg:text-5xl mb-4 group-hover:animate-bounce-subtle transition-all duration-300">{value.icon}</div>
              <h3 className="text-lg lg:text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                {value.title}
              </h3>
              <p className="text-sm lg:text-base text-neutral-600 leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
                {value.description}
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Premium Scarcity Box */}
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="bg-gradient-to-r from-warning-50 via-secondary-50 to-warning-50 border-2 border-warning-200/50 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-pulse-soft">
            <p className="text-lg lg:text-xl font-bold text-neutral-900 mb-2">
              ⚡ {SCARCITY.exclusiveMethod}
            </p>
            <p className="text-neutral-700 font-medium">
              Rejoignez les dirigeants qui marquent leur audience
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}