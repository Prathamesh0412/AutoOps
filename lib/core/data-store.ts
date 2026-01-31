import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { 
  Customer, 
  Product, 
  Order, 
  Campaign, 
  Action, 
  Workflow, 
  Insight, 
  SystemMetrics,
  ExecutionLog 
} from './data-models'
import { IntelligenceEngine } from './intelligence-engine'

interface DataStore {
  // Core data
  customers: Customer[]
  products: Product[]
  orders: Order[]
  campaigns: Campaign[]
  actions: Action[]
  workflows: Workflow[]
  insights: Insight[]
  execution_logs: ExecutionLog[]
  
  // System state
  metrics: SystemMetrics
  isLoading: boolean
  lastSync: string
  
  // Actions
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  addOrder: (order: Order) => void
  executeAction: (actionId: string, editedContent?: string) => Promise<void>
  rejectAction: (actionId: string) => void
  rollbackAction: (actionId: string) => void
  generateInsights: () => void
  generateActions: () => void
  updateMetrics: () => void
  simulateRealTimeData: () => void
}

// Generate realistic mock data
const generateMockCustomers = (): Customer[] => [
  {
    id: 'cust_1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    ltv: 45000,
    engagement_score: 65,
    purchase_frequency: 2.5,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString()
  },
  {
    id: 'cust_2',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    ltv: 32000,
    engagement_score: 45,
    purchase_frequency: 1.8,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    churn_risk: 0,
    segment: 'mid-market',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()
  },
  {
    id: 'cust_3',
    name: 'Amit Patel',
    email: 'amit.patel@email.com',
    ltv: 68000,
    engagement_score: 85,
    purchase_frequency: 3.2,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 400).toISOString()
  },
  {
    id: 'cust_4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@email.com',
    ltv: 28000,
    engagement_score: 55,
    purchase_frequency: 2.1,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    churn_risk: 0,
    segment: 'mid-market',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString()
  },
  {
    id: 'cust_5',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    ltv: 52000,
    engagement_score: 75,
    purchase_frequency: 2.8,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 280).toISOString()
  }
]

const generateMockProducts = (): Product[] => [
  {
    id: 'prod_1',
    name: 'Peter England Formal Shirt',
    sku: 'PE-FS-001',
    category: 'mens_formal_wear',
    price: 1899,
    cost: 950,
    stock_quantity: 85,
    sales_velocity: 18,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 30,
    supplier_lead_time: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString()
  },
  {
    id: 'prod_2',
    name: 'Van Heusen Premium Suit',
    sku: 'VH-PS-002',
    category: 'mens_formal_wear',
    price: 8999,
    cost: 4500,
    stock_quantity: 25,
    sales_velocity: 6,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 15,
    supplier_lead_time: 14,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()
  },
  {
    id: 'prod_3',
    name: 'FabIndia Cotton Kurta',
    sku: 'FI-CK-003',
    category: 'ethnic_wear',
    price: 1299,
    cost: 650,
    stock_quantity: 120,
    sales_velocity: 24,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 40,
    supplier_lead_time: 10,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
  },
  {
    id: 'prod_4',
    name: 'Biba Designer Salwar Kameez',
    sku: 'BI-DS-004',
    category: 'ethnic_wear',
    price: 2499,
    cost: 1250,
    stock_quantity: 65,
    sales_velocity: 15,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 25,
    supplier_lead_time: 12,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString()
  },
  {
    id: 'prod_5',
    name: 'Allen Solly Casual T-Shirt',
    sku: 'AS-CT-005',
    category: 'mens_casual_wear',
    price: 899,
    cost: 450,
    stock_quantity: 150,
    sales_velocity: 32,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 50,
    supplier_lead_time: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  },
  {
    id: 'prod_6',
    name: 'Levi\'s 501 Jeans',
    sku: 'LV-501-006',
    category: 'mens_casual_wear',
    price: 3499,
    cost: 1750,
    stock_quantity: 95,
    sales_velocity: 22,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 35,
    supplier_lead_time: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 75).toISOString()
  },
  {
    id: 'prod_7',
    name: 'Zara Women\'s Summer Dress',
    sku: 'ZA-WD-007',
    category: 'womens_western',
    price: 2799,
    cost: 1400,
    stock_quantity: 70,
    sales_velocity: 19,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 30,
    supplier_lead_time: 9,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 55).toISOString()
  },
  {
    id: 'prod_8',
    name: 'H&M Basic Cotton Top',
    sku: 'HM-BT-008',
    category: 'womens_western',
    price: 699,
    cost: 350,
    stock_quantity: 180,
    sales_velocity: 38,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 60,
    supplier_lead_time: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString()
  },
  {
    id: 'prod_9',
    name: 'Raymond Blazer',
    sku: 'RY-BL-009',
    category: 'mens_formal_wear',
    price: 5999,
    cost: 3000,
    stock_quantity: 35,
    sales_velocity: 8,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 20,
    supplier_lead_time: 15,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString()
  },
  {
    id: 'prod_10',
    name: 'W For Women Ethnic Gown',
    sku: 'WF-EG-010',
    category: 'ethnic_wear',
    price: 3299,
    cost: 1650,
    stock_quantity: 45,
    sales_velocity: 12,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 20,
    supplier_lead_time: 11,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString()
  },
  {
    id: 'prod_11',
    name: 'Flying Machine Cargo Pants',
    sku: 'FM-CP-011',
    category: 'mens_casual_wear',
    price: 1599,
    cost: 800,
    stock_quantity: 110,
    sales_velocity: 25,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 40,
    supplier_lead_time: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString()
  },
  {
    id: 'prod_12',
    name: 'Global Desi Indo-Western Dress',
    sku: 'GD-IW-012',
    category: 'womens_western',
    price: 1899,
    cost: 950,
    stock_quantity: 80,
    sales_velocity: 20,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 35,
    supplier_lead_time: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString()
  },
  {
    id: 'prod_13',
    name: 'Manyavar Sherwani',
    sku: 'MV-SW-013',
    category: 'ethnic_wear',
    price: 8999,
    cost: 4500,
    stock_quantity: 20,
    sales_velocity: 4,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 10,
    supplier_lead_time: 20,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 110).toISOString()
  },
  {
    id: 'prod_14',
    name: 'Park Avenue Polo T-Shirt',
    sku: 'PA-PT-014',
    category: 'mens_casual_wear',
    price: 1299,
    cost: 650,
    stock_quantity: 130,
    sales_velocity: 28,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 45,
    supplier_lead_time: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString()
  },
  {
    id: 'prod_15',
    name: 'Aurelia Women\'s Kurti',
    sku: 'AU-WK-015',
    category: 'ethnic_wear',
    price: 999,
    cost: 500,
    stock_quantity: 160,
    sales_velocity: 35,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 55,
    supplier_lead_time: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()
  }
]

const generateMockOrders = (): Order[] => [
  {
    id: 'order_1',
    customer_id: 'cust_1',
    product_id: 'prod_1',
    quantity: 2,
    revenue: 3798,
    profit: 1898,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: 'order_2',
    customer_id: 'cust_3',
    product_id: 'prod_2',
    quantity: 1,
    revenue: 8999,
    profit: 4499,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'order_3',
    customer_id: 'cust_2',
    product_id: 'prod_3',
    quantity: 3,
    revenue: 3897,
    profit: 1947,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: 'order_4',
    customer_id: 'cust_1',
    product_id: 'prod_6',
    quantity: 1,
    revenue: 3499,
    profit: 1749,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'order_5',
    customer_id: 'cust_3',
    product_id: 'prod_4',
    quantity: 2,
    revenue: 4998,
    profit: 2498,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'order_6',
    customer_id: 'cust_2',
    product_id: 'prod_8',
    quantity: 4,
    revenue: 2796,
    profit: 1396,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString()
  },
  {
    id: 'order_7',
    customer_id: 'cust_1',
    product_id: 'prod_15',
    quantity: 3,
    revenue: 2997,
    profit: 1497,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'order_8',
    customer_id: 'cust_3',
    product_id: 'prod_9',
    quantity: 1,
    revenue: 5999,
    profit: 2999,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
  }
]

export const useDataStore = create<DataStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial data
    customers: generateMockCustomers(),
    products: generateMockProducts(),
    orders: generateMockOrders(),
    campaigns: [],
    actions: [],
    workflows: [],
    insights: [],
    execution_logs: [],
    
    metrics: {
      total_customers: 0,
      total_products: 0,
      total_revenue: 0,
      total_profit: 0,
      active_workflows: 0,
      pending_actions: 0,
      executed_actions: 0,
      system_health: 0,
      time_saved_hours: 0,
      confidence_score: 0,
      last_updated: new Date().toISOString()
    },
    
    isLoading: false,
    lastSync: new Date().toISOString(),

    // Customer actions
    addCustomer: (customer) => {
      set(state => ({
        customers: [...state.customers, { ...customer, id: `cust_${Date.now()}` }]
      }))
      get().generateInsights()
    },

    updateCustomer: (id, updates) => {
      set(state => ({
        customers: state.customers.map(c => 
          c.id === id ? { ...c, ...updates } : c
        )
      }))
      get().generateInsights()
    },

    // Product actions
    addProduct: (product) => {
      const uniqueId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      set(state => ({
        products: [...state.products, { ...product, id: product.id || uniqueId }]
      }))
      get().generateInsights()
    },

    updateProduct: (id, updates) => {
      set(state => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      }))
      get().generateInsights()
    },

    // Order actions
    addOrder: (order) => {
      const uniqueId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      set(state => ({
        orders: [...state.orders, { ...order, id: order.id || uniqueId }]
      }))
      get().generateInsights()
      get().updateMetrics()
    },

    // Action execution
    executeAction: async (actionId, editedContent) => {
      const { actions, insights } = get()
      const action = actions.find(a => a.id === actionId)
      if (!action) return

      // Simulate execution delay
      set({ isLoading: true })
      await new Promise(resolve => setTimeout(resolve, 2000))

      const executionLog: ExecutionLog = {
        id: `log_${Date.now()}`,
        action_id: actionId,
        status: 'success',
        reason_code: 'user_approved',
        business_impact: action.expected_impact,
        execution_time: 1500,
        created_at: new Date().toISOString()
      }

      set(state => ({
        actions: state.actions.map(a =>
          a.id === actionId
            ? {
                ...a,
                status: 'executed' as const,
                executed_at: new Date().toISOString(),
                edited_content: editedContent || a.generated_content,
                executionLog
              }
            : a
        ),
        execution_logs: [...state.execution_logs, executionLog],
        isLoading: false
      }))

      // Update underlying data based on action type
      const insight = insights.find(i => i.id === action.trigger_insight_id)
      if (insight) {
        if (insight.type === 'churn_risk' && insight.target_entity_type === 'customer') {
          // Reduce churn risk for customer
          get().updateCustomer(insight.target_entity_id, {
            engagement_score: Math.min(100, get().customers.find(c => c.id === insight.target_entity_id)?.engagement_score! + 20)
          })
        } else if (insight.type === 'inventory_shortage' && insight.target_entity_type === 'product') {
          // Increase stock for product
          get().updateProduct(insight.target_entity_id, {
            stock_quantity: get().products.find(p => p.id === insight.target_entity_id)?.stock_quantity! + 100
          })
        }
      }

      get().updateMetrics()
    },

    rejectAction: (actionId) => {
      const executionLog: ExecutionLog = {
        id: `log_${Date.now()}`,
        action_id: actionId,
        status: 'failure',
        reason_code: 'user_rejected',
        business_impact: 0,
        execution_time: 100,
        created_at: new Date().toISOString()
      }

      set(state => ({
        actions: state.actions.map(a =>
          a.id === actionId ? { ...a, status: 'rejected' as const } : a
        ),
        execution_logs: [...state.execution_logs, executionLog]
      }))
    },

    rollbackAction: (actionId) => {
      const { actions } = get()
      const action = actions.find(a => a.id === actionId)
      if (!action || action.status !== 'executed') return

      const executionLog: ExecutionLog = {
        id: `log_${Date.now()}`,
        action_id: actionId,
        status: 'partial',
        reason_code: 'user_rollback',
        business_impact: -action.expected_impact,
        execution_time: 500,
        created_at: new Date().toISOString()
      }

      set(state => ({
        actions: state.actions.map(a =>
          a.id === actionId ? { ...a, status: 'rolled_back' as const } : a
        ),
        execution_logs: [...state.execution_logs, executionLog]
      }))

      get().updateMetrics()
    },

    // Intelligence generation
    generateInsights: () => {
      const { customers, products, orders, campaigns } = get()
      const insights = IntelligenceEngine.generateInsights(customers, products, orders, campaigns)
      set({ insights })
    },

    generateActions: () => {
      const { insights } = get()
      const actions = IntelligenceEngine.generateActions(insights)
      set({ actions })
    },

    updateMetrics: () => {
      const { customers, products, orders, actions, workflows } = get()
      const metrics = IntelligenceEngine.calculateSystemMetrics(customers, products, orders, actions, workflows)
      set({ metrics })
    },

    simulateRealTimeData: () => {
      // Simulate real-time updates
      const interval = setInterval(() => {
        const { customers, products } = get()
        
        // Randomly update customer engagement
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)]
        const engagementChange = Math.floor(Math.random() * 11) - 5 // -5 to +5
        get().updateCustomer(randomCustomer.id, {
          engagement_score: Math.max(0, Math.min(100, randomCustomer.engagement_score + engagementChange))
        })

        // Randomly update product stock
        const randomProduct = products[Math.floor(Math.random() * products.length)]
        const stockChange = Math.floor(Math.random() * 6) - 3 // -3 to +3
        get().updateProduct(randomProduct.id, {
          stock_quantity: Math.max(0, randomProduct.stock_quantity + stockChange)
        })

        // Occasionally add new orders
        if (Math.random() > 0.7) {
          const randomCustomer = customers[Math.floor(Math.random() * customers.length)]
          const randomProduct = products[Math.floor(Math.random() * products.length)]
          get().addOrder({
            id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            customer_id: randomCustomer.id,
            product_id: randomProduct.id,
            quantity: Math.floor(Math.random() * 3) + 1,
            revenue: randomProduct.price * (Math.floor(Math.random() * 3) + 1),
            profit: (randomProduct.price - randomProduct.cost) * (Math.floor(Math.random() * 3) + 1),
            status: 'completed',
            created_at: new Date().toISOString()
          })
        }
      }, 10000) // Every 10 seconds

      return () => clearInterval(interval)
    }
  }))
)

// Initialize the store with generated insights and actions
const store = useDataStore.getState()
store.generateInsights()
store.generateActions()
store.updateMetrics()
