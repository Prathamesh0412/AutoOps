"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useStoreActions } from "@/lib/hooks"
import { 
  X, 
  MessageSquare as BellIcon, 
  Target, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Users,
  Package,
  TrendingUp,
  Settings,
  Zap
} from "lucide-react"

interface Notification {
  id: string
  type: 'action' | 'prediction' | 'workflow' | 'system' | 'customer' | 'inventory' | 'order'
  title: string
  message: string
  time: string
  priority: 'High' | 'Medium' | 'Low'
  read: boolean
  data?: any // Additional data related to the notification
}

interface NotificationsPanelProps {
  onClose: () => void
  notifications: Notification[]
}

export function NotificationsPanel({ onClose, notifications }: NotificationsPanelProps) {
  const { markNotificationAsRead, markAllNotificationsAsRead, removeNotification } = useStoreActions()
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id)
    }
  }
  
  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead()
    onClose()
  }
  
  const handleRemoveNotification = (id: string) => {
    removeNotification(id)
  }
  const getIcon = (type: string) => {
    switch (type) {
      case 'action':
        return <Target className="size-4 text-blue-500" />
      case 'prediction':
        return <AlertTriangle className="size-4 text-amber-500" />
      case 'workflow':
        return <Settings className="size-4 text-purple-500" />
      case 'customer':
        return <Users className="size-4 text-green-500" />
      case 'inventory':
        return <Package className="size-4 text-orange-500" />
      case 'order':
        return <TrendingUp className="size-4 text-blue-600" />
      case 'system':
        return <Zap className="size-4 text-red-500" />
      default:
        return <BellIcon className="size-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'Medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <BellIcon className="size-4" />
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {notifications.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted/50 mb-4">
                <BellIcon className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No new notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 hover:bg-accent/30 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50 shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 opacity-0 hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveNotification(notification.id)
                          }}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      <span>{notification.time}</span>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="size-2 rounded-full bg-primary mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
