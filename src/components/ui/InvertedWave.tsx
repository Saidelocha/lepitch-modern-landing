interface InvertedWaveProps {
  className?: string
}

export default function InvertedWave({ className = '' }: InvertedWaveProps) {
  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        className="w-full h-20 block"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="heroBackground" patternUnits="userSpaceOnUse" width="1200" height="120">
            <image 
              href="/images/modules/Recraft-2025-02-28-19_11_18.webp" 
              width="1200" 
              height="120" 
              preserveAspectRatio="xMidYMid slice"
            />
            <rect width="1200" height="120" fill="rgba(0,0,0,0.5)" />
          </pattern>
        </defs>
        
        {/* Forme de la wave inversée */}
        <path
          d="M0,0 L0,40 Q300,0 600,40 T1200,40 L1200,0 Z"
          fill="url(#heroBackground)"
        />
        
        {/* Ligne de transition douce */}
        <path
          d="M0,40 Q300,0 600,40 T1200,40"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  )
}