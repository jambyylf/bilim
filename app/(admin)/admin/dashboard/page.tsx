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
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid'),
    supabase.from('courses')
      .select('id, title_ru, title_kk, created_at, instructor:profiles!courses_instructor_id_fkey(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('orders')
      .select('id, total_amount, payment_method, payment_status, created_at, student:profiles!orders_student_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Жалпы табыс
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
      recentOrders={(recentOrders as any) ?? []}
    />
  )
}
