import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import InstructorCourseEditContent from '@/components/instructor/InstructorCourseEditContent'

export const metadata = { title: 'Курсты өңдеу' }

export default async function InstructorCourseEditPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabase
    .from('courses')
    .select('id, title_ru, title_kk, title_en, description_ru, description_kk, description_en, slug, price, level, language, status, thumbnail_url, instructor_id, category_id')
    .eq('id', params.id)
    .single()

  if (!course) notFound()
  if (course.instructor_id !== user.id) redirect('/instructor/courses')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ru, name_kk, name_en, slug')
    .order('name_ru')

  const { data: sections } = await supabase
    .from('sections')
    .select('id, title_ru, title_kk, title_en, order_idx')
    .eq('course_id', params.id)
    .order('order_idx')

  const sectionIds = (sections ?? []).map((s: any) => s.id)

  const { data: lessons } = sectionIds.length > 0
    ? await supabase.from('lessons').select('id, title_ru, title_kk, title_en, section_id, order_idx, is_preview, mux_playback_id, mux_upload_id, youtube_url').in('section_id', sectionIds).order('order_idx')
    : { data: [] }

  return (
    <InstructorCourseEditContent
      course={course as any}
      categories={(categories as any) ?? []}
      sections={(sections as any) ?? []}
      lessons={(lessons as any) ?? []}
    />
  )
}
