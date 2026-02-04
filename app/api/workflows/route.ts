import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET() {
  try {
    const data = await db.getWorkflows()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Error fetching workflows:', error)
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, is_active } = body

    const data = await db.updateWorkflow(id, { is_active })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Error updating workflow:', error)
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })
  }
}
