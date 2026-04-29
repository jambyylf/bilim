'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import Stars from '@/components/shared/Stars'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

interface Lesson {
  id: string
  title_kk: string; title_ru: string; title_en: string
  duration_sec: number; order_idx: number; is_preview: boolean
}
interface Section {
  id: string
  title_kk: string; title_ru: string; title_en: string
  order_idx: number; lessons: Lesson[]
}
interface Review {
  id: string; rating: number; comment: string | null
  created_at: string; student_id: string
}
interface Course {
  id: string; slug: string
  title_kk: string; title_ru: string; title_en: string
  description_kk: string | null; description_ru: string | null; description_en: string | null
  price: number; discount_price: number | null
  language: string; level: string
  rating: number; students_count: number
  thumbnail_url: string | null
  what_you_learn: string[] | null; requirements: string[] | null
  category: { slug: string; name_kk: string; name_ru: string; name_en: string } | null
  instructor: { id: string; full_name: string | null; avatar_url: string | null; bio: string | null } | null
}
interface Props {
  course: Course; sections: Section[]; reviews: Review[]
  enrolled: boolean; userId: string | null
}

const GRAD: Record<string, number> = {
  design: 1, programming: 8, marketing: 4, business: 7,
  finance: 3, languages: 5, data: 2, 'soft-skills': 6,
}

const p2 = (n: number) => String(n).padStart(2, '0')

function durH(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60)
  return h >= 1 ? `${h}${m ? ':' + p2(m) : ''}+ ч` : `${m} мин`
}
function durM(sec: number) {
  const m = Math.floor(sec / 60), h = Math.floor(m / 60)
  return h ? `${h}:${p2(m % 60)} сағ` : `${m} мин`
}

export default function CourseDetailContent({ course, sections, reviews, enrolled, userId }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [enrolling, setEnrolling]   = useState(false)
  const [expandedSecs, setExpanded] = useState<Set<string>>(new Set())
  const [timer, setTimer]           = useState(2 * 3600 + 34 * 60 + 18)
  const [revRating, setRevRating]   = useState(0)
  const [revHover, setRevHover]     = useState(0)
  const [revText, setRevText]       = useState('')
  const [revSending, setRevSending] = useState(false)
  const [revSent, setRevSent]       = useState(false)
  const [revError, setRevError]     = useState('')

  useEffect(() => {
    if (!course.discount_price) return
    const id = setInterval(() => setTimer(v => Math.max(0, v - 1)), 1000)
    return () => clearInterval(id)
  }, [course.discount_price])

  const alreadyReviewed = reviews.some(r => r.student_id === userId)

  function tr(kk: string, ru: string | null, en: string | null) {
    return lang === 'ru' ? ru || kk : lang === 'en' ? (en || ru || kk) : (kk || ru || '')
  }

  const title = tr(course.title_kk, course.title_ru, course.title_en)
  const desc  = tr(course.description_kk ?? '', course.description_ru, course.description_en)
  const grad  = GRAD[course.category?.slug ?? ''] ?? 1

  const totalLessons  = sections.reduce((s, sec) => s + sec.lessons.length, 0)
  const totalDuration = sections.reduce((s, sec) => s + sec.lessons.reduce((a, l) => a + l.duration_sec, 0), 0)
  const discPct       = course.discount_price ? Math.round((1 - course.discount_price / course.price) * 100) : 0

  const lvl: Record<string, string> = {
    beginner:     lang === 'kk' ? 'Бастаушыларға' : lang === 'en' ? 'Beginner' : 'Для начинающих',
    intermediate: lang === 'kk' ? 'Орта деңгей'   : lang === 'en' ? 'Intermediate' : 'Средний',
    advanced:     lang === 'kk' ? 'Жоғары деңгей' : lang === 'en' ? 'Advanced'     : 'Продвинутый',
  }

  const features = [
    `${totalLessons} ${lang === 'kk' ? 'видео-сабақ' : lang === 'en' ? 'video lessons' : 'видео-урока'}`,
    lang === 'kk' ? 'Аяқтаған соң сертификат' : lang === 'en' ? 'Certificate' : 'Сертификат по окончании',
    lang === 'kk' ? 'Мәңгілік қолжетімді'     : lang === 'en' ? 'Lifetime access' : 'Доступ навсегда',
    lang === 'kk' ? 'Ментор қолдауы'           : lang === 'en' ? 'Mentor support'  : 'Поддержка ментора',
    lang === 'kk' ? 'Мобильдік қолжетімді'     : lang === 'en' ? 'Mobile access'   : 'Доступ с телефона',
  ]

  async function enroll() {
    if (!userId) { router.push('/login?redirect=/courses/' + course.slug); return }
    if (course.price > 0) { router.push(`/checkout?course=${course.id}`); return }
    setEnrolling(true)
    const { error } = await supabase
      .from('enrollments')
      .insert({ student_id: userId, course_id: course.id })
    if (error && error.code !== '23505') {
      // 23505 = unique violation (already enrolled) — treat as success
      setEnrolling(false)
      return
    }
    window.location.href = `/courses/${course.slug}/learn`
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!revRating) return
    setRevSending(true); setRevError('')
    const res = await fetch('/api/reviews/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: course.id, rating: revRating, comment: revText }),
    })
    setRevSending(false)
    if (res.ok) { setRevSent(true); router.refresh() }
    else { const d = await res.json(); setRevError(d.error ?? 'Қате') }
  }

  function toggleSec(id: string) {
    setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const catName = course.category
    ? tr(course.category.name_kk, course.category.name_ru, course.category.name_en)
    : ''

  const initials = course.instructor?.full_name
    ? course.instructor.full_name.split(' ').map(w => w[0]).slice(0, 2).join('')
    : '?'

  return (
    <div style={{ background: 'var(--b-bg)', minHeight: '100vh' }}>
      <TopNav />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Breadcrumbs */}
        <div className="b-sm" style={{ color: 'var(--b-text-3)', padding: '24px 0 0' }}>
          <Link href="/courses" style={{ color: 'var(--b-text-3)', textDecoration: 'none' }}>
            {lang === 'kk' ? 'Каталог' : lang === 'en' ? 'Catalog' : 'Каталог'}
          </Link>
          {catName && <>
            <span style={{ margin: '0 6px' }}>·</span>
            <Link href={`/courses?category=${course.category?.slug}`} style={{ color: 'var(--b-text-3)', textDecoration: 'none' }}>
              {catName}
            </Link>
          </>}
          <span style={{ margin: '0 6px' }}>·</span>
          <span style={{ color: 'var(--b-text)' }}>{title.slice(0, 40)}{title.length > 40 ? '…' : ''}</span>
        </div>

        {/* Main two-column grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48,
          alignItems: 'flex-start', padding: '32px 0 80px',
        }} className="cd-grid">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              {catName && <span className="chip chip-primary">{catName}</span>}
              {course.level && <span className="chip">{lvl[course.level] ?? course.level}</span>}
              {course.students_count > 100 && <span className="chip chip-accent">
                {lang === 'kk' ? 'Бестселлер' : lang === 'en' ? 'Bestseller' : 'Бестселлер'}
              </span>}
            </div>

            {/* Title */}
            <h1 className="b-h1" style={{ fontSize: 44, marginBottom: 20, maxWidth: 720, lineHeight: 1.15 }}>
              {title}
            </h1>

            {/* Description */}
            {desc && (
              <p className="b-body" style={{ color: 'var(--b-text-2)', maxWidth: 680, marginBottom: 24, fontSize: 17, lineHeight: 1.65 }}>
                {desc.slice(0, 280)}{desc.length > 280 ? '…' : ''}
              </p>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
              <Stars value={course.rating} />
              <span className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                {reviews.length} {lang === 'kk' ? 'пікір' : lang === 'en' ? 'reviews' : 'отзывов'}
              </span>
              <span className="b-sm" style={{ color: 'var(--b-text-3)', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <Icon name="users" size={14} />
                {course.students_count.toLocaleString('ru-RU')} {lang === 'kk' ? 'студент' : lang === 'en' ? 'students' : 'студентов'}
              </span>
              <span className="b-sm" style={{ color: 'var(--b-text-3)', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <Icon name="clock" size={14} />
                {durH(totalDuration)}
              </span>
              <span className="b-sm" style={{ color: 'var(--b-text-3)', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <Icon name="globe" size={14} />
                KZ · RU
              </span>
            </div>

            {/* Trailer / thumbnail */}
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}>
              <div style={{ height: 420, background: 'var(--b-bg-soft)' }} className={`thumb-grad-${grad} thumb-pattern`} />
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt={title} style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                }} />
              )}
              <button style={{
                position: 'absolute', inset: 0, margin: 'auto', width: 72, height: 72,
                borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--b-primary)', boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <div style={{
                position: 'absolute', bottom: 16, left: 16, padding: '6px 12px',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                borderRadius: 999, color: '#fff', fontSize: 12, fontWeight: 500,
              }}>
                {lang === 'kk' ? 'Трейлерді көру' : lang === 'en' ? 'Watch trailer' : 'Смотреть трейлер'} · 2:14
              </div>
            </div>

            {/* ── PROGRAM ── */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                  <h2 className="b-h2" style={{ marginBottom: 4 }}>
                    {lang === 'kk' ? 'Курс бағдарламасы' : lang === 'en' ? 'Course program' : 'Программа курса'}
                  </h2>
                  <p className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                    {sections.length} {lang === 'kk' ? 'модуль' : lang === 'en' ? 'modules' : 'модулей'}{' · '}
                    {totalLessons} {lang === 'kk' ? 'сабақ' : lang === 'en' ? 'lessons' : 'уроков'}{' · '}
                    {durH(totalDuration)}
                  </p>
                </div>
                <button
                  className="btn btn-link"
                  onClick={() => setExpanded(
                    expandedSecs.size === sections.length
                      ? new Set()
                      : new Set(sections.map(s => s.id))
                  )}
                >
                  {expandedSecs.size === sections.length
                    ? (lang === 'kk' ? 'Барлығын жабу' : lang === 'en' ? 'Collapse all' : 'Свернуть всё')
                    : (lang === 'kk' ? 'Барлығын ашу'  : lang === 'en' ? 'Expand all'   : 'Развернуть всё')}
                </button>
              </div>

              <div className="card" style={{ padding: 0 }}>
                {[...sections].sort((a, b) => a.order_idx - b.order_idx).map((sec, si) => {
                  const open = expandedSecs.has(sec.id)
                  const secDur = sec.lessons.reduce((s, l) => s + l.duration_sec, 0)
                  return (
                    <div key={sec.id} style={{ borderBottom: si < sections.length - 1 ? '1px solid var(--b-line)' : 'none' }}>
                      <div
                        onClick={() => toggleSec(sec.id)}
                        style={{ padding: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
                      >
                        <span className="b-mono" style={{ fontSize: 12, color: 'var(--b-text-4)', width: 28, flexShrink: 0 }}>
                          {p2(si + 1)}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div className="b-h4" style={{ fontWeight: 500, marginBottom: 2 }}>
                            {tr(sec.title_kk, sec.title_ru, sec.title_en)}
                          </div>
                          <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>
                            {sec.lessons.length} {lang === 'kk' ? 'сабақ' : lang === 'en' ? 'lessons' : 'уроков'} · {durM(secDur)}
                          </div>
                        </div>
                        <Icon name={open ? 'chevronUp' : 'chevronDown'} size={16} style={{ color: 'var(--b-text-4)' }} />
                      </div>

                      {open && (
                        <div style={{ borderTop: '1px solid var(--b-line-soft)' }}>
                          {[...sec.lessons].sort((a, b) => a.order_idx - b.order_idx).map((lesson, li) => (
                            <div key={lesson.id} style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 18px 10px 62px',
                              borderBottom: li < sec.lessons.length - 1 ? '1px solid var(--b-line-soft)' : 'none',
                            }}>
                              {lesson.is_preview
                                ? <Icon name="playCircle" size={15} style={{ color: 'var(--b-primary)', flexShrink: 0 }} />
                                : <Icon name="lock" size={13} style={{ color: 'var(--b-text-4)', flexShrink: 0 }} />
                              }
                              <span className="b-sm" style={{ flex: 1, color: 'var(--b-text-2)' }}>
                                {tr(lesson.title_kk, lesson.title_ru, lesson.title_en)}
                              </span>
                              {lesson.is_preview && (
                                <span style={{
                                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                                  background: '#EEF2FF', color: 'var(--b-primary)',
                                }}>
                                  {lang === 'kk' ? 'Тегін' : lang === 'en' ? 'Preview' : 'Бесплатно'}
                                </span>
                              )}
                              {lesson.duration_sec > 0 && (
                                <span className="b-xs" style={{ color: 'var(--b-text-4)', flexShrink: 0 }}>
                                  {durM(lesson.duration_sec)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── INSTRUCTOR ── */}
            {course.instructor && (
              <div style={{ marginBottom: 48 }}>
                <h2 className="b-h2" style={{ marginBottom: 20 }}>
                  {lang === 'kk' ? 'Спикер туралы' : lang === 'en' ? 'About instructor' : 'О спикере'}
                </h2>
                <div className="card" style={{ padding: 28, display: 'flex', gap: 24 }}>
                  <div style={{
                    width: 96, height: 96, borderRadius: 16, flexShrink: 0,
                    background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 32,
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="b-h3" style={{ marginBottom: 4 }}>{course.instructor.full_name}</div>
                    <div className="b-sm" style={{ color: 'var(--b-text-3)', marginBottom: 14 }}>
                      {lang === 'kk' ? 'Спикер' : lang === 'en' ? 'Instructor' : 'Спикер'}
                    </div>
                    {course.instructor.bio && (
                      <p className="b-sm" style={{ color: 'var(--b-text-2)', lineHeight: 1.6, marginBottom: 16 }}>
                        {course.instructor.bio}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 24 }}>
                      {[
                        { n: course.rating.toFixed(1), l: lang === 'kk' ? 'рейтинг' : 'рейтинг' },
                        { n: course.students_count.toLocaleString('ru-RU'), l: lang === 'kk' ? 'студент' : 'студентов' },
                        { n: String(sections.length), l: lang === 'kk' ? 'модуль' : 'модулей' },
                      ].map(({ n, l }) => (
                        <div key={l}>
                          <div className="b-h3" style={{ color: 'var(--b-text)' }}>{n}</div>
                          <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── REVIEWS ── */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <h2 className="b-h2">
                  {lang === 'kk' ? 'Студенттер пікірлері' : lang === 'en' ? 'Student reviews' : 'Отзывы студентов'}
                </h2>
                {reviews.length > 0 && (
                  <button className="btn btn-link">
                    {lang === 'kk' ? `Барлық ${reviews.length} пікір` : lang === 'en' ? `All ${reviews.length} reviews` : `Все ${reviews.length} отзывов`}
                  </button>
                )}
              </div>

              {/* Review form */}
              {enrolled && !alreadyReviewed && !revSent && (
                <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                  <div className="b-h4" style={{ marginBottom: 16 }}>
                    {lang === 'kk' ? 'Пікір жазу' : lang === 'en' ? 'Write a review' : 'Написать отзыв'}
                  </div>
                  <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button"
                          onMouseEnter={() => setRevHover(s)} onMouseLeave={() => setRevHover(0)}
                          onClick={() => setRevRating(s)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                          <svg width="28" height="28" viewBox="0 0 24 24"
                            fill={(revHover || revRating) >= s ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="1.5">
                            <path d="M12 2 14.6 8.6 22 9.5l-5.5 4.8L18 22l-6-3.4L6 22l1.5-7.7L2 9.5l7.4-.9z"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                    <textarea className="inp" rows={3} value={revText} onChange={e => setRevText(e.target.value)}
                      placeholder={lang === 'kk' ? 'Курс туралы пікіріңіз...' : 'Ваши впечатления...'} style={{ resize: 'vertical' }} />
                    {revError && (
                      <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626' }}>
                        {revError}
                      </div>
                    )}
                    <button type="submit" disabled={revSending || !revRating} style={{
                      alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 8,
                      background: 'var(--b-primary)', color: '#fff', fontWeight: 600, fontSize: 14,
                      border: 'none', cursor: revSending || !revRating ? 'not-allowed' : 'pointer',
                      opacity: revSending || !revRating ? 0.6 : 1,
                    }}>
                      {revSending
                        ? (lang === 'kk' ? 'Жіберілуде...' : 'Отправка...')
                        : (lang === 'kk' ? 'Пікір жіберу' : 'Отправить отзыв')}
                    </button>
                  </form>
                </div>
              )}

              {revSent && (
                <div style={{ background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="m4 12 5 5L20 6"/></svg>
                  <span className="b-sm" style={{ fontWeight: 600, color: '#059669' }}>
                    {lang === 'kk' ? 'Пікіріңіз жіберілді!' : 'Отзыв отправлен!'}
                  </span>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>⭐</div>
                  <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                    {lang === 'kk' ? 'Пікір жоқ' : lang === 'en' ? 'No reviews yet' : 'Отзывов пока нет'}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {reviews.slice(0, 4).map(rev => (
                    <div key={rev.id} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--b-primary)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 14,
                        }}>
                          {rev.student_id.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="b-sm" style={{ fontWeight: 600 }}>{rev.student_id.slice(0, 8)}…</div>
                          <Stars value={rev.rating} showNum={false} size={11} />
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="b-sm" style={{ color: 'var(--b-text-2)' }}>«{rev.comment}»</p>
                      )}
                      <div className="b-xs" style={{ color: 'var(--b-text-4)', marginTop: 8 }}>
                        {new Date(rev.created_at).toLocaleDateString(
                          lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: sticky purchase card ── */}
          <aside style={{ position: 'sticky', top: 88 }}>
            <div className="card card-elevated" style={{ padding: 24 }}>

              {/* Price */}
              {course.price === 0 ? (
                <div className="b-h1" style={{ fontSize: 36, color: 'var(--b-success)', marginBottom: 18 }}>
                  {lang === 'kk' ? 'Тегін' : lang === 'en' ? 'Free' : 'Бесплатно'}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                    <span className="b-h1" style={{ fontSize: 36 }}>
                      {(course.discount_price ?? course.price).toLocaleString('ru-RU')} ₸
                    </span>
                    {course.discount_price && (
                      <span style={{ color: 'var(--b-text-4)', textDecoration: 'line-through' }}>
                        {course.price.toLocaleString('ru-RU')} ₸
                      </span>
                    )}
                  </div>
                  {discPct > 0 && course.discount_price && timer > 0 && (
                    <div className="chip chip-accent" style={{ marginBottom: 20, display: 'inline-flex' }}>
                      −{discPct}% · {lang === 'kk' ? 'Жеңілдік аяқталады' : lang === 'en' ? 'Offer ends in' : 'Скидка действует ещё'}{' '}
                      {p2(Math.floor(timer / 3600))}:{p2(Math.floor((timer % 3600) / 60))}:{p2(timer % 60)}
                    </div>
                  )}
                </>
              )}

              {/* CTA */}
              {enrolled ? (
                <Link href={`/courses/${course.slug}/learn`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '14px 0', borderRadius: 10,
                  background: 'var(--b-primary)', color: '#fff',
                  fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 10,
                }}>
                  <Icon name="play" size={16} />
                  {lang === 'kk' ? 'Жалғастыру' : lang === 'en' ? 'Continue learning' : 'Продолжить'}
                </Link>
              ) : (
                <>
                  <button onClick={enroll} disabled={enrolling} className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginBottom: 10, opacity: enrolling ? 0.7 : 1 }}>
                    {enrolling
                      ? (lang === 'kk' ? 'Жүктелуде...' : 'Загрузка...')
                      : course.price > 0
                        ? (lang === 'kk' ? 'Курсқа жазылу' : lang === 'en' ? 'Enroll now' : 'Записаться на курс')
                        : (lang === 'kk' ? 'Тегін бастау' : lang === 'en' ? 'Start free' : 'Начать бесплатно')}
                  </button>
                  {course.price > 0 && (
                    <button className="btn btn-secondary btn-lg" style={{ width: '100%', marginBottom: 16 }}>
                      {lang === 'kk' ? 'Тегін көру' : lang === 'en' ? 'Try for free' : 'Попробовать бесплатно'}
                    </button>
                  )}
                </>
              )}

              {/* Wishlist / Share */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                  <Icon name="heart" size={14} />
                  {lang === 'kk' ? 'Сақтау' : lang === 'en' ? 'Save' : 'В избранное'}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                  <Icon name="upload" size={14} />
                  {lang === 'kk' ? 'Бөлісу' : lang === 'en' ? 'Share' : 'Поделиться'}
                </button>
              </div>

              {/* Features hairline */}
              <div className="hairline">
                {features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--b-success)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                      <path d="m4 12 5 5L20 6"/>
                    </svg>
                    <span className="b-sm" style={{ color: 'var(--b-text-2)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee */}
            {course.price > 0 && (
              <div style={{
                marginTop: 16, padding: 16, background: 'var(--b-bg-soft)',
                borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Icon name="shield" size={20} style={{ color: 'var(--b-success)' }} />
                <span className="b-xs" style={{ color: 'var(--b-text-2)' }}>
                  {lang === 'kk' ? '14 күн — сұраусыз ақша қайтару' : lang === 'en' ? '14-day money-back guarantee' : '14 дней — возврат денег без вопросов'}
                </span>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="cd-mob-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        background: 'var(--b-bg)', borderTop: '1px solid var(--b-line)',
        alignItems: 'center', gap: 14, zIndex: 30,
      }}>
        <div>
          <div className="b-xs" style={{ color: 'var(--b-text-4)' }}>
            {lang === 'kk' ? 'бастап' : lang === 'en' ? 'from' : 'от'}
          </div>
          <div className="b-h2" style={{ fontSize: 20 }}>
            {course.price === 0
              ? (lang === 'kk' ? 'Тегін' : 'Бесплатно')
              : `${(course.discount_price ?? course.price).toLocaleString('ru-RU')} ₸`}
          </div>
        </div>
        {enrolled ? (
          <Link href={`/courses/${course.slug}/learn`} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 0', borderRadius: 10, background: 'var(--b-primary)', color: '#fff',
            fontWeight: 700, fontSize: 15, textDecoration: 'none',
          }}>
            <Icon name="play" size={16} />
            {lang === 'kk' ? 'Жалғастыру' : 'Продолжить'}
          </Link>
        ) : (
          <button onClick={enroll} disabled={enrolling} style={{
            flex: 1, padding: '13px 0', borderRadius: 10, background: 'var(--b-primary)',
            color: '#fff', fontWeight: 700, fontSize: 15, border: 'none',
            cursor: enrolling ? 'not-allowed' : 'pointer', opacity: enrolling ? 0.7 : 1,
          }}>
            {enrolling ? '...' : course.price > 0
              ? (lang === 'kk' ? 'Сатып алу' : 'Купить')
              : (lang === 'kk' ? 'Тегін бастау' : 'Начать')}
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 959px) {
          .cd-grid { grid-template-columns: 1fr !important; }
          .cd-grid aside { display: none; }
          .cd-mob-bar { display: flex !important; }
        }
        @media (min-width: 960px) {
          .cd-mob-bar { display: none !important; }
        }
        .cd-mob-bar { display: none; }
      `}</style>
    </div>
  )
}
