import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

// RLS-тен тыс профиль жасау үшін service role client
const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Кіру қажет' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'courseId жоқ' }, { status: 400 })

  // Профиль бар-жоғын тексереміз
  const { data: existingProfile } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  // Жоқ болса жасаймыз (service role — RLS айналып өтеді)
  if (!existingProfile) {
    const displayName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.phone ??
      user.email?.split('@')[0] ??
      'Қолданушы'

    const { error: profileErr } = await adminSupabase.from('profiles').insert({
      id: user.id,
      full_name: displayName,
      role: 'student',
      lang_pref: 'ru',
    })

    if (profileErr) {
      return NextResponse.json({ error: 'Профиль жасалмады: ' + profileErr.message }, { status: 500 })
    }
  }

  // Жазылым қосамыз
  const { error } = await adminSupabase.from('enrollments').insert({
    student_id: user.id,
    course_id: courseId,
    status: 'active',
  })

  if (error && error.code !== '23505') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
