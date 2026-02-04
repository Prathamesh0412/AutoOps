"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAppData, useStoreActions } from "@/lib/hooks"
import type { Action as DbAction } from "@/lib/supabase"
import { 
  AlertCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  Play, 
  ShoppingCart, 
  Target,
  CheckCircle2,
  X,
  AlertTriangle,
  TrendingUp,
  Users
} from "lucide-react"

const ACTION_META = {
  email_campaign: { label: "Retention", icon: MessageSquare, color: "text-blue-600" },
  inventory_order: { label: "Purchase", icon: ShoppingCart, color: "text-green-600" },
  lead_assignment: { label: "Lead", icon: Target, color: "text-purple-600" },
} as const

type ActionKind = keyof typeof ACTION_META
type UrgencyLevel = "high" | "medium" | "low"

interface PendingAction {
  id: string
  type: ActionKind
  title: string
  description: string
  aiConfidence: number
  estimatedImpact: string
  urgency: UrgencyLevel
  generatedContent: string
  status: 'pending' | 'executed' | 'rejected' | 'executing'
  executedAt?: string
}

const FALLBACK_ACTIONS: PendingAction[] = [
  {
    id: "retention-1",
    type: "email_campaign",
    title: "Customer Retention Campaign",
    description: "High-value customer showing 40% engagement decline",
    aiConfidence: 94,
    estimatedImpact: "₹8,50,000 revenue protected",
    urgency: "high",
    generatedContent: "Personalized retention offer with exclusive discount",
    status: 'pending'
  },
  {
    id: "inventory-1",
    type: "inventory_order",
    title: "Stock Reorder Alert",
    description: "Critical inventory below threshold levels",
    aiConfidence: 87,
    estimatedImpact: "₹45,000 potential loss prevention",
    urgency: "medium",
    generatedContent: "Automated reorder for high-demand products",
    status: 'pending'
  },
  {
    id: "lead-1",
    type: "lead_assignment",
    title: "Lead Assignment Optimization",
    description: "AI-powered lead scoring and routing",
    aiConfidence: 91,
    estimatedImpact: "₹25,000 additional revenue",
    urgency: "low",
    generatedContent: "Optimized lead assignment based on conversion probability",
    status: 'pending'
  }
]

const URGENCY_STYLES: Record<UrgencyLevel, string> = {
  high: "border-destructive/20 bg-destructive/5",
  medium: "border-amber-500/20 bg-amber-500/5",
  low: "border-accent/20 bg-accent/5",
}

const formatImpact = (value?: string) => {
  if (!value) return "Impact pending"
  const numericValue = Number(value)
  if (Number.isFinite(numericValue)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numericValue)
  }
  return value
}

const deriveUrgency = (priority?: string): UrgencyLevel => {
  const normalized = priority?.toLowerCase()
  if (normalized === "high") return "high"
  if (normalized === "medium") return "medium"
  return "low"
}

const buildActionPreview = (action: DbAction): PendingAction => {
  const type = (action.action_type in ACTION_META ? action.action_type : "email_campaign") as ActionKind
  const urgency = deriveUrgency(action.priority)
  const aiConfidence = urgency === "high" ? 92 : urgency === "medium" ? 84 : 78
  const draft = typeof action.result?.draft === "string" ? action.result.draft : action.description

  return {
    id: action.id,
    type,
    title: action.title,
    description: action.description,
    aiConfidence,
    estimatedImpact: formatImpact(action.expected_impact),
    urgency,
    generatedContent: draft ?? "",
    status: 'pending'
  }
}

export function ActionExecutionPanel() {
  const { toast } = useToast()
  const [pendingActions, setPendingActions] = useState<PendingAction[]>(FALLBACK_ACTIONS)
  const [selectedActionId, setSelectedActionId] = useState<string>(FALLBACK_ACTIONS[0]?.id ?? "")
  const [editedContent, setEditedContent] = useState<string>(FALLBACK_ACTIONS[0]?.generatedContent ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchPendingActions = async () => {
      try {
        const response = await fetch("/api/actions?status=pending")
        if (!response.ok) throw new Error("Failed to fetch actions")
        const data: DbAction[] = await response.json()
        if (!Array.isArray(data) || !data.length) {
          if (isMounted) {
            setPendingActions([])
            setSelectedActionId("")
            setEditedContent("")
          }
          return
        }

        const mapped = data.map(buildActionPreview)
        if (isMounted) {
          setPendingActions(mapped)
          setSelectedActionId(mapped[0].id)
          setEditedContent(mapped[0].generatedContent)
        }
      } catch (error) {
        console.warn("[ActionExecutionPanel] Falling back to templates", error)
      }
    }

    fetchPendingActions()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!pendingActions.length) return
    if (!pendingActions.some((action) => action.id === selectedActionId)) {
      const next = pendingActions[0]
      setSelectedActionId(next.id)
      setEditedContent(next.generatedContent)
    }
  }, [pendingActions, selectedActionId])

  const selectedAction = pendingActions.find((action) => action.id === selectedActionId)

  const handleTabChange = (value: string) => {
    const action = pendingActions.find((item) => item.id === value)
    if (!action) return
    setSelectedActionId(action.id)
    setEditedContent(action.generatedContent)
  }

  const mutateAction = async (status: "completed" | "on_hold", successMessage: string) => {
    if (!selectedAction) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/actions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedAction.id, status }),
      })

      if (!response.ok) throw new Error("Failed to update action")

      setPendingActions((prev) => prev.filter((action) => action.id !== selectedAction.id))
      toast({
        title: successMessage,
        description: `${selectedAction.title} is now ${status === "completed" ? "completed" : "on hold"}.`,
      })
    } catch (error) {
      console.error("[ActionExecutionPanel] Unable to update action", error)
      toast({
        title: "Unable to update action",
        description: "Please retry in a few seconds.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    if (!selectedAction) return
    setPendingActions((prev) =>
      prev.map((action) => (action.id === selectedAction.id ? { ...action, generatedContent: editedContent } : action))
    )
    toast({ title: "Draft saved", description: "Your edits are stored locally for review." })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-amber-500" />
            Pending Approvals
          </CardTitle>
          <CardDescription>Review and approve AI-generated actions before execution</CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingActions.length || !selectedAction ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              All automated actions are up to date. New approvals will appear here as soon as AI recommendations arrive.
            </div>
          ) : (
            <Tabs value={selectedActionId} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                {pendingActions.map((action) => {
                  const Icon = ACTION_META[action.type].icon
                  return (
                    <TabsTrigger key={action.id} value={action.id} className="gap-2">
                      <Icon className="size-4" />
                      {ACTION_META[action.type].label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value={selectedAction.id} className="space-y-6">
                <div className={`rounded-lg border p-4 ${URGENCY_STYLES[selectedAction.urgency]}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background/50">
                      {(() => {
                        const Icon = ACTION_META[selectedAction.type].icon
                        return <Icon className="size-6 text-primary" />
                      })()}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{selectedAction.title}</h3>
                          <p className="text-sm text-muted-foreground">{selectedAction.description}</p>
                        </div>
                        <Badge variant="outline" className="gap-1 text-xs">
                          <AlertCircle className="size-3" />
                          {selectedAction.urgency.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">{selectedAction.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border bg-background/60 p-4 text-center">
                    <p className="text-xs text-muted-foreground">AI Confidence</p>
                    <p className="text-2xl font-semibold text-primary">{selectedAction.aiConfidence}%</p>
                  </div>
                  <div className="rounded-lg border bg-background/60 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Estimated Impact</p>
                    <p className="mt-1 text-lg font-bold text-accent">{selectedAction.estimatedImpact}</p>
                  </div>
                  <div className="rounded-lg border bg-background/60 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Status After Approval</p>
                    <p className="text-2xl font-semibold text-emerald-500">Ready</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action-content">Review & Edit</Label>
                  <Textarea
                    id="action-content"
                    className="min-h-55"
                    value={editedContent}
                    onChange={(event) => setEditedContent(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Tailor the draft before moving the action forward.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="gap-2"
                    disabled={isSubmitting}
                    onClick={() => mutateAction("completed", "Action approved and executed")}
                  >
                    <Play className="size-4" />
                    Approve & Execute
                  </Button>
                  <Button
                    variant="secondary"
                    className="gap-2"
                    disabled={isSubmitting}
                    onClick={() => mutateAction("on_hold", "Action moved to review queue")}
                  >
                    <Clock className="size-4" />
                    Hold for Review
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleSaveDraft} disabled={!editedContent}>
                    <FileText className="size-4" />
                    Save Draft
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
