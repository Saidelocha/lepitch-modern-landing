interface LogoProps {
  variant?: 'full' | 'compact'
  theme?: 'light' | 'dark' | 'auto'
  className?: string
  width?: number
  height?: number
}

export default function Logo({ 
  variant = 'full',
  theme = 'dark',
  className = '', 
  width = 180, 
  height = 50 
}: LogoProps) {
  if (variant === 'compact') {
    const isLight = theme === 'light'
    const gradientId = `logoGradient-${theme}`
    
    return (
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 120 40" 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isLight ? "#A855F7" : "#7C3AED"} />
            <stop offset="100%" stopColor={isLight ? "#F472B6" : "#EC4899"} />
          </linearGradient>
        </defs>
        
        {/* Cercle décoratif */}
        <circle cx="15" cy="20" r="12" fill={`url(#${gradientId})`} opacity="0.2" />
        
        {/* Icône microphone stylisée */}
        <path 
          d="M15 8 C18 8 20 10 20 13 L20 17 C20 20 18 22 15 22 C12 22 10 20 10 17 L10 13 C10 10 12 8 15 8 Z M15 24 C20 24 24 20 24 15 M6 15 C6 20 10 24 15 24 M15 26 L15 30 M11 30 L19 30" 
          stroke={`url(#${gradientId})`} 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round"
        />
        
        {/* Texte "LP" */}
        <text x="35" y="18" fontSize="14" fontWeight="bold" fill={isLight ? "#FFFFFF" : "#1F2937"}>L</text>
        <text x="45" y="18" fontSize="14" fontWeight="bold" fill={`url(#${gradientId})`}>P</text>
        
        {/* Texte "PITCH" */}
        <text x="35" y="32" fontSize="10" fontWeight="600" fill={isLight ? "#E5E7EB" : "#6B7280"}>PITCH</text>
      </svg>
    )
  }

  const isLight = theme === 'light'
  const gradientId = `logoGradientFull-${theme}`
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 240 60" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isLight ? "#A855F7" : "#7C3AED"} />
          <stop offset="100%" stopColor={isLight ? "#F472B6" : "#EC4899"} />
        </linearGradient>
        <filter id={`glow-${theme}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Cercle décoratif avec effet de brillance */}
      <circle cx="20" cy="30" r="16" fill={`url(#${gradientId})`} opacity="0.15" />
      <circle cx="20" cy="30" r="12" fill={`url(#${gradientId})`} opacity="0.3" />
      
      {/* Icône microphone stylisée */}
      <path 
        d="M20 12 C24 12 27 15 27 19 L27 25 C27 29 24 32 20 32 C16 32 13 29 13 25 L13 19 C13 15 16 12 20 12 Z M20 35 C28 35 34 29 34 21 M6 21 C6 29 12 35 20 35 M20 38 L20 45 M14 45 L26 45" 
        stroke={`url(#${gradientId})`} 
        strokeWidth="2.5" 
        fill="none" 
        strokeLinecap="round"
        filter={`url(#glow-${theme})`}
      />
      
      {/* Texte principal */}
      <text x="45" y="25" fontSize="18" fontWeight="bold" fill={isLight ? "#FFFFFF" : "#1F2937"}>LE</text>
      <text x="75" y="25" fontSize="18" fontWeight="bold" fill={`url(#${gradientId})`}>PITCH</text>
      
      {/* Sous-titre */}
      <text x="45" y="42" fontSize="12" fontWeight="600" fill={isLight ? "#E5E7EB" : "#6B7280"}>QU'IL VOUS FAUT</text>
      
      {/* Élément décoratif - ligne ondulée */}
      <path 
        d="M45 48 Q65 45 85 48 T125 48" 
        stroke={`url(#${gradientId})`} 
        strokeWidth="2" 
        fill="none" 
        opacity="0.6"
      />
    </svg>
  )
}