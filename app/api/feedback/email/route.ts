import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

const MODEL = 'mixtral-8x7b-32768'

const SENTIMENT_PRIORITY: Record<string, 'high' | 'medium' | 'low'> = {
  negative: 'high',
  neutral: 'medium',
  positive: 'low',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const customerName = (body.customerName || '').trim()
    const customerEmail = (body.customerEmail || '').trim()
    const feedback = (body.feedback || '').trim()
    const source = (body.source || '').trim()
    const sentiment = (body.sentiment || '').toLowerCase()

    if (!customerName || !customerEmail || !feedback || !sentiment) {
      return NextResponse.json({ error: 'customerName, customerEmail, sentiment, and feedback are required.' }, { status: 400 })
    }

    if (!['positive', 'neutral', 'negative'].includes(sentiment)) {
      return NextResponse.json({ error: 'sentiment must be positive, neutral, or negative.' }, { status: 400 })
    }

    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured on the server.' }, { status: 500 })
    }

    const prompt = `You are an empathetic AI customer success agent. Draft a concise email reply to a customer based on their review.
- Maintain a professional, human tone.
- Reflect the sentiment (${sentiment}).
- Reference specific points from the feedback.
- Include a clear next step or CTA.
- Keep the body under 200 words.
Format:
Subject: <compelling subject>
Body:
<email body>`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 512,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Customer Name: ${customerName}\nCustomer Email: ${customerEmail}\nSentiment: ${sentiment}\nFeedback: """${feedback}"""`,
          },
        ],
      }),
    })

    if (!groqResponse.ok) {
      const error = await groqResponse.text()
      console.error('[Groq] API error:', error)
      return NextResponse.json({ error: 'Failed to generate email. Check Groq API response.' }, { status: groqResponse.status })
    }

    const completion = await groqResponse.json()
    const emailDraft = completion?.choices?.[0]?.message?.content?.trim()

    if (!emailDraft) {
      return NextResponse.json({ error: 'Groq returned an empty response.' }, { status: 502 })
    }

    const action = await db.addAction({
      prediction_id: null,
      title: `Draft response for ${customerName}`,
      description: `LLM-generated email awaiting approval before sending to ${customerName}.`,
      action_type: 'customer_email',
      status: 'pending',
      priority: SENTIMENT_PRIORITY[sentiment],
      expected_impact: 'Preserve customer satisfaction',
      executed_at: null,
      result: null,
      metadata: {
        customerName,
        customerEmail,
        sentiment,
        feedback,
        emailDraft,
        source: source || 'customer_feedback',
        createdFrom: 'groq',
      },
    })

    return NextResponse.json({ action })
  } catch (error) {
    console.error('[API] Error generating email draft:', error)
    return NextResponse.json({ error: 'Failed to draft email' }, { status: 500 })
  }
}
