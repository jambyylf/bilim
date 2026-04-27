import { createClient } from '@/lib/supabase/server'
import InstructorEarningsContent from '@/components/instructor/InstructorEarningsContent'

export const metadata = { title: 'Табыс' }

export default async function InstructorEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Instructor's courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title_ru, title_kk')
    .eq('instructor_id', user.id)

  const courseIds = (courses ?? []).map((c: any) => c.id)

  // Orders for those courses
  const { data: orders } = courseIds.length > 0
    ? await supabase
        .from('order_items')
        .select('id, price, order:orders!order_items_order_id_fkey(created_at, payment_status)')
        .in('course_id', courseIds)
    : { data: [] }

  // Group by month
  const paidOrders = ((orders ?? []) as any[]).filter(o => o.order?.payment_status === 'paid')
  const byMonth: Record<string, number> = {}
  for (const o of paidOrders) {
    const d    = new Date(o.order?.created_at ?? '')
    const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] = (byMonth[key] ?? 0) + (o.price ?? 0)
  }
  const monthlyData = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, gross]) => ({ month, gross, net: gross * 0.8 }))

  const totalGross = paidOrders.reduce((s: number, o: any) => s + (o.price ?? 0), 0)

  return (
    <InstructorEarningsContent
      monthlyData={monthlyData}
      totalGross={totalGross}
      totalNet={totalGross * 0.8}
      orderCount={paidOrders.length}
    />
  )
}
