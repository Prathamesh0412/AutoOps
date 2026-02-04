"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  TrendingUp, 
  Shield, 
  Database, 
  Users, 
  BarChart3, 
  Target 
} from "lucide-react"
import { NoSSR } from "@/components/no-ssr"

const features = [
  {
    icon: Zap,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze your business data to identify patterns and opportunities.",
    badge: "Core Feature",
    color: "text-blue-500"
  },
  {
    icon: TrendingUp,
    title: "Predictive Intelligence",
    description: "Forecast business trends, customer behavior, and market changes with high accuracy predictions.",
    badge: "Advanced",
    color: "text-green-500"
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Identify potential business risks and automatically implement preventive measures to protect your operations.",
    badge: "Security",
    color: "text-red-500"
  },
  {
    icon: Database,
    title: "Data Integration",
    description: "Seamlessly connect all your business data sources for unified intelligence and comprehensive insights.",
    badge: "Integration",
    color: "text-purple-500"
  },
  {
    icon: Users,
    title: "Customer Intelligence",
    description: "Understand customer behavior patterns and automatically optimize engagement strategies for better results.",
    badge: "Analytics",
    color: "text-orange-500"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Monitor business metrics 24/7 with instant notifications and actionable insights for immediate action.",
    badge: "Monitoring",
    color: "text-indigo-500"
  }
]

export function FeaturesSection() {
  return (
    <NoSSR>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful Features for Modern Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Everything you need to automate, analyze, and optimize your business operations in one platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl hover:border-blue-800/30 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-300 interactive-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </NoSSR>
  )
}
