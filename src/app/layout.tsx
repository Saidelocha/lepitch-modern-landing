import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  // Optimize font loading strategy to prevent unused preload warnings
  adjustFontFallback: true,
  // Force immediate usage to align with preload timing
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'Le Pitch Qu\'il Vous Faut - Décrochez vos deals avec le pitch parfait',
  description: 'Décrochez ENFIN vos deals grâce au pitch parfait. Coaching personnalisé pour entrepreneurs. Résultats garantis en 30 jours ou remboursé.',
  keywords: 'pitch, coaching, entrepreneur, présentation, investisseur, prise de parole, formation',
  authors: [{ name: 'Léo Barcet' }],
  creator: 'Léo Barcet',
  publisher: 'Le Pitch Qu\'il Vous Faut',
  robots: 'index, follow',
  metadataBase: new URL('https://lepitchquilvousfaut.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://lepitchquilvousfaut.fr',
    siteName: 'Le Pitch Qu\'il Vous Faut',
    title: 'Le Pitch Qu\'il Vous Faut - Décrochez vos deals avec le pitch parfait',
    description: 'Décrochez ENFIN vos deals grâce au pitch parfait. Coaching personnalisé pour entrepreneurs. Résultats garantis en 30 jours ou remboursé.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Le Pitch Qu\'il Vous Faut - Coaching pitch pour entrepreneurs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Le Pitch Qu\'il Vous Faut - Décrochez vos deals avec le pitch parfait',
    description: 'Décrochez ENFIN vos deals grâce au pitch parfait. Coaching personnalisé pour entrepreneurs.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        
        {/* Font optimization handled by next/font/google */}
        
        {/* Force immediate font usage in critical CSS to prevent preload warnings */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html { font-family: var(--font-inter), system-ui, -apple-system, sans-serif; }
            body { font-family: var(--font-inter), system-ui, -apple-system, sans-serif; }
          `
        }} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "Le Pitch Qu'il Vous Faut",
              "description": "Coaching personnalisé pour entrepreneurs - Maîtrisez l'art du pitch parfait",
              "url": "https://lepitchquilvousfaut.fr",
              "telephone": "+33612345678",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "FR"
              },
              "priceRange": "€€€",
              "founder": {
                "@type": "Person",
                "name": "Léo Barcet",
                "jobTitle": "Coach en prise de parole",
                "alumniOf": ["Cours Florent", "Sorbonne Nouvelle"]
              },
              "serviceType": [
                "Coaching en prise de parole",
                "Formation pitch",
                "Coaching entrepreneur"
              ],
              "areaServed": "France"
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-white`}>
        {children}
      </body>
    </html>
  )
}