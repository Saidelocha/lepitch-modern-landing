import type { Testimonial, PricingOffer, FAQ, ValueProposition, TrustIndicator, MethodStep, ConsequencePoint } from '@/types'

// Contact Information
export const CONTACT = {
  phone: '+33612345678',
  email: 'contact@lepitchquilvousfaut.fr',
  bookingUrl: 'https://zcal.co/leobarcet/30min',
} as const

// Trust Indicators
export const TRUST_INDICATORS: TrustIndicator[] = [
  { label: 'Personnes accompagnées', value: '400+' },
  { label: 'De coaching spécialisé', value: '5 ans' },
  { label: 'Taux de satisfaction', value: '96%' },
]

// Value Propositions
export const VALUE_PROPOSITIONS: ValueProposition[] = [
  {
    id: 'impact',
    icon: '📈',
    title: 'Impact multiplié par 2',
    description: 'Vos présentations, keynotes et pitchs génèrent 2x plus d\'engagement et de résultats concrets'
  },
  {
    id: 'speed',
    icon: '⏱️',
    title: 'Résultats en 30 jours',
    description: 'Une méthode intensive qui transforme votre pitch en machine à convaincre en un temps record'
  },
  {
    id: 'custom',
    icon: '🎯',
    title: 'Écriture 100% personnalisée',
    description: 'Chaque mot, chaque phrase est écrite spécifiquement pour votre projet et votre personnalité'
  },
  {
    id: 'method',
    icon: '🎭',
    title: 'Méthode S.C.E.N.E. exclusive',
    description: 'Une approche unique issue de 5 ans d\'expérience théâtre et coaching pour structurer toute prise de parole marquante'
  },
  {
    id: 'guarantee',
    icon: '🛡️',
    title: 'Garantie 30 jours - ZÉRO RISQUE',
    description: 'Si vous n\'êtes pas 100% satisfait après 30 jours, nous vous remboursons intégralement'
  },
]

// Method Steps (S.C.E.N.E.)
export const METHOD_STEPS: MethodStep[] = [
  {
    id: 'structure',
    number: 1,
    title: 'Structure',
    description: 'Création d\'un pitch structuré qui capte l\'attention en 7 secondes'
  },
  {
    id: 'charisme',
    number: 2,
    title: 'Charisme',
    description: 'Techniques d\'acteur pour une présence magnétique'
  },
  {
    id: 'emotion',
    number: 3,
    title: 'Émotion',
    description: 'Storytelling puissant qui touche et convainc'
  },
  {
    id: 'naturel',
    number: 4,
    title: 'Naturel',
    description: 'Authenticité et fluidité pour être vous-même'
  },
  {
    id: 'efficacite',
    number: 5,
    title: 'Efficacité',
    description: 'Résultats mesurables dès la première semaine'
  },
]

// Testimonials
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'chloe',
    name: 'Chloé Beaumont',
    role: 'CEO',
    company: 'TechStart',
    image: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=96,h=96,fit=crop/m2WpKpGvVqhD2N7M/chloei-A0x1Dr67lasv731E.jpg',
    rating: 5,
    text: 'Grâce à l\'approche unique de Léo, j\'ai enfin réussi à présenter mon projet avec assurance. Son regard d\'artiste m\'a aidé à trouver ma posture et à capter l\'attention dès les premières secondes.',
    result: 'Première levée de fonds réussie',
    amount: '60K€'
  },
  {
    id: 'bertrand',
    name: 'Bertrand Leroy',
    role: 'Consultant Stratégie',
    company: 'Indépendant',
    image: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=96,h=96,fit=crop/m2WpKpGvVqhD2N7M/bertrand-mp8qR7lpqWH80o7q.jpg',
    rating: 5,
    text: 'L\'écoute et les techniques d\'accompagnement de Léo m\'ont permis de dépasser mes blocages. Sa formation de comédien apporte une dimension unique. Je suis plus à l\'aise et plus convaincant.',
    result: 'Confiance retrouvée et meilleure conversion'
  },
  {
    id: 'marie',
    name: 'Marie Gautier',
    role: 'Fondatrice',
    company: 'GreenTech',
    rating: 5,
    text: 'Le travail avec Léo m\'a transformée. Son approche bienveillante et ses techniques de metteur en scène m\'ont aidé à structurer mes idées. Je ne stresse plus, je prends plaisir à présenter!',
    result: 'Transformation complète de ma posture'
  },
]

// Pricing Offers
export const PRICING_OFFERS: PricingOffer[] = [
  {
    id: 'essentiel',
    name: 'L\'ESSENTIEL',
    price: 90,
    duration: '55 min en visio',
    features: [
      'Diagnostic expert de votre pitch actuel',
      'Ébauche de structure personnalisée',
      'Identification des points clés à améliorer',
      'Conseils concrets et actionnables',
      'Séance flexible 100% en ligne'
    ],
    ctaText: 'Réserver ma séance',
    ctaLink: CONTACT.bookingUrl
  },
  {
    id: 'coach',
    name: 'LE PITCH',
    price: 495,
    duration: 'Jusqu\'à 6h de coaching personnalisé',
    badge: 'PLUS POPULAIRE',
    featured: true,
    features: [
      'Séance ESSENTIEL incluse',
      'Script complet de présentation rédigé sur-mesure (2-10 min)',
      'Méthode S.C.E.N.E. complète',
      'Programme d\'exercices personnalisé',
      'Vidéo de vos séances',
      'Support 15 jours'
    ],
    bonus: 'Révision illimitée de votre script jusqu\'à satisfaction',
    ctaText: 'Je veux mon coaching intensif',
    ctaLink: CONTACT.bookingUrl
  },
  {
    id: 'orateur',
    name: 'L\'ORATEUR',
    price: 1295,
    duration: 'Jusqu\'à 15h + accompagnement 7/7',
    badge: 'TRANSFORMATION COMPLÈTE',
    features: [
      'Jusqu\'à 15 heures de coaching',
      'Rédaction complète de keynotes et discours personnalisés (jusqu\'à 45 min)',
      'Création de votre style d\'écriture signature',
      'Coaching posture et gestuelle personnalisé',
      'Préparation et débriefing de vos prestations'
    ],
    bonus: 'Accompagnement illimité pendant 3 mois',
    ctaText: 'Devenir un orateur d\'exception',
    ctaLink: CONTACT.bookingUrl
  },
]

// FAQ
export const FAQ_ITEMS: FAQ[] = [
  {
    id: 'results-timing',
    question: 'Combien de temps avant de voir des résultats?',
    answer: 'La plupart de nos clients constatent une amélioration dès la première semaine. Les résultats significatifs (augmentation du taux de closing) arrivent généralement sous 30 jours.'
  },
  {
    id: 'sector-compatibility',
    question: 'Est-ce que ça marche pour mon secteur?',
    answer: 'Absolument! Notre méthode s\'adapte à tous les secteurs. Nous avons accompagné des entrepreneurs dans la tech, le conseil, l\'industrie, les services, etc.'
  },
  {
    id: 'beginner-friendly',
    question: 'Et si je suis vraiment nul en prise de parole?',
    answer: 'C\'est justement notre spécialité! 80% de nos clients arrivent avec une peur bleue de parler en public. Notre méthode progressive vous transforme étape par étape.'
  },
  {
    id: 'guarantee',
    question: 'Quelle est votre garantie?',
    answer: 'Si après 30 jours vous n\'êtes pas 100% satisfait de votre progression, nous vous remboursons intégralement. C\'est notre engagement qualité.'
  },
]

// Statistics
export const STATS = {
  totalRaised: '480K€',
  clientsTransformed: '400+',
  averageClosingIncrease: 'x2.5',
  satisfactionRate: '96%',
} as const

// Consequences of Inaction
export const CONSEQUENCES_OF_INACTION: ConsequencePoint[] = [
  {
    id: 'financial-cost',
    icon: '💸',
    title: 'Coût financier direct',
    description: 'Chaque deal raté représente en moyenne 15K€ à 50K€ de manque à gagner',
    impact: '300K€ perdus par an',
    timeframe: 'Immédiat'
  },
  {
    id: 'confidence-spiral',
    icon: '😰',
    title: 'Spirale du manque de confiance',
    description: 'Plus vous échouez, plus vous doutez. Cette anxiété grandit et empire avec le temps',
    impact: 'Paralysie totale',
    timeframe: '3-6 mois'
  },
  {
    id: 'competitive-disadvantage',
    icon: '🏃‍♂️',
    title: 'Vos concurrents avancent',
    description: 'Pendant que vous hésitez, ils perfectionnent leur pitch et prennent votre place',
    impact: 'Parts de marché perdues',
    timeframe: 'Chaque semaine'
  },
  {
    id: 'opportunity-cost',
    icon: '⏰',
    title: 'Le temps ne revient jamais',
    description: 'Les meilleures opportunités se présentent rarement deux fois. Agir demain = trop tard',
    impact: 'Opportunités définitivement perdues',
    timeframe: 'Irréversible'
  }
]

export const INACTION_STATS = {
  averageDealLost: '35K€',
  dealsLostPerMonth: '3-5',
  confidenceDeclineWeeks: '4',
  competitorsAheadDays: '7',
} as const

// Scarcity Messages
export const SCARCITY = {
  spotsLeft: 2,
  exclusiveMethod: 'Méthode exclusive alliant théâtre professionnel et coaching business',
  qualityFocus: 'Pour maintenir la qualité de l\'accompagnement, je limite volontairement le nombre de clients',
  timeInvestment: 'Chaque entrepreneur mérite mon attention complète - d\'où ce choix délibéré',
  realityCheck: 'En 5 ans, j\'ai accompagné 400+ entrepreneurs. Seulement 20% passent vraiment à l\'action.',
  socialProof: 'Les 3 derniers entrepreneurs que j\'ai accompagnés ont levé +180K€ en cumulé',
  timeValue: 'Un pitch optimisé peut vous faire gagner 6 mois de négociation sur votre prochaine levée',
  opportunityCost: 'Pendant que vous réfléchissez, vos concurrents perfectionnent déjà leur présentation',
} as const

// Personalized Pricing Process
export const PERSONALIZED_PROCESS_STEPS = [
  {
    number: 1,
    icon: '🔍',
    title: 'Diagnostic gratuit',
    duration: '30 minutes',
    description: 'Analyse complète de votre pitch actuel et identification précise des opportunités d\'amélioration spécifiques à votre secteur'
  },
  {
    number: 2,
    icon: '📋',
    title: 'Proposition personnalisée',
    duration: 'Sur-mesure',
    description: 'Solution adaptée à vos besoins exacts, votre budget et vos objectifs, avec tarification transparente après diagnostic'
  },
  {
    number: 3,
    icon: '🚀',
    title: 'Accompagnement adapté',
    duration: 'Flexible',
    description: 'Rédaction sur-mesure de vos pitchs, keynotes et discours + méthode S.C.E.N.E. appliquée à votre profil avec coaching intensif jusqu\'à vos résultats'
  }
] as const

export const PERSONALIZED_BENEFITS = [
  'Solution 100% adaptée à votre secteur d\'activité et profil d\'entrepreneur',
  'Méthode S.C.E.N.E. personnalisée selon vos objectifs et contraintes',
  'Diagnostic approfondi gratuit avant tout engagement',
  'Tarification transparente et adaptée après analyse de vos besoins',
  'Accompagnement flexible : du coaching ponctuel à la transformation complète',
  'Garantie satisfait ou remboursé 30 jours sur tous les accompagnements'
] as const

