import { createClient } from '@/lib/supabase/server'
import InstructorAnalyticsContent from '@/components/instructor/InstructorAnalyticsContent'

export const metadata = { title: 'Аналитика' }

export default async function InstructorAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title_ru, title_kk, students_count, status')
    .eq('instructor_id', user.id)
    .order('students_count', { ascending: false })

  const courseIds = (courses ?? []).map((c: any) => c.id)

  const { data: enrollments } = courseIds.length > 0
    ? await supabase
        .from('enrollments')
        .select('id, progress_pct, course_id')
        .in('course_id', courseIds)
    : { data: [] }

  // Per-course analytics
  const courseStats = (courses ?? []).map((c: any) => {
    const enrolled = ((enrollments ?? []) as any[]).filter(e => e.course_id === c.id)
    const completed = enrolled.filter(e => (e.progress_pct ?? 0) >= 100).length
    const avgProgress = enrolled.length > 0
      ? Math.round(enrolled.reduce((s: number, e: any) => s + (e.progress_pct ?? 0), 0) / enrolled.length)
      : 0
    return {
      id: c.id,
      title_ru: c.title_ru,
      title_kk: c.title_kk,
      students: c.students_count ?? 0,
      enrolled: enrolled.length,
      completed,
      completionRate: enrolled.length > 0 ? Math.round((completed / enrolled.length) * 100) : 0,
      avgProgress,
      status: c.status,
    }
  })

  const totalStudents = courseStats.reduce((s, c) => s + c.students, 0)
  const totalCompleted = courseStats.reduce((s, c) => s + c.completed, 0)

  return (
    <InstructorAnalyticsContent
      courseStats={courseStats}
      totalStudents={totalStudents}
      totalCompleted={totalCompleted}
    />
  )
}
