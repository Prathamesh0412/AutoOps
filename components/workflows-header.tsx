"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Plus, Settings } from "lucide-react"
import { useAppData, useStoreActions } from "@/lib/hooks"
import { useState } from "react"

export function WorkflowsHeader() {
  const { workflows } = useAppData()
  const { addWorkflow } = useStoreActions()
  const [showSettings, setShowSettings] = useState(false)
  
  const activeWorkflows = workflows.filter(w => w.is_active).length
  
  const handleNewWorkflow = () => {
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      name: `New Workflow ${workflows.length + 1}`,
      description: "Automated workflow for business process optimization",
      trigger_type: "customer_churn",
      trigger_conditions: {
        churn_risk_threshold: 0.7,
        customer_segment: "high-value"
      },
      actions: [
        {
          type: "email_campaign",
          config: {
            template: "retention_offer",
            delay_hours: 24
          }
        }
      ],
      is_active: false,
      success_rate: 0,
      last_execution: null,
      total_executions: 0,
      created_at: new Date().toISOString()
    }
    
    addWorkflow(newWorkflow)
  }

  const handleSettings = () => {
    setShowSettings(!showSettings)
    // In a real app, this would open a settings modal or navigate to settings page
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          AI Workflow Automation
        </h1>
        <p className="mt-2 text-lg text-muted-foreground text-pretty">
          Configure and manage automated business workflows
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="bg-primary/10">
          <Zap className="mr-1 size-3" />
          {activeWorkflows} Active
        </Badge>
        <Button variant="outline" size="sm" onClick={handleSettings}>
          <Settings className="mr-2 size-4" />
          Settings
        </Button>
        <Button size="sm" onClick={handleNewWorkflow}>
          <Plus className="mr-2 size-4" />
          New Workflow
        </Button>
      </div>
    </div>
  )
}
