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
  if (h) return `${h}+ ч`
  return `${m} мин`
}

function fmtSec(sec: number) {
  const m = Math.floor(sec / 60)
  const h = Math.floor(m / 60)
  if (h) return `${h}:${String(m % 60).padStart(2, '0')} сағ`
  return `${m} мин`
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function CourseDetailContent({ course, sections, reviews, enrolled, userId }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [enrolling, setEnrolling] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([sections[0]?.id]))
  const [activeTab, setActiveTab] = useState<'program' | 'instructor' | 'reviews'>('program')

  // Жеңілдік таймері (UI only)
  const [timer, setTimer] = useState(2 * 3600 + 34 * 60 + 18)
  useEffect(() => {
    if (!course.discount_price) return
    const id = setInterval(() => setTimer(v => Math.max(0, v - 1)), 1000)
    return () => clearInterval(id)
  }, [course.discount_price])

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
    setReviewSending(true); setReviewError('')
    const res = await fetch('/api/reviews/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: course.id, rating: reviewRating, comment: reviewComment }),
    })
    setReviewSending(false)
    if (res.ok) { setReviewSent(true); router.refresh() }
    else { const d = await res.json(); setReviewError(d.error ?? 'Error') }
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
  const discountPct   = course.discount_price ? Math.round((1 - course.discount_price / course.price) * 100) : 0

  const levelLabel = {
    beginner:     lang === 'kk' ? 'Бастаушы'     : lang === 'en' ? 'Beginner'     : 'Начинающий',
    intermediate: lang === 'kk' ? 'Орта деңгей'  : lang === 'en' ? 'Intermediate' : 'Средний',
    advanced:     lang === 'kk' ? 'Жоғары деңгей': lang === 'en' ? 'Advanced'     : 'Продвинутый',
  }[course.level] ?? course.level

  const langLabel = {
    kk: 'Қазақша', ru: 'Орысша', en: 'English',
  }[course.language] ?? course.language

  async function handleEnroll() {
    if (!userId) { router.push('/login?redirect=/courses/' + course.slug); return }
    if (course.price > 0) { router.push(`/checkout?course=${course.id}`); return }
    setEnrolling(true)
    await supabase.from('enrollments').insert({ student_id: userId, course_id: course.id })
    router.push(`/courses/${course.slug}/learn`)
    router.refresh()
  }

  function toggleSection(id: string) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const features = [
    `${totalLessons} ${lang === 'kk' ? 'видео-сабақ' : lang === 'en' ? 'video lessons' : 'видео-урока'}`,
    lang === 'kk' ? 'Аяқтаған соң сертификат' : lang === 'en' ? 'Certificate of completion' : 'Сертификат по окончании',
    lang === 'kk' ? 'Мәңгілік қолжетімді'     : lang === 'en' ? 'Lifetime access'            : 'Доступ навсегда',
    lang === 'kk' ? 'Ментор қолдауы'           : lang === 'en' ? 'Mentor support'             : 'Поддержка ментора',
    `${langLabel} · ${levelLabel}`,
  ]

  // Сатып алу карточкасы
  const purchaseCard = (
    <div style={{
      background: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
      overflow: 'hidden',
    }}>
      {/* Трейлер */}
      {course.trailer_mux_playback_id && (
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
          <div className={`thumb-grad-${grad} thumb-pattern w-full h-full`} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="play" size={22} style={{ color: '#fff', marginLeft: 3 }} />
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            fontSize: 12, fontWeight: 500, borderRadius: 6, padding: '3px 8px',
          }}>
            {lang === 'kk' ? 'Трейлерді көру' : lang === 'en' ? 'Watch trailer' : 'Смотреть трейлер'} · {fmtSec(Math.floor(totalDuration / 10))}
          </div>
        </div>
      )}

      <div style={{ padding: 24 }}>
        {/* Баға */}
        {course.price === 0 ? (
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0D9488', marginBottom: 16 }}>
            {t.common.free}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
                {(course.discount_price ?? course.price).toLocaleString('ru-RU')} {t.common.currency}
              </span>
              {course.discount_price && (
                <span style={{ fontSize: 16, fontWeight: 500, color: '#9CA3AF', textDecoration: 'line-through' }}>
                  {course.price.toLocaleString('ru-RU')} {t.common.currency}
                </span>
              )}
              {discountPct > 0 && (
                <span style={{
                  background: '#FEF3C7', color: '#92400E', fontWeight: 700,
                  fontSize: 13, borderRadius: 6, padding: '2px 8px',
                }}>
                  −{discountPct}%
                </span>
              )}
            </div>
            {/* Таймер */}
            {course.discount_price && timer > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Icon name="clock" size={13} style={{ color: '#F59E0B' }} />
                <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
                  {lang === 'kk' ? 'Жеңілдік аяқталады:' : lang === 'en' ? 'Offer ends:' : 'Скидка действует ещё:'}{' '}
                  {pad(Math.floor(timer / 3600))}:{pad(Math.floor((timer % 3600) / 60))}:{pad(timer % 60)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Батырмалар */}
        {enrolled ? (
          <Link
            href={`/courses/${course.slug}/learn`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px 0', borderRadius: 10,
              background: '#1E3A8A', color: '#fff', fontWeight: 700, fontSize: 15,
              textDecoration: 'none', marginBottom: 10,
            }}
          >
            <Icon name="play" size={16} />
            {lang === 'kk' ? 'Жалғастыру' : lang === 'en' ? 'Continue learning' : 'Продолжить'}
          </Link>
        ) : (
          <>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              style={{
                display: 'block', width: '100%', padding: '13px 0', borderRadius: 10,
                background: '#1E3A8A', color: '#fff', fontWeight: 700, fontSize: 15,
                border: 'none', cursor: enrolling ? 'not-allowed' : 'pointer', marginBottom: 10,
                opacity: enrolling ? 0.7 : 1,
              }}
            >
              {enrolling ? t.common.loading : course.price > 0
                ? (lang === 'kk' ? 'Курсқа жазылу' : lang === 'en' ? 'Enroll now' : 'Записаться на курс')
                : t.course.enroll}
            </button>
            {course.price > 0 && (
              <button
                style={{
                  display: 'block', width: '100%', padding: '12px 0', borderRadius: 10,
                  background: 'transparent', color: '#1E3A8A', fontWeight: 600, fontSize: 14,
                  border: '1.5px solid #1E3A8A', cursor: 'pointer', marginBottom: 10,
                }}
              >
                {lang === 'kk' ? 'Тегін көру' : lang === 'en' ? 'Try for free' : 'Попробовать бесплатно'}
              </button>
            )}
          </>
        )}

        {/* Сақтау / Бөлісу */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 0', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB',
            color: '#374151', fontWeight: 500, fontSize: 13, cursor: 'pointer',
          }}>
            <Icon name="heart" size={14} />
            {lang === 'kk' ? 'Сақтау' : lang === 'en' ? 'Save' : 'В избранное'}
          </button>
          <button style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 0', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB',
            color: '#374151', fontWeight: 500, fontSize: 13, cursor: 'pointer',
          }}>
            <Icon name="upload" size={14} />
            {lang === 'kk' ? 'Бөлісу' : lang === 'en' ? 'Share' : 'Поделиться'}
          </button>
        </div>

        {/* Мүмкіндіктер тізімі */}
        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="m4 12 5 5L20 6"/></svg>
              <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Кепілдік */}
        {course.price > 0 && (
          <div style={{
            marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="shield" size={18} style={{ color: '#6B7280', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
              {lang === 'kk'
                ? '14 күн ішінде қайтарым кепілдігі'
                : lang === 'en' ? '14-day money-back guarantee'
                : '14 дней — вернём деньги без вопросов'}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <TopNav />

      <style>{`
        .detail-hero-grid { grid-template-columns: 1fr; }
        @media (min-width: 960px) { .detail-hero-grid { grid-template-columns: 1fr 380px; } }
        .hero-card-desktop { display: none; }
        @media (min-width: 960px) { .hero-card-desktop { display: block; } }
        .detail-main { grid-template-columns: 1fr; }
        @media (min-width: 960px) { .detail-main { grid-template-columns: 1fr 380px; } }
        .mobile-cta-bar { display: flex; }
        @media (min-width: 960px) { .mobile-cta-bar { display: none; } }
        .learn-grid { grid-template-columns: 1fr; }
        @media (min-width: 560px) { .learn-grid { grid-template-columns: 1fr 1fr; } }
        .reviews-grid { grid-template-columns: 1fr; }
        @media(min-width:640px){ .reviews-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {/* ── HERO ── */}
      <section className={`thumb-grad-${grad} thumb-pattern`} style={{ padding: '48px 20px 52px' }}>
        <div className="max-w-[1200px] mx-auto detail-hero-grid grid gap-10 items-start">

          {/* LEFT: course info */}
          <div style={{ color: '#fff' }}>
            {/* Chips: category + level + bestseller */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {course.category && (
                <Link href={`/courses?category=${course.category.slug}`} style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.25)', textDecoration: 'none',
                }}>
                  {tr(course.category.name_kk, course.category.name_ru, course.category.name_en)}
                </Link>
              )}
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
              }}>
                {levelLabel}
              </span>
              {course.students_count > 500 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: '#F59E0B', color: '#000',
                }}>
                  {lang === 'kk' ? 'Үздік таңдау' : lang === 'en' ? 'Bestseller' : 'Бестселлер'}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: 800,
              color: '#fff', lineHeight: 1.2, marginBottom: 16, maxWidth: 680,
            }}>
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', maxWidth: 580, marginBottom: 20, lineHeight: 1.6 }}>
                {description.slice(0, 200)}{description.length > 200 ? '…' : ''}
              </p>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Stars value={course.rating} size={15} />
                <span style={{ fontWeight: 700, color: '#F59E0B', fontSize: 14 }}>
                  {course.rating.toFixed(1)}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                  ({reviews.length} {lang === 'kk' ? 'пікір' : lang === 'en' ? 'reviews' : 'голосов'})
                </span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="users" size={13} />
                {course.students_count.toLocaleString('ru-RU')} {lang === 'kk' ? 'студент' : lang === 'en' ? 'students' : 'студентов'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="clock" size={13} />
                {fmtDur(totalDuration)}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="book" size={13} />
                {totalLessons} {lang === 'kk' ? 'сабақ' : lang === 'en' ? 'lessons' : 'уроков'}
              </span>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {course.instructor.full_name?.[0] ?? '?'}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  {course.instructor.full_name}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: purchase card (desktop sticky) */}
          <div className="hero-card-desktop">
            <div style={{ position: 'sticky', top: 80 }}>
              {purchaseCard}
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY TABS ── */}
      <div style={{
        position: 'sticky', top: 64, zIndex: 30,
        background: '#fff', borderBottom: '1px solid #E5E7EB',
      }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', minWidth: 'max-content' }}>
            {([
              ['program',    t.course.program],
              ['instructor', t.course.aboutInstructor],
              ['reviews',    t.course.reviews],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '14px 20px', fontSize: 14, fontWeight: activeTab === tab ? 700 : 500,
                  color: activeTab === tab ? '#1E3A8A' : '#6B7280',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid #1E3A8A' : '2px solid transparent',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 detail-main grid gap-8 items-start" style={{ paddingBottom: 100 }}>

        {/* LEFT column */}
        <div>

          {/* ── БАҒДАРЛАМА ── */}
          {activeTab === 'program' && (
            <div>
              {/* Не үйренесіз */}
              {course.what_you_learn && course.what_you_learn.length > 0 && (
                <div style={{
                  background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
                  padding: '24px', marginBottom: 24,
                }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#111827' }}>
                    {lang === 'kk' ? 'Не үйренесіз' : lang === 'en' ? "What you'll learn" : 'Чему вы научитесь'}
                  </h2>
                  <div className="learn-grid grid gap-y-3 gap-x-8">
                    {course.what_you_learn.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#374151' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><path d="m4 12 5 5L20 6"/></svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Бағдарлама тақырыбы */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                    {t.course.program}
                  </h2>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>
                    {sections.length} {lang === 'kk' ? 'бөлім' : lang === 'en' ? 'sections' : 'разделов'} ·{' '}
                    {totalLessons} {lang === 'kk' ? 'сабақ' : lang === 'en' ? 'lessons' : 'уроков'} ·{' '}
                    {fmtDur(totalDuration)}
                  </span>
                </div>
                <button
                  onClick={() => setExpandedSections(
                    expandedSections.size === sections.length
                      ? new Set()
                      : new Set(sections.map(s => s.id))
                  )}
                  style={{ fontSize: 13, fontWeight: 600, color: '#1E3A8A', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: '4px 8px' }}
                >
                  {expandedSections.size === sections.length
                    ? (lang === 'kk' ? 'Барлығын жабу' : lang === 'en' ? 'Collapse all' : 'Свернуть всё')
                    : (lang === 'kk' ? 'Барлығын ашу' : lang === 'en' ? 'Expand all' : 'Развернуть всё')}
                </button>
              </div>

              {/* Бөлімдер тізімі */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[...sections].sort((a, b) => a.order_idx - b.order_idx).map((sec, secIdx) => {
                  const open   = expandedSections.has(sec.id)
                  const secDur = sec.lessons.reduce((s, l) => s + l.duration_sec, 0)
                  const secNum = String(secIdx + 1).padStart(2, '0')
                  return (
                    <div key={sec.id} style={{
                      background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
                      overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => toggleSection(sec.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                          padding: '16px 20px', textAlign: 'left', background: 'transparent',
                          border: 'none', cursor: 'pointer', minHeight: 56,
                        }}
                      >
                        {/* Section number */}
                        <span style={{
                          fontSize: 13, fontWeight: 700, color: '#9CA3AF',
                          minWidth: 24, flexShrink: 0,
                        }}>{secNum}</span>
                        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#111827', textAlign: 'left' }}>
                          {tr(sec.title_kk, sec.title_ru, sec.title_en)}
                        </span>
                        <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap', marginLeft: 8 }}>
                          {sec.lessons.length} {lang === 'kk' ? 'сабақ' : 'урок'} · {fmtSec(secDur)}
                        </span>
                        <Icon
                          name={open ? 'chevronUp' : 'chevronDown'}
                          size={16}
                          style={{ color: '#6B7280', flexShrink: 0 }}
                        />
                      </button>

                      {open && (
                        <div style={{ borderTop: '1px solid #F3F4F6' }}>
                          {[...sec.lessons].sort((a, b) => a.order_idx - b.order_idx).map((lesson, li) => (
                            <div
                              key={lesson.id}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 20px 12px 58px',
                                borderBottom: li < sec.lessons.length - 1 ? '1px solid #F9FAFB' : 'none',
                                minHeight: 48,
                              }}
                            >
                              {lesson.is_preview
                                ? <Icon name="playCircle" size={16} style={{ color: '#1E3A8A', flexShrink: 0 }} />
                                : <Icon name="lock" size={14} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                              }
                              <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>
                                {tr(lesson.title_kk, lesson.title_ru, lesson.title_en)}
                              </span>
                              {lesson.is_preview && (
                                <span style={{
                                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                                  background: '#EEF2FF', color: '#1E3A8A', flexShrink: 0,
                                }}>
                                  {lang === 'kk' ? 'Тегін қарау' : lang === 'en' ? 'Preview' : 'Бесплатно'}
                                </span>
                              )}
                              {lesson.duration_sec > 0 && (
                                <span style={{ fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}>
                                  {fmtSec(lesson.duration_sec)}
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
          )}

          {/* ── СПИКЕР ── */}
          {activeTab === 'instructor' && course.instructor && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 16, flexShrink: 0,
                  background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 28,
                }}>
                  {course.instructor.full_name?.[0] ?? '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                    {course.instructor.full_name}
                  </div>
                  <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
                    {lang === 'kk' ? 'Спикер' : lang === 'en' ? 'Instructor' : 'Спикер'}
                  </div>
                  <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                    {[
                      { n: course.rating.toFixed(1), lbl: lang === 'kk' ? 'рейтинг' : lang === 'en' ? 'rating' : 'рейтинг' },
                      { n: course.students_count.toLocaleString('ru-RU'), lbl: lang === 'kk' ? 'студент' : lang === 'en' ? 'students' : 'студентов' },
                      { n: sections.length, lbl: lang === 'kk' ? 'модуль' : lang === 'en' ? 'modules' : 'модулей' },
                    ].map(({ n, lbl }) => (
                      <div key={lbl}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{n}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {course.instructor.bio && (
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{course.instructor.bio}</p>
              )}
            </div>
          )}

          {/* ── ПІКІРЛЕР ── */}
          {activeTab === 'reviews' && (
            <div>
              {/* Рейтинг жиынтығы */}
              <div style={{
                background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
                padding: '20px 24px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 20,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, color: '#111827' }}>
                    {course.rating.toFixed(1)}
                  </div>
                  <Stars value={course.rating} size={18} />
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                    {reviews.length} {lang === 'kk' ? 'пікір' : lang === 'en' ? 'reviews' : 'отзывов'}
                  </div>
                </div>
              </div>

              {/* Пікір жазу формасы */}
              {enrolled && !alreadyReviewed && !reviewSent && (
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24, marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#111827' }}>
                    {lang === 'kk' ? 'Пікір жазу' : lang === 'en' ? 'Write a review' : 'Написать отзыв'}
                  </div>
                  <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
                        {lang === 'kk' ? 'Рейтинг' : lang === 'en' ? 'Rating' : 'Рейтинг'}
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <button
                            key={s} type="button"
                            onMouseEnter={() => setReviewHover(s)}
                            onMouseLeave={() => setReviewHover(0)}
                            onClick={() => setReviewRating(s)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                          >
                            <svg width="28" height="28" viewBox="0 0 24 24"
                              fill={(reviewHover || reviewRating) >= s ? '#F59E0B' : 'none'}
                              stroke="#F59E0B" strokeWidth="1.5">
                              <path d="M12 2 14.6 8.6 22 9.5l-5.5 4.8L18 22l-6-3.4L6 22l1.5-7.7L2 9.5l7.4-.9z"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      className="inp w-full"
                      rows={3}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder={lang === 'kk' ? 'Курс туралы пікіріңіз...' : lang === 'en' ? 'Your thoughts...' : 'Ваши впечатления...'}
                      style={{ resize: 'vertical' }}
                    />
                    {reviewError && (
                      <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626' }}>
                        {reviewError}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={reviewSending || !reviewRating}
                      style={{
                        alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 8,
                        background: '#1E3A8A', color: '#fff', fontWeight: 600, fontSize: 14,
                        border: 'none', cursor: reviewSending || !reviewRating ? 'not-allowed' : 'pointer',
                        opacity: reviewSending || !reviewRating ? 0.6 : 1,
                      }}
                    >
                      {reviewSending
                        ? (lang === 'kk' ? 'Жіберілуде...' : lang === 'en' ? 'Sending...' : 'Отправка...')
                        : (lang === 'kk' ? 'Пікір жіберу' : lang === 'en' ? 'Submit review' : 'Отправить отзыв')}
                    </button>
                  </form>
                </div>
              )}

              {reviewSent && (
                <div style={{
                  background: '#F0FDF4', border: '1px solid #D1FAE5',
                  borderRadius: 12, padding: '14px 18px', marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="m4 12 5 5L20 6"/></svg>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                    {lang === 'kk' ? 'Пікіріңіз жіберілді!' : lang === 'en' ? 'Review submitted!' : 'Отзыв отправлен!'}
                  </span>
                </div>
              )}

              {reviews.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
                  <Icon name="star" size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                  <div style={{ fontSize: 14 }}>
                    {lang === 'kk' ? 'Пікір жоқ' : lang === 'en' ? 'No reviews yet' : 'Отзывов пока нет'}
                  </div>
                </div>
              ) : (
                <div className="reviews-grid grid gap-4">
                  {reviews.map(rev => (
                    <div key={rev.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: '#1E3A8A', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 14,
                        }}>
                          {rev.student_id.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                            {rev.student_id.slice(0, 8)}…
                          </div>
                          <Stars value={rev.rating} size={11} showNum={false} />
                        </div>
                      </div>
                      {rev.comment && (
                        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>«{rev.comment}»</p>
                      )}
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                        {new Date(rev.created_at).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : lang === 'en' ? 'en-US' : 'ru-RU')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: purchase card placeholder (desktop only — actual card is in hero sticky) */}
        <div className="hero-card-desktop" style={{ display: 'none' }} />
      </div>

      {/* ── Мобильді жабысқақ CTA ── */}
      <div
        className="mobile-cta-bar"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '12px 16px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          background: '#fff', borderTop: '1px solid #E5E7EB',
          alignItems: 'center', gap: 14, zIndex: 30,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
            {lang === 'kk' ? 'тек' : lang === 'en' ? 'from' : 'от'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
            {course.price === 0
              ? t.common.free
              : `${(course.discount_price ?? course.price).toLocaleString('ru-RU')} ${t.common.currency}`}
          </div>
        </div>
        {enrolled ? (
          <Link
            href={`/courses/${course.slug}/learn`}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px 0', borderRadius: 10, background: '#1E3A8A', color: '#fff',
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
            }}
          >
            <Icon name="play" size={16} />
            {lang === 'kk' ? 'Жалғастыру' : lang === 'en' ? 'Continue' : 'Продолжить'}
          </Link>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 10,
              background: '#1E3A8A', color: '#fff', fontWeight: 700, fontSize: 15,
              border: 'none', cursor: enrolling ? 'not-allowed' : 'pointer',
              opacity: enrolling ? 0.7 : 1,
            }}
          >
            {enrolling ? t.common.loading : course.price > 0
              ? (lang === 'kk' ? 'Сатып алу' : lang === 'en' ? 'Buy now' : 'Купить')
              : t.course.enroll}
          </button>
        )}
      </div>
    </div>
  )
}
