'use client'

import Link from 'next/link'

export default function MentionsLegales() {
  return (
    <div className="min-h-screen">
      {/* Hero Header with Background */}
      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-32 right-10 w-24 h-24 bg-secondary-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-primary-500/5 rounded-full blur-4xl"></div>
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
              <span className="text-white">Mentions Légales</span>
            </nav>
            
            {/* Header */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-primary-500/20 text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Informations légales</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Mentions Légales
                </span>
              </h1>
              <p className="text-xl text-white/90 font-medium drop-shadow-md max-w-2xl mx-auto">
                Informations légales obligatoires conformes au droit français
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
              {/* Table of Contents */}
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sommaire
                </h2>
                <nav className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <a href="#editeur" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">1. Éditeur du site</a>
                  <a href="#publication" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">2. Directeur de publication</a>
                  <a href="#hebergement" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">3. Hébergement</a>
                  <a href="#propriete" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">4. Propriété intellectuelle</a>
                  <a href="#donnees" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">5. Données personnelles</a>
                  <a href="#cookies" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">6. Cookies</a>
                  <a href="#responsabilite" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">7. Responsabilité</a>
                  <a href="#mediation" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">8. Médiation</a>
                  <a href="#droit-applicable" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">9. Droit applicable</a>
                  <a href="#contact" className="text-white/90 hover:text-white transition-colors py-1 hover:pl-2 duration-200">10. Contact</a>
                </nav>
              </div>
              
              <div className="p-8 lg:p-12">
                <div className="prose prose-lg max-w-none prose-headings:text-neutral-900 prose-headings:font-semibold prose-p:text-neutral-700 prose-p:leading-relaxed">
                
                  <div id="editeur" className="scroll-mt-24">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
                      Informations sur l'éditeur
                    </h2>
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 border-l-4 border-primary-500 mb-8">
                      <p className="text-lg font-medium text-neutral-800 mb-4">
                        Le site <strong className="text-primary-600">lepitchquilvousfaut.fr</strong> est édité par :
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <strong className="text-neutral-700">Nom :</strong>
                          </div>
                          <p className="text-neutral-900 font-semibold">Léo Barcet</p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm5.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM8 9a3 3 0 100-6 3 3 0 000 6zm7.5-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                            </svg>
                            <strong className="text-neutral-700">Statut :</strong>
                          </div>
                          <p className="text-neutral-900">Entrepreneur individuel</p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <strong className="text-neutral-700">Adresse :</strong>
                          </div>
                          <p className="text-neutral-900">157 rue de Belleville<br />75019 Paris</p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <strong className="text-neutral-700">Contact :</strong>
                          </div>
                          <p className="text-neutral-900">
                            <a href="tel:+33612345678" className="text-primary-600 hover:text-primary-700 transition-colors">+33 6 12 34 56 78</a><br />
                            <a href="mailto:contact@lepitchquilvousfaut.fr" className="text-primary-600 hover:text-primary-700 transition-colors">contact@lepitchquilvousfaut.fr</a>
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm md:col-span-2">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm-1 0a1 1 0 011-1h8a1 1 0 011 1v1H5V6zm9 1v1a1 1 0 11-2 0V7H8v1a1 1 0 11-2 0V7H5v1a1 1 0 112 0V7h6z" clipRule="evenodd" />
                            </svg>
                            <strong className="text-neutral-700">Informations légales :</strong>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">SIRET: 843 365 594 00020</span>
                            <span className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium">APE: 8559A</span>
                            <span className="bg-neutral-100 text-neutral-800 px-3 py-1 rounded-full text-sm font-medium">Formation continue d'adultes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="publication" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
                      Directeur de la publication
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700">
                        Le directeur de la publication est <strong className="text-primary-600">Léo Barcet</strong>, en sa qualité d'éditeur du site.
                      </p>
                    </div>
                  </div>

                  <div id="hebergement" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">3</div>
                      Hébergement
                    </h2>
                    <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl p-6 border-l-4 border-secondary-500">
                      <p className="text-neutral-700 mb-4">Le site est hébergé par :</p>
                      <div className="bg-white/80 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.5l-11.5-7.3v5.2l7.8 4.9-7.8 4.9v5.2z"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-900">Vercel Inc.</h4>
                            <p className="text-sm text-neutral-600">340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 transition-colors text-sm font-medium">vercel.com →</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="propriete" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">4</div>
                      Propriété intellectuelle
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700">
                        L'ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est protégé par le droit d'auteur et appartient à Léo Barcet ou à ses partenaires. Toute reproduction, représentation, modification, publication, transmission, ou dénaturation, totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, sans autorisation expresse préalable de Léo Barcet est interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
                      </p>
                    </div>
                  </div>

                  <div id="donnees" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">5</div>
                      Données personnelles
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700 mb-6">
                        Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données personnelles. Pour exercer ces droits, vous pouvez nous contacter à l'adresse : <a href="mailto:contact@lepitchquilvousfaut.fr" className="text-primary-600 hover:text-primary-700 transition-colors">contact@lepitchquilvousfaut.fr</a>.
                      </p>
                      
                      <h3 className="text-lg font-semibold text-neutral-900 mb-3">5.1 Données collectées</h3>
                      <p className="text-neutral-700 mb-3">
                        Les données personnelles collectées sur ce site sont :
                      </p>
                      <ul className="list-disc pl-6 mb-6 text-neutral-700 space-y-1">
                        <li>Nom, prénom</li>
                        <li>Adresse email</li>
                        <li>Numéro de téléphone (optionnel)</li>
                        <li>Message (formulaire de contact)</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-3">5.2 Finalité du traitement</h3>
                      <p className="text-neutral-700 mb-3">
                        Ces données sont collectées pour :
                      </p>
                      <ul className="list-disc pl-6 mb-6 text-neutral-700 space-y-1">
                        <li>Répondre à vos demandes de contact</li>
                        <li>Vous fournir les services demandés</li>
                        <li>Vous envoyer des informations sur nos services (avec votre consentement)</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-3">5.3 Conservation des données</h3>
                      <p className="text-neutral-700 mb-0">
                        Les données personnelles sont conservées pendant une durée maximale de 2 ans après votre dernière interaction avec nos services, conformément à nos engagements de confidentialité.
                      </p>
                    </div>
                  </div>

                  <div id="cookies" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">6</div>
                      Cookies
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700">
                        Ce site utilise des cookies pour améliorer votre expérience de navigation et analyser le trafic. Vous pouvez à tout moment modifier vos préférences de cookies dans les paramètres de votre navigateur.
                      </p>
                    </div>
                  </div>

                  <div id="responsabilite" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">7</div>
                      Responsabilité
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700">
                        Léo Barcet s'efforce de maintenir des informations exactes et à jour sur ce site. Cependant, il ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition. En conséquence, Léo Barcet décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur ce site.
                      </p>
                    </div>
                  </div>

                  <div id="mediation" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">8</div>
                      Médiation et résolution des litiges
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700 mb-4">
                        En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut, le client peut recourir à la médiation de la FEVAD (Fédération du e-commerce et de la vente à distance) :
                      </p>
                      <ul className="text-neutral-700 space-y-2">
                        <li><strong>Site web :</strong> <a href="https://www.fevad.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 transition-colors">fevad.com</a></li>
                        <li><strong>Email :</strong> <a href="mailto:mediateurduecommerce@fevad.com" className="text-primary-600 hover:text-primary-700 transition-colors">mediateurduecommerce@fevad.com</a></li>
                      </ul>
                    </div>
                  </div>

                  <div id="droit-applicable" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">9</div>
                      Droit applicable
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700">
                        Les présentes mentions légales sont soumises au droit français. En cas de litige persistant, les tribunaux de Paris sont seuls compétents.
                      </p>
                    </div>
                  </div>

                  <div id="contact" className="scroll-mt-24 mb-8">
                    <h2 className="flex items-center text-2xl font-bold text-neutral-900 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">10</div>
                      Contact
                    </h2>
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <p className="text-neutral-700 mb-4">
                        Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :
                      </p>
                      <ul className="text-neutral-700 space-y-2">
                        <li><strong>Email :</strong> <a href="mailto:contact@lepitchquilvousfaut.fr" className="text-primary-600 hover:text-primary-700 transition-colors">contact@lepitchquilvousfaut.fr</a></li>
                        <li><strong>Téléphone :</strong> <a href="tel:+33612345678" className="text-primary-600 hover:text-primary-700 transition-colors">+33 6 12 34 56 78</a></li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-neutral-50 rounded-xl">
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
                href="/cgv"
                className="inline-flex items-center space-x-2 bg-white text-primary-600 border-2 border-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Voir les CGV</span>
              </Link>
              <a
                href="mailto:contact@lepitchquilvousfaut.fr"
                className="inline-flex items-center space-x-2 bg-neutral-100 text-neutral-700 font-semibold px-8 py-4 rounded-xl hover:bg-neutral-200 transition-all duration-300 transform hover:scale-105"
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