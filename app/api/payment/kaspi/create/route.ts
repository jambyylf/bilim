import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Kaspi Pay integration (sandbox/production)
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title_ru, price, discount_price, instructor_id')
    .eq('id', courseId)
    .eq('status', 'published')
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const amount     = course.discount_price ?? course.price
  const commission = Math.round(amount * 0.2)

  const { data: order } = await supabase
    .from('orders')
    .insert({
      student_id:     user.id,
      total_amount:   amount,
      net_amount:     amount - commission,
      payment_method: 'kaspi',
      payment_status: 'pending',
      currency:       'KZT',
    })
    .select('id')
    .single()

  if (!order) return NextResponse.json({ error: 'Order failed' }, { status: 500 })

  await supabase.from('order_items').insert({
    order_id:        order.id,
    course_id:       course.id,
    instructor_id:   course.instructor_id,
    price:           amount,
    platform_fee:    commission,
    instructor_earn: amount - commission,
  })

  // Kaspi Pay API — нақты интеграция үшін KASPI_MERCHANT_ID және KASPI_API_KEY қажет
  const kaspiOrderId = `BILIM-${order.id.slice(0, 8).toUpperCase()}`
  await supabase.from('orders').update({ payment_ref: kaspiOrderId }).eq('id', order.id)

  // Kaspi Pay redirect URL (sandbox)
  // Нақты: https://pay.kaspi.kz/pay/api/v1/payments/create?...
  const redirectUrl = process.env.KASPI_MERCHANT_ID !== 'placeholder'
    ? `https://pay.kaspi.kz/pay?serviceId=${process.env.KASPI_MERCHANT_ID}&orderId=${kaspiOrderId}&amount=${amount}&returnUrl=${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${order.id}`
    : null

  return NextResponse.json({ orderId: order.id, redirectUrl })
}
