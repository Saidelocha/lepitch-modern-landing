'use client'

import Link from 'next/link'

export default function CGV() {
  return (
    <div className="min-h-screen">
      {/* Hero Header with Background */}
      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 right-10 w-32 h-32 bg-secondary-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-32 left-10 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-1/3 w-40 h-40 bg-secondary-500/5 rounded-full blur-4xl"></div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center space-x-2 text-sm text-white/70 mb-8 animate-fade-in-down">
              <Link href="/" className="hover:text-primary-400 transition-colors">
                Accueil
              </Link>
              <span>›</span>
              <span className="text-white">CGV</span>
            </nav>
            
            {/* Header */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-secondary-500/20 text-secondary-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm-1 0a1 1 0 011-1h8a1 1 0 011 1v1H5V6zm9 1v1a1 1 0 11-2 0V7H8v1a1 1 0 11-2 0V7H5v1a1 1 0 112 0V7h6z" clipRule="evenodd" />
                </svg>
                <span>Conditions commerciales</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                <span className="bg-gradient-to-r from-secondary-400 to-primary-400 bg-clip-text text-transparent">
                  Conditions Générales
                </span>
                <br />
                <span className="text-white">de Vente</span>
              </h1>
              <p className="text-xl text-white/90 font-medium drop-shadow-md max-w-2xl mx-auto">
                Services de coaching en prise de parole • Garantie 30 jours satisfait ou remboursé
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Content Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in-up">
              {/* Highlight Banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 lg:p-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white">Garantie 30 jours satisfait ou remboursé</h2>
                    <p className="text-white/90 text-sm">Protection maximale pour votre investissement</p>
                  </div>
                </div>
              </div>
              
              {/* Table of Contents */}
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sommaire
                </h2>
                <nav className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <a href="#objet" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">1. Objet et champ d'application</a>
                  <a href="#services" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">2. Description des services</a>
                  <a href="#tarifs" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">3. Tarifs et modalités de paiement</a>
                  <a href="#commande" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">4. Commande et confirmation</a>
                  <a href="#execution" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">5. Exécution des services</a>
                  <a href="#annulation" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">6. Annulation et report</a>
                  <a href="#garantie" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">7. Garantie satisfait ou remboursé</a>
                  <a href="#propriete" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">8. Propriété intellectuelle</a>
                  <a href="#confidentialite" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">9. Confidentialité</a>
                  <a href="#responsabilite" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">10. Responsabilité</a>
                  <a href="#force-majeure" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">11. Force majeure</a>
                  <a href="#donnees" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">12. Données personnelles</a>
                  <a href="#mediation" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">13. Médiation et résolution des litiges</a>
                  <a href="#droit-applicable" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">14. Droit applicable et juridictions</a>
                  <a href="#modifications" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">15. Modifications</a>
                  <a href="#contact" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">16. Contact</a>
                </nav>
              </div>
              
              <div className="p-8 lg:p-12">
                <div className="prose prose-lg max-w-none prose-headings:text-neutral-900 prose-headings:font-semibold prose-p:text-neutral-700 prose-p:leading-relaxed">
                
                  <div id="objet" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
                      Objet et champ d'application
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700 mb-4">
                        Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre <strong className="text-primary-600">Léo Barcet</strong>, coach professionnel en prise de parole, et ses clients pour la fourniture de services de coaching, formation et accompagnement personnalisé.
                      </p>
                      <p className="text-neutral-700">
                        Ces CGV s'appliquent à tous les services proposés sur le site <strong className="text-primary-600">lepitchquilvousfaut.fr</strong> et toute commande implique l'acceptation pleine et entière de ces conditions.
                      </p>
                    </div>
                  </div>

                  <div id="services" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
                      Description des services
                    </h2>
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border-l-4 border-primary-500">
                      <p className="text-neutral-700 mb-6">
                        Les services proposés comprennent :
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/80 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-primary-600">L'ESSENTIEL</h4>
                            <span className="text-2xl font-bold text-primary-600">90€</span>
                          </div>
                          <p className="text-sm text-neutral-600">Séance de diagnostic et ébauche de structure personnalisée (55 minutes)</p>
                        </div>
                        
                        <div className="bg-white/80 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-primary-600">LE COACH</h4>
                            <span className="text-2xl font-bold text-primary-600">495€</span>
                          </div>
                          <p className="text-sm text-neutral-600">L'accompagnement intensif pour transformer votre pitch. Écriture personnalisée de votre script + 6h de coaching pour des résultats durables.</p>
                        </div>
                        
                        <div className="bg-white/80 rounded-xl p-4 backdrop-blur-sm border-2 border-secondary-200">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-secondary-600">L'ORATEUR</h4>
                              <span className="text-xs text-secondary-600 font-medium">PREMIUM</span>
                            </div>
                            <span className="text-2xl font-bold text-secondary-600">1 295€</span>
                          </div>
                          <p className="text-sm text-neutral-600">Vous voulez devenir véritablement inoubliable ? Rédaction complète de vos discours + accompagnement 7/7 pendant 3 mois pour une transformation complète.</p>
                        </div>
                      </div>
                      
                      <div className="bg-neutral-800 rounded-lg p-4 text-center">
                        <p className="text-white text-sm">
                          <strong>💻 Tous les services sont dispensés en ligne</strong> via des outils de visioconférence professionnels
                        </p>
                      </div>
                    </div>
                  </div>

                  <div id="tarifs" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">3</div>
                      Tarifs et modalités de paiement
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">3.1 Tarifs</h3>
                      <p className="text-neutral-700 mb-4">
                        Les tarifs en vigueur sont ceux indiqués sur le site au moment de la commande :
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <div className="bg-white rounded-lg p-3 text-center border border-neutral-200">
                          <div className="text-lg font-bold text-primary-600">90€</div>
                          <div className="text-xs font-medium text-neutral-700">L'ESSENTIEL</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border border-neutral-200">
                          <div className="text-lg font-bold text-primary-600">495€</div>
                          <div className="text-xs font-medium text-neutral-700">LE COACH</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border-2 border-secondary-200">
                          <div className="text-lg font-bold text-secondary-600">1 295€</div>
                          <div className="text-xs font-medium text-neutral-700">L'ORATEUR</div>
                        </div>
                      </div>
                      
                      <p className="text-neutral-700 mb-6">
                        Les prix sont exprimés en euros toutes taxes comprises (TTC). Léo Barcet se réserve le droit de modifier ses tarifs à tout moment, les nouveaux tarifs ne s'appliquant qu'aux commandes postérieures à leur mise en ligne.
                      </p>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">3.2 Modalités de paiement</h3>
                      <p className="text-neutral-700 mb-4">
                        Le paiement s'effectue intégralement au moment de la commande par :
                      </p>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm5.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM8 9a3 3 0 100-6 3 3 0 000 6zm7.5-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          </svg>
                          Carte bancaire via PayPal
                        </div>
                        <div className="bg-secondary-100 text-secondary-800 px-4 py-2 rounded-full text-sm font-medium flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                          Virement bancaire (sur demande)
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm font-medium">
                          ⚠️ Aucun service ne sera délivré sans paiement préalable intégral.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div id="commande" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">4</div>
                      Commande et confirmation
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700 mb-4">
                        La commande est confirmée par :
                      </p>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center bg-white rounded-lg p-3 border border-neutral-200">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
                          <span className="text-neutral-700">Le paiement intégral du service</span>
                        </div>
                        <div className="flex items-center bg-white rounded-lg p-3 border border-neutral-200">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
                          <span className="text-neutral-700">L'envoi d'un email de confirmation</span>
                        </div>
                        <div className="flex items-center bg-white rounded-lg p-3 border border-neutral-200">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</div>
                          <span className="text-neutral-700">La planification de la première séance</span>
                        </div>
                      </div>
                      <p className="text-neutral-700">
                        Le client recevra un email de confirmation contenant les détails de sa commande et les modalités d'accès aux services.
                      </p>
                    </div>
                  </div>

                  <div id="execution" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">5</div>
                      Exécution des services
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">5.1 Délais et modalités</h3>
                      <p className="text-neutral-700 mb-6">
                        Les services sont dispensés selon les disponibilités mutuelles, dans un délai maximum de 30 jours après confirmation de la commande. Les séances se déroulent exclusivement en ligne via des outils de visioconférence sécurisés (Google Meet de préférence).
                      </p>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">5.2 Prérequis techniques</h3>
                      <p className="text-neutral-700 mb-4">
                        Le client doit disposer :
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                          <span className="text-sm text-neutral-700">Connexion internet stable et rapide</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-neutral-700">Webcam et microphone fonctionnels</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-neutral-700">Environnement calme et sans interruption</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-neutral-700">Ordinateur ou tablette avec navigateur récent</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">5.3 Obligations du client</h3>
                      <p className="text-neutral-700 mb-4">
                        Le client s'engage à :
                      </p>
                      <div className="space-y-2 mb-6">
                        <div className="bg-white rounded-lg p-3 border border-neutral-200 flex items-center">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">✓</div>
                          <span className="text-sm text-neutral-700">Être présent et ponctuel aux séances planifiées</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-neutral-200 flex items-center">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">✓</div>
                          <span className="text-sm text-neutral-700">Prévenir au moins 24h à l'avance en cas d'annulation</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-neutral-200 flex items-center">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">✓</div>
                          <span className="text-sm text-neutral-700">Participer activement aux exercices proposés</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-neutral-200 flex items-center">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">✓</div>
                          <span className="text-sm text-neutral-700">Respecter la confidentialité des méthodes enseignées</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-neutral-200 flex items-center">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">✓</div>
                          <span className="text-sm text-neutral-700">Maintenir un environnement propice au travail</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">5.4 Enregistrement des séances</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                          🎥 Les séances peuvent être enregistrées uniquement avec l'accord explicite du client pour faciliter le suivi pédagogique. Ces enregistrements sont strictement confidentiels et supprimés après 6 mois.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div id="annulation" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">6</div>
                      Annulation et report
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">6.1 Politique de report</h3>
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500 mb-6">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-green-800">Flexibilité maximale garantie</span>
                        </div>
                        <p className="text-green-700">
                          Le client peut reporter une séance sans frais en prévenant au moins 24h à l'avance. Les reports sont illimités et sans limite de temps, permettant une flexibilité maximale dans l'organisation.
                        </p>
                      </div>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">6.2 Système de "jokers"</h3>
                      <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500 mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium text-orange-800">Annulations de dernière minute</span>
                          </div>
                          <div className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">3 jokers gratuits</div>
                        </div>
                        <p className="text-orange-700 mb-3">
                          Pour les annulations de dernière minute (moins de 24h), le client dispose de 3 "jokers" gratuits par programme.
                        </p>
                        <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                          <p className="text-orange-800 text-sm">
                            <strong>Au-delà des 3 jokers :</strong> des frais de 100€ s'appliquent pour couvrir le créneau non utilisé.
                          </p>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">6.3 Annulation par le prestataire</h3>
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-blue-800">Protection client intégrale</span>
                        </div>
                        <p className="text-blue-700">
                          En cas d'empêchement de Léo Barcet, la séance sera reportée à une date ultérieure ou remboursée intégralement si aucune solution de report n'est trouvée.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div id="garantie" className="scroll-mt-24 mb-8">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200">
                      <h2 className="flex items-center text-3xl font-bold text-green-900 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-4">7</div>
                        Garantie satisfait ou remboursé
                      </h2>
                    <div className="bg-white/80 rounded-2xl p-6 backdrop-blur-sm mb-6">
                      <p className="text-lg text-green-800 mb-4">
                        Une <strong className="text-green-900">garantie satisfait ou remboursé de 30 jours</strong> s'applique à tous les services. Si le client n'est pas satisfait des résultats obtenus dans les 30 jours suivant la fin du programme, un remboursement intégral sera effectué sur simple demande motivée.
                      </p>
                      <div className="bg-green-100 rounded-xl p-4 border-l-4 border-green-500">
                        <p className="text-green-800 text-sm">
                          <strong>Conditions :</strong> Cette garantie ne s'applique que si le client a suivi l'intégralité du programme et mis en pratique les conseils prodigués.
                        </p>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Révisions et accompagnement renforcé
                    </h3>
                    <div className="bg-white/80 rounded-2xl p-6 backdrop-blur-sm">
                      <p className="text-green-800 mb-4">Pour garantir votre satisfaction, les services incluent :</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">4</div>
                          <div className="text-sm font-medium text-green-800">Révisions de votre pitch</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">4h</div>
                          <div className="text-sm font-medium text-green-800">Accompagnement supplémentaire</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">30</div>
                          <div className="text-sm font-medium text-green-800">Jours de suivi personnalisé</div>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>

                  <div id="propriete" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">8</div>
                      Propriété intellectuelle
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500 mb-6">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm-1 0a1 1 0 011-1h8a1 1 0 011 1v1H5V6zm9 1v1a1 1 0 11-2 0V7H8v1a1 1 0 11-2 0V7H5v1a1 1 0 112 0V7h6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-amber-800">Méthodes protégées</span>
                        </div>
                        <p className="text-amber-700 mb-4">
                          Les méthodes, techniques et supports pédagogiques utilisés restent la propriété exclusive de Léo Barcet.
                        </p>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Interdictions formelles</h3>
                      <p className="text-neutral-700 mb-4">Le client s'interdit formellement :</p>
                      <div className="space-y-3">
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200 flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-red-800">De reproduire, copier ou diffuser ces méthodes</span>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200 flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-red-800">De les utiliser à des fins commerciales</span>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200 flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-red-800">De les transmettre à des tiers sans autorisation</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="confidentialite" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">9</div>
                      Confidentialité
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500 mb-6">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 .257-.257A6 6 0 1118 8zm-6-2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-purple-800">Engagement de confidentialité stricte</span>
                        </div>
                        <p className="text-purple-700">
                          Les deux parties s'engagent à respecter la confidentialité absolue des informations échangées pendant les séances. Léo Barcet s'interdit formellement de divulguer les informations personnelles, professionnelles ou commerciales du client.
                        </p>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Protection garantie</h3>
                      <p className="text-neutral-700 mb-4">Cet engagement de confidentialité inclut :</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.732V12a1 1 0 11-2 0v-1.268l-1.246-.864a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.267l1.246.864a1 1 0 11-.992 1.736L3 15.131V16a1 1 0 11-2 0v-5a1 1 0 011-1zm14 0a1 1 0 011 1v5a1 1 0 11-2 0v-.869l-1.254.736a1 1 0 11-.992-1.736L16 14.267V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-neutral-700">Le contenu des projets et idées présentés</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm5.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM8 9a3 3 0 100-6 3 3 0 000 6zm7.5-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          </svg>
                          <span className="text-sm text-neutral-700">Les informations financières et commerciales</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-neutral-700">Les difficultés personnelles ou professionnelles évoquées</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-neutral-700">Toute information confidentielle partagée lors des séances</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="responsabilite" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">10</div>
                      Responsabilité
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 mb-4">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-blue-800">Engagement professionnel</span>
                        </div>
                        <p className="text-blue-700">
                          Léo Barcet s'engage à fournir ses services avec professionnalisme et selon les règles de l'art. Sa responsabilité est limitée à la valeur des services fournis. Il ne peut être tenu responsable des résultats obtenus par le client, ceux-ci dépendant largement de l'investissement personnel de ce dernier.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div id="force-majeure" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">11</div>
                      Force majeure
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-yellow-800">Cas exceptionnels</span>
                        </div>
                        <p className="text-yellow-700 mb-4">
                          Aucune des parties ne sera responsable de tout retard ou manquement dans l'exécution de ses obligations en cas de force majeure, incluant notamment :
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            <span className="text-sm text-yellow-800">Pandémies</span>
                          </div>
                          <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            <span className="text-sm text-yellow-800">Catastrophes naturelles</span>
                          </div>
                          <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            <span className="text-sm text-yellow-800">Grèves</span>
                          </div>
                          <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            <span className="text-sm text-yellow-800">Défaillances techniques majeures</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="donnees" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">12</div>
                      Données personnelles
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500 mb-6">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-indigo-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 .257-.257A6 6 0 1118 8zm-6-2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-indigo-800">Conformité RGPD</span>
                        </div>
                        <p className="text-indigo-700 mb-3">
                          Conformément au RGPD, les données personnelles collectées sont traitées pour l'exécution des services.
                        </p>
                        <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                          <p className="text-indigo-800 text-sm">
                            <strong>Conservation :</strong> Les données sont conservées pendant maximum 2 ans après la fin du programme.
                          </p>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Vos droits</h3>
                      <p className="text-neutral-700 mb-4">Le client dispose des droits suivants :</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-neutral-700">Droit d'accès aux données personnelles</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span className="text-sm text-neutral-700">Droit de rectification des informations inexactes</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-neutral-700">Droit d'effacement des données</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center">
                          <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                            <path fillRule="evenodd" d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-neutral-700">Droit de portabilité des données</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center md:col-span-2">
                          <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-neutral-700">Droit d'opposition au traitement</span>
                        </div>
                      </div>
                      
                      <div className="bg-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <p className="text-indigo-800 text-sm">
                          <strong>Pour exercer ces droits :</strong> contactez-nous à 
                          <a href="mailto:contact@lepitchquilvousfaut.fr" className="text-indigo-600 hover:text-indigo-700 transition-colors font-medium ml-1">
                            contact@lepitchquilvousfaut.fr
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div id="mediation" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">13</div>
                      Médiation et résolution des litiges
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <div className="bg-teal-50 rounded-lg p-4 border-l-4 border-teal-500 mb-6">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-teal-800">Résolution amiable privilégiée</span>
                        </div>
                        <p className="text-teal-700 mb-4">
                          En cas de litige, une solution amiable sera recherchée en priorité.
                        </p>
                        <p className="text-teal-700">À défaut d'accord, le client peut recourir à la médiation de la FEVAD :</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-neutral-200">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                            </svg>
                            <strong className="text-neutral-700">Site web</strong>
                          </div>
                          <a href="https://www.fevad.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 transition-colors font-medium">
                            fevad.com →
                          </a>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <strong className="text-neutral-700">Email</strong>
                          </div>
                          <a href="mailto:mediateurduecommerce@fevad.com" className="text-teal-600 hover:text-teal-700 transition-colors font-medium">
                            mediateurduecommerce@fevad.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="droit-applicable" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">14</div>
                      Droit applicable et juridictions
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-500">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm-1 0a1 1 0 011-1h8a1 1 0 011 1v1H5V6zm9 1v1a1 1 0 11-2 0V7H8v1a1 1 0 11-2 0V7H5v1a1 1 0 112 0V7h6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-gray-800">Juridiction française</span>
                        </div>
                        <p className="text-gray-700">
                          Les présentes CGV sont soumises au droit français. En cas de litige persistant après tentative de médiation, les tribunaux de Paris seront seuls compétents.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div id="modifications" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">15</div>
                      Modifications
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span className="font-medium text-orange-800">Évolution des conditions</span>
                        </div>
                        <p className="text-orange-700">
                          Léo Barcet se réserve le droit de modifier les présentes CGV à tout moment. Les nouvelles conditions s'appliqueront uniquement aux commandes postérieures à leur mise en ligne.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div id="contact" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">16</div>
                      Contact
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700 mb-4">Pour toute question relative aux présentes CGV :</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-neutral-200">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <strong className="text-neutral-700">Email</strong>
                          </div>
                          <a href="mailto:contact@lepitchquilvousfaut.fr" className="text-primary-600 hover:text-primary-700 transition-colors font-medium">
                            contact@lepitchquilvousfaut.fr
                          </a>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-neutral-200">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <strong className="text-neutral-700">Téléphone</strong>
                          </div>
                          <a href="tel:+33612345678" className="text-primary-600 hover:text-primary-700 transition-colors font-medium">
                            +33 6 12 34 56 78
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border-l-4 border-primary-500">
                    <h3 className="text-lg font-semibold text-primary-900 mb-2">Garantie personnelle</h3>
                    <p className="text-primary-800 mb-0">
                      En tant que professionnel certifié, je m'engage personnellement sur la qualité de mes services. 
                      Ma garantie 30 jours satisfait ou remboursé témoigne de ma confiance dans l'efficacité de ma méthode.
                    </p>
                  </div>

                  <div className="mt-8 p-6 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-600 mb-0">
                      <strong>Dernière mise à jour :</strong> 16 juillet 2024
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Retour à l'accueil</span>
              </Link>
              <Link
                href="/mentions-legales"
                className="inline-flex items-center space-x-2 bg-white text-primary-600 border-2 border-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Mentions légales</span>
              </Link>
              <a
                href="mailto:contact@lepitchquilvousfaut.fr"
                className="inline-flex items-center space-x-2 bg-green-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Nous contacter</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}