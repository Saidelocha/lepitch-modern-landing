import Hero from '@/components/sections/Hero'
import Identification from '@/components/sections/Identification'
import ValueProposition from '@/components/sections/ValueProposition'
import ProblemSolution from '@/components/sections/ProblemSolution'
import Method from '@/components/sections/Method'
import Testimonials from '@/components/sections/Testimonials'
import About from '@/components/sections/About'
import ConsequencesOfInaction from '@/components/sections/ConsequencesOfInaction'
import FAQ from '@/components/sections/FAQ'
import FinalCTA from '@/components/sections/FinalCTA'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileHeader from '@/components/conversion/MobileHeader'
import ExitIntentPopup from '@/components/conversion/ExitIntentPopup'
import LiveChat from '@/components/conversion/LiveChat'
import ScrollTracker from '@/components/analytics/ScrollTracker'
import Image from 'next/image'
import PricingPersonalized from '@/components/sections/PricingPersonalized'

export default function HomePage() {

  return (
    <>
      <MobileHeader />
      <Header />
      
      {/* Hero Section avec arrière-plan artistique global */}
      <div className="relative min-h-screen" data-hero-section>
        {/* Arrière-plan artistique étendu pour Header + Hero */}
        <div className="fixed top-0 left-0 right-0 h-screen z-0">
          <Image
            src="/images/modules/Recraft-2025-02-28-19_11_18.webp"
            alt="Theatrical stage with speaker presenting to audience"
            fill
            className="object-cover object-center"
            priority
            quality={90}
            sizes="100vw"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
        </div>
        
        <Hero />
      </div>
      
      <main className="relative bg-white z-20" data-white-section>
        <Identification />
        <ValueProposition />
        <ProblemSolution />
        <Method />
        <Testimonials />
        <About />
        <PricingPersonalized />
        <ConsequencesOfInaction />
        <FAQ />
        <FinalCTA />
      </main>
      
      <Footer />
      <ExitIntentPopup />
      <LiveChat />
      <ScrollTracker />
    </>
  )
}