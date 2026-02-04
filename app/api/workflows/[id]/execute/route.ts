import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // Simulate workflow execution
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update workflow execution stats
    const workflows = await db.getWorkflows()
    const workflow = workflows.find(w => w.id === id)
    
    if (workflow) {
      // Update last execution and increment count
      const updatedWorkflow = {
        ...workflow,
        last_execution: new Date().toISOString(),
        total_executions: workflow.total_executions + 1
      }
      
      await db.updateWorkflow(id, updatedWorkflow)
      
      return NextResponse.json(updatedWorkflow)
    }
    
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  } catch (error) {
    console.error('[API] Error executing workflow:', error)
    return NextResponse.json({ error: 'Failed to execute workflow' }, { status: 500 })
  }
}
