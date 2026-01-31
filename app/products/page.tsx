'use client'

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { NoSSR } from "@/components/no-ssr"
import { ProductIntelligenceDashboard } from "@/components/product-intelligence-dashboard"

export default function ProductsPage() {
  return (
    <NoSSR>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <ProductIntelligenceDashboard />
          </div>
        </main>
        <Footer />
      </div>
    </NoSSR>
  )
}
