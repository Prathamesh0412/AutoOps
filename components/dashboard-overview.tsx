"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Zap, Target, Clock, Activity, BarChart3, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useAppStore, useMetrics, useIsProcessing } from "@/lib/store"
import { useRouter } from "next/navigation"
import { NoSSR } from "@/components/no-ssr"

export function DashboardOverview() {
  const router = useRouter()
  const metrics = useMetrics()
  const isProcessing = useIsProcessing()
  const { updateMetrics } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

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
      value: metrics.activeWorkflows,
      icon: Zap,
      description: "AI agents running",
      trend: 'up' as const,
      trendValue: 12,
    },
    {
      title: "Predictions Generated",
      value: metrics.predictionsGenerated,
      icon: BarChart3,
      description: "AI insights created",
      trend: 'up' as const,
      trendValue: 8,
    },
    {
      title: "Actions Executed",
      value: metrics.totalActions,
      icon: Target,
      description: "Automated tasks completed",
      trend: 'up' as const,
      trendValue: 15,
    },
    {
      title: "Time Saved",
      value: metrics.timeSaved,
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Overview</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((metric, index) => (
            <MetricCard
              key={index}
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
          ))}
        </div>

        {/* System Health Card */}
        <Card>
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
                <span className="text-sm text-muted-foreground">{Math.round(metrics.systemHealth)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.systemHealth}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-500">{metrics.accuracyRate}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-500">{metrics.productivityBoost}x</div>
                  <div className="text-xs text-muted-foreground">Productivity</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-500">Live</div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </NoSSR>
  )
}
