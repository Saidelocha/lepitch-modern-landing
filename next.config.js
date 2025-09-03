/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // === HEADERS FOR VERCEL ANALYTICS/INSIGHTS ===
      {
        source: '/_vercel/:path*',
        headers: [
          // Allow Vercel's own scripts to load without restrictions
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src *",
          },
        ],
      },
      
      {
        source: '/((?!favicon|images|_next/static|_next/image|_vercel).*)',
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
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
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
          
          // === CONTENT SECURITY POLICY (CSP) optimisé ===
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://crisp.chat https://client.crisp.chat",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
          
          // === HEADERS DE SÉCURITÉ SUPPLÉMENTAIRES ===
          
          // Cross-Origin policies optimisées
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          
          // Cache optimisé pour les performances (landing page)
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
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
        ],
      },
      
      // === HEADERS SPÉCIFIQUES POUR WEBMANIFEST ===
      {
        source: '/favicon/site.webmanifest',
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
          
          // Type MIME correct pour webmanifest uniquement
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          
          // CSP optimisé pour PWA manifests
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; manifest-src 'self' *; script-src 'none'; style-src 'none'",
          },
          
          // Headers CORS pour PWA
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
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