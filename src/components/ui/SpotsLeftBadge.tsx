import { SCARCITY } from '@/lib/constants'

interface SpotsLeftBadgeProps {
  variant?: 'hero' | 'pricing' | 'compact'
  className?: string
}

export default function SpotsLeftBadge({ variant = 'compact', className = '' }: SpotsLeftBadgeProps) {
  const baseClasses = 'inline-flex items-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:scale-105'
  
  const variantClasses = {
    hero: 'px-4 py-2 bg-gradient-to-r from-warning-50/95 to-secondary-50/95 backdrop-blur-sm border border-warning-200/50 rounded-lg text-warning-800 text-xs lg:text-sm',
    pricing: 'px-6 py-3 bg-gradient-to-r from-blue-50 to-primary-50 border-2 border-blue-200 rounded-xl text-blue-800 text-sm lg:text-base',
    compact: 'px-4 py-2 bg-gradient-to-r from-warning-50 to-secondary-50 border border-warning-200 rounded-lg text-warning-800 text-xs lg:text-sm'
  }
  
  const iconClasses = {
    hero: '🔥',
    pricing: '🎯',
    compact: '🔥'
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <span>{iconClasses[variant]}</span>
      <span>Plus que {SCARCITY.spotsLeft} places disponibles ce mois-ci</span>
    </div>
  )
}