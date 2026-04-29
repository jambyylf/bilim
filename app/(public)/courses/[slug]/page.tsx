import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CourseDetailContent from '@/components/catalog/CourseDetailContent'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data } = await supabase.from('courses').select('title_ru, description_ru').eq('slug', params.slug).eq('status', 'published' as any).single()
  return {
    title: data?.title_ru ?? 'Курс',
    description: data?.description_ru ?? '',
  }
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select(`
      id, slug, title_kk, title_ru, title_en,
      description_kk, description_ru, description_en,
      price, discount_price, language, level, status,
      rating, students_count, thumbnail_url,
      trailer_mux_id, trailer_mux_playback_id,
      what_you_learn, requirements, created_at,
      instructor_id,
      category:categories(slug, name_kk, name_ru, name_en)
    `)
    .eq('slug', params.slug)
    .single()

  if (!course || course.status !== 'published') notFound()

  // Instructor-ды бөлек аламыз (FK hint мәселесін болдырмау үшін)
  const { data: instructor } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, bio')
    .eq('id', (course as any).instructor_id)
    .single()

  // Бөлімдер мен сабақтарды аламыз
  const { data: sections } = await supabase
    .from('sections')
    .select(`
      id, title_kk, title_ru, title_en, order_idx,
      lessons(id, title_kk, title_ru, title_en, duration_sec, order_idx, is_preview)
    `)
    .eq('course_id', course.id)
    .order('order_idx')

  // Пікірлерді аламыз
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, student_id')
    .eq('course_id', course.id)
    .order('created_at', { ascending: false })
    .limit(6)

  // Пайдаланушы тіркелген бе?
  const { data: { user } } = await supabase.auth.getUser()
  let enrolled = false
  if (user) {
    const { data: enroll } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', course.id)
      .single()
    enrolled = !!enroll
  }

  const courseWithInstructor = { ...(course as any), instructor: instructor ?? null }

  return (
    <CourseDetailContent
      course={courseWithInstructor}
      sections={(sections as any) ?? []}
      reviews={reviews ?? []}
      enrolled={enrolled}
      userId={user?.id ?? null}
    />
  )
}
