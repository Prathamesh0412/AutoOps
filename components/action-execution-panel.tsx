"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  AlertCircle
} = Icons
import { useState } from "react"

const pendingActions = [
  {
    id: 1,
    type: "retention",
    icon: MessageSquare,
    title: "Customer Retention Campaign",
    customer: "Sarah Chen",
    description: "High-value customer (LTV: $12,500) showing 40% engagement decline",
    proposedAction: "Send personalized retention offer with 20% discount on annual plan",
    aiConfidence: 94,
    estimatedImpact: "$12,500 revenue protected",
    urgency: "high",
    generatedContent: "Hi Sarah,\n\nWe've noticed you haven't been as active lately and wanted to reach out personally. As one of our valued customers, we'd like to offer you an exclusive 20% discount on your annual plan renewal.\n\nYour success is important to us. Can we schedule a call to discuss how we can better serve your needs?\n\nBest regards,\nCustomer Success Team",
  },
  {
    id: 2,
    type: "purchase",
    icon: ShoppingCart,
    title: "Inventory Purchase Order",
    product: "Widget Pro 3000 (SKU-2891)",
    description: "Stock predicted to run out in 4 days based on current sales velocity",
    proposedAction: "Generate purchase order for 500 units from Supplier A",
    aiConfidence: 87,
    estimatedImpact: "Prevent $24,000 lost revenue",
    urgency: "medium",
    generatedContent: "Purchase Order #PO-2024-0156\n\nSupplier: TechSupply Inc.\nProduct: Widget Pro 3000\nSKU: 2891\nQuantity: 500 units\nUnit Price: $45.00\nTotal: $22,500.00\n\nDelivery: Express (3-5 business days)\nShipping Address: Warehouse A, 123 Industrial Blvd",
  },
  {
    id: 3,
    type: "lead",
    icon: Target,
    title: "Priority Lead Assignment",
    lead: "TechCorp Inc.",
    description: "92% conversion probability based on behavior analysis and company fit",
    proposedAction: "Assign to senior sales rep Jessica Wong and schedule discovery call",
    aiConfidence: 91,
    estimatedImpact: "$45,000 potential deal",
    urgency: "high",
    generatedContent: "Lead Assignment\n\nCompany: TechCorp Inc.\nContact: Mike Johnson, VP of Operations\nScore: 92/100\n\nKey Signals:\n- Visited pricing page 5 times\n- Downloaded product comparison guide\n- Company size matches ICP (500-1000 employees)\n- Budget authority confirmed\n\nRecommended Action: Schedule demo within 48 hours\nAssigned to: Jessica Wong (Senior AE)",
  },
]

const urgencyConfig = {
  high: "border-destructive/20 bg-destructive/5",
  medium: "border-amber-500/20 bg-amber-500/5",
  low: "border-accent/20 bg-accent/5",
}

export function ActionExecutionPanel() {
  const [selectedAction, setSelectedAction] = useState(pendingActions[0])
  const [editedContent, setEditedContent] = useState(selectedAction.generatedContent)

  const handleActionSelect = (action: typeof pendingActions[0]) => {
    setSelectedAction(action)
    setEditedContent(action.generatedContent)
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
          <Tabs defaultValue={selectedAction.id.toString()} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              {pendingActions.map((action) => {
                const Icon = action.icon
                return (
                  <TabsTrigger
                    key={action.id}
                    value={action.id.toString()}
                    onClick={() => handleActionSelect(action)}
                    className="gap-2"
                  >
                    <Icon className="size-4" />
                    {action.type === "retention" && "Retention"}
                    {action.type === "purchase" && "Purchase"}
                    {action.type === "lead" && "Lead"}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value={selectedAction.id.toString()} className="space-y-4">
              <div className={`rounded-lg border p-4 ${urgencyConfig[selectedAction.urgency as keyof typeof urgencyConfig]}`}>
                <div className="flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background/50">
                    {selectedAction.type === "retention" && <MessageSquare className="size-6 text-primary" />}
                    {selectedAction.type === "purchase" && <ShoppingCart className="size-6 text-primary" />}
                    {selectedAction.type === "lead" && <Target className="size-6 text-primary" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedAction.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedAction.customer || selectedAction.product || selectedAction.lead}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          selectedAction.urgency === "high"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-500"
                        }
                      >
                        <AlertCircle className="mr-1 size-3" />
                        {selectedAction.urgency.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    <p className="text-sm">{selectedAction.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 rounded-lg border bg-card p-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">AI Confidence</p>
                  <p className="mt-1 text-lg font-bold text-primary">{selectedAction.aiConfidence}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Estimated Impact</p>
                  <p className="mt-1 text-lg font-bold text-accent">{selectedAction.estimatedImpact}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className="mt-1 bg-amber-500 text-white">Pending</Badge>
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
                <Button variant="outline" className="gap-2 bg-transparent">
                  <X className="size-4" />
                  Reject
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <FileText className="size-4" />
                  Save Draft
                </Button>
                <Button className="gap-2">
                  <Play className="size-4" />
                  Approve & Execute
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
