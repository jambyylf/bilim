import { createClient } from '@/lib/supabase/server'
import InstructorCoursesContent from '@/components/instructor/InstructorCoursesContent'

export const metadata = { title: 'Менің курстарым' }

export default async function InstructorCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title_kk, title_ru, title_en, status, price, discount_price, students_count, rating, created_at')
    .eq('instructor_id', user!.id)
    .order('created_at', { ascending: false })

  return <InstructorCoursesContent courses={courses ?? []} />
}
