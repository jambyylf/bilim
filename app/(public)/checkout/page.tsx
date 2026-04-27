import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CheckoutContent from '@/components/checkout/CheckoutContent'

export const metadata = { title: 'Төлем' }

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { course?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?redirect=/checkout?course=${searchParams.course ?? ''}`)

  const courseId = searchParams.course
  if (!courseId) redirect('/courses')

  const { data: course } = await supabase
    .from('courses')
    .select(`
      id, slug, title_kk, title_ru, title_en,
      price, discount_price, language, level,
      thumbnail_url,
      instructor:profiles!courses_instructor_id_fkey(full_name)
    `)
    .eq('id', courseId)
    .eq('status', 'published')
    .single()

  if (!course) redirect('/courses')

  // Бұрын сатып алған ба?
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (existing) redirect(`/courses/${course.slug}/learn`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single()

  return (
    <CheckoutContent
      course={course as any}
      userId={user.id}
      userEmail={user.email ?? ''}
      profile={profile}
    />
  )
}
