"use client"

import { ReactNode, useEffect, useState } from 'react'

interface HydrationSafeProps {
  children: ReactNode
  fallback?: ReactNode
}

export function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// For components that need to avoid hydration mismatches
export function ClientOnly({ children, fallback }: HydrationSafeProps) {
  return <HydrationSafe fallback={fallback}>{children}</HydrationSafe>
}

// For date/time displays that change between server and client
export function SafeTimeDisplay({ 
  children, 
  fallback = "Loading..." 
}: { 
  children: ReactNode 
  fallback?: string 
}) {
  return (
    <HydrationSafe fallback={<span>{fallback}</span>}>
      {children}
    </HydrationSafe>
  )
}
