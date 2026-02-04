"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, AlertTriangle, TrendingDown, Package, Users, ChevronRight, DollarSign, Clock, Target, AlertCircle, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { useAppData } from "@/lib/hooks"
import type { Prediction } from "@/lib/unified-store"
import Link from "next/link"

const iconMap: Record<string, any> = {
  churn_risk: TrendingDown,
  inventory_shortage: Package,
  lead_insight: Users,
  payment_delay: DollarSign,
  pricing_opportunity: Target,
  customer_satisfaction: Users,
}

const severityColors = {
  High: "text-red-500 bg-red-500/10 border-red-500/20",
  Medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  Low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
}

export function PredictionsPanel() {
  const { predictions } = useAppData()
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter predictions based on severity
  const filteredPredictions = predictions.filter(prediction => {
    if (filter === 'All') return true
    return prediction.severity === filter
  })

  // Convert predictions to unified format
  const unifiedPredictions = filteredPredictions.map(prediction => ({
    ...prediction,
    name: prediction.name || `${prediction.prediction_type} Prediction`
  }))

  // Calculate confidence score programmatically
  const calculateConfidence = (prediction: Prediction): number => {
    // Apply decay factor to confidence over time
    const ageInHours = (Date.now() - new Date(prediction.created_at).getTime()) / (1000 * 60 * 60)
    const ageDecay = Math.max(0.7, 1 - (ageInHours / 168)) // Decay over a week
    return Math.round(prediction.confidence * ageDecay)
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <div className="size-6 bg-muted-foreground/20 rounded" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-2 w-20 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Predictions</h2>
          <p className="text-muted-foreground">
            Real-time insights powered by machine learning
          </p>
        </div>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {unifiedPredictions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No predictions available</h3>
            <p className="text-muted-foreground">
              Upload data to start generating AI predictions
            </p>
            <Button asChild className="mt-4">
              <Link href="/products">
                <ChevronRight className="mr-2 size-4" />
                Upload Data
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {unifiedPredictions.map((prediction) => {
            const Icon = iconMap[prediction.prediction_type] || FileText
            const confidence = calculateConfidence(prediction)
            const isExpanded = expandedId === prediction.id
            
            return (
              <Card 
                key={prediction.id} 
                className={`transition-all duration-200 cursor-pointer hover:shadow-lg ${
                  isExpanded ? "ring-2 ring-primary/20" : ""
                }`}
                onClick={() => toggleExpanded(prediction.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{prediction.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={severityColors[prediction.severity]}
                        >
                          {prediction.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {prediction.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              confidence >= 90 ? 'bg-green-500' :
                              confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{confidence}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Impact</span>
                      <span className="font-medium">{prediction.impact}</span>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                        <h5 className="text-sm font-medium">Recommendation</h5>
                        <p className="text-xs text-muted-foreground">
                          {prediction.recommendation}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Created</span>
                          <span>{new Date(prediction.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/insights?prediction=${prediction.id}`}>
                          <FileText className="mr-2 size-4" />
                          Details
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => toggleExpanded(prediction.id)}
                      >
                        {isExpanded ? 'Hide' : 'Show'} Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
