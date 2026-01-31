"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Zap, Target, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { NoSSR } from "@/components/no-ssr"

interface Metrics {
  activeWorkflows: number
  predictionsMade: number
  actionsExecuted: number
  timeSaved: number
}

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<Metrics>({
    activeWorkflows: 0,
    predictionsMade: 0,
    actionsExecuted: 0,
    timeSaved: 0,
  })
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/metrics')
        if (!response.ok) {
          console.error('[v0] API error:', response.status)
          return
        }
        const data = await response.json()
        console.log('[v0] Metrics received:', data)
        if (data && typeof data === 'object') {
          setMetrics(data)
        } else {
          console.error('[v0] Invalid metrics data:', data)
        }
      } catch (error) {
        console.error('[v0] Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchMetrics()
      const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [mounted])

  const metricCards = [
    {
      title: "Active Workflows",
      value: metrics.activeWorkflows,
      icon: Zap,
      description: "AI agents running",
    },
    {
      title: "Predictions Made",
      value: metrics.predictionsMade,
      icon: Zap,
      description: "Last 7 days",
    },
    {
      title: "Actions Executed",
      value: metrics.actionsExecuted,
      icon: Target,
      description: "Automated tasks",
    },
    {
      title: "Time Saved",
      value: metrics.timeSaved,
      icon: Clock,
      description: "Hours saved",
    },
  ]

  return (
    <NoSSR fallback={
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    }>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => (
          <Card key={metric.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <metric.icon className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
              </div>
              <Badge
                variant="default"
                className="flex items-center gap-1"
              >
                <TrendingUp className="size-3" />
                Live
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : metric.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
            <div className="absolute -right-4 -top-4 size-24 rounded-full bg-primary/5" />
          </Card>
        ))}
      </div>
    </NoSSR>
  )
}
