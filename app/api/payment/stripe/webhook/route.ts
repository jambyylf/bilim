import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' as any })
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const { orderId, courseId, userId } = pi.metadata

    const supabase = await createClient()

    // Тапсырысты жаңарту
    await supabase.from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId)

    // Жазылым жасаймыз
    await supabase.from('enrollments').upsert({
      student_id:  userId,
      course_id:   courseId,
      order_id:    orderId,
      status:      'active',
    }, { onConflict: 'student_id,course_id' })

    // Студент санын арттыру (atomic UPDATE)
    const { data: courseData } = await supabase
      .from('courses')
      .select('students_count')
      .eq('id', courseId)
      .single()
    await supabase
      .from('courses')
      .update({ students_count: ((courseData?.students_count as number) ?? 0) + 1 } as any)
      .eq('id', courseId)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    const supabase = await createClient()
    await supabase.from('orders')
      .update({ payment_status: 'failed' })
      .eq('payment_ref', pi.id)
  }

  return NextResponse.json({ received: true })
}
