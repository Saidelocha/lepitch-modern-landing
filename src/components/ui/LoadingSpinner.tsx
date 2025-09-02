interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white'
  }

  return (
    <div className={`inline-block animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-200 rounded-lg ${className}`}>
      <div className="h-full bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 animate-gradient-x rounded-lg"></div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-14 h-14 bg-neutral-200 rounded-full"></div>
        <div className="ml-4 flex-1">
          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-neutral-200 rounded w-full"></div>
        <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
        <div className="h-3 bg-neutral-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}