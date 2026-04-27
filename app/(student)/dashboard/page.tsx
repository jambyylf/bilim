import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudentDashboard from '@/components/student/StudentDashboard'

export const metadata = { title: 'Менің курстарым' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'instructor') redirect('/instructor/dashboard')
  if (profile?.role === 'admin')      redirect('/admin')

  // Жазылған курстар + прогресс
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id, progress_pct, status, enrolled_at,
      course:courses(
        id, slug, title_kk, title_ru, title_en,
        thumbnail_url, level, language, students_count,
        category:categories(slug, name_kk, name_ru, name_en),
        instructor:profiles!courses_instructor_id_fkey(full_name)
      )
    `)
    .eq('student_id', user.id)
    .eq('status', 'active')
    .order('enrolled_at', { ascending: false })

  return <StudentDashboard profile={profile} enrollments={(enrollments as any) ?? []} />
}
