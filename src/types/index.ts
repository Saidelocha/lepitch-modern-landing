// Global types for the application

export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  image?: string
  rating: number
  text: string
  result: string
  amount?: string
}

export interface PricingOffer {
  id: string
  name: string
  price: number
  duration: string
  badge?: string
  featured?: boolean
  features: string[]
  bonus?: string
  ctaText: string
  ctaLink: string
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
}

export interface MethodStep {
  id: string
  number: number
  title: string
  description: string
  icon?: string
}

export interface TrustIndicator {
  label: string
  value: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
}

export interface ValueProposition {
  id: string
  icon: string
  title: string
  description: string
}

export interface ConversionEvent {
  eventName: string
  eventCategory: string
  eventLabel?: string
  value?: number
}

export interface ConsequencePoint {
  id: string
  icon: string
  title: string
  description: string
  impact: string
  timeframe: string
}

export interface LegalContent {
  title: string
  description: string
  sections: LegalSection[]
}

export interface LegalSection {
  id: string
  title: string
  content: string
  subsections?: LegalSubsection[]
}

export interface LegalSubsection {
  title: string
  content: string
}

export interface ProcessStep {
  number: number
  icon: string
  title: string
  duration: string
  description: string
}

// Re-export chatbot types
export * from './chatbot'
