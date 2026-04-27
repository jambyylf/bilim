import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, rating, comment } = await req.json()
  if (!courseId || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })

  // Тек сатып алған студент пікір жаза алады
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

  // Бұрын пікір жазылған ба?
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (existing) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })

  // Пікір жасау
  const { error: insertError } = await supabase.from('reviews').insert({
    student_id: user.id,
    course_id:  courseId,
    rating,
    comment:    comment ?? null,
  } as any)

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // Курстың орташа рейтингін жаңарту
  const { data: allRatings } = await supabase
    .from('reviews')
    .select('rating')
    .eq('course_id', courseId)

  if (allRatings && allRatings.length > 0) {
    const avg = allRatings.reduce((s, r) => s + (r.rating ?? 0), 0) / allRatings.length
    await supabase.from('courses').update({ rating: Math.round(avg * 10) / 10 } as any).eq('id', courseId)
  }

  return NextResponse.json({ ok: true })
}
