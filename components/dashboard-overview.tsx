"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Zap, Target, Clock, Activity, BarChart3, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useMetrics, useStoreActions, useLoadingStates } from "@/lib/hooks"
import { useRouter } from "next/navigation"
import { useRealTime } from "@/components/navigation"
import { useDataEvent, DATA_EVENTS, useDataStatus } from "@/lib/realtime-sync"
import { SafeTimeDisplay } from "@/components/hydration-safe"
import { NoSSR } from "@/components/no-ssr"

export function DashboardOverview() {
  const { isRealTimeEnabled } = useRealTime()
  const router = useRouter()
  const metrics = useMetrics()
  const { updateMetrics, simulateRealTimeData } = useStoreActions()
  const { isProcessing } = useLoadingStates()
  const { lastSync } = useDataStatus()
  const [mounted, setMounted] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    setLastUpdated(new Date())
  }, [])

  // Listen for real-time metrics updates
  useDataEvent(DATA_EVENTS.METRICS_UPDATED, () => {
    setLastUpdated(new Date())
  })

  // Listen for action executions
  useDataEvent(DATA_EVENTS.ACTION_EXECUTED, () => {
    setLastUpdated(new Date())
  })

  // Listen for product updates
  useDataEvent(DATA_EVENTS.PRODUCT_UPDATED, () => {
    setLastUpdated(new Date())
  })

  // Auto-refresh when real-time is enabled
  useEffect(() => {
    if (!isRealTimeEnabled) return

    const interval = setInterval(() => {
      setLastUpdated(new Date())
      // Trigger real-time data simulation
      simulateRealTimeData()
    }, 5000) // Refresh every 5 seconds when real-time is enabled

    return () => clearInterval(interval)
  }, [isRealTimeEnabled, simulateRealTimeData])

  useEffect(() => {
    setMounted(true)
    
    const interval = setInterval(() => {
      updateMetrics()
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [updateMetrics])

  const handleMetricClick = (metricType: string) => {
    switch (metricType) {
      case 'workflows':
        router.push('/workflows')
        break
      case 'predictions':
        router.push('/insights')
        break
      case 'actions':
        router.push('/actions')
        break
      default:
        break
    }
  }

  const metricCards = [
    {
      title: "Active Workflows",
      value: metrics.active_workflows,
      icon: Zap,
      description: "AI agents running",
      trend: 'up' as const,
      trendValue: 12,
    },
    {
      title: "Predictions Generated",
      value: metrics.predictions_generated,
      icon: BarChart3,
      description: "AI insights created",
      trend: 'up' as const,
      trendValue: 8,
    },
    {
      title: "Actions Executed",
      value: metrics.executed_actions,
      icon: Target,
      description: "Automated tasks completed",
      trend: 'up' as const,
      trendValue: 15,
    },
    {
      title: "Time Saved",
      value: metrics.time_saved_hours,
      icon: Clock,
      description: "Hours saved this week",
      suffix: "h",
      trend: 'up' as const,
      trendValue: 24,
    }
  ]

  return (
    <NoSSR fallback={
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded" />
        ))}
      </div>
    }>
      <div className="space-y-6">
        {/* Last updated indicator */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <h2 className="text-2xl font-bold">System Overview</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} ${lastSync && lastUpdated && lastSync.getTime() > lastUpdated.getTime() - 1000 ? 'animate-pulse' : ''}`} />
            <SafeTimeDisplay fallback="Loading...">
              Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
            </SafeTimeDisplay>
            {lastSync && lastUpdated && lastSync.getTime() > lastUpdated.getTime() - 1000 && (
              <Badge variant="outline" className="text-xs animate-bounce-subtle">Live</Badge>
            )}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((metric, index) => (
            <div key={index} className={`animate-fade-in-up animate-stagger-${(index % 5) + 1}`}>
              <MetricCard
                title={metric.title}
                value={metric.value}
                suffix={metric.suffix}
                description={metric.description}
                trend={metric.trend}
                trendValue={metric.trendValue}
                icon={metric.icon}
                onClick={() => handleMetricClick(metric.title.toLowerCase().includes('workflow') ? 'workflows' : 
                                            metric.title.toLowerCase().includes('prediction') ? 'predictions' : 
                                            metric.title.toLowerCase().includes('action') ? 'actions' : '')}
                loading={!mounted}
              />
            </div>
          ))}
        </div>

        {/* System Health Card */}
        <Card className="animate-fade-in-up animate-stagger-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Health</span>
                <span className="text-sm text-muted-foreground">{Math.round(metrics.system_health)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.system_health}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-500">{Math.round(metrics.confidence_score)}%</div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-500">{metrics.time_saved_hours}h</div>
                  <div className="text-xs text-muted-foreground">Time Saved</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-500">{metrics.executed_actions}</div>
                  <div className="text-xs text-muted-foreground">Actions</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </NoSSR>
  )
}
