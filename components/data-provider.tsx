"use client"

import { ReactNode, useEffect, useState } from 'react'
import { useUnifiedStore } from '@/lib/unified-store'
import { useRealTimeSync, globalEvents, DATA_EVENTS, useDataEvent } from '@/lib/realtime-sync'
import { useToast } from '@/hooks/use-toast'
import { HydrationSafe } from '@/components/hydration-safe'

interface DataProviderProps {
  children: ReactNode
  enableRealTime?: boolean
}

export function DataProvider({ children, enableRealTime = true }: DataProviderProps) {
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { subscribe, triggerSync } = useRealTimeSync(enableRealTime)
  const { generateInsights, generateActions, updateMetrics } = useUnifiedStore()

  // Handle hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Set up real-time event listeners
  useDataEvent(DATA_EVENTS.CUSTOMER_UPDATED, (data: any) => {
    console.log('Customer updated:', data)
    // Trigger dependent data updates
    updateMetrics()
  })

  useDataEvent(DATA_EVENTS.PRODUCT_UPDATED, (data: any) => {
    console.log('Product updated:', data)
    // Trigger dependent data updates
    updateMetrics()
    generateInsights()
  })

  useDataEvent(DATA_EVENTS.ACTION_EXECUTED, (data: any) => {
    console.log('Action executed:', data)
    toast({
      title: "Action Executed",
      description: "An automated action has been completed successfully.",
    })
    // Trigger dependent data updates
    updateMetrics()
    generateInsights()
  })

  useDataEvent(DATA_EVENTS.FILE_UPLOADED, (data: any) => {
    console.log('Files uploaded:', data)
    toast({
      title: "Files Uploaded",
      description: `${data.files.length} file(s) uploaded successfully.`,
    })
  })

  useDataEvent(DATA_EVENTS.FILE_ANALYZED, (data: any) => {
    console.log('File analyzed:', data)
    toast({
      title: "Analysis Complete",
      description: "File analysis has been completed and insights generated.",
    })
    // Trigger insights generation
    generateInsights()
    generateActions()
  })

  useDataEvent(DATA_EVENTS.METRICS_UPDATED, () => {
    console.log('Metrics updated')
  })

  // Initialize connection (only on client)
  useEffect(() => {
    if (!enableRealTime || !isClient) return

    setIsConnected(true)
    
    // Set up periodic data refresh
    const refreshInterval = setInterval(() => {
      updateMetrics()
    }, 30000) // Refresh every 30 seconds

    // Set up real-time simulation
    const simulationInterval = setInterval(() => {
      // Simulate random data changes for demo purposes
      if (Math.random() > 0.7) {
        triggerSync()
      }
    }, 10000) // Simulate changes every 10 seconds

    return () => {
      clearInterval(refreshInterval)
      clearInterval(simulationInterval)
      setIsConnected(false)
    }
  }, [enableRealTime, updateMetrics, triggerSync, isClient])

  // Initial data load (only on client)
  useEffect(() => {
    if (!isClient) return
    updateMetrics()
    generateInsights()
    generateActions()
  }, [updateMetrics, generateInsights, generateActions, isClient])

  return (
    <div className="relative">
      {/* Connection status indicator (hydration safe) */}
      <HydrationSafe fallback={null}>
        {enableRealTime && isClient && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1 bg-background border rounded-full shadow-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        )}
      </HydrationSafe>
      
      {children}
    </div>
  )
}
