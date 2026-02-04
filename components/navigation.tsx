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
  X,
  Package,
  MoreHorizontal as MenuIcon,
  MessageSquare as BellIcon,
  Users as UserIcon,
  HelpCircle,
  User,
  LogOut,
  CreditCard,
  Shield
} from "lucide-react"
import { useState, useEffect } from "react"
import { useNotifications, useStoreActions, useLoadingStates } from "@/lib/hooks"
import { NoSSR } from "@/components/no-ssr"
import { LoadingState } from "@/components/ui/loading-state"
import { cn } from "@/lib/utils"
import { NotificationsPanel } from "./notifications-panel"

// Create a context for real-time monitoring state
import { createContext, useContext } from "react"

const RealTimeContext = createContext<{
  isRealTimeEnabled: boolean
  toggleRealTime: () => void
}>({
  isRealTimeEnabled: true,
  toggleRealTime: () => {}
})

export const useRealTime = () => useContext(RealTimeContext)

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Actions", href: "/actions", icon: Target },
  { name: "Insights", href: "/insights", icon: BarChart3 },
  { name: "Products", href: "/products", icon: Package },
  { name: "Workflows", href: "/workflows", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  
  // Use optimized hooks
  const { notifications, totalNotifications } = useNotifications()
  
  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled)
  }

  const handleLogout = () => {
    // In a real app, this would handle logout logic
    console.log("Logging out...")
    // Redirect to home or login page
    window.location.href = "/"
  }
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <RealTimeContext.Provider value={{ isRealTimeEnabled, toggleRealTime }}>
      <NoSSR fallback={
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/75 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-lg">
                  <Zap className="size-5 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 size-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">AutoOps AI</span>
                <span className="text-xs text-muted-foreground">Intelligent Automation</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div key={item.name} className="h-8 w-16 bg-muted/50 animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-muted/50 animate-pulse rounded-lg" />
            <div className="h-8 w-8 bg-muted/50 animate-pulse rounded-lg" />
            <div className="h-8 w-8 bg-muted/50 animate-pulse rounded-lg" />
          </div>
        </div>
      </nav>
    }>
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/75 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="AutoOps AI Logo" 
                  className="size-12 object-contain bg-black p-1 transition-all duration-200 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      target.style.display = 'none';
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <Zap className="size-5 text-primary-foreground hidden" />
                <div className="absolute -bottom-1 -right-1 size-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">AutoOps AI</span>
                <span className="text-xs text-muted-foreground">Intelligent Automation</span>
              </div>
            </Link>
            
            <div className="hidden lg:flex items-center gap-1">
              {!mounted ? (
                <LoadingState message="" size="sm" className="gap-1" />
              ) : (
                navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out flex items-center justify-center min-w-0 transform",
                        isActive 
                          ? "text-blue-800 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/40 shadow-md border border-blue-300/60 dark:border-blue-700/60 scale-105" 
                          : "text-muted-foreground hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50/60 dark:hover:bg-blue-900/30 hover:scale-102 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className={cn(
                          "size-4 transition-all duration-300 ease-out shrink-0",
                          isActive ? "scale-110 text-blue-700 dark:text-blue-400 animate-pulse" : "group-hover:scale-110 group-hover:rotate-3"
                        )} />
                        <span className="truncate transition-all duration-300 ease-out group-hover:font-semibold">{item.name}</span>
                      </div>
                      {isActive && (
                        <div className="absolute inset-x-0 -bottom-px h-0.5 bg-linear-to-r from-transparent via-blue-500 to-transparent rounded-full animate-slide-in" />
                      )}
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "relative h-9 w-9 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200",
                isRealTimeEnabled ? "text-green-600" : "text-muted-foreground"
              )}
              onClick={toggleRealTime}
              title={isRealTimeEnabled ? "Disable real-time updates" : "Enable real-time updates"}
            >
              <Activity className={cn("size-4", isRealTimeEnabled && "animate-pulse")} />
              <span className={cn(
                "absolute right-1.5 top-1.5 flex size-2",
                isRealTimeEnabled ? "opacity-100" : "opacity-0"
              )}>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-9 w-9 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <BellIcon className="size-4" />
              {mounted && totalNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-xs animate-bounce border-2 border-background"
                >
                  {totalNotifications}
                </Badge>
              )}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative h-9 w-9 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200"
                >
                  <UserIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john.doe@autops.ai
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/security">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Security</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {notificationsOpen && (
              <div className="absolute top-16 right-4 z-50 w-80">
                <NotificationsPanel 
                  onClose={() => setNotificationsOpen(false)}
                  notifications={notifications}
                />
              </div>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-9 w-9 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <MenuIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4">
              <div className="grid gap-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-out transform",
                        isActive 
                          ? "text-blue-800 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/40 border border-blue-300/60 dark:border-blue-700/60 shadow-sm scale-102" 
                          : "text-muted-foreground hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50/60 dark:hover:bg-blue-900/30 hover:scale-101 hover:shadow-sm hover:translate-x-1"
                      )}
                    >
                      <item.icon className="size-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </nav>
    </NoSSR>
    </RealTimeContext.Provider>
  )
}
