"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  Target, 
  AlertTriangle,
  BarChart3,
  ShoppingCart,
  Zap
} from "lucide-react"
import { useDataStore } from "@/lib/core/data-store"
import { IntelligenceEngine } from "@/lib/core/intelligence-engine"

export function ProductIntelligenceDashboard() {
  const { 
    products, 
    orders, 
    actions, 
    generateActions,
    executeAction 
  } = useDataStore()
  
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d'>('30d')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate product metrics
  const getProductMetrics = (product: any) => {
    const productOrders = orders.filter(order => order.product_id === product.id)
    const totalSold = productOrders.reduce((sum, order) => sum + order.quantity, 0)
    const totalRevenue = productOrders.reduce((sum, order) => sum + order.revenue, 0)
    const totalProfit = productOrders.reduce((sum, order) => sum + order.profit, 0)
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : product.profit_margin
    
    // Calculate demand vs stock gap
    const weeklyDemand = productOrders.reduce((sum, order) => sum + order.quantity, 0) / 4
    const stockWeeks = product.stock_quantity / weeklyDemand
    const demandGap = Math.max(0, weeklyDemand - product.stock_quantity / 4)
    
    return {
      totalSold,
      totalRevenue,
      totalProfit,
      profitMargin,
      weeklyDemand,
      stockWeeks,
      demandGap,
      stockoutRisk: stockWeeks < 2 ? 100 - (stockWeeks * 50) : 0
    }
  }

  // Sort products by different metrics
  const mostBoughtProducts = [...products]
    .map(product => ({
      ...product,
      metrics: getProductMetrics(product)
    }))
    .sort((a, b) => b.metrics.totalSold - a.metrics.totalSold)
    .slice(0, 5)

  const mostDemandedProducts = [...products]
    .map(product => ({
      ...product,
      metrics: getProductMetrics(product)
    }))
    .sort((a, b) => b.metrics.weeklyDemand - a.metrics.weeklyDemand)
    .slice(0, 5)

  const mostProfitableProducts = [...products]
    .map(product => ({
      ...product,
      metrics: getProductMetrics(product)
    }))
    .sort((a, b) => b.metrics.totalProfit - a.metrics.totalProfit)
    .slice(0, 5)

  const generateProductRecommendations = (product: any) => {
    const metrics = getProductMetrics(product)
    const recommendations = []

    if (metrics.stockoutRisk > 60) {
      recommendations.push({
        type: 'inventory',
        title: 'Increase Inventory',
        description: `Order ${Math.ceil(metrics.demandGap * 2)} units to prevent stockout`,
        impact: metrics.weeklyDemand * product.price * 4,
        priority: 'High'
      })
    }

    if (metrics.profitMargin < 30) {
      recommendations.push({
        type: 'pricing',
        title: 'Price Adjustment',
        description: 'Consider price increase or cost reduction',
        impact: metrics.totalRevenue * 0.1,
        priority: 'Medium'
      })
    }

    if (metrics.weeklyDemand > product.sales_velocity * 1.5) {
      recommendations.push({
        type: 'promotion',
        title: 'Run Promotion',
        description: 'Capitalize on increased demand',
        impact: metrics.weeklyDemand * product.price * 0.2,
        priority: 'Medium'
      })
    }

    return recommendations
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-32 skeleton rounded" />
                  <div className="h-8 w-20 skeleton rounded" />
                  <div className="h-2 w-full skeleton rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          Product Intelligence
        </h1>
        <p className="mt-2 text-lg text-muted-foreground text-pretty">
          AI-driven product performance analysis and recommendations
        </p>
      </div>

      {/* Time Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Time Period:</span>
        <Tabs value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Dashboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Most Bought Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-primary" />
              Most Bought Products
            </CardTitle>
            <CardDescription>
              Ranked by quantity sold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostBoughtProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.metrics.totalSold} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.metrics.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="size-3" />
                      +{Math.round(Math.random() * 20 + 5)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Demanded Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-amber-500" />
              Most Demanded Products
            </CardTitle>
            <CardDescription>
              Demand vs stock gap analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostDemandedProducts.map((product, index) => (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(product.metrics.weeklyDemand)} units/week
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={product.metrics.stockoutRisk > 60 ? "destructive" : "secondary"}
                      className="gap-1"
                    >
                      {product.metrics.stockoutRisk > 60 ? (
                        <>
                          <AlertTriangle className="size-3" />
                          High Risk
                        </>
                      ) : (
                        'Normal'
                      )}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Stock: {product.stock_quantity} units</span>
                      <span>{Math.round(product.metrics.stockWeeks)} weeks left</span>
                    </div>
                    <Progress 
                      value={Math.min(100, product.metrics.stockWeeks * 25)} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Profitable Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5 text-green-600" />
              Most Profitable Products
            </CardTitle>
            <CardDescription>
              Revenue minus cost analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostProfitableProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-green-500/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(product.metrics.profitMargin)}% margin
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.metrics.totalProfit.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="size-3" />
                      +{Math.round(product.metrics.profitMargin)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Actionable insights generated from product data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map(product => {
              const recommendations = generateProductRecommendations(product)
              return recommendations.map((rec, recIndex) => (
                <div key={`${product.id}-${recIndex}`} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{product.name}</p>
                    </div>
                    <Badge 
                      variant={rec.priority === 'High' ? 'destructive' : 'secondary'}
                      className="gap-1"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">
                      +${rec.impact.toLocaleString()} impact
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        // Generate and execute action
                        const action = {
                          id: `action_${product.id}_${Date.now()}`,
                          title: rec.title,
                          description: rec.description,
                          action_type: rec.type === 'inventory' ? 'inventory_order' : 'price_adjustment',
                          status: 'pending' as const,
                          priority: rec.priority as 'High' | 'Medium' | 'Low',
                          confidence: 85,
                          expected_impact: rec.impact,
                          trigger_insight_id: `product_insight_${product.id}`,
                          generated_content: `AI Recommendation: ${rec.title}\n\n${rec.description}\n\nProjected impact: $${rec.impact.toLocaleString()}\nPriority: ${rec.priority}`,
                          created_at: new Date().toISOString()
                        }
                        executeAction(action.id)
                      }}
                    >
                      Execute
                    </Button>
                  </div>
                </div>
              ))
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
