"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, Shield, Cpu, ChevronRight, BarChart3, Target, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { NoSSR } from "@/components/no-ssr"

export function HomeHero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NoSSR>
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Zap className="mr-2 h-4 w-4" />
                  AI-Powered Business Automation
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Transform Your Business with{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Intelligent Automation
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty max-w-[600px]">
                  AutoOps AI analyzes your data, predicts business needs, and executes automated solutions to save time and increase efficiency.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="outline" size="lg">
                  View Demo
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">94%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">124h</div>
                  <div className="text-sm text-muted-foreground">Time Saved Weekly</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2.5x</div>
                  <div className="text-sm text-muted-foreground">Productivity Boost</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {mounted && (
                <Card className="relative overflow-hidden border-2 border-primary/20 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Live Dashboard</h3>
                        <Badge variant="default" className="bg-green-500">
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                          Active
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Active Workflows</span>
                          </div>
                          <div className="text-2xl font-bold">12</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Predictions</span>
                          </div>
                          <div className="text-2xl font-bold">247</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Actions Executed</span>
                          </div>
                          <div className="text-2xl font-bold">89</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Time Saved</span>
                          </div>
                          <div className="text-2xl font-bold">124h</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">System Health</span>
                          <span className="text-green-500 font-medium">Optimal</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </NoSSR>
  )
}
