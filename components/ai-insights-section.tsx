"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity,
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Lightbulb
} from "lucide-react"
import { useDataStore } from "@/lib/hooks"
import { useRealTime } from "@/components/navigation"
import { useState, useEffect, useMemo } from "react"
import { Insight, Prediction } from "@/lib/core/data-models"

export function AIInsightsSection() {
  const { isRealTimeEnabled } = useRealTime()
  const { insights, predictions, timeRange, setTimeRange } = useDataStore()
  const [mounted, setMounted] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)
  const [explanationMode, setExplanationMode] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-refresh when real-time is enabled
  useEffect(() => {
    if (!isRealTimeEnabled) return
    const interval = setInterval(() => setLastUpdated(new Date()), 5000)
    return () => clearInterval(interval)
  }, [isRealTimeEnabled])

  // Process insights with confidence and impact analysis
  const processedInsights = useMemo(() => {
    return insights
      .filter((insight: Insight) => {
        const expired = new Date(insight.expires_at) < new Date()
        return !expired
      })
      .sort((a: Insight, b: Insight) => {
        // Sort by confidence * impact (business priority)
        const scoreA = a.confidence * a.business_impact
        const scoreB = b.confidence * b.business_impact
        return scoreB - scoreA
      })
      .slice(0, 6) // Show top 6 insights
  }, [insights])

  // Process predictions with accuracy tracking
  const processedPredictions = useMemo(() => {
    return predictions
      .filter((prediction: Prediction) => {
        const expired = new Date(prediction.expires_at) < new Date()
        return !expired
      })
      .sort((a: Prediction, b: Prediction) => b.confidence - a.confidence)
      .slice(0, 4) // Show top 4 predictions
  }, [predictions])

  // Calculate AI performance metrics
  const aiMetrics = useMemo(() => {
    const totalPredictions = predictions.length
    const completedPredictionsArray = predictions.filter((p: Prediction) => p.outcome && p.outcome !== 'pending')
    const correctPredictions = completedPredictionsArray.filter((p: Prediction) => p.outcome === 'correct')
    
    const accuracy = completedPredictionsArray.length > 0 
      ? (correctPredictions.length / completedPredictionsArray.length) * 100 
      : 0

    const avgConfidence = predictions.length > 0 
      ? predictions.reduce((sum: number, p: Prediction) => sum + p.confidence, 0) / predictions.length 
      : 0

    // Calculate confidence by type
    const confidenceByType: Record<string, number[]> = {}
    predictions.forEach((p: Prediction) => {
      if (!confidenceByType[p.type]) {
        confidenceByType[p.type] = []
      }
      confidenceByType[p.type]!.push(p.confidence)
    })

    const avgConfidenceByType: Record<string, number> = {}
    Object.keys(confidenceByType).forEach(type => {
      const scores = confidenceByType[type]!
      avgConfidenceByType[type] = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
    })

    return {
      totalPredictions,
      completedPredictions: completedPredictionsArray.length,
      accuracy,
      avgConfidence,
      confidenceByType: avgConfidenceByType
    }
  }, [predictions])

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 skeleton rounded" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-32 skeleton rounded" />
                  <div className="h-8 w-20 skeleton rounded" />
                  <div className="h-2 w-full skeleton rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="size-6 text-primary" />
              AI Intelligence
            </h2>
            {isRealTimeEnabled && (
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            Predictive insights and AI-generated recommendations
            {isRealTimeEnabled && (
              <span className="ml-2 text-xs text-muted-foreground">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={explanationMode ? "default" : "outline"}
            size="sm"
            onClick={() => setExplanationMode(!explanationMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {explanationMode ? "Explain ON" : "Explain OFF"}
          </Button>
          
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="flex items-center gap-2"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Performance Overview */}
      <Card className={`card-hover border-border/50 shadow-sm ${explanationMode ? "ring-2 ring-primary/20" : ""}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="size-4 text-primary" />
            </div>
            <span>AI Performance</span>
          </CardTitle>
          <CardDescription>
            Model accuracy and confidence metrics across all predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Accuracy Rate</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(aiMetrics.accuracy)}%
                </Badge>
              </div>
              <Progress value={aiMetrics.accuracy} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {aiMetrics.completedPredictions} of {aiMetrics.totalPredictions} completed
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Confidence</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(aiMetrics.avgConfidence)}%
                </Badge>
              </div>
              <Progress value={aiMetrics.avgConfidence} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Across all prediction types
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Insights</span>
                <Badge variant="outline" className="text-xs">
                  {processedInsights.length}
                </Badge>
              </div>
              <Progress value={(processedInsights.length / 10) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground">
                High-priority recommendations
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Model Health</span>
                <Badge variant={aiMetrics.accuracy > 80 ? "default" : "destructive"} className="text-xs">
                  {aiMetrics.accuracy > 80 ? "Healthy" : "Training"}
                </Badge>
              </div>
              <Progress value={aiMetrics.accuracy} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {aiMetrics.accuracy > 80 ? 'Performing well' : 'Needs improvement'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Insights Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Insights */}
        <Card className={`card-hover border-border/50 shadow-sm ${explanationMode ? "ring-2 ring-primary/20" : ""}`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Lightbulb className="size-4 text-amber-500" />
              </div>
              <span>AI Insights</span>
            </CardTitle>
            <CardDescription>
              Actionable business insights generated by AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {processedInsights.length > 0 ? (
                processedInsights.map((insight: Insight) => (
                  <div 
                    key={insight.id} 
                    className={`border border-border/50 rounded-lg bg-card hover:bg-accent/30 transition-colors ${
                      explanationMode ? "ring-1 ring-primary/30" : ""
                    }`}
                  >
                    <div className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50 shrink-0">
                          <Zap className="size-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{insight.title}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                              className="h-6 px-2 text-xs"
                            >
                              {expandedInsight === insight.id ? 'Hide' : 'Explain'}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {insight.confidence}% confident
                            </Badge>
                            <Badge 
                              variant={insight.business_impact > 50000 ? 'destructive' : insight.business_impact > 20000 ? 'default' : 'secondary'}
                              className="text-xs px-2 py-1"
                            >
                              ₹{insight.business_impact.toLocaleString()} impact
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium">
                              {insight.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Explainable AI Section */}
                      {expandedInsight === insight.id && (
                        <div className="border-t border-border/50 p-3 bg-muted/20">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Why this insight:</p>
                              <div className="space-y-1">
                                {insight.reason_breakdown.slice(0, 3).map((reason, index) => (
                                  <div key={index} className="flex items-center gap-2 text-xs">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                    <span>{reason}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2 text-xs">
                              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <span className="text-muted-foreground">Trend</span>
                                <span className="font-medium capitalize">{insight.trend_data.trend}</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <span className="text-muted-foreground">Priority</span>
                                <span className="font-medium">
                                  {insight.business_impact > 50000 ? 'High' : insight.business_impact > 20000 ? 'Medium' : 'Low'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                    <Lightbulb className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No insights available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI will generate insights as patterns emerge
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Predictions */}
        <Card className={`card-hover border-border/50 shadow-sm ${explanationMode ? "ring-2 ring-primary/20" : ""}`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Target className="size-4 text-blue-500" />
              </div>
              <span>Active Predictions</span>
            </CardTitle>
            <CardDescription>
              AI predictions with confidence scores and accuracy tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {processedPredictions.length > 0 ? (
                processedPredictions.map((prediction: Prediction) => (
                  <div 
                    key={prediction.id} 
                    className={`border border-border/50 rounded-lg bg-card hover:bg-accent/30 transition-colors ${
                      explanationMode ? "ring-1 ring-primary/30" : ""
                    }`}
                  >
                    <div className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50 shrink-0">
                          <Target className="size-4 text-blue-500" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm capitalize">
                              {prediction.type.replace('_', ' ')} Prediction
                            </p>
                            <Badge 
                              variant={
                                prediction.outcome === 'correct' ? 'default' : 
                                prediction.outcome === 'incorrect' ? 'destructive' : 
                                'outline'
                              }
                              className="text-xs px-2 py-1"
                            >
                              {prediction.outcome === 'correct' ? '✓ Correct' : 
                               prediction.outcome === 'incorrect' ? '✗ Incorrect' : 
                               '⏳ Pending'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {prediction.confidence}% confident
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium">
                              {prediction.prediction_horizon} days
                            </span>
                            {prediction.actual_value && (
                              <span className="text-xs text-muted-foreground">
                                Predicted: {prediction.predicted_value} | Actual: {prediction.actual_value}
                              </span>
                            )}
                          </div>
                          
                          {/* Confidence Factors */}
                          {explanationMode && (
                            <div className="mt-2 p-2 bg-muted/20 rounded">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Key factors:</p>
                              <div className="space-y-1">
                                {prediction.factors.slice(0, 2).map((factor, index) => (
                                  <div key={index} className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">{factor.name}</span>
                                    <span className="font-medium">{Math.round(factor.weight * 100)}% weight</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                    <Target className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No predictions available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI will generate predictions as data patterns emerge
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explanation Mode Info */}
      {explanationMode && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Eye className="size-5 text-primary mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium">Explanation Mode Active</h4>
                <p className="text-sm text-muted-foreground">
                  All highlighted sections show the reasoning behind AI insights and predictions. 
                  Each insight includes the key factors, confidence scores, and business impact calculations.
                </p>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-amber-500 rounded"></div>
                    High Impact Insights
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    Active Predictions
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    Correct Predictions
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
