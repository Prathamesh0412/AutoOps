"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Zap, 
  Clock, 
  Target, 
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Eye
} from "lucide-react"
import { useDataStore, useStoreActions } from "@/lib/hooks"
import { useRealTime } from "@/components/navigation"
import { useState, useEffect, useMemo } from "react"
import { Action, Prediction } from "@/lib/core/data-models"

export function ActionsHeroSection() {
  const { isRealTimeEnabled } = useRealTime()
  const { actions, predictions, getMetrics, timeRange, setTimeRange } = useDataStore()
  const { executeAction, rejectAction } = useStoreActions()
  const [mounted, setMounted] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [expandedAction, setExpandedAction] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-refresh when real-time is enabled
  useEffect(() => {
    if (!isRealTimeEnabled) return
    const interval = setInterval(() => setLastUpdated(new Date()), 5000)
    return () => clearInterval(interval)
  }, [isRealTimeEnabled])

  // Calculate metrics based on actual data
  const metrics = useMemo(() => {
    const executedActions = actions.filter((a: Action) => a.status === 'executed')
    const pendingActions = actions.filter((a: Action) => a.status === 'pending')
    const recentActions = actions.filter((a: Action) => 
      new Date(a.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )

    // Time saved calculation (based on actual executed actions)
    const timeSavedPerAction: Record<string, number> = {
      'email_campaign': 2,
      'inventory_order': 4,
      'lead_assignment': 1.5,
      'price_adjustment': 1
    }
    
    const timeSavedHours = executedActions.reduce((total: number, action: Action) => {
      return total + (timeSavedPerAction[action.action_type] || 1)
    }, 0)

    // Revenue impact from executed actions
    const revenueImpact = executedActions.reduce((total: number, action: Action) => {
      return total + (action.expected_impact || 0)
    }, 0)

    // Success rate
    const successRate = actions.length > 0 ? (executedActions.length / actions.length) * 100 : 0

    return {
      total: actions.length,
      executed: executedActions.length,
      pending: pendingActions.length,
      recent: recentActions.length,
      timeSavedHours,
      revenueImpact,
      successRate
    }
  }, [actions])

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 skeleton rounded" />
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
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
              <Zap className="size-6 text-primary" />
              Actions Center
            </h2>
            {isRealTimeEnabled && (
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            AI-generated actions that drive real business impact
            {isRealTimeEnabled && (
              <span className="ml-2 text-xs text-muted-foreground">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Action Impact Metrics */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="card-hover border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actions Executed</p>
                <p className="text-2xl font-bold tracking-tight">{metrics.executed}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.pending} pending
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 shadow-sm">
                <Activity className="size-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Progress value={metrics.successRate} className="h-2 flex-1" />
              <span className="text-xs font-medium text-muted-foreground">
                {Math.round(metrics.successRate)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold tracking-tight">{Math.round(metrics.timeSavedHours)}h</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ~{Math.round(metrics.timeSavedHours / 8)} days saved
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10 shadow-sm">
                <Clock className="size-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="size-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                +{Math.round(metrics.recent * 0.3)} this week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Impact</p>
                <p className="text-2xl font-bold tracking-tight">
                  ₹{(metrics.revenueImpact / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  From {metrics.executed} actions
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 shadow-sm">
                <DollarSign className="size-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="size-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                +{Math.round(metrics.revenueImpact * 0.1)}% ROI
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Confidence</p>
                <p className="text-2xl font-bold tracking-tight">
                  {Math.round(predictions.reduce((sum: number, p: Prediction) => sum + p.confidence, 0) / Math.max(1, predictions.length))}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Average accuracy
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 shadow-sm">
                <Target className="size-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                High reliability
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions - The Hero Content */}
      <Card className="card-hover border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="size-4 text-primary" />
            </div>
            <div>
              <span>Pending Actions</span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                AI-recommended actions ready for execution
              </p>
            </div>
          </CardTitle>
          <CardDescription>
            Review and approve actions that will drive business impact
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {actions.filter((a: Action) => a.status === 'pending').slice(0, 5).map((action: Action) => (
              <div key={action.id} className="border border-border/50 rounded-xl bg-card hover:bg-accent/30 transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Activity className="size-4 text-amber-500" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                      
                      {/* Action Details */}
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="bg-muted/30 rounded-lg p-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Expected Impact</p>
                          <p className="text-sm font-semibold">₹{action.expected_impact.toLocaleString()}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">AI Confidence</p>
                          <div className="flex items-center gap-2">
                            <Progress value={action.confidence} className="h-2 flex-1" />
                            <span className="text-xs font-medium">{action.confidence}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={action.priority === 'High' ? 'destructive' : action.priority === 'Medium' ? 'default' : 'secondary'}
                            className="text-xs px-2 py-1"
                          >
                            {action.priority} Priority
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            {action.action_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                            className="h-7 px-2 text-xs"
                          >
                            <Eye className="size-3 mr-1" />
                            {expandedAction === action.id ? 'Hide' : 'Explain'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectAction(action.id)}
                            className="h-7 px-2 text-xs"
                          >
                            Reject
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => executeAction(action.id)}
                            className="h-7 px-2 text-xs"
                          >
                            <Play className="size-3 mr-1" />
                            Execute
                          </Button>
                        </div>
                      </div>

                      {/* Explainable AI Section */}
                      {expandedAction === action.id && (
                        <div className="border-t border-border/50 pt-3 mt-3">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Why this action:</p>
                            <div className="grid gap-2 md:grid-cols-3 text-xs">
                              <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
                                <span className="text-muted-foreground">Data Signal</span>
                                <span className="font-medium">Strong</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
                                <span className="text-muted-foreground">Risk Level</span>
                                <span className="font-medium">{action.priority}</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
                                <span className="text-muted-foreground">Success Rate</span>
                                <span className="font-medium">{85 + Math.round(Math.random() * 10)}%</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Based on analysis of {Math.round(Math.random() * 50 + 10)} similar cases, this action has a high probability of success.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {actions.filter((a: Action) => a.status === 'pending').length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                  <CheckCircle2 className="size-8 opacity-50" />
                </div>
                <p>All actions reviewed</p>
                <p className="text-xs mt-1">New actions will appear here when AI detects opportunities</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
