'use client'

import { Navigation } from "@/components/navigation"
import { ActionsHeroSection } from "@/components/actions-hero-section"
import { BusinessMetricsSection } from "@/components/business-metrics-section"
import { AIInsightsSection } from "@/components/ai-insights-section"
import { Footer } from "@/components/footer"
import { NoSSR } from "@/components/no-ssr"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      <Navigation />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              AutoOps AI Dashboard
            </h1>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground text-pretty max-w-3xl">
              Automated intelligence that analyzes, predicts, and executes business solutions
            </p>
          </div>
          
          <div className="space-y-8 sm:space-y-12">
            {/* Section 1: Actions Hero - The most important section */}
            <ActionsHeroSection />
            
            {/* Section 2: Business Metrics - The results and impact */}
            <BusinessMetricsSection />
            
            {/* Section 3: AI Insights - The intelligence behind the actions */}
            <AIInsightsSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
