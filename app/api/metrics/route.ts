import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET() {
  try {
    // Get data from virtual database
    const workflows = await db.getWorkflows()
    const predictions = await db.getPredictions()
    const actions = await db.getActions()
    const metrics = await db.getMetrics()

    // Calculate metrics
    const activeWorkflows = workflows.filter(w => w.is_active).length
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const predictionsMade = predictions.filter(p => 
      new Date(p.created_at) >= oneWeekAgo
    ).length
    const actionsExecuted = actions.filter(a => a.status === 'completed').length
    const timeSaved = metrics.find(m => m.metric_type === 'time_saved_hours')?.value || 0

    return NextResponse.json({
      activeWorkflows,
      predictionsMade,
      actionsExecuted,
      timeSaved,
    })
  } catch (error) {
    console.error('[v0] Error fetching metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
