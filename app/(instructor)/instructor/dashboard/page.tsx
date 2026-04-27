import { createClient } from '@/lib/supabase/server'
import InstructorDashboardContent from '@/components/instructor/InstructorDashboardContent'

export default async function InstructorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Спикердің барлық курстарын аламыз
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title_kk, title_ru, title_en, status, price, discount_price, students_count, rating')
    .eq('instructor_id', user!.id)
    .order('created_at', { ascending: false })

  // Соңғы пікірлерді аламыз
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, student_id')
    .in('course_id', (courses ?? []).map(c => c.id))
    .order('created_at', { ascending: false })
    .limit(5)

  const totalStudents = (courses ?? []).reduce((s, c) => s + (c.students_count ?? 0), 0)
  const avgRating = courses?.length
    ? (courses.reduce((s, c) => s + (c.rating ?? 0), 0) / courses.length).toFixed(1)
    : '—'

  return (
    <InstructorDashboardContent
      courses={courses ?? []}
      reviews={reviews ?? []}
      totalStudents={totalStudents}
      avgRating={avgRating}
    />
  )
}
