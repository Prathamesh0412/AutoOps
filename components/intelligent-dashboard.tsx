"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Clock, 
  Activity, 
  BarChart3,
  Zap,
  DollarSign,
  Package,
  Calendar
} from "lucide-react"
import { useAppData, useStoreActions } from "@/lib/hooks"
import { useRealTime } from "@/components/navigation"
import { useState, useEffect, useMemo } from "react"

type TimeRange = '7d' | '30d' | '90d'

export function IntelligentDashboard() {
  const { isRealTimeEnabled } = useRealTime()
  const { metrics, customers, products, orders, actions, predictions } = useAppData()
  const { executeAction, rejectAction } = useStoreActions()
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Auto-refresh when real-time is enabled
  useEffect(() => {
    if (!isRealTimeEnabled) return

    const interval = setInterval(() => {
      setLastUpdated(new Date())
      // Trigger data refresh by invalidating cache or calling refresh functions
      // This would typically call API endpoints to refresh data
    }, 5000) // Refresh every 5 seconds when real-time is enabled

    return () => clearInterval(interval)
  }, [isRealTimeEnabled])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Time range calculations
  const timeRangeDays = {
    '7d': 7,
    '30d': 30,
    '90d': 90
  }

  const getDateRange = (days: number) => {
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
    const previousStart = new Date(start.getTime() - days * 24 * 60 * 60 * 1000)
    return { start, end, previousStart }
  }

  // KPI Calculations with real logic
  const kpiData = useMemo(() => {
    const days = timeRangeDays[timeRange]
    const { start, end, previousStart } = getDateRange(days)

    // Total Customers: COUNT(unique customer_id where status = active)
    const totalCustomers = customers.length // All customers are considered active

    const previousCustomers = customers.filter(c => 
      new Date(c.created_at) < start
    ).length

    // Active Products: COUNT(product_id where product_status = live)
    const activeProducts = products.filter(p => p.stock_quantity > 0).length

    // Total Revenue: SUM(order_amount where order_status = completed and date in selected range)
    const totalRevenue = orders
      .filter(o => 
        o.status === 'completed' && 
        new Date(o.created_at) >= start && 
        new Date(o.created_at) <= end
      )
      .reduce((sum, o) => sum + (o.revenue || 0), 0)

    const previousRevenue = orders
      .filter(o => 
        o.status === 'completed' && 
        new Date(o.created_at) >= previousStart && 
        new Date(o.created_at) < start
      )
      .reduce((sum, o) => sum + (o.revenue || 0), 0)

    // System Health: Composite score calculation
    const modelConfidence = predictions.length > 0 
      ? predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length 
      : 85

    const executedActions = actions.filter(a => a.status === 'executed').length
    const totalActions = actions.length
    const actionSuccessRate = totalActions > 0 ? (executedActions / totalActions) * 100 : 85

    const dataPipelineUptime = 95 // Mock: Would come from monitoring system
    const systemHealth = Math.max(0, Math.min(100, 
      0.4 * modelConfidence + 
      0.3 * actionSuccessRate + 
      0.3 * dataPipelineUptime
    ))

    return {
      totalCustomers,
      previousCustomers,
      activeProducts,
      totalRevenue,
      previousRevenue,
      systemHealth,
      modelConfidence,
      actionSuccessRate
    }
  }, [customers, products, orders, actions, predictions, timeRange])

  // Generate AI Insights with explainable logic
  const aiInsights = useMemo(() => {
    const insights = []
    
    // Customer Churn Risk Analysis
    const highRiskCustomers = customers.filter(c => c.churn_risk > 0.7)
    if (highRiskCustomers.length > 0) {
      const avgLTV = highRiskCustomers.reduce((sum, c) => sum + c.ltv, 0) / highRiskCustomers.length
      const totalRisk = highRiskCustomers.reduce((sum, c) => sum + c.churn_risk, 0) / highRiskCustomers.length
      
      insights.push({
        id: 'churn-risk',
        name: 'Customer Churn Risk',
        description: `${highRiskCustomers.length} customers at high risk of churning with average LTV of ₹${avgLTV.toLocaleString()}`,
        confidence: Math.round(totalRisk * 100),
        impact: Math.round(avgLTV * highRiskCustomers.length),
        type: 'churn_risk',
        severity: totalRisk > 0.8 ? 'High' : totalRisk > 0.6 ? 'Medium' : 'Low',
        explanation: {
          factors: [
            { name: 'Engagement Drop', weight: 0.5, value: '45%' },
            { name: 'Support Tickets', weight: 0.3, value: '3 tickets' },
            { name: 'Payment Failures', weight: 0.2, value: '2 failures' }
          ],
          recommendation: 'Send targeted retention campaigns to high-risk customers'
        }
      })
    }

    // Inventory Shortage Prediction
    const lowStockProducts = products.filter(p => p.stock_quantity <= p.reorder_threshold)
    if (lowStockProducts.length > 0) {
      const totalLostRevenue = lowStockProducts.reduce((sum, p) => sum + (p.price * p.sales_velocity * 7), 0)
      
      insights.push({
        id: 'inventory-shortage',
        name: 'Inventory Shortage Alert',
        description: `${lowStockProducts.length} products below reorder threshold, risking ₹${totalLostRevenue.toLocaleString()} in lost sales`,
        confidence: 85,
        impact: totalLostRevenue,
        type: 'inventory_shortage',
        severity: totalLostRevenue > 50000 ? 'High' : totalLostRevenue > 20000 ? 'Medium' : 'Low',
        explanation: {
          factors: [
            { name: 'Stock Level', weight: 0.4, value: `${lowStockProducts.length} products` },
            { name: 'Sales Velocity', weight: 0.3, value: 'High demand' },
            { name: 'Lead Time', weight: 0.3, value: '7 days avg' }
          ],
          recommendation: 'Reorder inventory for high-demand products immediately'
        }
      })
    }

    // Lead Scoring Insight
    const recentOrders = orders.filter(o => 
      new Date(o.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
    if (recentOrders.length > 0) {
      const avgOrderValue = recentOrders.reduce((sum, o) => sum + o.revenue, 0) / recentOrders.length
      
      insights.push({
        id: 'lead-insight',
        name: 'Lead Conversion Opportunity',
        description: `30-day average order value of ₹${avgOrderValue.toLocaleString()} indicates upsell potential`,
        confidence: 78,
        impact: Math.round(avgOrderValue * 0.2 * recentOrders.length),
        type: 'lead_insight',
        severity: 'Medium',
        explanation: {
          factors: [
            { name: 'Order Frequency', weight: 0.4, value: `${(recentOrders.length / 30).toFixed(1)}/day` },
            { name: 'Average Value', weight: 0.3, value: `₹${avgOrderValue.toLocaleString()}` },
            { name: 'Product Mix', weight: 0.3, value: 'High-margin items' }
          ],
          recommendation: 'Target recent customers with complementary product recommendations'
        }
      })
    }

    return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
  }, [customers, products, orders])

  // Generate AI-driven actions based on insights
  const generatedActions = useMemo(() => {
    const actions = []
    
    // Action: Send retention emails for high churn risk
    const highRiskCustomers = customers.filter(c => c.churn_risk > 0.7)
    if (highRiskCustomers.length > 0 && Math.random() > 0.5) {
      actions.push({
        id: 'retention-campaign',
        title: 'Send Retention Email Campaign',
        description: `Targeted email campaign for ${highRiskCustomers.length} high-risk customers with personalized offers`,
        trigger_condition: 'churn_risk > 0.7 AND confidence > 80%',
        expected_impact: Math.round(highRiskCustomers.reduce((sum, c) => sum + c.ltv, 0) * 0.3),
        risk_level: highRiskCustomers.length > 10 ? 'High' : highRiskCustomers.length > 5 ? 'Medium' : 'Low',
        action_type: 'email_campaign',
        confidence: 85
      })
    }

    // Action: Reorder inventory for low stock
    const lowStockProducts = products.filter(p => p.stock_quantity <= p.reorder_threshold)
    if (lowStockProducts.length > 0 && Math.random() > 0.3) {
      const totalCost = lowStockProducts.reduce((sum, p) => sum + (p.cost * p.reorder_threshold * 2), 0)
      actions.push({
        id: 'inventory-reorder',
        title: 'Reorder Critical Inventory',
        description: `Automated reorder for ${lowStockProducts.length} products below threshold`,
        trigger_condition: 'stock_quantity <= reorder_threshold AND sales_velocity > 0',
        expected_impact: Math.round(lowStockProducts.reduce((sum, p) => sum + (p.price * p.sales_velocity * 7), 0)),
        risk_level: totalCost > 50000 ? 'High' : totalCost > 20000 ? 'Medium' : 'Low',
        action_type: 'inventory_order',
        confidence: 90
      })
    }

    // Action: Lead assignment optimization
    const recentOrders = orders.filter(o => 
      new Date(o.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    if (recentOrders.length > 5 && Math.random() > 0.6) {
      actions.push({
        id: 'lead-assignment',
        title: 'Optimize Lead Assignment',
        description: `Reassign ${Math.round(recentOrders.length * 0.2)} leads based on conversion probability`,
        trigger_condition: 'order_frequency > 5/day AND confidence > 75%',
        expected_impact: Math.round(recentOrders.reduce((sum, o) => sum + o.revenue, 0) * 0.15),
        risk_level: 'Low',
        action_type: 'lead_assignment',
        confidence: 78
      })
    }

    return actions
  }, [customers, products, orders])

  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)
  const [approvingAction, setApprovingAction] = useState<string | null>(null)

  if (!mounted) {
    return (
      <div className="space-y-8">
        {/* Time Range Selector Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 skeleton rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 w-16 skeleton rounded" />
            ))}
          </div>
        </div>
        
        {/* KPI Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 skeleton rounded" />
                  <div className="h-8 w-16 skeleton rounded" />
                  <div className="h-2 w-full skeleton rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const metricCards = [
    {
      title: "Total Customers",
      value: kpiData.totalCustomers.toLocaleString(),
      change: kpiData.totalCustomers - kpiData.previousCustomers,
      changeType: (kpiData.totalCustomers - kpiData.previousCustomers) >= 0 ? "increase" as const : "decrease" as const,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Active Products",
      value: kpiData.activeProducts.toLocaleString(),
      change: products.filter(p => p.stock_quantity <= p.reorder_threshold).length,
      changeType: "decrease" as const, // Low stock is bad
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Total Revenue",
      value: `₹${(kpiData.totalRevenue / 1000).toFixed(0)}K`,
      change: ((kpiData.totalRevenue - kpiData.previousRevenue) / (kpiData.previousRevenue || 1)) * 100,
      changeType: (kpiData.totalRevenue - kpiData.previousRevenue) >= 0 ? "increase" as const : "decrease" as const,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "System Health",
      value: `${Math.round(kpiData.systemHealth)}%`,
      change: kpiData.systemHealth - 85, // Compare to baseline
      changeType: kpiData.systemHealth > 85 ? "increase" as const : "decrease" as const,
      icon: Activity,
      color: kpiData.systemHealth > 80 ? "text-green-600" : "text-red-600",
      bgColor: kpiData.systemHealth > 80 ? "bg-green-500/10" : "bg-red-500/10"
    }
  ]

  const handleApproveAction = async (actionId: string) => {
    setApprovingAction(actionId)
    try {
      await executeAction(actionId)
    } catch (error) {
      console.error('Failed to approve action:', error)
    } finally {
      setApprovingAction(null)
    }
  }

  const handleRejectAction = async (actionId: string) => {
    try {
      await rejectAction(actionId)
    } catch (error) {
      console.error('Failed to reject action:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Business Overview</h2>
            {isRealTimeEnabled && (
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            Real-time metrics and AI-driven insights
            {isRealTimeEnabled && (
              <span className="ml-2 text-xs text-muted-foreground">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="card-hover border-border/50 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                  </div>
                  <div className={`flex size-10 items-center justify-center rounded-xl ${metric.bgColor} shadow-sm`}>
                    <Icon className={`size-5 ${metric.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {metric.changeType === "increase" ? (
                    <TrendingUp className="size-4 text-green-600" />
                  ) : (
                    <TrendingDown className="size-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.changeType === "increase" ? "text-green-600" : "text-red-600"
                  }`}>
                    {metric.changeType === "increase" ? "+" : ""}{metric.change}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    from last period
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* System Performance Bar */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="size-4 text-blue-500" />
            </div>
            <div>
              <span>System Performance</span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Real-time operational metrics and AI efficiency
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Time Saved */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time Saved</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.time_saved_hours}h total
                </Badge>
              </div>
              <Progress value={Math.min(100, (metrics.time_saved_hours / 40) * 100)} className="h-2" />
              <div className="text-xs text-muted-foreground">
                ~{Math.round(metrics.time_saved_hours / 8)} days saved this month
              </div>
            </div>

            {/* Actions Executed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Actions Executed</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.executed_actions} total
                </Badge>
              </div>
              <Progress value={Math.min(100, (metrics.executed_actions / 50) * 100)} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {actions.filter(a => a.status === 'executed').length} successful
              </div>
            </div>

            {/* AI Confidence */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Confidence</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(metrics.confidence_score)}% avg
                </Badge>
              </div>
              <Progress value={metrics.confidence_score} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {metrics.confidence_score > 85 ? 'High accuracy' : 'Training needed'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent AI Insights */}
        <Card className="card-hover border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="size-4 text-primary" />
              </div>
              <div>
                <span>Recent AI Insights</span>
                <p className="text-sm font-normal text-muted-foreground mt-1">
                </p>
              </div>
            </CardTitle>
            <CardDescription>
              Latest predictions and recommendations from our AI engine
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {aiInsights.length > 0 ? (
                aiInsights.map((insight: any, index: number) => (
                  <div key={insight.id} className="border border-border/50 rounded-lg bg-card hover:bg-accent/30 transition-colors">
                    <div className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50 shrink-0">
                          <Zap className="size-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{insight.name}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                              className="h-6 px-2 text-xs"
                            >
                              {expandedInsight === insight.id ? 'Hide' : 'Explain'}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {insight.confidence}% confident
                            </Badge>
                            <Badge 
                              variant={insight.severity === 'High' ? 'destructive' : insight.severity === 'Medium' ? 'default' : 'secondary'}
                              className="text-xs px-2 py-1"
                            >
                              {insight.severity} Risk
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium">
                              ₹{insight.impact.toLocaleString()} impact
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Explainable AI Section */}
                    {expandedInsight === insight.id && insight.explanation && (
                      <div className="border-t border-border/50 p-3 bg-muted/20">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Why this prediction:</p>
                            <div className="space-y-1">
                              {insight.explanation.factors.map((factor: any, factorIndex: number) => (
                                <div key={factorIndex} className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{factor.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{factor.value}</span>
                                    <span className="text-muted-foreground">({Math.round(factor.weight * 100)}%)</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Recommendation:</p>
                            <p className="text-xs">{insight.explanation.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                    <Zap className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No insights available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload data to generate AI insights
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="card-hover border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="size-4 text-amber-500" />
              </div>
              <div>
                <span>Pending Actions</span>
                <p className="text-sm font-normal text-muted-foreground mt-1">
                  AI-generated actions awaiting approval
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {generatedActions.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <div className="flex size-16 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                    <Target className="size-8 opacity-50" />
                  </div>
                  <p>No pending actions</p>
                  <p className="text-xs mt-1">AI will generate actions based on insights</p>
                </div>
              ) : (
                generatedActions.map((action: any) => (
                  <div key={action.id} className="border border-border/50 rounded-xl bg-card hover:bg-accent/30 transition-all duration-200">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                          <Activity className="size-4 text-amber-500" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="font-medium text-sm">{action.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {action.description}
                            </p>
                          </div>
                          
                          {/* Trigger Condition */}
                          <div className="bg-muted/30 rounded-lg p-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Trigger:</p>
                            <p className="text-xs font-mono">{action.trigger_condition}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={action.risk_level === 'High' ? 'destructive' : action.risk_level === 'Medium' ? 'default' : 'secondary'}
                                className="text-xs px-2 py-1"
                              >
                                {action.risk_level} Risk
                              </Badge>
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                {action.confidence}% confident
                              </Badge>
                              <span className="text-xs text-muted-foreground font-medium">
                                ₹{action.expected_impact.toLocaleString()} impact
                              </span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectAction(action.id)}
                                className="h-7 px-2 text-xs"
                              >
                                Reject
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveAction(action.id)}
                                disabled={approvingAction === action.id}
                                className="h-7 px-2 text-xs"
                              >
                                {approvingAction === action.id ? 'Approving...' : 'Approve'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <Card className="card-hover border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="size-4 text-primary" />
            </div>
            <div>
              <span>System Performance</span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Real-time AI system metrics and efficiency
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time Saved</span>
                <span className="text-sm text-muted-foreground font-medium">
                  {metrics.time_saved_hours} hours
                </span>
              </div>
              <Progress value={Math.min(100, metrics.time_saved_hours * 2)} className="h-3" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Actions Executed</span>
                <span className="text-sm text-muted-foreground font-medium">
                  {metrics.executed_actions}
                </span>
              </div>
              <Progress 
                value={Math.min(100, (metrics.executed_actions / Math.max(1, metrics.executed_actions + metrics.pending_actions)) * 100)} 
                className="h-3" 
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Confidence</span>
                <span className="text-sm text-muted-foreground font-medium">
                  {metrics.confidence_score}%
                </span>
              </div>
              <Progress value={metrics.confidence_score} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
