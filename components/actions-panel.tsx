"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, CheckCircle2, Clock, Play, X, MessageSquare, FileText, ShoppingCart, TrendingUp, Mail } from "lucide-react"
import { useState, useEffect } from "react"
import type { Action } from "@/lib/supabase"

const iconMap: Record<string, any> = {
  retention_offer: MessageSquare,
  purchase_order: ShoppingCart,
  lead_prioritization: Target,
  report_generation: FileText,
  email_campaign: Mail,
  pricing_adjustment: TrendingUp,
}

export function ActionsPanel() {
  const [activeTab, setActiveTab] = useState("executed")
  const [executedActions, setExecutedActions] = useState<Action[]>([])
  const [pendingActions, setPendingActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActions() {
      try {
        const [executedRes, pendingRes] = await Promise.all([
          fetch('/api/actions?status=executed'),
          fetch('/api/actions?status=pending'),
        ])

        if (!executedRes.ok || !pendingRes.ok) {
          console.error('[v0] API error:', executedRes.status, pendingRes.status)
          setExecutedActions([])
          setPendingActions([])
          setLoading(false)
          return
        }

        const executed = await executedRes.json()
        const pending = await pendingRes.json()

        console.log('[v0] Executed actions:', executed)
        console.log('[v0] Pending actions:', pending)

        if (Array.isArray(executed)) {
          setExecutedActions(executed.slice(0, 4))
        } else {
          console.error('[v0] Executed is not an array:', executed)
          setExecutedActions([])
        }

        if (Array.isArray(pending)) {
          setPendingActions(pending.slice(0, 2))
        } else {
          console.error('[v0] Pending is not an array:', pending)
          setPendingActions([])
        }
      } catch (error) {
        console.error('[v0] Error fetching actions:', error)
        setExecutedActions([])
        setPendingActions([])
      } finally {
        setLoading(false)
      }
    }

    fetchActions()
    const interval = setInterval(fetchActions, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'executed' }),
      })

      if (!response.ok) {
        console.error('[v0] Error approving action:', response.status)
        return
      }

      setPendingActions(prev => prev.filter(a => a.id !== id))
      const executedResponse = await fetch(`/api/actions?status=executed`)
      if (executedResponse.ok) {
        const executed = await executedResponse.json()
        if (Array.isArray(executed)) {
          setExecutedActions(executed.slice(0, 4))
        }
      }
    } catch (error) {
      console.error('[v0] Error approving action:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" />
              Automated Actions
            </CardTitle>
            <CardDescription className="mt-1">
              AI-executed solutions and pending approvals
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-accent/10">
              <CheckCircle2 className="mr-1 size-3" />
              {executedActions.length + pendingActions.length} Active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="executed" className="gap-2">
              <CheckCircle2 className="size-4" />
              Executed ({executedActions.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="size-4" />
              Pending ({pendingActions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executed" className="mt-4 space-y-3">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading actions...
              </div>
            ) : executedActions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No executed actions yet.
              </div>
            ) : (
              executedActions.map((action) => {
                const Icon = iconMap[action.action_type] || Target
                return (
                  <div
                    key={action.id}
                    className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Icon className="size-6 text-accent" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{action.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-accent/10 text-accent">
                          <CheckCircle2 className="mr-1 size-3" />
                          Complete
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {action.executed_at ? new Date(action.executed_at).toLocaleString() : 'Just now'}
                        </span>
                        <span className="font-medium text-primary">{action.expected_impact}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading pending actions...
              </div>
            ) : pendingActions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No pending actions. All automated tasks are running smoothly.
              </div>
            ) : (
              pendingActions.map((action) => {
                const Icon = iconMap[action.action_type] || Target
                return (
                  <div
                    key={action.id}
                    className="flex items-start gap-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Icon className="size-6 text-amber-500" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{action.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                          <Clock className="mr-1 size-3" />
                          {action.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Impact: {action.expected_impact}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <X className="mr-2 size-4" />
                            Hold
                          </Button>
                          <Button size="sm" onClick={() => handleApprove(action.id)}>
                            <Play className="mr-2 size-4" />
                            Approve & Execute
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
