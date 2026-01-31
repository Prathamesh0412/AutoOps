import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')

    let data = await db.getPredictions()

    if (status) {
      data = data.filter(p => p.status === status)
    }

    if (severity) {
      data = data.filter(p => p.severity === severity)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error fetching predictions:', error)
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 })
  }
}
