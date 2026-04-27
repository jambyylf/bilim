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

  const allowed = ['published', 'rejected', 'draft', 'pending']
  if (!allowed.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const { error } = await supabase.from('courses').update({ status } as any).eq('id', courseId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Instructor-ға хабарлама жіберу (approved / rejected)
  if (status === 'published' || status === 'rejected') {
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id, title_kk, title_ru')
      .eq('id', courseId)
      .single()

    if (course?.instructor_id) {
      const approved = status === 'published'
      await supabase.from('notifications').insert({
        user_id:  course.instructor_id,
        type:     approved ? 'course_approved' : 'course_rejected',
        title_kk: approved
          ? `"${course.title_kk}" курсы мақұлданды`
          : `"${course.title_kk}" курсы қабылданбады`,
        title_ru: approved
          ? `Курс "${course.title_ru}" одобрен`
          : `Курс "${course.title_ru}" отклонён`,
        body_kk: approved
          ? 'Сіздің курсыңыз каталогта жарияланды. Құттықтаймыз!'
          : 'Курс модерациядан өтпеді. Спикер кабинетінен толығырақ біліңіз.',
        body_ru: approved
          ? 'Ваш курс опубликован в каталоге. Поздравляем!'
          : 'Курс не прошёл модерацию. Подробности в кабинете спикера.',
        link: approved ? `/courses/${courseId}` : '/instructor/courses',
      })
    }
  }

  return NextResponse.json({ ok: true })
}
