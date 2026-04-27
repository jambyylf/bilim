import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LessonPlayer from '@/components/student/LessonPlayer'

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { lesson?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?redirect=/courses/${params.slug}/learn`)

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title_kk, title_ru, title_en, status')
    .eq('slug', params.slug)
    .single()

  if (!course || course.status !== 'published') notFound()

  // Жазылым тексеру
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, progress_pct')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment) redirect(`/courses/${params.slug}`)

  // Бөлімдер мен сабақтар
  const { data: sections } = await supabase
    .from('sections')
    .select(`
      id, title_kk, title_ru, title_en, order_idx,
      lessons(id, title_kk, title_ru, title_en, mux_asset_id, mux_playback_id, duration_sec, order_idx, is_preview)
    `)
    .eq('course_id', course.id)
    .order('order_idx')

  const rawSections = (sections as any[]) ?? []
  const allLessons = rawSections.flatMap((s: any) =>
    ((s.lessons ?? []) as any[]).sort((a: any, b: any) => a.order_idx - b.order_idx)
  )

  // Прогресс
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed, last_position')
    .eq('student_id', user.id)
    .eq('enrollment_id', enrollment.id)

  const currentLessonId = searchParams.lesson ?? allLessons[0]?.id ?? null

  return (
    <LessonPlayer
      course={course as any}
      sections={rawSections}
      allLessons={allLessons}
      currentLessonId={currentLessonId}
      enrollmentId={enrollment.id}
      userId={user.id}
      progress={(progress as any) ?? []}
    />
  )
}
