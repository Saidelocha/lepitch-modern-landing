import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Légales - Le Pitch Qu\'il Vous Faut',
  description: 'Mentions légales du site Le Pitch Qu\'il Vous Faut - Informations légales obligatoires.',
  robots: 'noindex, follow',
  openGraph: {
    title: 'Mentions Légales - Le Pitch Qu\'il Vous Faut',
    description: 'Mentions légales du site Le Pitch Qu\'il Vous Faut - Informations légales obligatoires.',
    url: 'https://lepitchquilvousfaut.fr/mentions-legales',
    type: 'website',
  },
}

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}