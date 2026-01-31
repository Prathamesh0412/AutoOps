"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, AlertTriangle, TrendingDown, Package, Users, ChevronRight, DollarSign, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import type { Prediction } from "@/lib/supabase"
import Link from "next/link"

const iconMap: Record<string, any> = {
  customer_churn: TrendingDown,
  inventory_shortage: Package,
  high_value_lead: Users,
  payment_delay: DollarSign,
  pricing_opportunity: TrendingDown,
  customer_satisfaction: Users,
}

const severityColors = {
  critical: "text-destructive bg-destructive/10 border-destructive/20",
  high: "text-destructive bg-destructive/10 border-destructive/20",
  medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  low: "text-accent bg-accent/10 border-accent/20",
}

export function PredictionsPanel() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPredictions() {
      try {
        const response = await fetch('/api/predictions?status=active')
        if (!response.ok) {
          console.error('[v0] API error:', response.status)
          setPredictions([])
          return
        }
        const data = await response.json()
        console.log('[v0] Predictions received:', data)
        if (Array.isArray(data)) {
          setPredictions(data.slice(0, 3)) // Show top 3
        } else {
          console.error('[v0] Predictions is not an array:', data)
          setPredictions([])
        }
      } catch (error) {
        console.error('[v0] Error fetching predictions:', error)
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
    const interval = setInterval(fetchPredictions, 15000)
    return () => clearInterval(interval)
  }, [])

  const avgConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.length)
    : 0

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              AI Predictions
            </CardTitle>
            <CardDescription className="mt-1">
              Proactive business intelligence and forecasting
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5">
            <AlertTriangle className="mr-1 size-3" />
            {predictions.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Analyzing data...
          </div>
        ) : predictions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No active predictions. System is monitoring data.
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => {
              const Icon = iconMap[prediction.type] || Zap
              return (
                <div
                  key={prediction.id}
                  className={`rounded-lg border p-4 ${severityColors[prediction.severity as keyof typeof severityColors]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background/50">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{prediction.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {prediction.confidence_score}% confident
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm opacity-90">
                          {prediction.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {new Date(prediction.created_at).toLocaleDateString()}
                        </span>
                        <Link href="/insights">
                          <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                            View Details
                            <ChevronRight className="size-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        <div className="mt-6 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">AI Model Performance</p>
              <p className="text-xs text-muted-foreground">
                Average prediction accuracy across all models
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{avgConfidence}%</p>
              <p className="text-xs text-muted-foreground">Current period</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
