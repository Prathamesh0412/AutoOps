"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Mail, DollarSign, Star, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"
import type { DataSource } from "@/lib/supabase"

const iconMap: Record<string, any> = {
  email: Mail,
  invoice: DollarSign,
  review: Star,
  sales_log: BarChart3,
}

export function DataAnalysisPanel() {
  const [uploading, setUploading] = useState(false)
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDataSources() {
      try {
        const response = await fetch('/api/data-sources')
        if (!response.ok) {
          console.error('[v0] API error:', response.status)
          setDataSources([])
          return
        }
        const data = await response.json()
        console.log('[v0] Data sources received:', data)
        if (Array.isArray(data)) {
          setDataSources(data)
        } else {
          console.error('[v0] Data sources is not an array:', data)
          setDataSources([])
        }
      } catch (error) {
        console.error('[v0] Error fetching data sources:', error)
        setDataSources([])
      } finally {
        setLoading(false)
      }
    }

    fetchDataSources()
    const interval = setInterval(fetchDataSources, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleUpload = () => {
    setUploading(true)
    setTimeout(() => setUploading(false), 2000)
  }

  const getProgress = (status: string) => {
    if (status === 'completed') return 100
    if (status === 'processing') return 65
    if (status === 'error') return 0
    return 0
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Data Analysis
            </CardTitle>
            <CardDescription className="mt-1">
              Real-time processing of unstructured business data
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleUpload} disabled={uploading}>
            <Upload className="mr-2 size-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading data sources...
          </div>
        ) : dataSources.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No data sources found. Upload data to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {dataSources.map((source) => {
              const Icon = iconMap[source.type] || FileText
              const progress = getProgress(source.status)
              return (
                <div
                  key={source.id}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{source.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {(source.records_count || 0).toLocaleString()} records
                        </p>
                      </div>
                      <Badge
                        variant={source.status === "completed" ? "default" : "secondary"}
                      >
                        {source.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Processing</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last sync: {source.last_processed ? new Date(source.last_processed).toLocaleString() : 'Never'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
