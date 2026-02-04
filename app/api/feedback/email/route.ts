import { NextResponse } from 'next/server'
import { z } from 'zod'
import { analyzeSentiment, categorizeCustomer } from '@/lib/sentiment'
import { generateEmailContent } from '@/lib/email-generator'
import { sendCustomerEmail } from '@/lib/email-sender'

const payloadSchema = z.object({
  customer_name: z.string().min(1, 'customer_name is required'),
  customer_email: z.string().email('customer_email must be valid'),
  feedback: z.string().min(5, 'feedback must contain more detail'),
})

export async function POST(request: Request) {
  try {
    const raw = await request.json()
    const payload = payloadSchema.parse(raw)

    const sentimentResult = analyzeSentiment(payload.feedback)
    const category = categorizeCustomer(sentimentResult.sentiment)

    const emailContent = await generateEmailContent({
      customerName: payload.customer_name,
      feedback: payload.feedback,
      sentiment: sentimentResult.sentiment,
      category,
    })

    const delivery = await sendCustomerEmail({
      to: payload.customer_email,
      subject: emailContent.subject,
      body: emailContent.email_body,
    })

    return NextResponse.json({
      sentiment: {
        sentiment: sentimentResult.sentiment,
        confidence: Number(sentimentResult.confidence.toFixed(2)),
      },
      category,
      email: {
        subject: emailContent.subject,
        email_body: emailContent.email_body,
      },
      delivery_status: delivery.status,
      generator_source: emailContent.source,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('[feedback-email] Unexpected error', error)
    return NextResponse.json({ error: 'Unable to process feedback right now.' }, { status: 500 })
  }
}
