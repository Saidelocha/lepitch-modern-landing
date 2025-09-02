import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente - Le Pitch Qu\'il Vous Faut',
  description: 'Conditions générales de vente des services de coaching en prise de parole de Léo Barcet.',
  robots: 'noindex, follow',
  openGraph: {
    title: 'Conditions Générales de Vente - Le Pitch Qu\'il Vous Faut',
    description: 'Conditions générales de vente des services de coaching en prise de parole de Léo Barcet.',
    url: 'https://lepitchquilvousfaut.fr/cgv',
    type: 'website',
  },
}

export default function CGVLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}