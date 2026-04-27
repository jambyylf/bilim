import { createClient } from '@/lib/supabase/server'
import CheckoutSuccess from '@/components/checkout/CheckoutSuccess'

export const metadata = { title: 'Төлем сәтті өтті' }

export default async function CheckoutSuccessPage({
  searchParams,
}: { searchParams: { order?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const orderId = searchParams.order
  let courseSlug = ''

  if (orderId && user) {
    // Тапсырысты paid-ке өзгертеміз (Stripe webhookты күтпестен)
    await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderId).eq('student_id', user.id)

    const { data: item } = await supabase
      .from('order_items')
      .select('course_id, courses(slug)')
      .eq('order_id', orderId)
      .single()

    if (item) {
      await supabase.from('enrollments').upsert({
        student_id: user.id,
        course_id:  item.course_id,
        order_id:   orderId,
        status:     'active',
      }, { onConflict: 'student_id,course_id' })
      courseSlug = (item as any).courses?.slug ?? ''
    }
  }

  return <CheckoutSuccess courseSlug={courseSlug} />
}
