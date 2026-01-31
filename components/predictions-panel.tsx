"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, AlertTriangle, TrendingDown, Package, Users, ChevronRight, DollarSign, Clock, Target, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useDataStore } from "@/lib/core/data-store"
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
  const { insights, generateInsights } = useDataStore()
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter insights based on severity (using confidence as proxy for severity)
  const filteredInsights = insights.filter(insight => {
    const confidence = insight.confidence
    let severity: 'High' | 'Medium' | 'Low'
    if (confidence >= 80) severity = 'High'
    else if (confidence >= 60) severity = 'Medium'
    else severity = 'Low'
    
    return filter === 'All' || severity === filter
  }).slice(0, 6)

  // Calculate confidence score programmatically
  const calculateConfidence = (insight: any): number => {
    // Apply decay factor to confidence over time
    const ageInHours = (Date.now() - new Date(insight.created_at).getTime()) / (1000 * 60 * 60)
    const ageDecay = Math.max(0.7, 1 - (ageInHours / 168)) // Decay over a week
    
    return Math.min(99, Math.round(insight.confidence * ageDecay * insight.decay_factor))
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const generateNewInsight = () => {
    generateInsights()
  }

  const avgConfidence = insights.length > 0
    ? Math.round(insights.reduce((sum, insight) => sum + calculateConfidence(insight), 0) / insights.length)
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
            {insights.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Analyzing data...
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No active predictions. System is monitoring data.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filter by severity:</span>
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All ({insights.length})</SelectItem>
                    <SelectItem value="High">High ({insights.filter(i => i.confidence >= 80).length})</SelectItem>
                    <SelectItem value="Medium">Medium ({insights.filter(i => i.confidence >= 60 && i.confidence < 80).length})</SelectItem>
                    <SelectItem value="Low">Low ({insights.filter(i => i.confidence < 60).length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                size="sm" 
                onClick={generateNewInsight}
                className="btn-primary"
              >
                <Zap className="mr-1 size-3" />
                Generate New
              </Button>
            </div>

            {/* Insights list */}
            {filteredInsights.map((insight) => {
              const Icon = iconMap[insight.type] || Zap
              const calculatedConfidence = calculateConfidence(insight)
              const isExpanded = expandedId === insight.id
              
              return (
                <div
                  key={insight.id}
                  className={`rounded-lg border p-4 transition-all duration-200 cursor-pointer ${
                    insight.confidence >= 80 ? severityColors.High : 
                    insight.confidence >= 60 ? severityColors.Medium : 
                    severityColors.Low
                  } ${
                    isExpanded ? 'ring-2 ring-primary/20 shadow-md' : 'shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => toggleExpanded(insight.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background/50">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {calculatedConfidence}% confident
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm opacity-90">
                          {insight.description}
                        </p>
                      </div>
                      
                      {/* Expandable details */}
                      <div className={`overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        {insight.reason_breakdown && (
                          <div className="mt-3 p-3 bg-background/50 rounded-lg animate-fade-in">
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <AlertTriangle className="size-4" />
                              Why this insight exists
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">{insight.reason_breakdown.join(', ')}</p>
                            <div className="mt-3 p-2 bg-muted/50 rounded border-l-2 border-primary/30">
                              <p className="text-xs font-medium text-primary">Business Impact</p>
                              <p className="text-xs text-muted-foreground mt-1">${insight.business_impact.toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {new Date(insight.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExpanded(insight.id)
                            }}
                            className="gap-1 btn-ghost"
                          >
                            {isExpanded ? (
                              <>
                                <AlertCircle className="size-3" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <AlertCircle className="size-3" />
                                Show Details
                              </>
                            )}
                          </Button>
                          <Link href="/insights">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1 btn-ghost"
                              onClick={(e) => e.stopPropagation()}
                            >
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
