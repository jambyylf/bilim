import { createClient } from '@/lib/supabase/server'
import AdminCoursesContent from '@/components/admin/AdminCoursesContent'

export const metadata = { title: 'Admin — Курстар' }

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: { status?: string; review?: string }
}) {
  const supabase = await createClient()
  const status   = searchParams.status ?? 'all'

  let query = supabase
    .from('courses')
    .select('id, title_ru, title_kk, title_en, slug, status, price, created_at, deleted_at, instructor:profiles!courses_instructor_id_fkey(id, full_name)')
    .order('created_at', { ascending: false })

  if (status === 'trash') {
    query = query.eq('status', 'deleted' as any)
  } else if (status !== 'all') {
    query = query.eq('status', status as any)
  } else {
    query = query.neq('status', 'deleted' as any)
  }

  const { data: courses } = await query

  return (
    <AdminCoursesContent
      courses={(courses as any) ?? []}
      statusFilter={status}
      reviewId={searchParams.review}
    />
  )
}
