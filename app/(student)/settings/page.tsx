import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentSettingsContent from '@/components/student/StudentSettingsContent'

export const metadata = { title: 'Параметрлер' }

export default async function StudentSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, bio, avatar_url, role')
    .eq('id', user.id)
    .single()

  return <StudentSettingsContent profile={{ ...profile, email: user.email ?? null } as any} />
}
