"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Key, Smartphone, Mail, Bell, Eye, EyeOff } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { NoSSR } from "@/components/no-ssr"

export default function SecurityPage() {
  return (
    <NoSSR>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Security Settings</h1>
            <Badge className="bg-green-500">All Secure</Badge>
          </div>

          {/* Security Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-500">Strong</div>
                <div className="text-sm text-muted-foreground">Password Strength</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Key className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-blue-500">Active</div>
                <div className="text-sm text-muted-foreground">2FA Enabled</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-purple-500">2</div>
                <div className="text-sm text-muted-foreground">Devices</div>
              </CardContent>
            </Card>
          </div>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Last Changed</div>
                  <div className="text-sm text-muted-foreground">30 days ago</div>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Password expires every 90 days</span>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Require special characters</span>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Minimum password length</span>
                  <Badge variant="outline">12 chars</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <div>
                  <div className="font-medium">Authenticator App</div>
                  <div className="text-sm text-muted-foreground">Using Google Authenticator</div>
                </div>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS Authentication</span>
                  <Button variant="outline" size="sm">Setup</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Backup Codes</span>
                  <Button variant="outline" size="sm">Generate</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { device: "Chrome on Windows", location: "New York, USA", time: "2 hours ago", current: true },
                  { device: "Safari on iPhone", location: "Boston, USA", time: "1 day ago", current: false },
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {session.device}
                        {session.current && <Badge variant="outline">Current</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">{session.location} • {session.time}</div>
                    </div>
                    {!session.current && (
                      <Button variant="outline" size="sm">Revoke</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Security Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "New login from unknown device", enabled: true },
                  { title: "Password changed", enabled: true },
                  { title: "2FA disabled", enabled: true },
                  { title: "API key created", enabled: false },
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{notification.title}</span>
                    <Button variant={notification.enabled ? "default" : "outline"} size="sm">
                      {notification.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </NoSSR>
  )
}
