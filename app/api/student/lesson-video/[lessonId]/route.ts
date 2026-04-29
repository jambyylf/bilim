import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// YouTube URL-ден video ID шығарады
function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m?.[1] ?? null
}

export async function GET(_req: NextRequest, { params }: { params: { lessonId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lessonRaw } = await supabase
    .from('lessons')
    .select('id, youtube_url, is_preview, course_id')
    .eq('id', params.lessonId)
    .single()

  const lesson = lessonRaw as any
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Жазылымды тексеру (алдын ала қарау сабақтары ашық)
  if (!lesson.is_preview) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', lesson.course_id)
      .single()

    if (!enrollment) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!lesson.youtube_url) return NextResponse.json({ error: 'No video' }, { status: 404 })

  const videoId = extractYouTubeId(lesson.youtube_url)
  if (!videoId) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })

  // Video ID-ін base64-пен қайтарамыз (URL анық болмасын деп)
  return NextResponse.json({ vid: Buffer.from(videoId).toString('base64') })
}
