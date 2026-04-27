import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' as any })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title_ru, price, discount_price, instructor_id')
    .eq('id', courseId)
    .eq('status', 'published')
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const amount = Math.round((course.discount_price ?? course.price) * 100) // тиынға айналдыру (KZT * 100)
  const commission = Math.round(amount * 0.2)

  // Тапсырыс жасаймыз
  const { data: order } = await supabase
    .from('orders')
    .insert({
      student_id:     user.id,
      total_amount:   amount / 100,
      net_amount:     (amount - commission) / 100,
      payment_method: 'stripe',
      payment_status: 'pending',
      currency:       'KZT',
    })
    .select('id')
    .single()

  if (!order) return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })

  // Order item
  await supabase.from('order_items').insert({
    order_id:        order.id,
    course_id:       course.id,
    instructor_id:   course.instructor_id,
    price:           amount / 100,
    platform_fee:    commission / 100,
    instructor_earn: (amount - commission) / 100,
  })

  // Stripe PaymentIntent жасаймыз
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'kzt',
    metadata: {
      orderId:  order.id,
      courseId: course.id,
      userId:   user.id,
    },
  })

  // Тапсырысқа payment_ref сақтаймыз
  await supabase.from('orders').update({ payment_ref: paymentIntent.id }).eq('id', order.id)

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderId:      order.id,
  })
}
