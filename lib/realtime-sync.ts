import { useEffect, useRef, useState } from 'react'
import { useUnifiedStore } from './unified-store'

// Real-time synchronization hook for cross-component data consistency
export function useRealTimeSync(enabled: boolean = true) {
  const lastUpdateRef = useRef<number>(Date.now())
  const subscribersRef = useRef(new Set<() => void>())

  // Subscribe to store changes and notify all components
  useEffect(() => {
    if (!enabled) return

    // Use Zustand's subscribe method with the store instance
    const unsubscribe = useUnifiedStore.subscribe(
      () => {
        const now = Date.now()
        
        // Debounce rapid updates (prevent excessive re-renders)
        if (now - lastUpdateRef.current < 100) return
        
        lastUpdateRef.current = now
        
        // Notify all subscribers of data changes
        subscribersRef.current.forEach(callback => {
          try {
            callback()
          } catch (error) {
            console.error('Error in real-time sync subscriber:', error)
          }
        })
      }
    )

    return unsubscribe
  }, [enabled])

  // Register a component for real-time updates
  const subscribe = (callback: () => void) => {
    subscribersRef.current.add(callback)
    
    // Return unsubscribe function
    return () => {
      subscribersRef.current.delete(callback)
    }
  }

  // Trigger manual sync across all components
  const triggerSync = () => {
    lastUpdateRef.current = Date.now()
    subscribersRef.current.forEach(callback => callback())
  }

  return {
    subscribe,
    triggerSync,
    lastUpdate: lastUpdateRef.current
  }
}

// Enhanced real-time data synchronization with conflict resolution
export function useDataSync<T>(
  dataSelector: (state: any) => T,
  onUpdate?: (newData: T, oldData: T) => void
) {
  const { subscribe, triggerSync } = useRealTimeSync()
  const data = useUnifiedStore(dataSelector)
  const prevDataRef = useRef<T>(data)

  useEffect(() => {
    return subscribe(() => {
      const currentData = useUnifiedStore.getState()
      const newData = dataSelector(currentData)
      
      if (JSON.stringify(newData) !== JSON.stringify(prevDataRef.current)) {
        onUpdate?.(newData, prevDataRef.current)
        prevDataRef.current = newData
      }
    })
  }, [subscribe, dataSelector, onUpdate])

  return {
    data,
    triggerSync,
    isDataChanged: JSON.stringify(data) !== JSON.stringify(prevDataRef.current)
  }
}

// Global event system for cross-component communication
class GlobalEventEmitter {
  private events = new Map<string, Set<Function>>()

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    this.events.get(event)?.delete(callback)
  }

  emit(event: string, data?: any) {
    this.events.get(event)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error)
      }
    })
  }

  clear() {
    this.events.clear()
  }
}

export const globalEvents = new GlobalEventEmitter()

// Predefined events for data synchronization
export const DATA_EVENTS = {
  CUSTOMER_UPDATED: 'customer:updated',
  PRODUCT_UPDATED: 'product:updated',
  ORDER_UPDATED: 'order:updated',
  ACTION_EXECUTED: 'action:executed',
  PREDICTION_GENERATED: 'prediction:generated',
  WORKFLOW_EXECUTED: 'workflow:executed',
  FILE_UPLOADED: 'file:uploaded',
  FILE_ANALYZED: 'file:analyzed',
  METRICS_UPDATED: 'metrics:updated'
} as const

// Hook for listening to global data events
export function useDataEvent(event: string, handler: (data?: any) => void) {
  useEffect(() => {
    globalEvents.on(event, handler)
    return () => globalEvents.off(event, handler)
  }, [event, handler])
}

// Hook for components to access real-time data status
export function useDataStatus() {
  const { subscribe } = useRealTimeSync()
  const [lastSync, setLastSync] = useState<Date>(new Date())

  useEffect(() => {
    return subscribe(() => {
      setLastSync(new Date())
    })
  }, [subscribe])

  return {
    lastSync,
    isLive: true // Could be enhanced with actual connection status
  }
}
