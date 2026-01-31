"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, AlertTriangle, TrendingDown, Package, Users, ChevronRight, DollarSign, Clock, Target } from "lucide-react"
import { useEffect, useState } from "react"
import { usePredictions, useAppStore } from "@/lib/store"
import type { Prediction } from "@/lib/store"
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
  const predictions = usePredictions()
  const { generatePrediction, updatePredictionSeverity } = useAppStore()
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter predictions based on severity
  const filteredPredictions = predictions.filter(prediction => 
    filter === 'All' || prediction.severity === filter
  ).slice(0, 6)

  // Calculate confidence score programmatically
  const calculateConfidence = (prediction: Prediction): number => {
    // Simulate AI confidence calculation based on various factors
    let baseConfidence = prediction.confidence
    
    // Adjust based on data age (newer predictions are more confident)
    const ageInHours = (Date.now() - new Date(prediction.created_at).getTime()) / (1000 * 60 * 60)
    const ageFactor = Math.max(0.7, 1 - (ageInHours / 168)) // Decay over a week
    
    // Adjust based on severity
    const severityFactor = prediction.severity === 'High' ? 1.1 : prediction.severity === 'Medium' ? 1.0 : 0.9
    
    return Math.min(99, Math.round(baseConfidence * ageFactor * severityFactor))
  }

  const handleSeverityChange = (id: string, severity: 'High' | 'Medium' | 'Low') => {
    updatePredictionSeverity(id, severity)
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const generateNewPrediction = () => {
    generatePrediction()
  }

  const avgConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + calculateConfidence(p), 0) / predictions.length)
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
        {!mounted ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Analyzing data...
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No active predictions. System is monitoring data.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="flex items-center justify-between">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={generateNewPrediction}>
                Generate New
              </Button>
            </div>

            {/* Predictions list */}
            {filteredPredictions.map((prediction) => {
              const Icon = iconMap[prediction.prediction_type] || Zap
              const calculatedConfidence = calculateConfidence(prediction)
              const isExpanded = expandedId === prediction.id
              
              return (
                <div
                  key={prediction.id}
                  className={`rounded-lg border p-4 transition-all duration-200 ${severityColors[prediction.severity as keyof typeof severityColors]} ${
                    isExpanded ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background/50">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{prediction.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {calculatedConfidence}% confident
                          </Badge>
                          <Select 
                            value={prediction.severity} 
                            onValueChange={(value: any) => handleSeverityChange(prediction.id, value)}
                          >
                            <SelectTrigger className="w-20 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="mt-1 text-sm opacity-90">
                          {prediction.description}
                        </p>
                      </div>
                      
                      {/* Expandable details */}
                      {isExpanded && prediction.details && (
                        <div className="mt-3 p-3 bg-background/50 rounded-lg">
                          <h5 className="text-sm font-medium mb-2">Why this prediction?</h5>
                          <p className="text-xs text-muted-foreground">{prediction.details}</p>
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Recommendation: </span>
                            {prediction.recommendation}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {new Date(prediction.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => toggleExpanded(prediction.id)}
                            className="gap-1 bg-transparent"
                          >
                            {isExpanded ? 'Hide' : 'Show'} Details
                          </Button>
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
