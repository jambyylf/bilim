import { createClient } from '@/lib/supabase/server'
import AdminDashboardContent from '@/components/admin/AdminDashboardContent'

export const metadata = { title: 'Admin — Шолу' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalCourses },
    { count: totalOrders },
    { data: pendingCourses },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid'),
    supabase.from('courses')
      .select('id, title_ru, title_kk, created_at, instructor:profiles!courses_instructor_id_fkey(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('profiles')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  // Платформа табысы (20%)
  const { data: revenue } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('payment_status', 'paid')

  const totalRevenue = (revenue ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const platformRevenue = totalRevenue * 0.2

  return (
    <AdminDashboardContent
      stats={{ totalUsers: totalUsers ?? 0, totalCourses: totalCourses ?? 0, totalOrders: totalOrders ?? 0, platformRevenue }}
      pendingCourses={(pendingCourses as any) ?? []}
      recentUsers={(recentUsers as any) ?? []}
    />
  )
}
