"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, Clock, CheckCircle2, TrendingUp } from "lucide-react"
import { useAppData } from "@/lib/hooks"

export function WorkflowStats() {
  const { workflows } = useAppData()
  
  const activeWorkflows = workflows.filter(w => w.is_active).length
  const avgSuccessRate = workflows.length > 0 
    ? Math.round(workflows.reduce((sum, w) => sum + w.success_rate, 0) / workflows.length)
    : 0
  
  // Calculate actions this week (executions in the last 7 days)
  const actionsThisWeek = workflows.reduce((total, workflow) => {
    if (workflow.last_execution) {
      const executionDate = new Date(workflow.last_execution)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      if (executionDate >= weekAgo) {
        return total + workflow.total_executions
      }
    }
    return total
  }, 0)

  const statCards = [
    {
      label: "Total Workflows",
      value: workflows.length,
      icon: Zap,
      color: "text-primary",
    },
    {
      label: "Active Now",
      value: activeWorkflows,
      icon: Clock,
      color: "text-green-600",
    },
    {
      label: "Success Rate",
      value: `${avgSuccessRate}%`,
      icon: CheckCircle2,
      color: avgSuccessRate >= 80 ? "text-green-600" : avgSuccessRate >= 60 ? "text-amber-600" : "text-red-600",
    },
    {
      label: "Actions This Week",
      value: actionsThisWeek,
      icon: TrendingUp,
      color: "text-primary",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className={`size-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
