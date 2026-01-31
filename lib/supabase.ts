// Virtual Database API - Replaces Supabase with browser-based storage
import { virtualDB } from './virtual-db'

export type DataSource = {
  id: string
  name: string
  type: string
  status: string
  records_count: number
  last_processed: string
  created_at: string
}

export type Prediction = {
  id: string
  type: string
  severity: string
  title: string
  description: string
  confidence_score: number
  metrics: any
  recommended_action: string
  status: string
  created_at: string
}

export type Action = {
  id: string
  prediction_id: string | null
  title: string
  description: string
  action_type: string
  status: string
  priority: string
  expected_impact: string
  executed_at: string | null
  result: any
  metadata?: Record<string, any> | null
  created_at: string
}

export type Workflow = {
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

export type WorkflowExecution = {
  id: string
  workflow_id: string
  status: string
  started_at: string
  completed_at: string | null
  result: any
}

export type Metric = {
  id: string
  metric_type: string
  value: number
  period: string
  recorded_at: string
}

// Export virtual database as the main API
export const supabase = {
  // Data Sources
  from: (table: string) => ({
    select: () => ({
      data: null,
      error: null
    })
  })
}

// Export direct database functions for easier usage
export const db = {
  getDataSources: async () => {
    try {
      const result = await virtualDB.getDataSources()
      return result
    } catch (error) {
      console.error('[Supabase] getDataSources error:', error)
      return []
    }
  },
  getPredictions: async () => {
    try {
      const result = await virtualDB.getPredictions()
      return result
    } catch (error) {
      console.error('[Supabase] getPredictions error:', error)
      return []
    }
  },
  getActions: async () => {
    try {
      const result = await virtualDB.getActions()
      return result
    } catch (error) {
      console.error('[Supabase] getActions error:', error)
      return []
    }
  },
  updateAction: async (id: string, updates: Partial<Action>) => {
    try {
      const result = await virtualDB.updateAction(id, updates)
      return result
    } catch (error) {
      console.error('[Supabase] updateAction error:', error)
      throw error
    }
  },
  addAction: async (action: Omit<Action, 'id' | 'created_at'>) => {
    try {
      const result = await virtualDB.addAction(action)
      return result
    } catch (error) {
      console.error('[Supabase] addAction error:', error)
      throw error
    }
  },
  executeAction: (id: string) => virtualDB.executeAction(id),
  getWorkflows: () => virtualDB.getWorkflows(),
  updateWorkflow: (id: string, updates: Partial<Workflow>) => virtualDB.updateWorkflow(id, updates),
  executeWorkflow: (id: string) => virtualDB.executeWorkflow(id),
  getMetrics: () => virtualDB.getMetrics(),
  addDataSource: (dataSource: Omit<DataSource, 'id' | 'created_at'>) => virtualDB.addDataSource(dataSource),
  addPrediction: (prediction: Omit<Prediction, 'id' | 'created_at'>) => virtualDB.addPrediction(prediction)
}
