import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Кіру қажет' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'courseId жоқ' }, { status: 400 })

  // Профиль жоқ болса жасаймыз (FK мәселесін болдырмау үшін)
  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Қолданушы',
    role: 'student',
    lang_pref: 'ru',
  }, { onConflict: 'id', ignoreDuplicates: true })

  // Жазылым қосамыз (бұрын бар болса елемейміз)
  const { error } = await supabase.from('enrollments').insert({
    student_id: user.id,
    course_id: courseId,
    status: 'active',
  })

  if (error && error.code !== '23505') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
