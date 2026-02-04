// Core data models for AutoOps AI
export interface Customer {
  id: string
  name: string
  email: string
  ltv: number // Lifetime Value
  engagement_score: number // 0-100
  purchase_frequency: number // purchases per month
  last_purchase: string
  churn_risk: number // 0-100 calculated
  segment: 'enterprise' | 'mid-market' | 'small-business'
  created_at: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  cost: number
  stock_quantity: number
  sales_velocity: number // units per week
  demand_score: number // 0-100 calculated
  profit_margin: number // percentage
  reorder_threshold: number
  supplier_lead_time: number // days
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  product_id: string
  quantity: number
  revenue: number
  profit: number
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
}

export interface Campaign {
  id: string
  name: string
  type: 'retention' | 'acquisition' | 'promotion'
  target_segment: string
  status: 'draft' | 'active' | 'completed' | 'paused'
  budget: number
  spent: number
  roi: number // calculated
  conversions: number
  created_at: string
}

export interface Company {
  id: string
  name: string
  industry: string
  size: 'startup' | 'small' | 'medium' | 'enterprise'
  maturity_level: number // 1-5
  monthly_revenue: number
  employee_count: number
  created_at: string
}

export interface Action {
  id: string
  title: string
  description: string
  action_type: 'email_campaign' | 'inventory_order' | 'lead_assignment' | 'price_adjustment'
  status: 'pending' | 'executed' | 'rejected' | 'rolled_back'
  priority: 'High' | 'Medium' | 'Low'
  confidence: number // 0-100
  expected_impact: number // monetary value
  trigger_insight_id: string
  generated_content: string
  edited_content?: string
  executed_at?: string
  created_at: string
  execution_log?: ExecutionLog
}

export interface Workflow {
  id: string
  name: string
  description: string
  trigger_type: 'customer_churn' | 'inventory_shortage' | 'lead_score'
  trigger_conditions: Record<string, any>
  actions: string[] // action IDs
  is_active: boolean
  success_rate: number // calculated per execution
  last_execution: string | null
  total_executions: number
  business_impact: number // total monetary impact
  created_at: string
  execution_logs: ExecutionLog[]
}

export interface ExecutionLog {
  id: string
  workflow_id?: string
  action_id?: string
  status: 'success' | 'failure' | 'partial'
  reason_code: string
  business_impact: number
  execution_time: number // milliseconds
  created_at: string
}

export interface Insight {
  id: string
  type: 'churn_risk' | 'inventory_shortage' | 'lead_value' | 'profit_opportunity'
  title: string
  description: string
  confidence: number // 0-100
  business_impact: number // monetary value
  reason_breakdown: string[]
  trend_data: {
    current: number
    previous: number
    trend: 'up' | 'down' | 'stable'
  }
  decay_factor: number // 0-1, decreases over time
  target_entity_id: string // customer_id, product_id, etc.
  target_entity_type: 'customer' | 'product' | 'order'
  created_at: string
  expires_at: string
}

export interface Prediction {
  id: string
  type: 'churn' | 'demand' | 'lead_conversion' | 'revenue'
  target_entity_id: string
  target_entity_type: 'customer' | 'product' | 'order'
  confidence: number // 0-100
  predicted_value: number
  actual_value?: number // Updated after outcome
  prediction_horizon: number // days
  factors: {
    name: string
    weight: number
    value: number
  }[]
  created_at: string
  expires_at: string
  outcome?: 'correct' | 'incorrect' | 'pending'
}

export interface SystemMetrics {
  total_customers: number
  total_products: number
  total_revenue: number
  total_profit: number
  active_workflows: number
  pending_actions: number
  executed_actions: number
  system_health: number // 0-100
  time_saved_hours: number
  confidence_score: number // overall system confidence
  last_updated: string
  // Derived metrics (calculated, not stored)
  revenue_per_customer?: number
  profit_margin?: number
  action_success_rate?: number
  avg_confidence_by_type?: Record<string, number>
  monthly_recurring_revenue?: number
  customer_acquisition_cost?: number
  churn_rate?: number
  inventory_turnover?: number
}

// Core data spine - unified data model
class UnifiedDataModel {
  // Core entities
  companies: Company[] = []
  products: Product[] = []
  customers: Customer[] = []
  orders: Order[] = []
  actions: Action[] = []
  predictions: Prediction[] = []
  workflows: Workflow[] = []
  
  // Computed metrics (always derived from core entities)
  getMetrics(timeRange: TimeRange): SystemMetrics {
    const filteredOrders = this.filterOrdersByTimeRange(this.orders, timeRange)
    const filteredActions = this.filterActionsByTimeRange(this.actions, timeRange)
    const executedActions = filteredActions.filter(a => a.status === 'executed')
    
    // Core metrics
    const total_customers = this.customers.length
    const total_products = this.products.length
    const total_revenue = filteredOrders.reduce((sum, o) => sum + o.revenue, 0)
    const total_profit = filteredOrders.reduce((sum, o) => sum + o.profit, 0)
    const executed_actions = executedActions.length
    const pending_actions = filteredActions.filter(a => a.status === 'pending').length
    
    // Derived metrics (no orphan numbers)
    const revenue_per_customer = total_customers > 0 ? total_revenue / total_customers : 0
    const profit_margin = total_revenue > 0 ? (total_profit / total_revenue) * 100 : 0
    const action_success_rate = filteredActions.length > 0 ? (executed_actions / filteredActions.length) * 100 : 0
    const avg_confidence = this.predictions.length > 0 
      ? this.predictions.reduce((sum, p) => sum + p.confidence, 0) / this.predictions.length 
      : 0
    
    // Time saved calculation (based on actual executed actions)
    const timeSavedPerAction: Record<string, number> = {
      'email_campaign': 2,
      'inventory_order': 4,
      'lead_assignment': 1.5,
      'price_adjustment': 1
    }
    const time_saved_hours = executedActions.reduce((total, action) => {
      return total + (timeSavedPerAction[action.action_type] || 1)
    }, 0)
    
    // System health (composite of real metrics)
    const system_health = Math.min(100, (
      0.3 * avg_confidence +
      0.4 * action_success_rate +
      0.3 * (this.customers.filter(c => c.churn_risk < 0.3).length / Math.max(1, this.customers.length) * 100)
    ))
    
    return {
      total_customers,
      total_products,
      total_revenue,
      total_profit,
      active_workflows: this.workflows.filter(w => w.is_active).length,
      pending_actions,
      executed_actions,
      system_health,
      time_saved_hours,
      confidence_score: avg_confidence,
      last_updated: new Date().toISOString(),
      // Derived metrics
      revenue_per_customer,
      profit_margin,
      action_success_rate,
      avg_confidence_by_type: this.getConfidenceByType(),
      monthly_recurring_revenue: this.calculateMRR(filteredOrders),
      customer_acquisition_cost: this.calculateCAC(),
      churn_rate: this.calculateChurnRate(),
      inventory_turnover: this.calculateInventoryTurnover()
    }
  }
  
  private filterOrdersByTimeRange(orders: Order[], timeRange: TimeRange): Order[] {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return orders.filter(o => new Date(o.created_at) >= cutoff)
  }
  
  private filterActionsByTimeRange(actions: Action[], timeRange: TimeRange): Action[] {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return actions.filter(a => new Date(a.created_at) >= cutoff)
  }
  
  private getConfidenceByType(): Record<string, number> {
    const confidenceByType: Record<string, number[]> = {}
    this.predictions.forEach(p => {
      if (!confidenceByType[p.type]) confidenceByType[p.type] = []
      confidenceByType[p.type].push(p.confidence)
    })
    
    const result: Record<string, number> = {}
    Object.entries(confidenceByType).forEach(([type, scores]) => {
      result[type] = scores.reduce((sum, score) => sum + score, 0) / scores.length
    })
    return result
  }
  
  private calculateMRR(orders: Order[]): number {
    // Simplified MRR calculation based on recent orders
    const recentOrders = orders.filter(o => 
      new Date(o.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
    return recentOrders.reduce((sum, o) => sum + o.revenue, 0) / 30
  }
  
  private calculateCAC(): number {
    // Customer Acquisition Cost = Total Marketing Spend / New Customers
    // For demo, we'll use a simplified calculation
    const recentCustomers = this.customers.filter(c => 
      new Date(c.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
    return recentCustomers > 0 ? 5000 / recentCustomers : 0 // Assume $5k monthly marketing spend
  }
  
  private calculateChurnRate(): number {
    const highRiskCustomers = this.customers.filter(c => c.churn_risk > 0.7).length
    return this.customers.length > 0 ? (highRiskCustomers / this.customers.length) * 100 : 0
  }
  
  private calculateInventoryTurnover(): number {
    const totalStock = this.products.reduce((sum, p) => sum + p.stock_quantity, 0)
    const avgMonthlySales = 50 // Simplified - would calculate from orders
    return totalStock > 0 ? avgMonthlySales / totalStock : 0
  }
}

export type TimeRange = '7d' | '30d' | '90d'
export const unifiedDataModel = new UnifiedDataModel()
