import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSettingsContent from '@/components/admin/AdminSettingsContent'

export const metadata = { title: 'Admin — Баптаулар' }

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <AdminSettingsContent
      profile={profile as any}
      email={user.email ?? ''}
    />
  )
}
