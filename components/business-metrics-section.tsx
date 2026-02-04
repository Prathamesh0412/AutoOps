"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign,
  Package,
  BarChart3,
  Activity,
  Calendar,
  Building,
  Filter
} from "lucide-react"
import { useDataStore } from "@/lib/hooks"
import { useRealTime } from "@/components/navigation"
import { useState, useEffect, useMemo } from "react"
import { Company } from "@/lib/core/data-models"

export function BusinessMetricsSection() {
  const { isRealTimeEnabled } = useRealTime()
  const { 
    selectedCompany, 
    companies, 
    customers, 
    products, 
    orders, 
    getMetrics, 
    timeRange, 
    setTimeRange,
    switchCompany 
  } = useDataStore()
  const [mounted, setMounted] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-refresh when real-time is enabled
  useEffect(() => {
    if (!isRealTimeEnabled) return
    const interval = setInterval(() => setLastUpdated(new Date()), 5000)
    return () => clearInterval(interval)
  }, [isRealTimeEnabled])

  // Get metrics from unified data model
  const metrics = useMemo(() => getMetrics(timeRange), [getMetrics, timeRange])

  // Calculate additional business metrics
  const businessMetrics = useMemo(() => {
    if (!selectedCompany) return null

    // Customer metrics
    const activeCustomers = customers.filter(c => c.churn_risk < 0.5)
    const highValueCustomers = customers.filter(c => c.ltv > selectedCompany.monthly_revenue * 0.05)
    const atRiskCustomers = customers.filter(c => c.churn_risk > 0.7)
    
    // Product metrics
    const activeProducts = products.filter(p => p.stock_quantity > 0)
    const lowStockProducts = products.filter(p => p.stock_quantity <= p.reorder_threshold)
    const highMarginProducts = products.filter(p => p.profit_margin > 60)
    
    // Order metrics
    const recentOrders = orders.filter(o => 
      new Date(o.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
    const avgOrderValue = recentOrders.length > 0 
      ? recentOrders.reduce((sum, o) => sum + o.revenue, 0) / recentOrders.length 
      : 0

    return {
      activeCustomers: activeCustomers.length,
      highValueCustomers: highValueCustomers.length,
      atRiskCustomers: atRiskCustomers.length,
      activeProducts: activeProducts.length,
      lowStockProducts: lowStockProducts.length,
      highMarginProducts: highMarginProducts.length,
      recentOrders: recentOrders.length,
      avgOrderValue,
      customerHealth: (activeCustomers.length / Math.max(1, customers.length)) * 100,
      inventoryHealth: (activeProducts.length / Math.max(1, products.length)) * 100
    }
  }, [selectedCompany, customers, products, orders])

  if (!mounted || !businessMetrics) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 skeleton rounded" />
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
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
    <div className="space-y-8">
      {/* Header with Company Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="size-6 text-primary" />
              Business Metrics
            </h2>
            {isRealTimeEnabled && (
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            Real business outcomes and performance indicators
            {isRealTimeEnabled && (
              <span className="ml-2 text-xs text-muted-foreground">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Company Switcher */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
            {companies.map((company: Company) => (
              <Button
                key={company.id}
                variant={selectedCompany?.id === company.id ? "default" : "ghost"}
                size="sm"
                onClick={() => switchCompany(company.id)}
                className="flex items-center gap-2"
              >
                <Building className="h-4 w-4" />
                {company.name.split(' ')[0]}
              </Button>
            ))}
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {range === '7d' ? '7d' : range === '30d' ? '30d' : '90d'}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Company Info Bar */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-medium">{selectedCompany?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedCompany?.industry} • {selectedCompany?.size} • Maturity Level {selectedCompany?.maturity_level}/5
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Monthly Revenue</p>
                <p className="font-semibold">₹{(selectedCompany?.monthly_revenue || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Employees</p>
                <p className="font-semibold">{selectedCompany?.employee_count}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Business Metrics */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="card-hover border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold tracking-tight">
                  ₹{(metrics.total_revenue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.revenue_per_customer ? 
                    `₹${Math.round(metrics.revenue_per_customer).toLocaleString()} per customer` : 
                    'Loading...'
                  }
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 shadow-sm">
                <DollarSign className="size-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {metrics.profit_margin && metrics.profit_margin > 0 ? (
                <TrendingUp className="size-4 text-green-600" />
              ) : (
                <TrendingDown className="size-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                metrics.profit_margin && metrics.profit_margin > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {metrics.profit_margin ? `${Math.round(metrics.profit_margin)}% margin` : 'Loading...'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold tracking-tight">{businessMetrics.activeCustomers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {businessMetrics.atRiskCustomers} at risk
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10 shadow-sm">
                <Users className="size-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Progress value={businessMetrics.customerHealth} className="h-2 flex-1" />
              <span className="text-xs font-medium text-muted-foreground">
                {Math.round(businessMetrics.customerHealth)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product Catalog</p>
                <p className="text-2xl font-bold tracking-tight">{businessMetrics.activeProducts}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {businessMetrics.lowStockProducts} low stock
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 shadow-sm">
                <Package className="size-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Progress value={businessMetrics.inventoryHealth} className="h-2 flex-1" />
              <span className="text-xs font-medium text-muted-foreground">
                {Math.round(businessMetrics.inventoryHealth)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold tracking-tight">{Math.round(metrics.system_health)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.executed_actions} actions executed
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 shadow-sm">
                <Activity className="size-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={metrics.system_health > 80 ? "default" : "destructive"} className="text-xs">
                {metrics.system_health > 80 ? "Optimal" : "Needs Attention"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Business Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Insights */}
        <Card className="card-hover border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="size-4 text-blue-500" />
              </div>
              <span>Customer Insights</span>
            </CardTitle>
            <CardDescription>
              Customer segmentation and value analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">High Value Customers</p>
                  <p className="text-lg font-semibold">{businessMetrics.highValueCustomers}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((businessMetrics.highValueCustomers / Math.max(1, customers.length)) * 100)}% of total
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">At Risk Customers</p>
                  <p className="text-lg font-semibold text-red-600">{businessMetrics.atRiskCustomers}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((businessMetrics.atRiskCustomers / Math.max(1, customers.length)) * 100)}% churn risk
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Customer Distribution</p>
                <div className="space-y-2">
                  {['enterprise', 'mid-market', 'small-business'].map((segment) => {
                    const count = customers.filter(c => c.segment === segment).length
                    const percentage = (count / Math.max(1, customers.length)) * 100
                    return (
                      <div key={segment} className="flex items-center gap-3">
                        <div className="w-20 text-xs capitalize">{segment.replace('-', ' ')}</div>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <div className="w-8 text-xs text-right">{count}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Performance */}
        <Card className="card-hover border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-green-500/10">
                <Package className="size-4 text-green-500" />
              </div>
              <span>Product Performance</span>
            </CardTitle>
            <CardDescription>
              Inventory and product profitability analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">High Margin Products</p>
                  <p className="text-lg font-semibold">{businessMetrics.highMarginProducts}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((businessMetrics.highMarginProducts / Math.max(1, products.length)) * 100)}% of catalog
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Low Stock Alert</p>
                  <p className="text-lg font-semibold text-amber-600">{businessMetrics.lowStockProducts}</p>
                  <p className="text-xs text-muted-foreground">
                    Need reordering
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Average Order Value</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-2xl font-bold">
                      ₹{Math.round(businessMetrics.avgOrderValue).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      From {businessMetrics.recentOrders} recent orders
                    </div>
                  </div>
                  {businessMetrics.avgOrderValue > (selectedCompany?.monthly_revenue || 0) * 0.01 ? (
                    <TrendingUp className="size-5 text-green-600" />
                  ) : (
                    <TrendingDown className="size-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel (Collapsible) */}
      {showFilters && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            <CardDescription>
              Filter metrics by specific criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Segment</label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>All Segments</option>
                  <option>Enterprise</option>
                  <option>Mid-Market</option>
                  <option>Small Business</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Category</label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>All Categories</option>
                  <option>Software</option>
                  <option>Hardware</option>
                  <option>Services</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Risk Level</label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>All Levels</option>
                  <option>High Risk</option>
                  <option>Medium Risk</option>
                  <option>Low Risk</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
