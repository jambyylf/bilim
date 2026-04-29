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
  const slug = decodeURIComponent(params.slug)

  if (!user) redirect(`/login?redirect=/courses/${slug}/learn`)

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title_kk, title_ru, title_en, status')
    .eq('slug', slug)
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
      lessons(id, title_kk, title_ru, title_en, youtube_url, duration_sec, order_idx, is_preview)
    `)
    .eq('course_id', course.id)
    .order('order_idx')

  // youtube_url клиентке бермейміз — has_video boolean-ға айналдырамыз
  function mapLesson(l: any) {
    return {
      id: l.id,
      title_kk: l.title_kk,
      title_ru: l.title_ru,
      title_en: l.title_en,
      has_video: !!(l.youtube_url),
      duration_sec: l.duration_sec,
      order_idx: l.order_idx,
      is_preview: l.is_preview,
    }
  }

  const rawSections = (sections as any[]) ?? []
  const cleanSections = rawSections.map((s: any) => ({
    id: s.id,
    title_kk: s.title_kk,
    title_ru: s.title_ru,
    title_en: s.title_en,
    order_idx: s.order_idx,
    lessons: ((s.lessons ?? []) as any[]).map(mapLesson),
  }))
  const allLessons = cleanSections.flatMap(s =>
    [...s.lessons].sort((a, b) => a.order_idx - b.order_idx)
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
      sections={cleanSections}
      allLessons={allLessons}
      currentLessonId={currentLessonId}
      enrollmentId={enrollment.id}
      userId={user.id}
      progress={(progress as any) ?? []}
    />
  )
}
