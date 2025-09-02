import Link from 'next/link'
import { CONTACT } from '@/lib/constants'

export default function Identification() {
  return (
    <section id="identification" className="py-16 lg:py-24 bg-white">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Opening Hook */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Il y a 2 types d'entrepreneurs : 
              <span className="text-primary-600"> ceux qui nous marquent</span> et ceux qu'on oublie !
            </h2>
            <p className="text-xl text-gray-600 font-semibold">
              On n'a jamais deux occasions de faire bonne impression !
            </p>
          </div>

          {/* Main Story */}
          <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12 mb-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed text-gray-700 mb-6">
                Vous avez <strong className="text-primary-600">une idée géniale</strong> et vous devez la présenter, 
                obtenir un rendez-vous, convaincre quelqu'un d'important de vous faire confiance, 
                de vous suivre dans votre projet ! 
              </p>
              
              <p className="text-lg leading-relaxed text-gray-700 mb-6">
                Mais voilà, <strong className="text-red-600">prendre la parole pour vous c'est compliqué</strong>. 
                Vous vous préparez autant que possible, vous faites, pensez-vous, tout ce qu'il faut, 
                mais arrive le moment fatidique et malgré tout <strong>votre cœur s'emballe...</strong> 
                <span className="text-red-600 font-semibold"> vous commencez à trembler...</span>
              </p>

              <div className="bg-red-50 border-l-4 border-red-400 p-6 my-8">
                <p className="text-lg text-gray-700 italic">
                  "Vous prenez votre courage à deux mains et vous vous lancez, vous arrivez devant cette personne 
                  en vous répétant 'je vais la convaincre, je vais la convaincre'."
                </p>
              </div>

              <p className="text-lg leading-relaxed text-gray-700 mb-6">
                Malheureusement, à peine ouvrez-vous la bouche que vous avez déjà perdu. 
                Vos mots s'éparpillent, vous ne savez plus quoi dire, 
                <strong className="text-red-600"> vous rougissez</strong> puis, penaud, 
                <strong className="text-red-600"> vous commencez à vous excuser.</strong>
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 my-8">
                <p className="text-lg text-gray-800 font-semibold">
                  💡 C'est tout votre charisme, toute la confiance en vous et en votre projet 
                  que vous venez ainsi de jeter à l'eau en l'espace de trois secondes.
                </p>
              </div>
            </div>

            {/* Micro-conversion CTA */}
            <div className="text-center mt-8 p-6 bg-primary-50 rounded-lg border border-primary-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Vous vous reconnaissez ?
              </h3>
              <p className="text-gray-700 mb-4">
                Vous n'êtes pas seul. <strong>87% des entrepreneurs</strong> vivent exactement la même situation.
              </p>
              <Link
                href={CONTACT.bookingUrl}
                className="group inline-block bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  💬 Parlons de votre situation
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Enhanced Why Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500 p-6 lg:p-8 border border-neutral-100 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                Mais alors, pourquoi ?
              </h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Vous vous étiez pourtant bien préparé, non ? En tout cas, c'est ce que vous pensiez... 
                <strong>Vous y aviez mis du temps</strong>, de l'énergie, peut-être même n'en dormiez-vous plus...
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Mais <strong className="text-primary-600">que savez-vous de la prise de parole</strong>, 
                de l'écriture d'un pitch, de la persuasion ?
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 p-6 lg:p-8 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <h3 className="text-2xl font-bold mb-4">
                Les chiffres qui parlent
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-warning-300 text-xl">📊</span>
                  <div>
                    <p className="font-semibold">3 minutes 44 secondes</p>
                    <p className="text-primary-100">d'attention moyenne de votre cible</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-warning-300 text-xl">⚡</span>
                  <div>
                    <p className="font-semibold">100 millisecondes</p>
                    <p className="text-primary-100">pour former une première impression</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-warning-300 text-xl">📈</span>
                  <div>
                    <p className="font-semibold">+27% de succès</p>
                    <p className="text-primary-100">avec une narration bien structurée</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12 mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 text-center">
              Les erreurs que <span className="text-red-600">tout le monde</span> fait
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h4 className="font-bold text-red-800 mb-3">❌ Regarder des vidéos YouTube</h4>
                <p className="text-red-700 text-sm">
                  Méthodes génériques qui ne correspondent pas à votre voix, votre posture, votre rythme.
                </p>
              </div>
              
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h4 className="font-bold text-red-800 mb-3">❌ Répéter devant le miroir</h4>
                <p className="text-red-700 text-sm">
                  Le miroir déforme, ment, et renforce vos mauvaises habitudes.
                </p>
              </div>
              
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h4 className="font-bold text-red-800 mb-3">❌ Utiliser des templates</h4>
                <p className="text-red-700 text-sm">
                  En montagne, il vaut mieux un vrai guide qu'une simple carte, non ?
                </p>
              </div>
              
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h4 className="font-bold text-red-800 mb-3">❌ Demander à l'entourage</h4>
                <p className="text-red-700 text-sm">
                  C'est comme demander à une boulangère d'éteindre un feu de forêt.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h4 className="text-xl font-bold text-green-800 mb-3">
                La solution ? Un artiste-coach expérimenté !
              </h4>
              <p className="text-green-700 mb-4">
                <strong>Ce n'est pas inné, cela s'apprend !</strong> Tout comme on ne devient pas joueur de tennis 
                professionnel sans un bon coach, vous avez besoin d'un professionnel formé aux techniques d'acteur et d'accompagnement.
              </p>
              <Link
                href={CONTACT.bookingUrl}
                className="group inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  🚀 Ensemble, nous pouvons faire de grandes choses !
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Final Hook */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-8 lg:p-12">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Prêt à transformer cette frustration en succès ?
              </h3>
              <p className="text-xl mb-6 opacity-90">
                Plus jamais vous ne vivrez cette situation humiliante.
              </p>
              <Link
                href={CONTACT.bookingUrl}
                className="group inline-block bg-white hover:bg-gray-50 text-primary-600 hover:text-primary-700 font-bold py-5 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl ring-2 ring-white/50"
              >
                <span className="flex items-center justify-center gap-2">
                  🎯 Réservez votre séance GRATUITE
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}