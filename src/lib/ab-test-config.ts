// A/B Testing Configuration for Pricing Optimization
// 3 vs 4 Offers Conversion Test

export interface ABTestVariant {
  id: string
  name: string
  description: string
  traffic_split: number
  active: boolean
}

export interface PricingOffer {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  ctaText: string
  ctaLink: string
  featured?: boolean
  badge?: string
  bonus?: string
}

export interface ABTestConfig {
  experiment_id: string
  experiment_name: string
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  variants: ABTestVariant[]
  success_metrics: string[]
  sample_size_target: number
}

// A/B Test Configuration
export const PRICING_AB_TEST: ABTestConfig = {
  experiment_id: 'pricing_3vs4_offers_2024',
  experiment_name: '3 vs 4 Offers Pricing Optimization',
  start_date: '2024-07-22', // Lundi pour éviter weekend effects
  end_date: '2024-08-19',   // 30 jours de test
  status: 'draft',
  variants: [
    {
      id: 'control_4offers',
      name: 'Contrôle - 4 Offres',
      description: 'Structure actuelle avec 4 offres',
      traffic_split: 0.5,
      active: true
    },
    {
      id: 'test_3offers',
      name: 'Test - 3 Offres',
      description: 'Structure optimisée avec 3 offres',
      traffic_split: 0.5,
      active: true
    }
  ],
  success_metrics: [
    'conversion_rate',
    'average_order_value',
    'time_to_decision',
    'bounce_rate_pricing'
  ],
  sample_size_target: 7684 // 3,842 par variante pour 80% power
}

// Variante A - Contrôle (4 Offres Actuelles)
export const PRICING_OFFERS_VARIANT_A: PricingOffer[] = [
  {
    id: 'essentiel',
    name: 'L\'ESSENTIEL',
    price: 75,
    duration: '1 heure',
    features: [
      'Diagnostic personnalisé de votre pitch',
      'Conseils ciblés pour vos défis spécifiques',
      'Plan d\'action concret à mettre en place',
      'Techniques pour gérer le stress'
    ],
    ctaText: 'Choisir L\'ESSENTIEL',
    ctaLink: 'https://calendar.app.google/DgYzJrMyj1FGfwvP7'
  },
  {
    id: 'pitch_plus',
    name: 'LE PITCH+',
    price: 295,
    duration: '2 heures',
    features: [
      'Structuration complète de votre pitch',
      'Techniques de storytelling efficaces',
      'Gestion du stress et de l\'émotion',
      'Entraînement avec feedback en temps réel',
      'Support 7j après la séance'
    ],
    ctaText: 'Choisir LE PITCH+',
    ctaLink: 'https://calendar.app.google/DgYzJrMyj1FGfwvP7',
    featured: true,
    badge: 'POPULAIRE'
  },
  {
    id: 'pitch',
    name: 'LE PITCH',
    price: 495,
    duration: '3 heures',
    features: [
      'Pitch de 2 à 5 min entièrement personnalisé',
      'Maîtrise complète de la méthode S.C.E.N.E.',
      'Techniques avancées de persuasion',
      'Simulation en conditions réelles',
      'Enregistrement vidéo pour analyse',
      'Support 14j après la séance'
    ],
    ctaText: 'Choisir LE PITCH',
    ctaLink: 'https://calendar.app.google/DgYzJrMyj1FGfwvP7'
  },
  {
    id: 'orateur',
    name: 'L\'ORATEUR',
    price: 1295,
    duration: '8 modules de 55 min',
    features: [
      'Formation complète sur 2 mois',
      'Maîtrise de tous types de présentation',
      'Techniques d\'acteur professionnel',
      'Gestion avancée du stress et émotions',
      'Présence scénique et charisme',
      'Suivi personnalisé entre séances',
      'Accès groupe privé alumni'
    ],
    ctaText: 'Choisir L\'ORATEUR',
    ctaLink: 'https://calendar.app.google/DgYzJrMyj1FGfwvP7',
    bonus: 'Accès à vie aux mises à jour du programme'
  }
]

// Variante B - Test (3 Offres Optimisées)
export const PRICING_OFFERS_VARIANT_B: PricingOffer[] = [
  {
    id: 'decouverte',
    name: 'DÉCOUVERTE',
    price: 75,
    duration: '1 heure',
    features: [
      'Diagnostic personnalisé de votre pitch',
      'Conseils ciblés pour vos défis spécifiques',
      'Plan d\'action concret à mettre en place',
      'Techniques pour gérer le stress'
    ],
    ctaText: 'Choisir DÉCOUVERTE',
    ctaLink: 'https://calendar.app.google/DgYzJrMyj1FGfwvP7'
  },
  {
    id: 'pitch_complet',
    name: 'PITCH COMPLET',
    price: 395,
    duration: '2-3 heures selon besoins',
    features: [
      'Pitch de 2 à 5 min entièrement personnalisé',
      'Maîtrise complète de la méthode S.C.E.N.E.',
      'Techniques de storytelling et persuasion',
      'Simulation en conditions réelles',
      'Enregistrement vidéo pour analyse',
      'Support 14j après la séance'
    ],
    ctaText: 'Choisir PITCH COMPLET',
    ctaLink: 'https://calendar.app.google/DgYzJrMyj1FGfwvP7',
    featured: true,
    badge: 'RECOMMANDÉ',
    bonus: 'Session de suivi gratuite si besoin'
  },
  {
    id: 'orateur',
    name: 'L\'ORATEUR',
    price: 1295,
    duration: '8 modules de 55 min',
    features: [
      'Formation complète sur 2 mois',
      'Maîtrise de tous types de présentation',
      'Techniques d\'acteur professionnel',
      'Gestion avancée du stress et émotions',
      'Présence scénique et charisme',
      'Suivi personnalisé entre séances',
      'Accès groupe privé alumni'
    ],
    ctaText: 'Choisir L\'ORATEUR',
    ctaLink: 'https://calendar.app.google/DgYzJrMyj1FGfwvP7',
    bonus: 'Accès à vie aux mises à jour du programme'
  }
]

// Helper function to determine user variant
export function getUserVariant(userId: string): 'A' | 'B' {
  // Simple hash-based assignment for consistent user experience
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash % 2 === 0 ? 'A' : 'B'
}

// Helper function to get offers based on variant
export function getPricingOffers(variant: 'A' | 'B'): PricingOffer[] {
  return variant === 'A' ? PRICING_OFFERS_VARIANT_A : PRICING_OFFERS_VARIANT_B
}

// Analytics tracking helpers
export interface ABTestEvent {
  experiment_id: string
  variant: 'A' | 'B'
  event_type: 'view' | 'click' | 'conversion'
  offer_id?: string
  timestamp: number
  user_id: string
  session_id: string
  page_url: string
  device_type: 'desktop' | 'tablet' | 'mobile'
  traffic_source: string
}

export function trackABTestEvent(
  variant: 'A' | 'B',
  eventType: ABTestEvent['event_type'],
  offerId?: string
): void {
  const event: ABTestEvent = {
    experiment_id: PRICING_AB_TEST.experiment_id,
    variant,
    event_type: eventType,
    ...(offerId && { offer_id: offerId }),
    timestamp: Date.now(),
    user_id: getUserId(), // À implémenter
    session_id: getSessionId(), // À implémenter
    page_url: window.location.href,
    device_type: getDeviceType(), // À implémenter
    traffic_source: getTrafficSource() // À implémenter
  }

  // Send to analytics
  if (typeof window !== 'undefined' && typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', 'ab_test_interaction', {
      'experiment_id': event.experiment_id,
      'variant': event.variant,
      'event_type': event.event_type,
      'offer_id': event.offer_id,
      'custom_parameters': event
    })
  }

  // Send to custom analytics endpoint
  fetch('/api/analytics/ab-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  }).catch(error => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Development-only error logging for AB test tracking
      console.error('AB Test tracking error:', error)
    }
  })
}

// Utility functions (à implémenter selon votre setup)
function getUserId(): string {
  // Return user ID from cookies/localStorage
  return localStorage.getItem('user_id') || 'anonymous_' + Date.now()
}

function getSessionId(): string {
  // Return session ID
  return sessionStorage.getItem('session_id') || 'session_' + Date.now()
}

function getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  const width = window.innerWidth
  if (width >= 1024) return 'desktop'
  if (width >= 768) return 'tablet'
  return 'mobile'
}

function getTrafficSource(): string {
  // Analyze referrer to determine source
  const referrer = document.referrer
  if (!referrer) return 'direct'
  if (referrer.includes('google')) return 'organic_google'
  if (referrer.includes('linkedin')) return 'social_linkedin'
  return 'referral'
}

// Configuration pour tests statistiques
export const STATISTICAL_CONFIG = {
  confidence_level: 0.95,
  statistical_power: 0.80,
  minimum_effect_size: 0.15, // 15% amélioration relative
  minimum_sample_size: 3842, // Par variante
  minimum_test_duration: 14, // Jours minimum
  maximum_test_duration: 45  // Jours maximum
}