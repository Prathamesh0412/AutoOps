"use client"

import { useState, useEffect } from 'react'
import { Customer, Product, Order, Insight, Action, Prediction, Workflow, Company, unifiedDataModel, TimeRange } from './data-models'
import { IntelligenceEngine } from './intelligence-engine'

// Mock companies with different maturity levels for realistic demos
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    industry: 'Software',
    size: 'enterprise',
    maturity_level: 4,
    monthly_revenue: 500000,
    employee_count: 250,
    created_at: '2020-01-15'
  },
  {
    id: '2', 
    name: 'MediumScale Inc',
    industry: 'Manufacturing',
    size: 'medium',
    maturity_level: 3,
    monthly_revenue: 150000,
    employee_count: 75,
    created_at: '2021-06-20'
  },
  {
    id: '3',
    name: 'SmallBiz Startup',
    industry: 'Retail',
    size: 'small',
    maturity_level: 2,
    monthly_revenue: 45000,
    employee_count: 15,
    created_at: '2023-03-10'
  }
]

// Mock data scaled realistically based on company maturity
const generateRealisticCustomers = (company: Company): Customer[] => {
  const baseCount = company.size === 'enterprise' ? 50 : company.size === 'medium' ? 20 : 8
  const customerCount = baseCount * company.maturity_level
  
  return Array.from({ length: customerCount }, (_, i) => ({
    id: `${company.id}-${i + 1}`,
    name: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    ltv: company.monthly_revenue * 0.1 * (1 + Math.random() * 0.5), // 10% of monthly revenue per customer
    engagement_score: Math.round(40 + Math.random() * 60),
    purchase_frequency: Math.round((1 + Math.random() * 4) * 10) / 10,
    last_purchase: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    churn_risk: Math.round(Math.random() * 100),
    segment: company.size === 'enterprise' ? 
      (i < customerCount * 0.6 ? 'enterprise' : i < customerCount * 0.9 ? 'mid-market' : 'small-business') :
      (i < customerCount * 0.3 ? 'mid-market' : 'small-business'),
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }))
}

const generateRealisticProducts = (company: Company): Product[] => {
  const baseCount = company.size === 'enterprise' ? 15 : company.size === 'medium' ? 8 : 4
  const productCount = Math.round(baseCount * (company.maturity_level / 3))
  
  return Array.from({ length: productCount }, (_, i) => ({
    id: `${company.id}-prod-${i + 1}`,
    name: `Product ${i + 1}`,
    sku: `SKU-${company.id}-${i + 1}`,
    category: ['Software', 'Hardware', 'Services', 'Consulting'][Math.floor(Math.random() * 4)],
    price: Math.round((1000 + Math.random() * 49000) * (company.maturity_level / 3)),
    cost: Math.round(500 + Math.random() * 10000),
    stock_quantity: Math.round(5 + Math.random() * 95),
    sales_velocity: Math.round((0.5 + Math.random() * 5) * 10) / 10,
    demand_score: Math.round(30 + Math.random() * 70),
    profit_margin: Math.round(40 + Math.random() * 40),
    reorder_threshold: Math.round(10 + Math.random() * 20),
    supplier_lead_time: Math.round(7 + Math.random() * 14),
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }))
}

const generateRealisticOrders = (company: Company, customers: Customer[], products: Product[]): Order[] => {
  const orderCount = Math.round(customers.length * (0.3 + Math.random() * 0.4)) // 30-70% of customers have orders
  
  return Array.from({ length: orderCount }, (_, i) => {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const product = products[Math.floor(Math.random() * products.length)]
    const quantity = Math.round(1 + Math.random() * 5)
    const revenue = product.price * quantity
    const profit = revenue * (product.profit_margin / 100)
    
    return {
      id: `${company.id}-order-${i + 1}`,
      customer_id: customer.id,
      product_id: product.id,
      quantity,
      revenue,
      profit,
      status: Math.random() > 0.1 ? 'completed' : 'pending',
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  })
}

const generateRealisticActions = (company: Company, insights: Insight[]): Action[] => {
  const actionCount = Math.round(insights.length * (0.5 + Math.random() * 0.5))
  const actionTypes: Action['action_type'][] = ['email_campaign', 'inventory_order', 'lead_assignment', 'price_adjustment']
  
  return Array.from({ length: actionCount }, (_, i) => {
    const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)]
    const confidence = Math.round(70 + Math.random() * 25) // Realistic confidence: 70-95%
    const isExecuted = Math.random() > 0.3 // 70% execution rate
    
    return {
      id: `${company.id}-action-${i + 1}`,
      title: `Action ${i + 1}: ${actionType.replace('_', ' ')}`,
      description: `Automated ${actionType} based on AI analysis`,
      action_type: actionType,
      status: isExecuted ? 'executed' : Math.random() > 0.5 ? 'pending' : 'rejected',
      priority: confidence > 90 ? 'High' : confidence > 80 ? 'Medium' : 'Low',
      confidence,
      expected_impact: Math.round(company.monthly_revenue * 0.01 * (confidence / 100)), // 1% of monthly revenue scaled by confidence
      trigger_insight_id: insights.length > 0 ? insights[Math.floor(Math.random() * insights.length)].id : '',
      generated_content: `Generated content for ${actionType}`,
      executed_at: isExecuted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  })
}

const generateRealisticPredictions = (company: Company, customers: Customer[], products: Product[]): Prediction[] => {
  const predictionCount = Math.round((customers.length + products.length) * 0.3)
  const predictionTypes: Prediction['type'][] = ['churn', 'demand', 'lead_conversion', 'revenue']
  
  return Array.from({ length: predictionCount }, (_, i) => {
    const type = predictionTypes[Math.floor(Math.random() * predictionTypes.length)]
    const confidence = Math.round(65 + Math.random() * 30) // Realistic: 65-95%
    const hasOutcome = Math.random() > 0.6 // 40% have outcomes
    
    return {
      id: `${company.id}-pred-${i + 1}`,
      type,
      target_entity_id: type === 'churn' ? customers[Math.floor(Math.random() * customers.length)].id :
                       type === 'demand' ? products[Math.floor(Math.random() * products.length)].id :
                       customers[Math.floor(Math.random() * customers.length)].id,
      target_entity_type: type === 'demand' ? 'product' : 'customer',
      confidence,
      predicted_value: Math.round(Math.random() * 1000),
      actual_value: hasOutcome ? Math.round(Math.random() * 1000) : undefined,
      prediction_horizon: Math.round(7 + Math.random() * 23), // 7-30 days
      factors: [
        { name: 'Historical Data', weight: 0.4, value: Math.round(Math.random() * 100) },
        { name: 'Market Trends', weight: 0.3, value: Math.round(Math.random() * 100) },
        { name: 'Seasonal Patterns', weight: 0.3, value: Math.round(Math.random() * 100) }
      ],
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      outcome: hasOutcome ? (Math.random() > 0.3 ? 'correct' : 'incorrect') : 'pending'
    }
  })
}

const generateRealisticWorkflows = (company: Company): Workflow[] => {
  const workflowCount = Math.round(3 + Math.random() * 7) // 3-10 workflows
  
  return Array.from({ length: workflowCount }, (_, i) => ({
    id: `${company.id}-workflow-${i + 1}`,
    name: `Workflow ${i + 1}`,
    description: `Automated workflow for ${['customer retention', 'inventory management', 'lead scoring'][Math.floor(Math.random() * 3)]}`,
    trigger_type: ['customer_churn', 'inventory_shortage', 'lead_score'][Math.floor(Math.random() * 3)] as any,
    trigger_conditions: { threshold: 0.7 },
    actions: [],
    is_active: Math.random() > 0.2, // 80% active
    success_rate: Math.round(70 + Math.random() * 25), // 70-95% success rate
    last_execution: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
    total_executions: Math.round(Math.random() * 50),
    business_impact: Math.round(company.monthly_revenue * 0.001 * Math.random()), // Small but realistic impact
    created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    execution_logs: []
  }))
}

// Initialize unified data model with realistic data
const initializeDataModel = () => {
  const selectedCompany = mockCompanies[0] // Default to first company
  
  const customers = generateRealisticCustomers(selectedCompany)
  const products = generateRealisticProducts(selectedCompany)
  const orders = generateRealisticOrders(selectedCompany, customers, products)
  
  // Generate insights from IntelligenceEngine
  const insights = IntelligenceEngine.generateInsights(customers, products, orders, [])
  
  const actions = generateRealisticActions(selectedCompany, insights)
  const predictions = generateRealisticPredictions(selectedCompany, customers, products)
  const workflows = generateRealisticWorkflows(selectedCompany)
  
  // Populate unified data model
  unifiedDataModel.companies = mockCompanies
  unifiedDataModel.customers = customers
  unifiedDataModel.products = products
  unifiedDataModel.orders = orders
  unifiedDataModel.actions = actions
  unifiedDataModel.predictions = predictions
  unifiedDataModel.workflows = workflows
  
  return { selectedCompany, insights }
}

// Global state
let globalData: ReturnType<typeof initializeDataModel> | null = null

export function useDataStore() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!globalData) {
      globalData = initializeDataModel()
    }
    
    setInsights(globalData.insights)
    setSelectedCompany(globalData.selectedCompany)
    setLoading(false)
  }, [])

  const switchCompany = (companyId: string) => {
    const company = mockCompanies.find(c => c.id === companyId)
    if (!company) return
    
    setLoading(true)
    // Re-initialize with new company
    setTimeout(() => {
      globalData = initializeDataModel()
      setInsights(globalData.insights)
      setSelectedCompany(globalData.selectedCompany)
      setLoading(false)
    }, 500)
  }

  const getMetrics = (timeRangeOverride?: TimeRange) => {
    return unifiedDataModel.getMetrics(timeRangeOverride || timeRange)
  }

  return {
    insights,
    selectedCompany,
    companies: mockCompanies,
    customers: unifiedDataModel.customers,
    products: unifiedDataModel.products,
    orders: unifiedDataModel.orders,
    actions: unifiedDataModel.actions,
    predictions: unifiedDataModel.predictions,
    workflows: unifiedDataModel.workflows,
    timeRange,
    setTimeRange,
    loading,
    refreshData: () => {
      setLoading(true)
      setTimeout(() => {
        globalData = initializeDataModel()
        setInsights(globalData.insights)
        setLoading(false)
      }, 1000)
    },
    switchCompany,
    getMetrics
  }
}
