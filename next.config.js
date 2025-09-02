/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/((?!favicon|images|_next/static|_next/image).*)',
        headers: [
          // === HEADERS DE SÉCURITÉ RENFORCÉS ===
          
          // Protection contre le clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          
          // Prévention du sniffing MIME
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          
          // Politique de référence stricte
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          
          // Désactivation des APIs sensibles (optimisé pour landing page)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), interest-cohort=()',
          },
          
          // Protection XSS pour les navigateurs anciens
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          
          // Force HTTPS (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          
          // === CONTENT SECURITY POLICY (CSP) ===
          {
            key: 'Content-Security-Policy',
            value: [
              // Scripts : uniquement sources sécurisées + Next.js
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live https://assets.zyrosite.com",
              
              // Styles : Tailwind et inline pour Next.js
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              
              // Images : optimisées + CDN
              "img-src 'self' data: blob: https://assets.zyrosite.com https://vercel.com",
              
              // Fonts : Google Fonts + locales
              "font-src 'self' https://fonts.gstatic.com",
              
              // Connexions : APIs autorisées seulement
              "connect-src 'self' https://va.vercel-scripts.com https://vercel.live https://vitals.vercel-insights.com wss://ws-us3.pusher.com https://crisp.chat https://client.crisp.chat https://openrouter.ai",
              
              // Frames : désactivés complètement
              "frame-src 'none'",
              
              // Objects : désactivés (Flash, etc.)
              "object-src 'none'",
              
              // Media : local seulement
              "media-src 'self'",
              
              // Workers : local seulement  
              "worker-src 'self'",
              
              // Manifests : local seulement
              "manifest-src 'self'",
              
              // Formulaires : même origine ou HTTPS
              "form-action 'self' https:",
              
              // Navigation : même origine
              "frame-ancestors 'none'",
              
              // Base URI : même origine
              "base-uri 'self'",
              
              // Upgrade HTTP vers HTTPS
              "upgrade-insecure-requests"
            ].join('; '),
          },
          
          // === HEADERS DE SÉCURITÉ SUPPLÉMENTAIRES ===
          
          // Protection contre les attaques de timing
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          
          // Isolation des origines
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          
          // Politique de ressources cross-origin
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site',
          },
          
          // Header serveur masqué pour la sécurité
          {
            key: 'Server',
            value: 'LePitch-SecureServer/1.0',
          },
          
          // Désactivation du cache pour les pages sensibles
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      },
      
      // === HEADERS SPÉCIFIQUES API ===
      {
        source: '/api/:path*',
        headers: [
          // API strictement JSON
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
          
          // Pas de cache pour les APIs
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          
          // Pragma pour compatibilité HTTP/1.0
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          
          // Expires dans le passé
          {
            key: 'Expires',
            value: '0',
          },
          
          // CSP spécifique API (plus restrictif)
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; frame-ancestors 'none'",
          },
        ],
      },
      
      // === HEADERS POUR ASSETS STATIQUES ===
      {
        source: '/images/:path*',
        headers: [
          // Cache long pour les images
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          
          // CSP permissif pour les images
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; img-src 'self'",
          },
        ],
      },
      
      // === HEADERS POUR PWA ET FAVICON ===
      {
        source: '/favicon/:path*',
        headers: [
          // Cache approprié pour PWA
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
          
          // Autoriser l'accès cross-origin pour PWA
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          
          // Type MIME correct pour webmanifest
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          
          // CSP permissif pour les manifests
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; manifest-src 'self'",
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.zyrosite.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig