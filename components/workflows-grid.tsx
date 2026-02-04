"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  Play,
  X,
  Zap,
  Target,
  Trash,
  Edit
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAppData, useStoreActions, useLoadingStates } from "@/lib/hooks"
import type { Workflow } from "@/lib/unified-store"
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
  const { workflows } = useAppData()
  const { toggleWorkflow, executeWorkflow, deleteWorkflow, updateWorkflow } = useStoreActions()
  const { isProcessing } = useLoadingStates()
  const [mounted, setMounted] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggleWorkflow = async (id: string, isActive: boolean) => {
    await toggleWorkflow(id, isActive)
  }

  const handleExecuteWorkflow = async (id: string) => {
    await executeWorkflow(id)
  }

  const handleDeleteWorkflow = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteWorkflow(id)
    }
  }

  const handleEditWorkflow = (id: string) => {
    setEditingId(editingId === id ? null : id)
  }

  const handleSaveWorkflow = async (id: string, updates: Partial<Workflow>) => {
    await updateWorkflow(id, updates)
    setEditingId(null)
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getStatusColor = (workflow: Workflow) => {
    if (workflow.is_executing) return 'text-blue-500'
    if (workflow.is_active) return 'text-green-500'
    return 'text-gray-500'
  }

  if (!mounted) {
    return (
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
        {workflows.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center text-muted-foreground">
              No workflows configured yet.
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => {
            const Icon = iconMap[workflow.trigger_type] || Zap
            const isActive = workflow.is_active
            const isExpanded = expandedId === workflow.id
            
            return (
              <Card key={workflow.id} className={`transition-all duration-200 ${isActive ? "" : "opacity-60"} ${isExpanded ? "ring-2 ring-primary/20" : ""}`}>
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
                          onCheckedChange={(checked) => handleToggleWorkflow(workflow.id, checked)}
                          disabled={isProcessing}
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
                    
                    {/* Success Rate Progress Bar */}
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            workflow.success_rate >= 90 ? 'bg-green-500' :
                            workflow.success_rate >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${workflow.success_rate}%` }}
                        />
                      </div>
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

                    {/* Expandable execution logs */}
                    {isExpanded && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                        <h5 className="text-sm font-medium">Execution Details</h5>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={getStatusColor(workflow)}>
                              {workflow.is_executing ? 'Executing...' : isActive ? 'Ready' : 'Paused'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trigger Type:</span>
                            <span>{workflow.trigger_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Actions:</span>
                            <span>{Array.isArray(workflow.actions) ? workflow.actions.length : 0} configured</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditWorkflow(workflow.id)}
                      >
                        <Edit className="mr-2 size-4" />
                        {editingId === workflow.id ? 'Cancel' : 'Edit'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="mr-2 size-4" />
                        Delete
                      </Button>
                      <Button 
                        size="sm" 
                        disabled={!isActive || workflow.is_executing || isProcessing} 
                        onClick={() => isActive && handleExecuteWorkflow(workflow.id)}
                      >
                        {workflow.is_executing ? (
                          <>
                            <div className="mr-2 size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Executing...
                          </>
                        ) : isActive ? (
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
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => toggleExpanded(workflow.id)}
                        className="text-xs"
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                    
                    {/* Edit Form */}
                    {editingId === workflow.id && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
                        <h5 className="text-sm font-medium">Edit Workflow</h5>
                        <div className="grid gap-3">
                          <div>
                            <label className="text-xs font-medium">Name</label>
                            <input
                              type="text"
                              className="w-full mt-1 px-2 py-1 text-sm border rounded"
                              defaultValue={workflow.name}
                              onBlur={(e) => handleSaveWorkflow(workflow.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Description</label>
                            <textarea
                              className="w-full mt-1 px-2 py-1 text-sm border rounded"
                              rows={2}
                              defaultValue={workflow.description}
                              onBlur={(e) => handleSaveWorkflow(workflow.id, { description: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
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
