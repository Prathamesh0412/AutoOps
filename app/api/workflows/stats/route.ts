import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all workflows
    const allWorkflows = await db.getWorkflows()
    
    // Get active workflows
    const activeWorkflows = allWorkflows.filter(w => w.is_active)

    // Calculate average success rate
    const successRate = allWorkflows.length > 0
      ? Math.round(allWorkflows.reduce((sum, w) => sum + w.success_rate, 0) / allWorkflows.length)
      : 0

    // Get actions this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const actions = await db.getActions()
    const actionsThisWeek = actions.filter(a => 
      a.status === 'completed' && 
      a.executed_at && 
      new Date(a.executed_at) >= oneWeekAgo
    ).length

    return NextResponse.json({
      totalWorkflows: allWorkflows.length,
      activeWorkflows: activeWorkflows.length,
      successRate,
      actionsThisWeek,
    })
  } catch (error) {
    console.error('[v0] Error fetching workflow stats:', error)
    return NextResponse.json({ error: 'Failed to fetch workflow stats' }, { status: 500 })
  }
}
