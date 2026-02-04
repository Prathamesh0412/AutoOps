import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET() {
  try {
    const data = await db.getDataSources()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error fetching data sources:', error)
    return NextResponse.json({ error: 'Failed to fetch data sources' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const data = await db.addDataSource({
      name: body.name,
      type: body.type,
      status: 'processing',
      records_count: 0,
      last_processed: new Date().toISOString()
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Error creating data source:', error)
    return NextResponse.json({ error: 'Failed to create data source' }, { status: 500 })
  }
}
