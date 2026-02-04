"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Bell, Mail, Smartphone, Globe, Moon, Sun } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { NoSSR } from "@/components/no-ssr"

export default function SettingsPage() {
  return (
    <NoSSR>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Settings</h1>
            <Button>Save Changes</Button>
          </div>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Language</div>
                    <div className="text-sm text-muted-foreground">Choose your preferred language</div>
                  </div>
                  <select className="px-3 py-2 border rounded-md bg-background">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Timezone</div>
                    <div className="text-sm text-muted-foreground">Set your local timezone</div>
                  </div>
                  <select className="px-3 py-2 border rounded-md bg-background">
                    <option>UTC-5 (Eastern)</option>
                    <option>UTC-8 (Pacific)</option>
                    <option>UTC+0 (GMT)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Date Format</div>
                    <div className="text-sm text-muted-foreground">How dates are displayed</div>
                  </div>
                  <select className="px-3 py-2 border rounded-md bg-background">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-muted-foreground">Choose your preferred theme</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Sun className="h-4 w-4 mr-1" />
                    Light
                  </Button>
                  <Button variant="default" size="sm">
                    <Moon className="h-4 w-4 mr-1" />
                    Dark
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Compact Mode</div>
                  <div className="text-sm text-muted-foreground">Reduce UI spacing</div>
                </div>
                <Button variant="outline" size="sm">Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates via email</div>
                  </div>
                  <Button variant="default" size="sm">Enabled</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">Browser push notifications</div>
                  </div>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS Alerts</div>
                    <div className="text-sm text-muted-foreground">Critical alerts via SMS</div>
                  </div>
                  <Button variant="default" size="sm">Enabled</Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Notification Types</h4>
                {[
                  "System updates and maintenance",
                  "Security alerts and warnings",
                  "Billing and subscription updates",
                  "Feature announcements and tips",
                  "Weekly performance reports",
                ].map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{type}</span>
                    <Button variant={index < 3 ? "default" : "outline"} size="sm">
                      {index < 3 ? "On" : "Off"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Data Export</div>
                  <div className="text-sm text-muted-foreground">Download all your data</div>
                </div>
                <Button variant="outline">Export Data</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Analytics Tracking</div>
                  <div className="text-sm text-muted-foreground">Help us improve the product</div>
                </div>
                <Button variant="default" size="sm">Enabled</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Cookie Preferences</div>
                  <div className="text-sm text-muted-foreground">Manage cookie settings</div>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                API Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">API Access</div>
                  <div className="text-sm text-muted-foreground">Enable API access for your account</div>
                </div>
                <Button variant="default" size="sm">Enabled</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Rate Limit</div>
                  <div className="text-sm text-muted-foreground">1000 requests per hour</div>
                </div>
                <Button variant="outline">Configure</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Webhook URLs</div>
                  <div className="text-sm text-muted-foreground">Configure webhook endpoints</div>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </NoSSR>
  )
}
