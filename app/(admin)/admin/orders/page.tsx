import { createClient } from '@/lib/supabase/server'
import AdminOrdersContent from '@/components/admin/AdminOrdersContent'

export const metadata = { title: 'Admin — Тапсырыстар' }

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const supabase = await createClient()
  const status   = searchParams.status ?? 'all'
  const page     = parseInt(searchParams.page ?? '1')
  const pageSize = 20
  const from     = (page - 1) * pageSize
  const to       = from + pageSize - 1

  let query = supabase
    .from('orders')
    .select('id, total_amount, payment_method, payment_status, created_at, student:profiles!orders_student_id_fkey(full_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status !== 'all') query = query.eq('payment_status', status as any)

  const { data: orders, count } = await query

  // Revenue summary
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('payment_status', 'paid')

  const totalRevenue = (revenueData ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0)

  return (
    <AdminOrdersContent
      orders={(orders as any) ?? []}
      total={count ?? 0}
      page={page}
      pageSize={pageSize}
      statusFilter={status}
      totalRevenue={totalRevenue}
    />
  )
}
