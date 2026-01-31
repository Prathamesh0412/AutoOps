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
    name: 'Sarah Chen',
    email: 'sarah@techcorp.com',
    ltv: 12500,
    engagement_score: 65,
    purchase_frequency: 2.5,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString()
  },
  {
    id: 'cust_2',
    name: 'Mike Johnson',
    email: 'mike@startup.io',
    ltv: 8500,
    engagement_score: 45,
    purchase_frequency: 1.8,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    churn_risk: 0,
    segment: 'mid-market',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()
  },
  {
    id: 'cust_3',
    name: 'Emily Davis',
    email: 'emily@enterprise.co',
    ltv: 18500,
    engagement_score: 85,
    purchase_frequency: 3.2,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 400).toISOString()
  }
]

const generateMockProducts = (): Product[] => [
  {
    id: 'prod_1',
    name: 'Widget Pro 3000',
    sku: 'SKU-2891',
    category: 'electronics',
    price: 299.99,
    cost: 150.00,
    stock_quantity: 45,
    sales_velocity: 12,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 20,
    supplier_lead_time: 14,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString()
  },
  {
    id: 'prod_2',
    name: 'Service Plus',
    sku: 'SKU-3421',
    category: 'software',
    price: 99.99,
    cost: 25.00,
    stock_quantity: 1000,
    sales_velocity: 45,
    demand_score: 0,
    profit_margin: 75,
    reorder_threshold: 100,
    supplier_lead_time: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString()
  }
]

const generateMockOrders = (): Order[] => [
  {
    id: 'order_1',
    customer_id: 'cust_1',
    product_id: 'prod_1',
    quantity: 2,
    revenue: 599.98,
    profit: 299.98,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: 'order_2',
    customer_id: 'cust_3',
    product_id: 'prod_2',
    quantity: 5,
    revenue: 499.95,
    profit: 374.95,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
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
      set(state => ({
        products: [...state.products, { ...product, id: `prod_${Date.now()}` }]
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
      set(state => ({
        orders: [...state.orders, { ...order, id: `order_${Date.now()}` }]
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
            id: `order_${Date.now()}`,
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
