"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "@/components/ui/toast-provider"
import * as Icons from "lucide-react"
const { 
  MessageSquare, 
  ShoppingCart, 
  Target, 
  FileText,
  Play,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} = Icons
import { useState, useEffect } from "react"
import { useDataStore } from "@/lib/core/data-store"
import type { Action } from "@/lib/core/data-models"

export function ActionExecutionPanel() {
  const { 
    actions, 
    insights, 
    executeAction, 
    rejectAction, 
    isLoading 
  } = useDataStore()
  
  const pendingActions = actions.filter(action => action.status === 'pending')
  const [selectedAction, setSelectedAction] = useState<Action | undefined>(
    pendingActions.length > 0 ? pendingActions[0] : actions.length > 0 ? actions[0] : undefined
  )
  const [editedContent, setEditedContent] = useState(selectedAction?.generated_content || '')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Update selectedAction when actions change
    if (!selectedAction && pendingActions.length > 0) {
      setSelectedAction(pendingActions[0])
      setEditedContent(pendingActions[0].generated_content || '')
    } else if (selectedAction && !actions.find(a => a.id === selectedAction.id)) {
      // Current selected action was removed, select a new one
      const newSelected = pendingActions.length > 0 ? pendingActions[0] : actions.length > 0 ? actions[0] : undefined
      setSelectedAction(newSelected)
      setEditedContent(newSelected?.generated_content || '')
    }
  }, [actions, pendingActions, selectedAction])

  const handleActionSelect = (action: Action) => {
    setSelectedAction(action)
    setEditedContent(action.generated_content || '')
  }

  const handleApprove = async () => {
    setPendingAction('approve')
    setShowConfirmDialog(true)
  }

  const handleReject = async () => {
    setPendingAction('reject')
    setShowConfirmDialog(true)
  }

  const handleSaveDraft = () => {
    // Update the action message in store
    if (selectedAction) {
      // Note: In a real system, this would persist to backend
      console.log('Draft saved:', editedContent)
    }
  }

  const executeActionHandler = async () => {
    try {
      if (pendingAction === 'approve' && selectedAction) {
        await executeAction(selectedAction.id, editedContent)
        toast({ 
          message: `Action "${selectedAction?.title || 'this action'}" executed successfully`, 
          type: "success" 
        })
      } else if (pendingAction === 'reject' && selectedAction) {
        rejectAction(selectedAction.id)
        toast({ 
          message: `Action "${selectedAction?.title || 'this action'}" rejected`, 
          type: "info" 
        })
      }
      
      setShowConfirmDialog(false)
      setPendingAction(null)
    } catch (error) {
      toast({ 
        message: "Failed to execute action. Please try again.", 
        type: "error" 
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-amber-500" />
            Pending Approvals
          </CardTitle>
          <CardDescription>
            Review and approve AI-generated actions before execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingActions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Target className="size-12 mx-auto mb-4 opacity-50" />
              <p>No pending actions. System is monitoring for new insights.</p>
            </div>
          ) : (
            <Tabs defaultValue={selectedAction?.id || pendingActions[0]?.id} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                {pendingActions.slice(0, 3).map((action) => {
                  const getIcon = (type: string) => {
                    switch (type) {
                      case 'email_campaign': return MessageSquare
                      case 'inventory_order': return ShoppingCart
                      case 'lead_assignment': return Target
                      default: return Target
                    }
                  }
                  const Icon = getIcon(action.action_type)
                  
                  return (
                    <TabsTrigger
                      key={action.id}
                      value={action.id}
                      onClick={() => handleActionSelect(action)}
                      className="gap-2"
                    >
                      <Icon className="size-4" />
                      {action.action_type === 'email_campaign' && "Retention"}
                      {action.action_type === 'inventory_order' && "Purchase"}
                      {action.action_type === 'lead_assignment' && "Lead"}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

            <TabsContent value={selectedAction?.id || ''} className="space-y-4">
              {selectedAction && (
                <>
                  <div className={`rounded-lg border p-4 ${
                    selectedAction.priority === 'High' 
                      ? "border-destructive/20 bg-destructive/5" 
                      : "border-amber-500/20 bg-amber-500/5"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background/50">
                        {selectedAction.action_type === "email_campaign" && <MessageSquare className="size-6 text-primary" />}
                        {selectedAction.action_type === "inventory_order" && <ShoppingCart className="size-6 text-primary" />}
                        {selectedAction.action_type === "lead_assignment" && <Target className="size-6 text-primary" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{selectedAction.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              AI-generated action
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              selectedAction.priority === "High"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-amber-500/10 text-amber-500"
                            }
                          >
                            <AlertCircle className="mr-1 size-3" />
                            {selectedAction.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                        <p className="text-sm">{selectedAction.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 rounded-lg border bg-card p-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">AI Confidence</p>
                      <p className="mt-1 text-lg font-bold text-primary">{selectedAction.confidence}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Expected Impact</p>
                      <p className="mt-1 text-lg font-bold text-accent">₹{selectedAction?.expected_impact?.toLocaleString() || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={`mt-1 ${
                        selectedAction.priority === 'High' ? 'status-high' : 'status-medium'
                      }`}>
                        Pending
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="action-content">Generated Content</Label>
                    <Textarea
                      id="action-content"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can edit the AI-generated content before approval
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      className="gap-2 btn-ghost"
                      onClick={handleReject}
                      disabled={isLoading}
                    >
                      <X className="size-4" />
                      Reject
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-2 btn-ghost"
                      onClick={handleSaveDraft}
                      disabled={isLoading}
                    >
                      <FileText className="size-4" />
                      Save Draft
                    </Button>
                    <Button 
                      className="gap-2 btn-primary"
                      onClick={handleApprove}
                      disabled={isLoading}
                    >
                      <Play className="size-4" />
                      Approve & Execute
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          )
        </Tabs>
          )}</CardContent>
    </Card>

    <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={pendingAction === 'approve' ? 'Approve & Execute Action' : 'Reject Action'}
        description={
          pendingAction === 'approve'
            ? `Are you sure you want to execute "${selectedAction?.title || 'this action'}"? This action will be processed immediately.`
            : `Are you sure you want to reject "${selectedAction?.title || 'this action'}"? This action will be removed from the pending list.`
        }
        confirmText={pendingAction === 'approve' ? 'Execute' : 'Reject'}
        onConfirm={executeActionHandler}
        isLoading={isLoading}
      />
  </div>
  )
}
