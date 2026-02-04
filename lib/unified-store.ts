import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
import { globalEvents, DATA_EVENTS } from './realtime-sync'

// Unified data models
export interface Customer {
  id: string
  name: string
  email: string
  ltv: number
  engagement_score: number
  purchase_frequency: number
  last_purchase: string
  churn_risk: number
  segment: 'enterprise' | 'mid-market' | 'small'
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
  sales_velocity: number
  demand_score: number
  profit_margin: number
  reorder_threshold: number
  supplier_lead_time: number
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

export interface Action {
  id: string
  title: string
  description: string
  action_type: string
  status: 'pending' | 'executed' | 'on_hold'
  priority: 'High' | 'Medium' | 'Low'
  expected_impact: string
  executed_at?: string
  created_at: string
  message?: string
}

export interface Prediction {
  id: string
  name: string
  description: string
  prediction_type: 'churn_risk' | 'inventory_shortage' | 'lead_insight'
  confidence: number
  severity: 'High' | 'Medium' | 'Low'
  impact: string
  recommendation: string
  created_at: string
  details?: string
  source_file_id?: string
  source_file_name?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  trigger_type: string
  trigger_conditions: any
  actions: any
  is_active: boolean
  success_rate: number
  last_execution: string | null
  total_executions: number
  is_executing?: boolean
  created_at: string
}

export interface Metrics {
  total_customers: number
  total_products: number
  total_orders: number
  total_revenue: number
  total_profit: number
  total_actions: number
  active_workflows: number
  predictions_generated: number
  system_health: number
  confidence_score: number
  time_saved_hours: number
  executed_actions: number
  pending_actions: number
  last_updated: string
}

export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  uploadTimestamp: string
  status: 'uploaded' | 'analyzing' | 'completed' | 'failed'
  selected: boolean
  error?: string
  analysisProgress?: number
  recordsProcessed?: number
  totalRecords?: number
}

export interface Notification {
  id: string
  type: 'action' | 'prediction' | 'workflow' | 'system' | 'customer' | 'inventory' | 'order'
  title: string
  message: string
  time: string
  priority: 'High' | 'Medium' | 'Low'
  read: boolean
  data?: any // Additional data related to the notification
}

// Unified store interface
interface UnifiedStore {
  // Core data
  customers: Customer[]
  products: Product[]
  orders: Order[]
  actions: Action[]
  predictions: Prediction[]
  workflows: Workflow[]
  metrics: Metrics
  uploadedFiles: UploadedFile[]
  notifications: Notification[]
  
  // Loading states
  isLoading: boolean
  isProcessing: boolean
  isUploading: boolean
  isAnalyzing: boolean
  
  // Actions
  // Customer operations
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  
  // Product operations
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  
  // Order operations
  addOrder: (order: Omit<Order, 'id' | 'created_at'>) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  deleteOrder: (id: string) => void
  
  // Action operations
  executeAction: (actionId: string, editedContent?: string) => Promise<void>
  rejectAction: (actionId: string) => void
  rollbackAction: (actionId: string) => void
  
  // Workflow operations
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'created_at'>) => void
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void
  deleteWorkflow: (id: string) => void
  toggleWorkflow: (id: string, isActive: boolean) => void
  executeWorkflow: (id: string) => Promise<void>
  
  // Notification operations
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Prediction operations
  generateInsights: () => void
  generateActions: () => void
  updateMetrics: () => void
  simulateRealTimeData: () => void
  
  // File operations
  uploadFiles: (files: FileList) => Promise<void>
  removeFile: (id: string) => void
  toggleFileSelection: (id: string) => void
  selectAllFiles: (selected: boolean) => void
  analyzeSelectedFiles: () => Promise<void>
  
  // Utility
  simulateApiCall: <T>(data: T, delay?: number) => Promise<T>
}

// Mock data generators (optimized)
const generateMockCustomers = (): Customer[] => [
  {
    id: 'cust_1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    ltv: 850000,
    engagement_score: 65,
    purchase_frequency: 2.5,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'cust_2',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    ltv: 620000,
    engagement_score: 45,
    purchase_frequency: 1.8,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    churn_risk: 0,
    segment: 'mid-market',
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'cust_3',
    name: 'Amit Patel',
    email: 'amit.patel@email.com',
    ltv: 1200000,
    engagement_score: 85,
    purchase_frequency: 3.2,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'cust_4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@email.com',
    ltv: 480000,
    engagement_score: 55,
    purchase_frequency: 2.1,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    churn_risk: 0,
    segment: 'mid-market',
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'cust_5',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    ltv: 980000,
    engagement_score: 75,
    purchase_frequency: 2.8,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: '2024-01-01T00:00:00.000Z'
  }
]

const generateMockProducts = (): Product[] => [
  {
    id: 'prod_1',
    name: 'Peter England Formal Shirt',
    sku: 'PE-FS-001',
    category: 'mens_formal_wear',
    price: 2499,
    cost: 1250,
    stock_quantity: 85,
    sales_velocity: 18,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 30,
    supplier_lead_time: 7,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_2',
    name: 'Van Heusen Premium Suit',
    sku: 'VH-PS-002',
    category: 'mens_formal_wear',
    price: 12999,
    cost: 6500,
    stock_quantity: 25,
    sales_velocity: 6,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 15,
    supplier_lead_time: 14,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_3',
    name: 'FabIndia Cotton Kurta',
    sku: 'FI-CK-003',
    category: 'ethnic_wear',
    price: 1899,
    cost: 950,
    stock_quantity: 120,
    sales_velocity: 24,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 40,
    supplier_lead_time: 10,
    created_at: '2024-01-01T00:00:00.000Z'
  }
]

const generateMockOrders = (): Order[] => [
  {
    id: 'order_1',
    customer_id: 'cust_1',
    product_id: 'prod_1',
    quantity: 2,
    revenue: 4998,
    profit: 2498,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: 'order_2',
    customer_id: 'cust_3',
    product_id: 'prod_2',
    quantity: 1,
    revenue: 12999,
    profit: 6499,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
]

const generateMockActions = (): Action[] => [
  {
    id: '1',
    title: 'Send retention email to at-risk customers',
    description: 'Automated email campaign for customers with engagement drop > 40%',
    action_type: 'email_campaign',
    status: 'pending',
    priority: 'High',
    expected_impact: 'Save 15 customers',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
]

const generateMockPredictions = (): Prediction[] => [
  {
    id: '1',
    name: 'Customer Churn Risk - Enterprise Segment',
    description: '12 enterprise customers showing 45% engagement drop over 30 days',
    prediction_type: 'churn_risk',
    confidence: 87,
    severity: 'High',
    impact: 'Potential revenue loss: ₹240,000/year',
    recommendation: 'Immediate outreach with personalized retention offers',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
]

const generateMockWorkflows = (): Workflow[] => [
  {
    id: '1',
    name: 'Customer Churn Prevention',
    description: 'Identify at-risk customers and trigger retention workflows',
    trigger_type: 'customer_churn',
    trigger_conditions: { engagement_decline_threshold: 0.4 },
    actions: ['send_email', 'create_support_ticket', 'notify_account_manager'],
    is_active: true,
    success_rate: 94,
    last_execution: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    total_executions: 156,
    created_at: '2024-01-01T00:00:00.000Z'
  }
]

const generateMockMetrics = (): Metrics => ({
  total_customers: 5,
  total_products: 3,
  total_orders: 2,
  total_revenue: 17997,
  total_profit: 8997,
  total_actions: 1,
  active_workflows: 1,
  predictions_generated: 1,
  system_health: 92,
  confidence_score: 87,
  time_saved_hours: 24,
  executed_actions: 8,
  pending_actions: 3,
  last_updated: '2024-01-01T00:00:00.000Z'
})

// Create unified store
export const useUnifiedStore = create<UnifiedStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial data
        customers: generateMockCustomers(),
        products: generateMockProducts(),
        orders: generateMockOrders(),
        actions: generateMockActions(),
        predictions: generateMockPredictions(),
        workflows: generateMockWorkflows(),
        metrics: generateMockMetrics(),
        uploadedFiles: [],
        notifications: [],
        
        // Loading states
        isLoading: false,
        isProcessing: false,
        isUploading: false,
        isAnalyzing: false,
        
        // Customer operations
        addCustomer: (customer) => {
          const newCustomer: Customer = {
            ...customer,
            id: `cust_${Date.now()}`,
            created_at: new Date().toISOString()
          }
          set(state => ({
            customers: [...state.customers, newCustomer]
          }))
          get().updateMetrics()
        },
        
        updateCustomer: (id, updates) => {
          set(state => ({
            customers: state.customers.map(c =>
              c.id === id ? { ...c, ...updates } : c
            )
          }))
          get().updateMetrics()
          // Emit real-time event
          globalEvents.emit(DATA_EVENTS.CUSTOMER_UPDATED, { id, updates })
        },
        
        deleteCustomer: (id) => {
          set(state => ({
            customers: state.customers.filter(c => c.id !== id)
          }))
          get().updateMetrics()
        },
        
        // Product operations
        addProduct: (product) => {
          const newProduct: Product = {
            ...product,
            id: `prod_${Date.now()}`,
            created_at: new Date().toISOString()
          }
          set(state => ({
            products: [...state.products, newProduct]
          }))
          get().updateMetrics()
        },
        
        updateProduct: (id, updates) => {
          set(state => ({
            products: state.products.map(p =>
              p.id === id ? { ...p, ...updates } : p
            )
          }))
          get().updateMetrics()
          // Emit real-time event
          globalEvents.emit(DATA_EVENTS.PRODUCT_UPDATED, { id, updates })
        },
        
        deleteProduct: (id) => {
          set(state => ({
            products: state.products.filter(p => p.id !== id)
          }))
          get().updateMetrics()
        },
        
        // Order operations
        addOrder: (order) => {
          const newOrder: Order = {
            ...order,
            id: `order_${Date.now()}`,
            created_at: new Date().toISOString()
          }
          set(state => ({
            orders: [...state.orders, newOrder]
          }))
          get().updateMetrics()
        },
        
        updateOrder: (id, updates) => {
          set(state => ({
            orders: state.orders.map(o =>
              o.id === id ? { ...o, ...updates } : o
            )
          }))
          get().updateMetrics()
        },
        
        deleteOrder: (id) => {
          set(state => ({
            orders: state.orders.filter(o => o.id !== id)
          }))
          get().updateMetrics()
        },
        
        // Action operations
        executeAction: async (actionId, _editedContent) => {
          const { simulateApiCall } = get()
          await simulateApiCall(null, 1500)
          
          set(state => ({
            actions: state.actions.map(a =>
              a.id === actionId
                ? { ...a, status: 'executed' as const, executed_at: new Date().toISOString() }
                : a
            )
          }))
          
          get().updateMetrics()
          // Emit real-time event
          globalEvents.emit(DATA_EVENTS.ACTION_EXECUTED, { actionId })
        },
        
        rejectAction: (actionId) => {
          set(state => ({
            actions: state.actions.filter(a => a.id !== actionId)
          }))
          get().updateMetrics()
        },
        
        rollbackAction: (actionId) => {
          set(state => ({
            actions: state.actions.map(a =>
              a.id === actionId
                ? { ...a, status: 'pending' as const, executed_at: undefined }
                : a
            )
          }))
          get().updateMetrics()
        },
        
        // Prediction operations
        generateInsights: () => {
          const { products } = get()
          const insights: Prediction[] = []
          
          // Generate insights based on data patterns
          const lowStockProducts = products.filter(p => p.stock_quantity < p.reorder_threshold)
          lowStockProducts.forEach(product => {
            insights.push({
              id: `insight_${Date.now()}_${product.id}`,
              name: `Low Stock Alert: ${product.name}`,
              description: `Product ${product.name} is running low on stock`,
              prediction_type: 'inventory_shortage',
              confidence: 85,
              severity: 'High',
              impact: `Potential revenue loss: ₹${product.price * product.sales_velocity * 7}`,
              recommendation: 'Reorder immediately to avoid stockout',
              created_at: new Date().toISOString()
            })
          })
          
          set(state => ({
            predictions: [...insights, ...state.predictions]
          }))
        },
        
        generateActions: () => {
          const { predictions } = get()
          const actions: Action[] = []
          
          predictions.filter(p => p.severity === 'High').forEach(prediction => {
            actions.push({
              id: `action_${Date.now()}_${prediction.id}`,
              title: `Address: ${prediction.name}`,
              description: prediction.recommendation,
              action_type: 'automated_response',
              status: 'pending',
              priority: 'High',
              expected_impact: prediction.impact,
              created_at: new Date().toISOString()
            })
          })
          
          set(state => ({
            actions: [...actions, ...state.actions]
          }))
        },
        
        updateMetrics: () => {
          const { customers, products, orders, actions, workflows, predictions } = get()
          
          set(state => ({
            metrics: {
              ...state.metrics,
              total_customers: customers.length,
              total_products: products.length,
              total_orders: orders.length,
              total_revenue: orders.reduce((sum, o) => sum + o.revenue, 0),
              total_profit: orders.reduce((sum, o) => sum + o.profit, 0),
              total_actions: actions.length,
              active_workflows: workflows.filter(w => w.is_active).length,
              predictions_generated: predictions.length,
              system_health: 85 + Math.random() * 10,
              confidence_score: predictions.length > 0 
                ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length 
                : 85,
              last_updated: new Date().toISOString()
            }
          }))
          // Emit real-time event
          globalEvents.emit(DATA_EVENTS.METRICS_UPDATED)
        },
        
        simulateRealTimeData: () => {
          const interval = setInterval(() => {
            const { products } = get()
            
            // Randomly update some product stock
            const randomProduct = products[Math.floor(Math.random() * products.length)]
            if (randomProduct && randomProduct.stock_quantity > 0) {
              get().updateProduct(randomProduct.id, {
                stock_quantity: randomProduct.stock_quantity - 1
              })
            }
            
            // Update system health
            set(state => ({
              metrics: {
                ...state.metrics,
                system_health: Math.max(75, Math.min(100, state.metrics.system_health + (Math.random() - 0.5) * 2))
              }
            }))
          }, 5000)
          
          return () => clearInterval(interval)
        },
        
        // File operations
        uploadFiles: async (files: FileList) => {
          set({ isUploading: true })
          
          const newFiles: UploadedFile[] = []
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            newFiles.push({
              id: `file_${Date.now()}_${i}`,
              name: file.name,
              type: file.type,
              size: file.size,
              uploadTimestamp: new Date().toISOString(),
              status: 'uploaded',
              selected: true
            })
          }
          
          set(state => ({
            uploadedFiles: [...newFiles, ...state.uploadedFiles],
            isUploading: false
          }))
          // Emit real-time event
          globalEvents.emit(DATA_EVENTS.FILE_UPLOADED, { files: newFiles })
        },
        
        removeFile: (id) => {
          set(state => ({
            uploadedFiles: state.uploadedFiles.filter(f => f.id !== id)
          }))
        },
        
        analyzeSelectedFiles: async () => {
          const { uploadedFiles } = get()
          const selectedFiles = uploadedFiles.filter(f => f.selected)
          
          if (selectedFiles.length === 0) return
          
          set({ isAnalyzing: true })
          
          // Simulate analysis
          for (const file of selectedFiles) {
            set(state => ({
              uploadedFiles: state.uploadedFiles.map(f =>
                f.id === file.id ? { ...f, status: 'analyzing', analysisProgress: 0 } : f
              )
            }))
            
            // Simulate progress
            for (let progress = 0; progress <= 100; progress += 10) {
              await new Promise(resolve => setTimeout(resolve, 100))
              set(state => ({
                uploadedFiles: state.uploadedFiles.map(f =>
                  f.id === file.id ? { ...f, analysisProgress: progress } : f
                )
              }))
            }
            
            set(state => ({
              uploadedFiles: state.uploadedFiles.map(f =>
                f.id === file.id ? { ...f, status: 'completed', analysisProgress: 100 } : f
              )
            }))
          }
          
          set({ isAnalyzing: false })
          get().generateInsights()
        },
        
        toggleFileSelection: (id) => {
          set(state => ({
            uploadedFiles: state.uploadedFiles.map(f =>
              f.id === id ? { ...f, selected: !f.selected } : f
            )
          }))
        },
        
        selectAllFiles: (selected) => {
          set(state => ({
            uploadedFiles: state.uploadedFiles.map(f =>
              ({ ...f, selected })
            )
          }))
        },
        
        // Workflow operations
        addWorkflow: (workflow) => {
          const newWorkflow: Workflow = {
            ...workflow,
            id: `workflow_${Date.now()}`,
            created_at: new Date().toISOString()
          }
          set(state => ({
            workflows: [...state.workflows, newWorkflow]
          }))
          get().updateMetrics()
        },
        
        updateWorkflow: (id, updates) => {
          set(state => ({
            workflows: state.workflows.map(w =>
              w.id === id ? { ...w, ...updates } : w
            )
          }))
          get().updateMetrics()
        },
        
        deleteWorkflow: (id) => {
          set(state => ({
            workflows: state.workflows.filter(w => w.id !== id)
          }))
          get().updateMetrics()
        },
        
        toggleWorkflow: (id, isActive) => {
          set(state => ({
            workflows: state.workflows.map(w =>
              w.id === id ? { ...w, is_active: isActive } : w
            )
          }))
          get().updateMetrics()
        },
        
        executeWorkflow: async (id) => {
          const workflow = get().workflows.find(w => w.id === id)
          if (!workflow || !workflow.is_active) return
          
          // Set workflow to executing state
          set(state => ({
            workflows: state.workflows.map(w =>
              w.id === id ? { ...w, is_executing: true } : { ...w, is_executing: false }
            )
          }))
          
          // Simulate workflow execution
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Update workflow after execution
          set(state => ({
            workflows: state.workflows.map(w => {
              if (w.id === id) {
                const success = Math.random() > 0.1 // 90% success rate
                const newExecutions = w.total_executions + 1
                const newSuccessRate = ((w.success_rate * w.total_executions) + (success ? 100 : 0)) / newExecutions
                
                return {
                  ...w,
                  is_executing: false,
                  last_execution: new Date().toISOString(),
                  total_executions: newExecutions,
                  success_rate: Math.round(newSuccessRate)
                }
              }
              return w
            })
          }))
          
          get().updateMetrics()
        },
        
        // Notification operations
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            time: 'Just now',
            read: false
          }
          set(state => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50) // Keep only last 50
          }))
        },
        
        markNotificationAsRead: (id) => {
          set(state => ({
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            )
          }))
        },
        
        markAllNotificationsAsRead: () => {
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true }))
          }))
        },
        
        removeNotification: (id) => {
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }))
        },
        
        clearNotifications: () => {
          set({ notifications: [] })
        },
        
        // Utility
        simulateApiCall: async <T,>(data: T, delay = 1000) => {
          set({ isProcessing: true })
          await new Promise(resolve => setTimeout(resolve, delay))
          set({ isProcessing: false })
          return data
        },
      }),
      {
        name: 'unified-store',
        partialize: (state) => ({
          customers: state.customers,
          products: state.products,
          orders: state.orders,
          uploadedFiles: state.uploadedFiles
        })
      }
    )
  )
)

// Optimized selectors
export const useCustomers = () => useUnifiedStore(state => state.customers)
export const useProducts = () => useUnifiedStore(state => state.products)
export const useOrders = () => useUnifiedStore(state => state.orders)
export const useActions = () => useUnifiedStore(state => state.actions)
export const usePredictions = () => useUnifiedStore(state => state.predictions)
export const useWorkflows = () => useUnifiedStore(state => state.workflows)
export const useMetrics = () => useUnifiedStore(state => state.metrics)
export const useUploadedFiles = () => useUnifiedStore(state => state.uploadedFiles)
export const useLoadingStates = () => useUnifiedStore(state => ({
  isLoading: state.isLoading,
  isProcessing: state.isProcessing,
  isUploading: state.isUploading,
  isAnalyzing: state.isAnalyzing
}))
