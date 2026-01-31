import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Types
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
  totalActions: number
  activeWorkflows: number
  predictionsGenerated: number
  systemHealth: number
  timeSaved: number
  accuracyRate: number
  productivityBoost: number
  lastUpdated: string
}

// Mock data generators
const generateMockActions = (): Action[] => [
  {
    id: '1',
    title: 'Send retention email to at-risk customers',
    description: 'Automated email campaign for customers with engagement drop > 40%',
    action_type: 'email_campaign',
    status: 'pending',
    priority: 'High',
    expected_impact: 'Save 15 customers',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    message: 'Dear valued customer, we noticed your recent decrease in engagement and want to ensure you\'re getting the most value from our service...'
  },
  {
    id: '2',
    title: 'Reorder inventory for SKU-1234',
    description: 'Stock level below 20% threshold, automatic reorder triggered',
    action_type: 'inventory',
    status: 'executed',
    priority: 'High',
    expected_impact: 'Prevent stockout',
    executed_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: '3',
    title: 'Prioritize high-value leads',
    description: 'Lead scoring identified 3 prospects with >80% conversion probability',
    action_type: 'lead_scoring',
    status: 'pending',
    priority: 'Medium',
    expected_impact: 'Increase conversion by 25%',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
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
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    details: 'Analysis of login frequency, feature usage, and support tickets indicates high churn risk. Customers have reduced API calls by 60% and haven\'t accessed premium features in 45 days.'
  },
  {
    id: '2',
    name: 'Inventory Shortage - Product Line A',
    description: 'SKU-1234 projected to run out in 7 days based on current demand',
    prediction_type: 'inventory_shortage',
    confidence: 92,
    severity: 'High',
    impact: 'Potential sales loss: ₹85,000',
    recommendation: 'Expedite supplier order and consider alternative sourcing',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    details: 'Current inventory: 45 units. Weekly demand: 35 units. Lead time: 14 days. Seasonal demand increase expected: +20%'
  },
  {
    id: '3',
    name: 'Lead Conversion Opportunity',
    description: '8 qualified leads showing buying signals in last 48 hours',
    prediction_type: 'lead_insight',
    confidence: 78,
    severity: 'Medium',
    impact: 'Potential revenue: ₹120,000',
    recommendation: 'Prioritize sales team follow-up within 24 hours',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    details: 'Leads have visited pricing page 3+ times, downloaded case studies, and spent >10 minutes on product demos.'
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
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  },
  {
    id: '2',
    name: 'Inventory Management',
    description: 'Monitor stock levels and automate reordering',
    trigger_type: 'inventory',
    trigger_conditions: { stock_threshold: 0.2 },
    actions: ['check_inventory', 'create_purchase_order', 'notify_manager'],
    is_active: true,
    success_rate: 98,
    last_execution: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    total_executions: 89,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString()
  },
  {
    id: '3',
    name: 'Lead Scoring & Routing',
    description: 'Score leads and route to appropriate sales reps',
    trigger_type: 'lead_scoring',
    trigger_conditions: { lead_score_threshold: 80 },
    actions: ['score_lead', 'assign_rep', 'send_notification'],
    is_active: false,
    success_rate: 76,
    last_execution: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    total_executions: 234,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
  }
]

const generateMockMetrics = (): Metrics => ({
  totalActions: 47,
  activeWorkflows: 2,
  predictionsGenerated: 247,
  systemHealth: 92,
  timeSaved: 124,
  accuracyRate: 94,
  productivityBoost: 2.5,
  lastUpdated: new Date().toISOString()
})

// Store interface
interface AppStore {
  // Data
  actions: Action[]
  predictions: Prediction[]
  workflows: Workflow[]
  metrics: Metrics
  
  // Loading states
  isLoading: boolean
  isProcessing: boolean
  
  // Actions
  setActions: (actions: Action[]) => void
  setPredictions: (predictions: Prediction[]) => void
  setWorkflows: (workflows: Workflow[]) => void
  setMetrics: (metrics: Metrics) => void
  
  // Action operations
  approveAction: (id: string) => Promise<void>
  holdAction: (id: string) => Promise<void>
  updateActionMessage: (id: string, message: string) => void
  
  // Workflow operations
  toggleWorkflow: (id: string, isActive: boolean) => Promise<void>
  executeWorkflow: (id: string) => Promise<void>
  
  // Prediction operations
  generatePrediction: () => void
  updatePredictionSeverity: (id: string, severity: 'High' | 'Medium' | 'Low') => void
  
  // Metrics operations
  updateMetrics: () => void
  
  // Utility
  simulateApiCall: <T>(data: T, delay?: number) => Promise<T>
}

// Create store
export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial data
    actions: generateMockActions(),
    predictions: generateMockPredictions(),
    workflows: generateMockWorkflows(),
    metrics: generateMockMetrics(),
    
    // Loading states
    isLoading: false,
    isProcessing: false,
    
    // Setters
    setActions: (actions) => set({ actions }),
    setPredictions: (predictions) => set({ predictions }),
    setWorkflows: (workflows) => set({ workflows }),
    setMetrics: (metrics) => set({ metrics }),
    
    // Utility function for simulating API calls
    simulateApiCall: async <T,>(data: T, delay = 1000) => {
      set({ isProcessing: true })
      await new Promise(resolve => setTimeout(resolve, delay))
      set({ isProcessing: false })
      return data
    },
    
    // Action operations
    approveAction: async (id: string) => {
      const { actions, simulateApiCall } = get()
      const action = actions.find(a => a.id === id)
      if (!action) return
      
      await simulateApiCall(null, 1500)
      
      set(state => ({
        actions: state.actions.map(a =>
          a.id === id
            ? { ...a, status: 'executed' as const, executed_at: new Date().toISOString() }
            : a
        )
      }))
      
      // Update metrics
      get().updateMetrics()
    },
    
    holdAction: async (id: string) => {
      const { simulateApiCall } = get()
      
      await simulateApiCall(null, 800)
      
      set(state => ({
        actions: state.actions.filter(a => a.id !== id)
      }))
    },
    
    updateActionMessage: (id: string, message: string) => {
      set(state => ({
        actions: state.actions.map(a =>
          a.id === id ? { ...a, message } : a
        )
      }))
    },
    
    // Workflow operations
    toggleWorkflow: async (id: string, isActive: boolean) => {
      const { simulateApiCall } = get()
      
      await simulateApiCall(null, 500)
      
      set(state => ({
        workflows: state.workflows.map(w =>
          w.id === id ? { ...w, is_active: isActive } : w
        )
      }))
      
      // Update metrics
      get().updateMetrics()
    },
    
    executeWorkflow: async (id: string) => {
      const { workflows, simulateApiCall } = get()
      const workflow = workflows.find(w => w.id === id)
      if (!workflow) return
      
      // Set executing state
      set(state => ({
        workflows: state.workflows.map(w =>
          w.id === id ? { ...w, is_executing: true } : w
        )
      }))
      
      await simulateApiCall(null, 2000)
      
      set(state => ({
        workflows: state.workflows.map(w =>
          w.id === id
            ? {
                ...w,
                is_executing: false,
                last_execution: new Date().toISOString(),
                total_executions: w.total_executions + 1,
                success_rate: Math.min(100, w.success_rate + Math.random() * 2 - 1)
              }
            : w
        )
      }))
      
      // Update metrics
      get().updateMetrics()
    },
    
    // Prediction operations
    generatePrediction: () => {
      const newPrediction: Prediction = {
        id: Date.now().toString(),
        name: `New AI Prediction ${Date.now()}`,
        description: 'Automatically generated prediction based on current data patterns',
        prediction_type: ['churn_risk', 'inventory_shortage', 'lead_insight'][Math.floor(Math.random() * 3)] as any,
        confidence: 70 + Math.random() * 25,
        severity: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as any,
        impact: 'Potential impact: ₹' + Math.floor(Math.random() * 200000 + 50000),
        recommendation: 'Recommended action based on AI analysis',
        created_at: new Date().toISOString()
      }
      
      set(state => ({
        predictions: [newPrediction, ...state.predictions]
      }))
      
      // Update metrics
      get().updateMetrics()
    },
    
    updatePredictionSeverity: (id: string, severity: 'High' | 'Medium' | 'Low') => {
      set(state => ({
        predictions: state.predictions.map(p =>
          p.id === id ? { ...p, severity } : p
        )
      }))
    },
    
    // Metrics operations
    updateMetrics: () => {
      const { actions, workflows, predictions } = get()
      
      set(state => ({
        metrics: {
          ...state.metrics,
          totalActions: actions.length,
          activeWorkflows: workflows.filter(w => w.is_active).length,
          predictionsGenerated: predictions.length,
          systemHealth: 85 + Math.random() * 10,
          lastUpdated: new Date().toISOString()
        }
      }))
    }
  }))
)

// Selectors for easy data access
export const useActions = () => useAppStore(state => state.actions)
export const usePredictions = () => useAppStore(state => state.predictions)
export const useWorkflows = () => useAppStore(state => state.workflows)
export const useMetrics = () => useAppStore(state => state.metrics)
export const useIsLoading = () => useAppStore(state => state.isLoading)
export const useIsProcessing = () => useAppStore(state => state.isProcessing)
