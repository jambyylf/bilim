import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })

  // Тіркелу + 100% аяқтау тексеру
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, progress_pct')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
  if ((enrollment.progress_pct ?? 0) < 100) return NextResponse.json({ error: 'Course not completed' }, { status: 400 })

  // Бұрын берілген сертификат бар ма?
  const { data: existing } = await supabase
    .from('certificates')
    .select('id, cert_number')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (existing) return NextResponse.json({ certNumber: existing.cert_number })

  // Жаңа сертификат жасау
  const certNumber = randomUUID()
  const { error } = await supabase.from('certificates').insert({
    student_id:  user.id,
    course_id:   courseId,
    cert_number: certNumber,
  } as any)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ certNumber })
}
