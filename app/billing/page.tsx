"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Calendar, DollarSign, TrendingUp, Download, AlertCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { NoSSR } from "@/components/no-ssr"

export default function BillingPage() {
  return (
    <NoSSR>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <Button>Upgrade Plan</Button>
          </div>

          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan</span>
                <Badge className="bg-green-500">Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="text-xl font-semibold">Enterprise Plan</h3>
                  <p className="text-muted-foreground">Full access to all AutoOps AI features</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">$299</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited AI predictions</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">24/7 monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Billing History</span>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoices
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "2024-01-15", amount: "$299", status: "Paid", plan: "Enterprise Plan" },
                  { date: "2023-12-15", amount: "$299", status: "Paid", plan: "Enterprise Plan" },
                  { date: "2023-11-15", amount: "$299", status: "Paid", plan: "Enterprise Plan" },
                  { date: "2023-10-15", amount: "$99", status: "Paid", plan: "Pro Plan" },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{invoice.plan}</div>
                      <div className="text-sm text-muted-foreground">{invoice.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{invoice.amount}</div>
                      <Badge variant={invoice.status === "Paid" ? "default" : "secondary"}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <div className="font-medium">•••• •••• •••• 4242</div>
                    <div className="text-sm text-muted-foreground">Expires 12/25</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </NoSSR>
  )
}
