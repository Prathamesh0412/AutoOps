import { useMemo, useEffect } from 'react'
import { useUnifiedStore } from './unified-store'
import { useDataStore as useDataStoreFromCore } from './core/data-store'

// Re-export useDataStore from core
export { useDataStore as useDataStore } from './core/data-store'

// Memoized hooks for better performance
export const useAppData = () => {
  const customers = useUnifiedStore(state => state.customers)
  const products = useUnifiedStore(state => state.products)
  const orders = useUnifiedStore(state => state.orders)
  const actions = useUnifiedStore(state => state.actions)
  const predictions = useUnifiedStore(state => state.predictions)
  const workflows = useUnifiedStore(state => state.workflows)
  const metrics = useUnifiedStore(state => state.metrics)
  
  return useMemo(() => ({
    customers,
    products,
    orders,
    actions,
    predictions,
    workflows,
    metrics
  }), [customers, products, orders, actions, predictions, workflows, metrics])
}

export const useNotifications = () => {
  const { customers, products, orders, actions, predictions, workflows } = useAppData()
  const { addNotification } = useStoreActions()
  const notifications = useUnifiedStore(state => state.notifications)
  
  // Generate real-time notifications based on actual data
  useEffect(() => {
    const generateNotifications = () => {
      // Customer churn risk notifications
      const highRiskCustomers = customers.filter(c => c.churn_risk > 0.8)
      highRiskCustomers.forEach(customer => {
        const existingNotif = notifications.find(n => 
          n.type === 'customer' && n.data?.customerId === customer.id
        )
        if (!existingNotif) {
          addNotification({
            type: 'customer',
            title: 'High Churn Risk Alert',
            message: `Customer ${customer.name} has ${Math.round(customer.churn_risk * 100)}% churn risk with ₹${customer.ltv.toLocaleString()} LTV`,
            priority: 'High',
            data: { customerId: customer.id, customerName: customer.name, churnRisk: customer.churn_risk }
          })
        }
      })

      // Inventory shortage notifications
      const lowStockProducts = products.filter(p => p.stock_quantity <= p.reorder_threshold)
      lowStockProducts.forEach(product => {
        const existingNotif = notifications.find(n => 
          n.type === 'inventory' && n.data?.productId === product.id
        )
        if (!existingNotif) {
          addNotification({
            type: 'inventory',
            title: 'Inventory Shortage',
            message: `${product.name} is below reorder threshold (${product.stock_quantity} units left)`,
            priority: product.stock_quantity === 0 ? 'High' : 'Medium',
            data: { productId: product.id, productName: product.name, stockLevel: product.stock_quantity }
          })
        }
      })

      // High value order notifications (only for new orders in last hour)
      const recentHighValueOrders = orders.filter(o => 
        o.revenue > 10000 && new Date(o.created_at) >= new Date(Date.now() - 60 * 60 * 1000)
      )
      recentHighValueOrders.forEach(order => {
        const existingNotif = notifications.find(n => 
          n.type === 'order' && n.data?.orderId === order.id
        )
        if (!existingNotif) {
          addNotification({
            type: 'order',
            title: 'High Value Order',
            message: `New order worth ₹${order.revenue.toLocaleString()} received`,
            priority: 'Medium',
            data: { orderId: order.id, revenue: order.revenue }
          })
        }
      })

      // Pending action notifications
      const pendingActions = actions.filter(a => a.status === 'pending')
      pendingActions.forEach(action => {
        const existingNotif = notifications.find(n => 
          n.type === 'action' && n.data?.actionId === action.id
        )
        if (!existingNotif) {
          addNotification({
            type: 'action',
            title: 'Action Required',
            message: action.title,
            priority: action.priority,
            data: { actionId: action.id, actionTitle: action.title }
          })
        }
      })

      // High severity prediction notifications
      const highSeverityPredictions = predictions.filter(p => p.severity === 'High')
      highSeverityPredictions.forEach(prediction => {
        const existingNotif = notifications.find(n => 
          n.type === 'prediction' && n.data?.predictionId === prediction.id
        )
        if (!existingNotif) {
          addNotification({
            type: 'prediction',
            title: 'High Priority Prediction',
            message: prediction.name,
            priority: 'High',
            data: { predictionId: prediction.id, predictionName: prediction.name }
          })
        }
      })

      // Workflow execution notifications (only for recent executions in last 2 minutes)
      const recentlyExecutedWorkflows = workflows.filter(w => 
        w.last_execution && new Date(w.last_execution) >= new Date(Date.now() - 2 * 60 * 1000)
      )
      recentlyExecutedWorkflows.forEach(workflow => {
        const existingNotif = notifications.find(n => 
          n.type === 'workflow' && n.data?.workflowId === workflow.id
        )
        if (!existingNotif) {
          addNotification({
            type: 'workflow',
            title: 'Workflow Executed',
            message: `${workflow.name} completed with ${workflow.success_rate}% success rate`,
            priority: workflow.success_rate >= 80 ? 'Low' : 'Medium',
            data: { workflowId: workflow.id, workflowName: workflow.name, successRate: workflow.success_rate }
          })
        }
      })
    }

    // Throttle notification generation to prevent rapid duplicates
    const timeoutId = setTimeout(generateNotifications, 500)
    return () => clearTimeout(timeoutId)
  }, [customers, products, orders, actions, predictions, workflows, addNotification, notifications])
  
  const unreadNotifications = notifications.filter(n => !n.read)
  const totalNotifications = unreadNotifications.length
  
  return {
    notifications: unreadNotifications,
    totalNotifications,
    allNotifications: notifications,
    pendingActions: actions.filter(a => a.status === 'pending').length,
    highSeverityPredictions: predictions.filter(p => p.severity === 'High').length
  }
}

export const useStoreActions = () => {
  const addCustomer = useUnifiedStore(state => state.addCustomer)
  const updateCustomer = useUnifiedStore(state => state.updateCustomer)
  const deleteCustomer = useUnifiedStore(state => state.deleteCustomer)
  const addProduct = useUnifiedStore(state => state.addProduct)
  const updateProduct = useUnifiedStore(state => state.updateProduct)
  const deleteProduct = useUnifiedStore(state => state.deleteProduct)
  const addOrder = useUnifiedStore(state => state.addOrder)
  const updateOrder = useUnifiedStore(state => state.updateOrder)
  const deleteOrder = useUnifiedStore(state => state.deleteOrder)
  const executeAction = useUnifiedStore(state => state.executeAction)
  const rejectAction = useUnifiedStore(state => state.rejectAction)
  const rollbackAction = useUnifiedStore(state => state.rollbackAction)
  const generateInsights = useUnifiedStore(state => state.generateInsights)
  const generateActions = useUnifiedStore(state => state.generateActions)
  const updateMetrics = useUnifiedStore(state => state.updateMetrics)
  const simulateRealTimeData = useUnifiedStore(state => state.simulateRealTimeData)
  const uploadFiles = useUnifiedStore(state => state.uploadFiles)
  const removeFile = useUnifiedStore(state => state.removeFile)
  const analyzeSelectedFiles = useUnifiedStore(state => state.analyzeSelectedFiles)
  const simulateApiCall = useUnifiedStore(state => state.simulateApiCall)
  
  // Workflow actions
  const addWorkflow = useUnifiedStore(state => state.addWorkflow)
  const updateWorkflow = useUnifiedStore(state => state.updateWorkflow)
  const deleteWorkflow = useUnifiedStore(state => state.deleteWorkflow)
  const toggleWorkflow = useUnifiedStore(state => state.toggleWorkflow)
  const executeWorkflow = useUnifiedStore(state => state.executeWorkflow)
  
  // Notification actions
  const addNotification = useUnifiedStore(state => state.addNotification)
  const markNotificationAsRead = useUnifiedStore(state => state.markNotificationAsRead)
  const markAllNotificationsAsRead = useUnifiedStore(state => state.markAllNotificationsAsRead)
  const removeNotification = useUnifiedStore(state => state.removeNotification)
  const clearNotifications = useUnifiedStore(state => state.clearNotifications)
  
  return {
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    deleteOrder,
    executeAction,
    rejectAction,
    rollbackAction,
    generateInsights,
    generateActions,
    updateMetrics,
    simulateRealTimeData,
    uploadFiles,
    removeFile,
    analyzeSelectedFiles,
    simulateApiCall,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
    executeWorkflow,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearNotifications
  }
}

export const useLoadingStates = () => {
  const isLoading = useUnifiedStore(state => state.isLoading)
  const isProcessing = useUnifiedStore(state => state.isProcessing)
  const isUploading = useUnifiedStore(state => state.isUploading)
  const isAnalyzing = useUnifiedStore(state => state.isAnalyzing)
  
  return {
    isLoading,
    isProcessing,
    isUploading,
    isAnalyzing
  }
}

// Legacy compatibility hooks (to replace old imports)
export const useCustomers = () => useUnifiedStore(state => state.customers)
export const useProducts = () => useUnifiedStore(state => state.products)
export const useOrders = () => useUnifiedStore(state => state.orders)
export const useActions = () => useUnifiedStore(state => state.actions)
export const usePredictions = () => useUnifiedStore(state => state.predictions)
export const useWorkflows = () => useUnifiedStore(state => state.workflows)
export const useMetrics = () => useUnifiedStore(state => state.metrics)
export const useUploadedFiles = () => useUnifiedStore(state => state.uploadedFiles)
