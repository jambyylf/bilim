'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/shared/Icon'
import Logo from '@/components/shared/Logo'
import { useLang } from '@/components/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'
import YouTubeSecurePlayer from '@/components/student/YouTubeSecurePlayer'

interface Lesson {
  id: string
  title_kk: string; title_ru: string; title_en: string
  has_video: boolean
  duration_sec: number
  order_idx: number
  is_preview: boolean
}
interface Section {
  id: string
  title_kk: string; title_ru: string; title_en: string
  order_idx: number
  lessons: Lesson[]
}
interface Progress { lesson_id: string; completed: boolean; last_position: number }

interface Props {
  course: { id: string; slug: string; title_kk: string; title_ru: string; title_en: string }
  sections: Section[]
  allLessons: Lesson[]
  currentLessonId: string | null
  enrollmentId: string
  userId: string
  progress: Progress[]
}

function fmtSec(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function LessonPlayer({ course, sections, allLessons, currentLessonId, enrollmentId, userId, progress }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [activeId, setActiveId] = useState(currentLessonId ?? allLessons[0]?.id ?? '')
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(progress.filter((p: any) => p.completed).map((p: any) => p.lesson_id as string))
  )
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  const currentLesson = allLessons.find(l => l.id === activeId)
  const currentIdx    = allLessons.findIndex(l => l.id === activeId)
  const prevLesson    = allLessons[currentIdx - 1] ?? null
  const nextLesson    = allLessons[currentIdx + 1] ?? null

  function tr(kk: string, ru: string, en: string) {
    if (lang === 'ru') return ru || kk
    if (lang === 'en') return en || ru || kk
    return kk || ru
  }

  function goLesson(id: string) {
    setActiveId(id)
    setMobileSidebarOpen(false)
    router.replace(`/courses/${course.slug}/learn?lesson=${id}`, { scroll: false })
  }

  const saveProgress = useCallback(async (lessonId: string, position: number, completed: boolean) => {
    await supabase.from('lesson_progress').upsert({
      student_id:    userId,
      enrollment_id: enrollmentId,
      lesson_id:     lessonId,
      last_position: Math.floor(position),
      completed,
    }, { onConflict: 'student_id,lesson_id' })

    if (completed) {
      setCompletedIds(prev => { const s = new Set(Array.from(prev)); s.add(lessonId); return s })
      const total = allLessons.length
      const done  = completedIds.size + 1
      const pct   = Math.round((done / total) * 100)
      await supabase.from('enrollments').update({ progress_pct: pct }).eq('id', enrollmentId)
    }
  }, [completedIds, allLessons.length])

  function handleTimeUpdate(time: number) {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (currentLesson) saveProgress(currentLesson.id, time, false)
    }, 5000)
  }

  function handleEnded() {
    if (currentLesson) {
      saveProgress(currentLesson.id, 0, true)
      if (nextLesson) setTimeout(() => goLesson(nextLesson.id), 1500)
    }
  }

  const progressPct = allLessons.length
    ? Math.round((completedIds.size / allLessons.length) * 100)
    : 0

  // Сабақтар тізімі — ортақ контент
  const lessonList = (
    <>
      <div className="px-4 py-3 b-eyebrow shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid var(--b-line)' }}>
        <span>{t.course.program}</span>
        <button className="md:hidden btn btn-ghost btn-sm" onClick={() => setMobileSidebarOpen(false)}>
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1">
        {sections.map(sec => (
          <div key={sec.id}>
            <div className="px-4 py-2.5 b-sm font-semibold" style={{ background: 'var(--b-bg-soft)', borderBottom: '1px solid var(--b-line-soft)' }}>
              {tr(sec.title_kk, sec.title_ru, sec.title_en)}
            </div>
            {(sec.lessons ?? []).sort((a, b) => a.order_idx - b.order_idx).map(lesson => {
              const isActive    = lesson.id === activeId
              const isCompleted = completedIds.has(lesson.id)
              return (
                <button
                  key={lesson.id}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    background: isActive ? 'var(--b-primary-50)' : 'transparent',
                    borderBottom: '1px solid var(--b-line-soft)',
                    minHeight: 52,
                  }}
                  onClick={() => goLesson(lesson.id)}
                >
                  <div className="shrink-0">
                    {isCompleted
                      ? <Icon name="check" size={15} style={{ color: 'var(--b-teal)' }} />
                      : isActive
                      ? <Icon name="play" size={13} style={{ color: 'var(--b-primary)' }} />
                      : <div style={{ width: 15, height: 15, borderRadius: '50%', border: '1.5px solid var(--b-line)', flexShrink: 0 }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="b-xs font-medium truncate" style={{ color: isActive ? 'var(--b-primary)' : 'var(--b-text-1)' }}>
                      {tr(lesson.title_kk, lesson.title_ru, lesson.title_en)}
                    </div>
                    {lesson.duration_sec > 0 && (
                      <div className="b-xs mt-0.5" style={{ color: 'var(--b-text-4)' }}>{fmtSec(lesson.duration_sec)}</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'var(--b-bg)', overflow: 'hidden' }}>

      {/* ── Жоғарғы тақта ── */}
      <header
        className="flex items-center gap-2 px-3 md:px-5 shrink-0"
        style={{ height: 56, borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg)' }}
      >
        <Link href={`/courses/${course.slug}`} className="btn btn-ghost btn-sm" style={{ minWidth: 44, minHeight: 44 }}>
          <Icon name="chevronLeft" size={16} />
        </Link>
        <Logo size={22} />
        <div className="flex-1 min-w-0 hidden sm:block">
          <div className="b-sm font-semibold truncate">
            {tr(course.title_kk, course.title_ru, course.title_en)}
          </div>
        </div>
        {/* Прогресс */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="progress hidden sm:block" style={{ width: 100 }}>
            <div className="progress-bar" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="b-xs" style={{ color: 'var(--b-text-3)' }}>{progressPct}%</span>
        </div>
        {/* Mobile: сабақтар тізімін ашу */}
        <button
          className="md:hidden btn btn-ghost btn-sm"
          onClick={() => setMobileSidebarOpen(v => !v)}
          style={{ minWidth: 44, minHeight: 44 }}
          aria-label="Toggle lessons"
        >
          <Icon name="book" size={18} />
        </button>
        <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ minWidth: 44, minHeight: 44 }}>
          <Icon name="grid" size={16} />
        </Link>
      </header>

      {/* ── Негізгі аудан ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-[150]"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile drawer — оң жақтан */}
        <aside
          className="md:hidden fixed top-14 right-0 bottom-0 z-[200] flex flex-col"
          style={{
            width: Math.min(320, typeof window !== 'undefined' ? window.innerWidth * 0.85 : 320),
            background: 'var(--b-bg-soft)',
            borderLeft: '1px solid var(--b-line)',
            transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {lessonList}
        </aside>

        {/* Desktop sidebar — сол жақта */}
        <aside
          className="hidden md:flex flex-col shrink-0"
          style={{
            width: 300,
            borderRight: '1px solid var(--b-line)',
            background: 'var(--b-bg-soft)',
          }}
        >
          {lessonList}
        </aside>

        {/* Плеер + мазмұн */}
        <main className="flex-1 overflow-y-auto">
          {currentLesson?.has_video ? (
            <YouTubeSecurePlayer
              lessonId={currentLesson.id}
              autoPlay
              onEnded={handleEnded}
              onTimeUpdate={handleTimeUpdate}
            />
          ) : (
            <div className="flex items-center justify-center" style={{ aspectRatio: '16/9', background: '#0f0f0f' }}>
              <div className="text-center text-white">
                <Icon name="video" size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <div className="b-body" style={{ opacity: 0.5 }}>
                  {lang === 'kk' ? 'Видео жоқ' : lang === 'en' ? 'No video' : 'Видео отсутствует'}
                </div>
              </div>
            </div>
          )}

          {/* Сабақ аты + навигация */}
          <div className="px-4 md:px-8 py-5 md:py-6" style={{ maxWidth: 860 }}>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <h1 className="b-h2 flex-1" style={{ fontSize: 'clamp(16px, 2.5vw, 24px)' }}>
                {currentLesson ? tr(currentLesson.title_kk, currentLesson.title_ru, currentLesson.title_en) : '—'}
              </h1>
              {!completedIds.has(activeId) && (
                <button
                  className="btn btn-secondary btn-sm shrink-0 flex items-center gap-2"
                  style={{ minHeight: 44 }}
                  onClick={() => currentLesson && saveProgress(currentLesson.id, 0, true)}
                >
                  <Icon name="check" size={13} />
                  <span className="hidden sm:inline">{lang === 'kk' ? 'Аяқталды' : lang === 'en' ? 'Mark complete' : 'Пройдено'}</span>
                  <span className="sm:hidden">✓</span>
                </button>
              )}
            </div>

            {/* Алдыңғы / келесі */}
            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--b-line)' }}>
              <button
                className="btn btn-secondary flex items-center gap-2"
                style={{ minHeight: 44 }}
                onClick={() => prevLesson && goLesson(prevLesson.id)}
                disabled={!prevLesson}
              >
                <Icon name="chevronLeft" size={14} />
                {t.common.back}
              </button>
              <span className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                {currentIdx + 1} / {allLessons.length}
              </span>
              <button
                className="btn btn-primary flex items-center gap-2"
                style={{ minHeight: 44 }}
                onClick={() => nextLesson && goLesson(nextLesson.id)}
                disabled={!nextLesson}
              >
                {t.common.next}
                <Icon name="chevronLeft" size={14} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
