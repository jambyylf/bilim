'use client'

import { useState } from 'react'
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
  trailer_mux_playback_id: string | null
  what_you_learn: string[] | null
  requirements: string[] | null
  category: { slug: string; name_kk: string; name_ru: string; name_en: string } | null
  instructor: { id: string; full_name: string | null; avatar_url: string | null; bio: string | null } | null
}

interface Props {
  course: Course; sections: Section[]; reviews: Review[]
  enrolled: boolean; userId: string | null
}

const GRAD_MAP: Record<string, number> = {
  design: 1, programming: 8, marketing: 4, business: 7,
  finance: 3, languages: 5, data: 2, 'soft-skills': 6,
}

function fmtDur(sec: number) {
  const m = Math.floor(sec / 60)
  const h = Math.floor(m / 60)
  if (h) return `${h}:${String(m % 60).padStart(2, '0')} сағ`
  return `${m} мин`
}

export default function CourseDetailContent({ course, sections, reviews, enrolled, userId }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [enrolling, setEnrolling] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([sections[0]?.id]))
  const [activeTab, setActiveTab] = useState<'program' | 'instructor' | 'reviews'>('program')

  // Пікір жазу стейті
  const [reviewRating, setReviewRating]   = useState(0)
  const [reviewHover, setReviewHover]     = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSending, setReviewSending] = useState(false)
  const [reviewSent, setReviewSent]       = useState(false)
  const [reviewError, setReviewError]     = useState('')
  const alreadyReviewed = reviews.some(r => r.student_id === userId)

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewRating) return
    setReviewSending(true)
    setReviewError('')
    const res = await fetch('/api/reviews/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: course.id, rating: reviewRating, comment: reviewComment }),
    })
    setReviewSending(false)
    if (res.ok) {
      setReviewSent(true)
      router.refresh()
    } else {
      const d = await res.json()
      setReviewError(d.error ?? 'Error')
    }
  }

  function tr(kk: string, ru: string | null, en: string | null) {
    if (lang === 'ru') return ru || kk
    if (lang === 'en') return en || ru || kk
    return kk || ru || ''
  }

  const title       = tr(course.title_kk, course.title_ru, course.title_en)
  const description = tr(course.description_kk ?? '', course.description_ru, course.description_en)
  const grad        = GRAD_MAP[course.category?.slug ?? ''] ?? 1

  const totalLessons  = sections.reduce((s, sec) => s + sec.lessons.length, 0)
  const totalDuration = sections.reduce((s, sec) => s + sec.lessons.reduce((ls, l) => ls + l.duration_sec, 0), 0)

  async function handleEnroll() {
    if (!userId) { router.push('/login?redirect=/courses/' + course.slug); return }
    setEnrolling(true)
    await supabase.from('enrollments').insert({ student_id: userId, course_id: course.id })
    router.push(`/courses/${course.slug}/learn`)
    router.refresh()
  }

  function toggleSection(id: string) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div style={{ background: 'var(--b-bg)', minHeight: '100vh' }}>
      <TopNav />

      {/* ── HERO ── */}
      <section className={`thumb-grad-${grad} thumb-pattern`} style={{ padding: '56px 32px' }}>
        <div className="max-w-[1280px] mx-auto grid gap-12 items-start" style={{ gridTemplateColumns: '1fr 380px' }}>
          <div className="text-white">
            {course.category && (
              <Link href={`/courses?category=${course.category.slug}`}
                className="chip chip-accent inline-flex mb-4 no-underline"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                {tr(course.category.name_kk, course.category.name_ru, course.category.name_en)}
              </Link>
            )}
            <h1 className="b-display mb-4" style={{ color: '#fff', maxWidth: 640 }}>{title}</h1>
            {description && (
              <p className="b-body mb-6" style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 560 }}>
                {description.slice(0, 220)}{description.length > 220 ? '…' : ''}
              </p>
            )}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Stars value={course.rating} size={15} />
                <span className="b-sm font-semibold" style={{ color: '#fff' }}>{course.rating.toFixed(1)}</span>
                <span className="b-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  ({reviews.length} {t.course.reviews})
                </span>
              </div>
              <span className="b-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <Icon name="users" size={14} style={{ display: 'inline', marginRight: 4 }} />
                {course.students_count.toLocaleString('ru-RU')} {t.course.students}
              </span>
              <span className="b-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <Icon name="clock" size={14} style={{ display: 'inline', marginRight: 4 }} />
                {fmtDur(totalDuration)}
              </span>
              <span className="b-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <Icon name="book" size={14} style={{ display: 'inline', marginRight: 4 }} />
                {totalLessons} {t.course.lessons}
              </span>
            </div>
            {course.instructor && (
              <div className="flex items-center gap-2 mt-5">
                <div className="b-avatar" style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 13 }}>
                  {course.instructor.full_name?.[0] ?? '?'}
                </div>
                <span className="b-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{course.instructor.full_name}</span>
              </div>
            )}
          </div>

          {/* Сатып алу карточкасы */}
          <div className="card p-6 sticky top-24" style={{ background: 'var(--b-bg)' }}>
            {course.trailer_mux_playback_id && (
              <div className="rounded-xl overflow-hidden mb-4 relative" style={{ aspectRatio: '16/9', background: '#000' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                    <Icon name="play" size={24} style={{ color: '#fff', marginLeft: 3 }} />
                  </div>
                </div>
                <div className={`thumb-grad-${grad} thumb-pattern w-full h-full`} />
              </div>
            )}

            <div className="mb-4">
              {course.price === 0 ? (
                <div className="b-display" style={{ color: 'var(--b-teal)' }}>{t.common.free}</div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <div className="b-display">{(course.discount_price ?? course.price).toLocaleString('ru-RU')} {t.common.currency}</div>
                  {course.discount_price && (
                    <div className="b-h4 line-through" style={{ color: 'var(--b-text-4)' }}>
                      {course.price.toLocaleString('ru-RU')} {t.common.currency}
                    </div>
                  )}
                </div>
              )}
            </div>

            {enrolled ? (
              <Link
                href={`/courses/${course.slug}/learn`}
                className="btn btn-primary btn-fluid btn-lg w-full mb-3"
                style={{ justifyContent: 'center' }}
              >
                <Icon name="play" size={16} />
                {lang === 'kk' ? 'Жалғастыру' : lang === 'en' ? 'Continue learning' : 'Продолжить'}
              </Link>
            ) : (
              <button
                className="btn btn-primary btn-fluid btn-lg w-full mb-3"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? t.common.loading : t.course.enroll}
              </button>
            )}

            <button className="btn btn-secondary w-full mb-4" style={{ justifyContent: 'center' }}>
              <Icon name="heart" size={15} /> {t.course.addToWishlist}
            </button>

            <div className="flex flex-col gap-2 pt-4" style={{ borderTop: '1px solid var(--b-line)' }}>
              {[
                [t.instructor.courseLanguage, t.instructor.languages[course.language as 'kk' | 'ru' | 'en']],
                [t.instructor.courseLevel, t.instructor.levels[course.level as 'beginner' | 'intermediate' | 'advanced']],
                [t.course.lessons, `${totalLessons}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between b-sm">
                  <span style={{ color: 'var(--b-text-3)' }}>{label}</span>
                  <span className="font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TABS ── */}
      <div className="sticky top-16 z-30" style={{ background: 'var(--b-bg)', borderBottom: '1px solid var(--b-line)' }}>
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="liquid-tabs">
            {(['program', 'instructor', 'reviews'] as const).map(tab => (
              <button key={tab} className={`liquid-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'program'    ? t.course.program
                : tab === 'instructor' ? t.course.aboutInstructor
                : t.course.reviews}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-8 py-10" style={{ maxWidth: 860 }}>

        {/* ── ОҚУ ЖОСПАРЫ ── */}
        {activeTab === 'program' && (
          <div>
            {course.what_you_learn && course.what_you_learn.length > 0 && (
              <div className="card p-6 mb-8">
                <h2 className="b-h2 mb-4">
                  {lang === 'kk' ? 'Не үйренесіз' : lang === 'en' ? "What you'll learn" : 'Чему вы научитесь'}
                </h2>
                <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {course.what_you_learn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 b-sm">
                      <Icon name="check" size={14} style={{ color: 'var(--b-teal)', flexShrink: 0, marginTop: 2 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="b-h2">{t.course.program}</h2>
              <button
                className="btn btn-link b-sm"
                onClick={() => setExpandedSections(
                  expandedSections.size === sections.length
                    ? new Set()
                    : new Set(sections.map(s => s.id))
                )}
              >
                {expandedSections.size === sections.length ? '↑' : t.course.expandAll}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {sections.map(sec => {
                const open = expandedSections.has(sec.id)
                const secDur = sec.lessons.reduce((s, l) => s + l.duration_sec, 0)
                return (
                  <div key={sec.id} className="card overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                      onClick={() => toggleSection(sec.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon name={open ? 'chevronDown' : 'chevronLeft'} size={16} style={{ color: 'var(--b-text-3)' }} />
                        <span className="b-h4">{tr(sec.title_kk, sec.title_ru, sec.title_en)}</span>
                      </div>
                      <span className="b-xs" style={{ color: 'var(--b-text-3)' }}>
                        {sec.lessons.length} {t.course.lessons} · {fmtDur(secDur)}
                      </span>
                    </button>

                    {open && (
                      <div style={{ borderTop: '1px solid var(--b-line)' }}>
                        {sec.lessons
                          .sort((a, b) => a.order_idx - b.order_idx)
                          .map(lesson => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 px-5 py-3"
                              style={{ borderBottom: '1px solid var(--b-line-soft)' }}
                            >
                              {lesson.is_preview
                                ? <Icon name="playCircle" size={17} style={{ color: 'var(--b-primary)', flexShrink: 0 }} />
                                : <Icon name="lock" size={15} style={{ color: 'var(--b-text-4)', flexShrink: 0 }} />
                              }
                              <span className="b-sm flex-1">{tr(lesson.title_kk, lesson.title_ru, lesson.title_en)}</span>
                              {lesson.is_preview && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--b-primary-50)', color: 'var(--b-primary)' }}>
                                  {t.instructor.freePreview}
                                </span>
                              )}
                              {lesson.duration_sec > 0 && (
                                <span className="b-xs" style={{ color: 'var(--b-text-4)' }}>{fmtDur(lesson.duration_sec)}</span>
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
        )}

        {/* ── СПИКЕР ── */}
        {activeTab === 'instructor' && course.instructor && (
          <div className="card p-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="b-avatar" style={{ width: 64, height: 64, fontSize: 24, background: 'var(--b-primary)', color: '#fff' }}>
                {course.instructor.full_name?.[0] ?? '?'}
              </div>
              <div>
                <div className="b-h2">{course.instructor.full_name}</div>
                <div className="b-sm mt-1" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'Спикер' : lang === 'en' ? 'Instructor' : 'Спикер'}
                </div>
              </div>
            </div>
            {course.instructor.bio && (
              <p className="b-body" style={{ color: 'var(--b-text-2)', lineHeight: 1.65 }}>{course.instructor.bio}</p>
            )}
          </div>
        )}

        {/* ── ПІКІРЛЕР ── */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{course.rating.toFixed(1)}</div>
                <Stars value={course.rating} size={18} />
              </div>
            </div>

            {/* Пікір жазу формасы — тек жазылған студенттер */}
            {enrolled && !alreadyReviewed && !reviewSent && (
              <div className="card p-6 mb-6">
                <div className="b-h4 mb-4">
                  {lang === 'kk' ? 'Пікір жазу' : lang === 'en' ? 'Write a review' : 'Написать отзыв'}
                </div>
                <form onSubmit={submitReview} className="flex flex-col gap-4">
                  {/* Жұлдыз рейтинг */}
                  <div>
                    <div className="b-sm mb-2" style={{ color: 'var(--b-text-3)' }}>
                      {lang === 'kk' ? 'Рейтинг' : lang === 'en' ? 'Rating' : 'Рейтинг'}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          type="button"
                          onMouseEnter={() => setReviewHover(s)}
                          onMouseLeave={() => setReviewHover(0)}
                          onClick={() => setReviewRating(s)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill={(reviewHover || reviewRating) >= s ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="1.5">
                            <path d="M12 2 14.6 8.6 22 9.5l-5.5 4.8L18 22l-6-3.4L6 22l1.5-7.7L2 9.5l7.4-.9z"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="b-sm mb-1.5 block" style={{ color: 'var(--b-text-3)' }}>
                      {lang === 'kk' ? 'Пікір (міндетті емес)' : lang === 'en' ? 'Comment (optional)' : 'Комментарий (необязательно)'}
                    </label>
                    <textarea
                      className="input w-full"
                      rows={3}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder={lang === 'kk' ? 'Курс туралы пікіріңіз...' : lang === 'en' ? 'Your thoughts on the course...' : 'Ваши впечатления о курсе...'}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  {reviewError && (
                    <div className="b-sm p-3 rounded-lg" style={{ background: '#fee2e2', color: '#dc2626' }}>{reviewError}</div>
                  )}
                  <button type="submit" disabled={reviewSending || !reviewRating} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                    {reviewSending
                      ? (lang === 'kk' ? 'Жіберілуде...' : lang === 'en' ? 'Sending...' : 'Отправка...')
                      : (lang === 'kk' ? 'Пікір жіберу' : lang === 'en' ? 'Submit review' : 'Отправить отзыв')}
                  </button>
                </form>
              </div>
            )}

            {reviewSent && (
              <div className="card p-5 mb-6 flex items-center gap-3" style={{ borderColor: '#d1fae5', background: '#f0fdf4' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="m4 12 5 5L20 6"/></svg>
                <span className="b-sm font-medium" style={{ color: '#059669' }}>
                  {lang === 'kk' ? 'Пікіріңіз жіберілді!' : lang === 'en' ? 'Your review was submitted!' : 'Ваш отзыв отправлен!'}
                </span>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="card p-10 text-center" style={{ color: 'var(--b-text-3)' }}>
                <Icon name="star" size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                <div className="b-body">
                  {lang === 'kk' ? 'Пікір жоқ' : lang === 'en' ? 'No reviews yet' : 'Отзывов пока нет'}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map(rev => (
                  <div key={rev.id} className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="b-avatar" style={{ width: 36, height: 36, background: 'var(--b-primary-50)', color: 'var(--b-primary)' }}>
                          {rev.student_id.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="b-sm font-semibold">{rev.student_id.slice(0, 8)}…</span>
                      </div>
                      <Stars value={rev.rating} size={13} />
                    </div>
                    {rev.comment && <p className="b-body" style={{ color: 'var(--b-text-2)' }}>{rev.comment}</p>}
                    <div className="b-xs mt-2" style={{ color: 'var(--b-text-4)' }}>
                      {new Date(rev.created_at).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : lang === 'en' ? 'en-US' : 'ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
