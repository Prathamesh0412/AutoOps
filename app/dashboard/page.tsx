'use client'

import { Navigation } from "@/components/navigation"
import { IntelligentDashboard } from "@/components/intelligent-dashboard"
import { VisualIntelligenceDashboard } from "@/components/visual-intelligence-dashboard"
import { ExplainableInsightsPanel } from "@/components/explainable-insights-panel"
import { DataAnalysisPanel } from "@/components/data-analysis-panel"
import { UploadedDocumentsPanel } from "@/components/uploaded-documents-panel"
import { PredictionsPanel } from "@/components/predictions-panel"
import { ActionsPanel } from "@/components/actions-panel"
import { Footer } from "@/components/footer"
import { NoSSR } from "@/components/no-ssr"

export default function DashboardPage() {
  return (
    <NoSSR>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-balance">
                AutoOps AI Dashboard
              </h1>
              <p className="mt-2 text-lg text-muted-foreground text-pretty">
                Automated intelligence that analyzes, predicts, and executes business solutions
              </p>
            </div>
            
            <IntelligentDashboard />
            
            <div className="mt-8">
              <VisualIntelligenceDashboard />
            </div>
            
            <div className="mt-8">
              <ExplainableInsightsPanel />
            </div>
            
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <UploadedDocumentsPanel />
              <DataAnalysisPanel />
            </div>
            
            <div className="mt-8">
              <PredictionsPanel />
            </div>
            
            <div className="mt-8">
              <ActionsPanel />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </NoSSR>
  )
}
