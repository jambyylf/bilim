import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InstructorSettingsContent from '@/components/instructor/InstructorSettingsContent'

export const metadata = { title: 'Параметрлер' }

export default async function InstructorSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, bio, avatar_url, role')
    .eq('id', user.id)
    .single()

  return <InstructorSettingsContent profile={profile as any} />
}
