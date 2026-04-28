import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface LessonInput {
  id?: string
  title_kk: string
  title_ru: string
  order_idx: number
  is_preview: boolean
  mux_upload_id?: string
}

interface SectionInput {
  id?: string
  title_kk: string
  title_ru: string
  order_idx: number
  lessons: LessonInput[]
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Тек өз курсын өзгерте алады
  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', params.id)
    .single()

  if (!course || course.instructor_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { sections }: { sections: SectionInput[] } = await req.json()

  // 1. Бар бөлімдерді алу (жою үшін)
  const { data: existingSections } = await supabase
    .from('sections')
    .select('id')
    .eq('course_id', params.id)

  const existingSectionIds = (existingSections ?? []).map((s: any) => s.id)
  const incomingSectionIds = sections.filter(s => s.id).map(s => s.id!)

  // Кірмеген бөлімдерді жою
  const toDeleteSections = existingSectionIds.filter(id => !incomingSectionIds.includes(id))
  if (toDeleteSections.length > 0) {
    await supabase.from('lessons').delete().in('section_id', toDeleteSections)
    await supabase.from('sections').delete().in('id', toDeleteSections)
  }

  // 2. Бөлімдерді upsert
  for (const sec of sections) {
    let sectionId = sec.id

    if (sectionId) {
      await supabase.from('sections').update({
        title_kk: sec.title_kk || '—',
        title_ru: sec.title_ru || '—',
        order_idx: sec.order_idx,
      }).eq('id', sectionId)
    } else {
      const { data: newSection } = await supabase
        .from('sections')
        .insert({ course_id: params.id, title_kk: sec.title_kk || '—', title_ru: sec.title_ru || '—', order_idx: sec.order_idx })
        .select('id')
        .single()
      sectionId = newSection?.id
    }

    if (!sectionId) continue

    // 3. Сабақтарды upsert
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('section_id', sectionId)

    const existingLessonIds = (existingLessons ?? []).map((l: any) => l.id)
    const incomingLessonIds = sec.lessons.filter(l => l.id).map(l => l.id!)

    const toDeleteLessons = existingLessonIds.filter((id: string) => !incomingLessonIds.includes(id))
    if (toDeleteLessons.length > 0) {
      await supabase.from('lessons').delete().in('id', toDeleteLessons)
    }

    for (const les of sec.lessons) {
      if (les.id) {
        await supabase.from('lessons').update({
          title_kk:   les.title_kk || '—',
          title_ru:   les.title_ru || '—',
          order_idx:  les.order_idx,
          is_preview: les.is_preview,
        }).eq('id', les.id)
      } else {
        await supabase.from('lessons').insert({
          section_id:    sectionId,
          course_id:     params.id,
          title_kk:      les.title_kk || '—',
          title_ru:      les.title_ru || '—',
          order_idx:     les.order_idx,
          is_preview:    les.is_preview,
        })
      }
    }
  }

  // 4. Курс статусын pending-ге қою (admin тексеруіне)
  await supabase
    .from('courses')
    .update({ status: 'pending' } as any)
    .eq('id', params.id)

  return NextResponse.json({ ok: true })
}
