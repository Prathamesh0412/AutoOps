'use client'

import { Navigation } from "@/components/navigation"
import { HomeHero } from "@/components/home-hero"
import { FeaturesSection } from "@/components/features-section"
import { CTASection } from "@/components/cta-section"
import { NoSSR } from "@/components/no-ssr"

export default function HomePage() {
  return (
    <NoSSR>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <HomeHero />
          <FeaturesSection />
          <CTASection />
        </main>
      </div>
    </NoSSR>
  )
}
