import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let data = await db.getActions()

    if (!data || !Array.isArray(data)) {
      data = []
    }

    if (status) {
      // Handle different status values
      if (status === 'executed') {
        data = data.filter(a => a.status === 'completed')
      } else if (status === 'pending') {
        data = data.filter(a => a.status === 'pending' || a.status === 'in_progress')
      } else {
        data = data.filter(a => a.status === status)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error fetching actions:', error)
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    const updateData: any = { status }
    
    if (status === 'completed') {
      updateData.executed_at = new Date().toISOString()
      updateData.result = { success: true, message: 'Action executed successfully' }
    }

    const data = await db.updateAction(id, updateData)

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error updating action:', error)
    return NextResponse.json({ error: 'Failed to update action' }, { status: 500 })
  }
}
