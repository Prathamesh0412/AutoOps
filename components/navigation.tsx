"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Home, 
  Activity, 
  Target, 
  BarChart3, 
  Settings, 
  Users, 
  Zap, 
  MoreVertical,
  Search,
  X
} from "lucide-react"
import { useState, useEffect } from "react"
import { useActions, usePredictions, useWorkflows, useMetrics } from "@/lib/store"
import { NoSSR } from "@/components/no-ssr"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Actions", href: "/actions", icon: Target },
  { name: "Insights", href: "/insights", icon: BarChart3 },
  { name: "Workflows", href: "/workflows", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Get live data for notifications
  const actions = useActions()
  const predictions = usePredictions()
  const workflows = useWorkflows()
  const metrics = useMetrics()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate notifications based on real data
  const pendingActions = actions.filter(a => a.status === 'pending').length
  const highSeverityPredictions = predictions.filter(p => p.severity === 'High').length
  const totalNotifications = pendingActions + highSeverityPredictions

  return (
    <NoSSR fallback={
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                <Zap className="size-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AutoOps AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <div key={item.name} className="h-9 w-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-20 bg-muted animate-pulse rounded" />
            <div className="h-9 w-9 bg-muted animate-pulse rounded" />
            <div className="h-9 w-9 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </nav>
    }>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                <Zap className="size-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AutoOps AI</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href && item.name !== "Home"
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="size-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Activity className="size-5" />
              <span className="absolute right-1 top-1 flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <Users className="size-5" />
              {mounted && totalNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-xs animate-pulse"
                >
                  {totalNotifications}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navigation.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </NoSSR>
  )
}
