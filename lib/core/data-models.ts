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
}
