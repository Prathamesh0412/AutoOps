"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, Shield, Cpu, ChevronRight, BarChart3, Target, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useMetrics, useStoreActions } from "@/lib/hooks"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { NoSSR } from "@/components/no-ssr"

export function HomeHero() {
  const metrics = useMetrics()
  const { updateMetrics } = useStoreActions()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Update metrics every 5 seconds for live feel
    const interval = setInterval(() => {
      updateMetrics()
    }, 5000)

    return () => clearInterval(interval)
  }, [updateMetrics])

  return (
    <NoSSR>
      <section className="relative overflow-hidden bg-linear-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4 animate-fade-in-up">
                <Badge variant="secondary" className="w-fit animate-scale-in animate-stagger-1">
                  <Zap className="mr-2 h-4 w-4" />
                  AI-Powered Business Automation
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl animate-fade-in-up animate-stagger-2">
                  Transform Your Business with{" "}
                  <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Intelligent Automation
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty max-w-150 animate-fade-in-up animate-stagger-3">
                  AutoOps AI analyzes your data, predicts business needs, and executes automated solutions to save time and increase efficiency.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-stagger-4">
                <Button size="lg" className="group" asChild>
                  <Link href="/dashboard">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard">
                    View Demo
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 animate-fade-in-up animate-stagger-5">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    <AnimatedCounter value={metrics.confidence_score} suffix="%" />
                  </div>
                  <div className="text-sm text-muted-foreground">AI Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    <AnimatedCounter value={metrics.time_saved_hours} suffix="h" />
                  </div>
                  <div className="text-sm text-muted-foreground">Time Saved Weekly</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    <AnimatedCounter value={Math.round(metrics.executed_actions * 1.2)} suffix="x" />
                  </div>
                  <div className="text-sm text-muted-foreground">Productivity Boost</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {mounted && (
                <Card className="relative overflow-hidden border-2 border-blue-800/20 shadow-2xl hover:border-blue-800/40 hover:shadow-blue-800/10 transition-all duration-300 animate-fade-in-right animate-scale-in">
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
                          <div className="text-2xl font-bold">
                            <AnimatedCounter value={metrics.active_workflows} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Predictions</span>
                          </div>
                          <div className="text-2xl font-bold">
                            <AnimatedCounter value={metrics.predictions_generated} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Actions Executed</span>
                          </div>
                          <div className="text-2xl font-bold">
                            <AnimatedCounter value={metrics.executed_actions} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Time Saved</span>
                          </div>
                          <div className="text-2xl font-bold">
                            <AnimatedCounter value={metrics.time_saved_hours} suffix="h" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">System Health</span>
                          <span className="text-green-500 font-medium">
                            {metrics.system_health >= 90 ? 'Optimal' : metrics.system_health >= 70 ? 'Good' : 'Warning'}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              metrics.system_health >= 90 ? 'bg-green-500' :
                              metrics.system_health >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${metrics.system_health}%` }}
                          ></div>
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
