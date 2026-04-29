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
  resourcesCount?: number
  questionsCount?: number
}

function fmtSec(sec: number) {
  const s = Math.floor(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function LessonPlayer({
  course, sections, allLessons, currentLessonId,
  enrollmentId, userId, progress,
  resourcesCount = 0, questionsCount = 0,
}: Props) {
  const { lang } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [activeId, setActiveId] = useState(currentLessonId ?? allLessons[0]?.id ?? '')
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(progress.filter(p => p.completed).map(p => p.lesson_id))
  )
  const [activeTab, setActiveTab] = useState<'notes' | 'resources' | 'questions'>('notes')
  const [noteText, setNoteText] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  const currentLesson  = allLessons.find(l => l.id === activeId)
  const currentIdx     = allLessons.findIndex(l => l.id === activeId)
  const prevLesson     = allLessons[currentIdx - 1] ?? null
  const nextLesson     = allLessons[currentIdx + 1] ?? null
  const currentSection = sections.find(s => s.lessons.some(l => l.id === activeId))

  function tr(kk: string, ru: string, en: string) {
    if (lang === 'ru') return ru || kk
    if (lang === 'en') return en || ru || kk
    return kk || ru
  }

  function goLesson(id: string) {
    setActiveId(id)
    setCurrentTime(0)
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
    setCurrentTime(time)
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

  const progressPct = allLessons.length ? Math.round((completedIds.size / allLessons.length) * 100) : 0

  const tx = {
    notes:     lang === 'kk' ? 'Жазбалар'          : lang === 'en' ? 'Notes'          : 'Заметки',
    resources: lang === 'kk' ? 'Материалдар'        : lang === 'en' ? 'Resources'      : 'Материалы',
    questions: lang === 'kk' ? 'Сұрақтар'           : lang === 'en' ? 'Questions'      : 'Вопросы',
    overview:  lang === 'kk' ? 'Курс шолуы'         : lang === 'en' ? 'Course overview' : 'Обзор курса',
    save:      lang === 'kk' ? 'Сақтау'             : lang === 'en' ? 'Save'            : 'Сохранить',
    mark:      lang === 'kk' ? 'Өткен деп белгілеу' : lang === 'en' ? 'Mark complete'   : 'Пройдено',
    prev:      lang === 'kk' ? 'Алдыңғы'            : lang === 'en' ? 'Previous'        : 'Предыдущий',
    next:      lang === 'kk' ? 'Келесі'             : lang === 'en' ? 'Next'            : 'Следующий',
    noVideo:   lang === 'kk' ? 'Видео жоқ'          : lang === 'en' ? 'No video'        : 'Видео отсутствует',
    notePh:    lang === 'kk' ? 'сәтіне жазба...'    : lang === 'en' ? 'Note for this moment...' : 'Заметка к моменту...',
    passed:    lang === 'kk' ? 'Өттім'              : lang === 'en' ? 'Progress'        : 'Пройдено',
  }

  const tabLabels = {
    notes:     tx.notes,
    resources: resourcesCount > 0 ? `${tx.resources} · ${resourcesCount}` : tx.resources,
    questions: questionsCount > 0 ? `${tx.questions} · ${questionsCount}` : tx.questions,
  }

  // Sidebar lesson list (desktop + mobile drawer)
  const sidebarContent = (
    <>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
      }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{tx.overview}</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{completedIds.size} / {allLessons.length}</span>
      </div>

      {/* Lesson list — сабақтар көп болса scroll */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', minHeight: 0 }}>
        {sections.map(sec => (
          <div key={sec.id}>
            <div style={{
              padding: '10px 8px 4px', fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {tr(sec.title_kk, sec.title_ru, sec.title_en)}
            </div>
            {[...sec.lessons].sort((a, b) => a.order_idx - b.order_idx).map(lesson => {
              const isActive    = lesson.id === activeId
              const isCompleted = completedIds.has(lesson.id)
              const lessonIdx   = allLessons.findIndex(l => l.id === lesson.id)
              const isLocked    = !isCompleted && !isActive && lessonIdx > currentIdx

              return (
                <button
                  key={lesson.id}
                  onClick={() => !isLocked && goLesson(lesson.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', textAlign: 'left',
                    padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                    cursor: isLocked ? 'default' : 'pointer',
                    border: 'none', outline: 'none',
                    background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Status icon */}
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: isCompleted ? '#0D9488' : isActive ? '#F59E0B' : 'transparent',
                    border: isCompleted || isActive ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    color: isLocked ? 'rgba(255,255,255,0.3)' : '#fff',
                  }}>
                    {isCompleted
                      ? <Icon name="check" size={12} />
                      : isActive
                      ? <Icon name="play" size={10} />
                      : isLocked
                      ? <Icon name="lock" size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      : <svg width="5" height="5" viewBox="0 0 5 5" fill="rgba(255,255,255,0.4)"><circle cx="2.5" cy="2.5" r="2.5"/></svg>
                    }
                  </span>

                  {/* Title + duration */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: isLocked ? 'rgba(255,255,255,0.3)' : isActive ? '#F59E0B' : isCompleted ? '#fff' : 'rgba(255,255,255,0.75)',
                      fontWeight: isActive ? 600 : 400, fontSize: 13, marginBottom: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {tr(lesson.title_kk, lesson.title_ru, lesson.title_en)}
                    </div>
                    {lesson.duration_sec > 0 && (
                      <div style={{ color: isLocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                        {fmtSec(lesson.duration_sec)}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Sidebar bottom: tab-тен тәуелді контент ── */}
      <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
        {activeTab === 'notes' && (
          <>
            <div style={{
              color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
            }}>
              {tx.notes}{currentTime > 0 ? ` · ${fmtSec(currentTime)}` : ''}
            </div>
            <textarea
              placeholder={currentTime > 0 ? `${fmtSec(currentTime)} ${tx.notePh}` : tx.notePh}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              style={{
                width: '100%', height: 80, boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13,
                fontFamily: 'inherit', resize: 'none', outline: 'none',
              }}
            />
            <button
              className="btn btn-accent btn-sm"
              style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
              onClick={() => {}}
            >
              {tx.save}
            </button>
          </>
        )}
        {activeTab === 'resources' && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '8px 0' }}>
            {lang === 'kk' ? 'Материалдар жоқ' : lang === 'en' ? 'No resources' : 'Нет материалов'}
          </div>
        )}
        {activeTab === 'questions' && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '8px 0' }}>
            {lang === 'kk' ? 'Сұрақтар жоқ' : lang === 'en' ? 'No questions' : 'Нет вопросов'}
          </div>
        )}
      </div>
    </>
  )

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0e1a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <header style={{
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, background: '#0a0e1a',
      }}>
        {/* Left: back + logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Link
            href={`/courses/${course.slug}`}
            style={{ color: 'rgba(255,255,255,0.7)', padding: 6, display: 'flex', alignItems: 'center', borderRadius: 6, flexShrink: 0 }}
          >
            <Icon name="chevronLeft" size={18} />
          </Link>
          <Logo color="var(--b-accent)" textColor="#fff" size={24} />
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            {currentSection && (
              <div style={{
                color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1,
              }}>
                {tr(currentSection.title_kk, currentSection.title_ru, currentSection.title_en)}
              </div>
            )}
            <div style={{
              color: '#fff', fontWeight: 600, fontSize: 14,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '38vw',
            }}>
              {currentLesson
                ? tr(currentLesson.title_kk, currentLesson.title_ru, currentLesson.title_en)
                : tr(course.title_kk, course.title_ru, course.title_en)}
            </div>
          </div>
        </div>

        {/* Right: progress + settings + mobile toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div className="hidden sm:block">
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4, whiteSpace: 'nowrap' }}>
              {tx.passed} {progressPct}%
            </div>
            <div style={{ width: 160, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: '#F59E0B', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>
          <button
            style={{ color: 'rgba(255,255,255,0.55)', background: 'none', border: 'none', padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: 6 }}
          >
            <Icon name="settings" size={17} />
          </button>
          <button
            className="md:hidden flex items-center"
            onClick={() => setMobileSidebarOpen(v => !v)}
            style={{ color: '#fff', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}
          >
            <Icon name="book" size={16} />
          </button>
        </div>
      </header>

      {/* ── Main area ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* LEFT: player column */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* Video */}
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative', flexShrink: 0 }}>
            {currentLesson?.has_video ? (
              <YouTubeSecurePlayer
                lessonId={currentLesson.id}
                autoPlay
                onEnded={handleEnded}
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#fff' }}>
                <Icon name="video" size={48} style={{ opacity: 0.2 }} />
                <div style={{ opacity: 0.4, fontSize: 14 }}>{tx.noVideo}</div>
              </div>
            )}
          </div>

          {/* ── Below-player toolbar ── */}
          <div style={{
            padding: '12px 24px', background: '#0f172a',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, gap: 8, flexWrap: 'wrap',
          }}>

            {/* Tabs (button style) */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(['notes', 'resources', 'questions'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 12px', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                    cursor: 'pointer', border: 'none', outline: 'none', borderRadius: 6,
                    background: activeTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'background 0.15s, color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>

            {/* Nav buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => prevLesson && goLesson(prevLesson.id)}
                disabled={!prevLesson}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px',
                  borderRadius: 8, fontSize: 13, fontWeight: 500,
                  cursor: prevLesson ? 'pointer' : 'not-allowed',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.08)',
                  color: prevLesson ? '#fff' : 'rgba(255,255,255,0.25)',
                }}
              >
                <Icon name="chevronLeft" size={13} /> {tx.prev}
              </button>

              {!completedIds.has(activeId) && (
                <button
                  onClick={() => currentLesson && saveProgress(currentLesson.id, currentTime, true)}
                  className="btn btn-accent btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Icon name="check" size={13} />
                  <span className="hidden sm:inline">{tx.mark}</span>
                </button>
              )}

              <button
                onClick={() => nextLesson && goLesson(nextLesson.id)}
                disabled={!nextLesson}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  opacity: nextLesson ? 1 : 0.35,
                  cursor: nextLesson ? 'pointer' : 'not-allowed',
                }}
              >
                {tx.next} <Icon name="chevronLeft" size={13} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT: sidebar (desktop) */}
        <aside
          className="hidden md:flex flex-col"
          style={{ width: 360, background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.08)', minHeight: 0, overflow: 'hidden' }}
        >
          {sidebarContent}
        </aside>
      </div>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.65)' }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="md:hidden flex flex-col"
        style={{
          position: 'fixed', top: 56, right: 0, bottom: 0, zIndex: 200,
          width: Math.min(360, typeof window !== 'undefined' ? window.innerWidth * 0.85 : 300),
          background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.08)',
          transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {sidebarContent}
      </aside>
    </div>
  )
}
