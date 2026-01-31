"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  TrendingDown, 
  Package, 
  Users, 
  Mail,
  FileText,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  Play,
  X,
  Zap,
  Target
} from "lucide-react"
import { useState, useEffect } from "react"
import type { Workflow } from "@/lib/supabase"
import { NoSSR } from "@/components/no-ssr"

const iconMap: Record<string, any> = {
  customer_churn: TrendingDown,
  inventory: Package,
  lead_scoring: Users,
  email_campaign: Mail,
  report_generation: FileText,
  meeting_scheduler: Calendar,
  analytics: BarChart3,
  feedback_analysis: MessageSquare,
}

export function WorkflowsGrid() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function fetchWorkflows() {
      try {
        const response = await fetch('/api/workflows')
        if (!response.ok) {
          console.error('[v0] API error:', response.status)
          setWorkflows([])
          return
        }
        const data = await response.json()
        console.log('[v0] Workflows received:', data)
        if (Array.isArray(data)) {
          setWorkflows(data)
        } else {
          console.error('[v0] Data is not an array:', data)
          setWorkflows([])
        }
      } catch (error) {
        console.error('[v0] Error fetching workflows:', error)
        setWorkflows([])
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchWorkflows()
    }
  }, [mounted])

  const toggleWorkflow = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: isActive }),
      })

      if (response.ok) {
        const updatedWorkflow = await response.json()
        setWorkflows(prev => 
          prev.map(w => w.id === id ? updatedWorkflow : w)
        )
      }
    } catch (error) {
      console.error('[v0] Error updating workflow:', error)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading workflows...
      </div>
    )
  }

  if (workflows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No workflows configured yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <NoSSR fallback={
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="opacity-60">
            <CardHeader>
              <div className="flex items-start gap-3">
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
                <div className="flex justify-between">
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    }>
      <div className="grid gap-6 md:grid-cols-2">
        {workflows.length === 0 && !loading ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center text-muted-foreground">
              No workflows configured yet.
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => {
            const Icon = iconMap[workflow.trigger_type] || Zap
            const isActive = workflow.is_active
            
            return (
              <Card key={workflow.id} className={isActive ? "" : "opacity-60"}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-accent/10">
                        <Target className="mr-1 size-3" />
                        {workflow.total_executions} Executed
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {isActive ? "Active" : "Paused"}
                        </span>
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) => toggleWorkflow(workflow.id, checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-medium">{workflow.success_rate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Execution</span>
                      <span className="font-medium">
                        {workflow.last_execution 
                          ? new Date(workflow.last_execution).toLocaleString()
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="mr-2 size-4" />
                        Configure
                      </Button>
                      <Button size="sm" disabled={!isActive}>
                        {isActive ? (
                          <>
                            <Play className="mr-2 size-4" />
                            Run Now
                          </>
                        ) : (
                          <>
                            <X className="mr-2 size-4" />
                            Paused
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </NoSSR>
  )
}
