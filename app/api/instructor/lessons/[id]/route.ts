import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Сабаққа YouTube URL сақтайды
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lesson } = await (supabase as any)
    .from('lessons')
    .select('id, course_id')
    .eq('id', params.id)
    .single()

  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', lesson.course_id)
    .single()

  if (!course || course.instructor_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { youtube_url } = body

  const { error } = await (supabase as any)
    .from('lessons')
    .update({ youtube_url: youtube_url ?? null })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
