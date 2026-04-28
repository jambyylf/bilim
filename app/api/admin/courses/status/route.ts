import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { courseId, status } = await req.json()
  if (!courseId || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const allowed = ['published', 'rejected', 'draft', 'pending', 'deleted']
  if (!allowed.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const updateData: any = { status }
  if (status === 'deleted') updateData.deleted_at = new Date().toISOString()
  if (status !== 'deleted') updateData.deleted_at = null

  const { error } = await supabase.from('courses').update(updateData).eq('id', courseId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Instructor-ға хабарлама жіберу
  if (status === 'published' || status === 'rejected' || status === 'deleted') {
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id, title_kk, title_ru')
      .eq('id', courseId)
      .single()

    if (course?.instructor_id) {
      const notifMap: Record<string, { type: string; kk: string; ru: string; body_kk: string; body_ru: string }> = {
        published: { type: 'course_approved',  kk: `"${course.title_kk}" курсы мақұлданды`,  ru: `Курс "${course.title_ru}" одобрен`,   body_kk: 'Сіздің курсыңыз каталогта жарияланды. Құттықтаймыз!', body_ru: 'Ваш курс опубликован в каталоге. Поздравляем!' },
        rejected:  { type: 'course_rejected',  kk: `"${course.title_kk}" курсы қабылданбады`, ru: `Курс "${course.title_ru}" отклонён`,  body_kk: 'Курс модерациядан өтпеді. Спикер кабинетінен толығырақ біліңіз.', body_ru: 'Курс не прошёл модерацию. Подробности в кабинете спикера.' },
        deleted:   { type: 'course_deleted',   kk: `"${course.title_kk}" курсы жойылды`,      ru: `Курс "${course.title_ru}" удалён`,    body_kk: 'Курс платформадан жойылды. Сұрақтар болса, админмен хабарласыңыз.', body_ru: 'Курс удалён с платформы. По вопросам обратитесь к администратору.' },
      }
      const n = notifMap[status]
      if (n) {
        await supabase.from('notifications').insert({
          user_id:  course.instructor_id,
          type:     n.type,
          title_kk: n.kk,
          title_ru: n.ru,
          body_kk:  n.body_kk,
          body_ru:  n.body_ru,
          link: '/instructor/courses',
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })

  const { error } = await supabase.from('courses').delete().eq('id', courseId).eq('status', 'deleted' as any)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
