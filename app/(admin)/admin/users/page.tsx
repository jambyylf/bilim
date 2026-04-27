import { createClient } from '@/lib/supabase/server'
import AdminUsersContent from '@/components/admin/AdminUsersContent'

export const metadata = { title: 'Admin — Қолданушылар' }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string; q?: string }
}) {
  const supabase = await createClient()
  const role = searchParams.role ?? 'all'
  const q    = searchParams.q ?? ''

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at, avatar_url')
    .order('created_at', { ascending: false })

  if (role !== 'all') query = query.eq('role', role as any)
  if (q)              query = query.ilike('full_name', `%${q}%`)

  const { data: users } = await query.limit(100)

  return <AdminUsersContent users={(users as any) ?? []} roleFilter={role} searchQuery={q} />
}
