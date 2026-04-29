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
  thumbnail_url: string | null; trailer_mux_playback_id: string | null
  what_you_learn: string[] | null; requirements: string[] | null
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

function fmtH(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h >= 1) return `${h}${m ? ':' + String(m).padStart(2,'0') : ''}+ ч`
  return `${m} мин`
}
function fmtMin(sec: number) {
  const m = Math.floor(sec / 60)
  const h = Math.floor(m / 60)
  if (h) return `${h}:${String(m % 60).padStart(2,'0')} сағ`
  return `${m} мин`
}
function pad2(n: number) { return String(n).padStart(2,'0') }

export default function CourseDetailContent({ course, sections, reviews, enrolled, userId }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [enrolling, setEnrolling] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([sections[0]?.id])
  )
  const [activeTab, setActiveTab] = useState<'program' | 'instructor' | 'reviews'>('program')

  // Жеңілдік таймері
  const [timer, setTimer] = useState(2 * 3600 + 34 * 60 + 18)
  useEffect(() => {
    if (!course.discount_price) return
    const id = setInterval(() => setTimer(v => Math.max(0, v - 1)), 1000)
    return () => clearInterval(id)
  }, [course.discount_price])

  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover]   = useState(0)
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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

  const levelLabel: Record<string, string> = {
    beginner:     lang === 'kk' ? 'Бастаушы'     : lang === 'en' ? 'Beginner'     : 'Начинающий',
    intermediate: lang === 'kk' ? 'Орта деңгей'  : lang === 'en' ? 'Intermediate' : 'Средний',
    advanced:     lang === 'kk' ? 'Жоғары деңгей': lang === 'en' ? 'Advanced'     : 'Продвинутый',
  }
  const langLabel: Record<string, string> = { kk: 'Қазақша', ru: 'Орысша', en: 'English' }

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
    `${langLabel[course.language] ?? course.language} · ${levelLabel[course.level] ?? course.level}`,
  ]

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <TopNav />

      <style>{`
        .cd-hero   { display: grid; grid-template-columns: 1fr; gap: 0; }
        .cd-card   { display: none; }
        .cd-tabs   { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .cd-body   { display: grid; grid-template-columns: 1fr; gap: 32px; }
        .cd-mob    { display: flex; }
        .cd-learn  { grid-template-columns: 1fr; }
        .cd-rev    { grid-template-columns: 1fr; }
        @media (min-width: 960px) {
          .cd-hero  { grid-template-columns: 1fr 380px; gap: 40px; align-items: start; }
          .cd-card  { display: block; }
          .cd-body  { grid-template-columns: 1fr 380px; }
          .cd-mob   { display: none; }
        }
        @media (min-width: 560px) { .cd-learn { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 640px) { .cd-rev   { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO — dark gradient background
      ══════════════════════════════════════════ */}
      <section className={`thumb-grad-${grad} thumb-pattern`}>

        {/* Breadcrumbs */}
        <div className="max-w-[1200px] mx-auto px-5 md:px-10" style={{ paddingTop: 16, paddingBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Link href="/courses" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
              {lang === 'kk' ? 'Каталог' : lang === 'en' ? 'Catalog' : 'Каталог'}
            </Link>
            {course.category && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
                <Link href={`/courses?category=${course.category.slug}`} style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
                  {tr(course.category.name_kk, course.category.name_ru, course.category.name_en)}
                </Link>
              </>
            )}
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>{title.slice(0, 28)}{title.length > 28 ? '…' : ''}</span>
          </div>
        </div>

        {/* Hero grid */}
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 cd-hero" style={{ paddingTop: 24, paddingBottom: 48 }}>

          {/* ── LEFT: course info + video ── */}
          <div>
            {/* Chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {course.category && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', padding: '4px 14px',
                  borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  {tr(course.category.name_kk, course.category.name_ru, course.category.name_en)}
                </span>
              )}
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '4px 14px',
                borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
              }}>
                {levelLabel[course.level] ?? course.level}
              </span>
              {course.students_count > 200 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', padding: '4px 14px',
                  borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: '#F59E0B', color: '#000',
                }}>
                  {lang === 'kk' ? 'Үздік таңдау' : lang === 'en' ? 'Bestseller' : 'Бестселлер'}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, color: '#fff',
              lineHeight: 1.2, marginBottom: 14, maxWidth: 640,
            }}>
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', maxWidth: 600, marginBottom: 18, lineHeight: 1.65 }}>
                {description.slice(0, 200)}{description.length > 200 ? '…' : ''}
              </p>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Stars value={course.rating} size={14} />
                <span style={{ fontWeight: 700, color: '#F59E0B', fontSize: 14 }}>
                  {course.rating.toFixed(1)}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                  ({reviews.length} {lang === 'kk' ? 'пікір' : lang === 'en' ? 'reviews' : 'голосов'})
                </span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                👥 {course.students_count.toLocaleString('ru-RU')} {lang === 'kk' ? 'студент' : 'студентов'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                ⏱ {fmtH(totalDuration)}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                📚 {sections.length} · {totalLessons}
              </span>
            </div>

            {/* Video thumbnail (LEFT side) */}
            <div style={{
              position: 'relative', width: '100%', maxWidth: 520,
              aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden',
              background: '#000', marginBottom: 20, cursor: 'pointer',
            }}>
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className={`thumb-grad-${grad} thumb-pattern w-full h-full`} />
              )}
              {/* Play overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.45)',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 3 }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              {/* Label */}
              <div style={{
                position: 'absolute', bottom: 12, left: 12,
                background: 'rgba(0,0,0,0.65)', color: '#fff',
                fontSize: 12, fontWeight: 600, borderRadius: 6, padding: '4px 10px',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                {lang === 'kk' ? 'Трейлерді көру' : lang === 'en' ? 'Watch trailer' : 'Смотреть трейлер'}
                {totalDuration > 0 && ` · ${fmtMin(Math.min(totalDuration, 180))}`}
              </div>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                }}>
                  {course.instructor.full_name?.[0] ?? '?'}
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                  {course.instructor.full_name}
                </span>
              </div>
            )}
          </div>

          {/* ── RIGHT: Purchase card (desktop sticky) ── */}
          <div className="cd-card">
            <div style={{ position: 'sticky', top: 80 }}>
              <PurchaseCard
                course={course} enrolled={enrolled} enrolling={enrolling}
                discountPct={discountPct} timer={timer} features={features}
                lang={lang} t={t} onEnroll={handleEnroll}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STICKY TABS
      ══════════════════════════════════════════ */}
      <div style={{ position: 'sticky', top: 64, zIndex: 30, background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 cd-tabs">
          <div style={{ display: 'flex', minWidth: 'max-content' }}>
            {([
              ['program',    t.course.program],
              ['instructor', t.course.aboutInstructor],
              ['reviews',    t.course.reviews],
            ] as const).map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '16px 22px', fontSize: 14, fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? '#1E3A8A' : '#6B7280',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid #1E3A8A' : '2px solid transparent',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN BODY
      ══════════════════════════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 cd-body" style={{ paddingTop: 32, paddingBottom: 100 }}>

        {/* LEFT: tab content */}
        <div>
          {activeTab === 'program' && (
            <ProgramTab
              course={course} sections={sections} lang={lang} t={t}
              expandedSections={expandedSections} toggleSection={toggleSection}
              totalLessons={totalLessons} totalDuration={totalDuration}
              tr={tr}
            />
          )}
          {activeTab === 'instructor' && course.instructor && (
            <InstructorTab
              instructor={course.instructor} course={course}
              sections={sections} reviews={reviews} lang={lang} tr={tr}
            />
          )}
          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={reviews} course={course} enrolled={enrolled}
              alreadyReviewed={alreadyReviewed} reviewSent={reviewSent}
              reviewRating={reviewRating} reviewHover={reviewHover}
              reviewComment={reviewComment} reviewSending={reviewSending}
              reviewError={reviewError}
              setReviewRating={setReviewRating} setReviewHover={setReviewHover}
              setReviewComment={setReviewComment}
              submitReview={submitReview} lang={lang}
            />
          )}
        </div>

        {/* RIGHT: purchase card (desktop — same as hero card, hidden on mobile) */}
        <div className="cd-card" />
      </div>

      {/* ══════════════════════════════════════════
          MOBILE STICKY CTA
      ══════════════════════════════════════════ */}
      <div className="cd-mob" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        background: '#fff', borderTop: '1px solid #E5E7EB',
        alignItems: 'center', gap: 14, zIndex: 30,
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
            {lang === 'kk' ? 'бастап' : lang === 'en' ? 'from' : 'от'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
            {course.price === 0
              ? t.common.free
              : `${(course.discount_price ?? course.price).toLocaleString('ru-RU')} ${t.common.currency}`}
          </div>
        </div>
        {enrolled ? (
          <Link href={`/courses/${course.slug}/learn`} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 0', borderRadius: 10, background: '#1E3A8A', color: '#fff',
            fontWeight: 700, fontSize: 15, textDecoration: 'none',
          }}>
            <Icon name="play" size={16} />
            {lang === 'kk' ? 'Жалғастыру' : lang === 'en' ? 'Continue' : 'Продолжить'}
          </Link>
        ) : (
          <button onClick={handleEnroll} disabled={enrolling} style={{
            flex: 1, padding: '13px 0', borderRadius: 10,
            background: '#1E3A8A', color: '#fff', fontWeight: 700, fontSize: 15,
            border: 'none', cursor: enrolling ? 'not-allowed' : 'pointer', opacity: enrolling ? 0.7 : 1,
          }}>
            {enrolling ? t.common.loading : course.price > 0
              ? (lang === 'kk' ? 'Сатып алу' : lang === 'en' ? 'Buy now' : 'Купить')
              : t.course.enroll}
          </button>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   PURCHASE CARD — right-side sticky card
════════════════════════════════════════════════════════ */
function PurchaseCard({ course, enrolled, enrolling, discountPct, timer, features, lang, t, onEnroll }: {
  course: Course; enrolled: boolean; enrolling: boolean; discountPct: number
  timer: number; features: string[]; lang: string; t: any; onEnroll: () => void
}) {
  function pad2(n: number) { return String(n).padStart(2,'0') }

  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 40px rgba(0,0,0,0.12)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '24px 24px 20px' }}>

        {/* Price */}
        {course.price === 0 ? (
          <div style={{ fontSize: 34, fontWeight: 800, color: '#0D9488', marginBottom: 16 }}>
            {lang === 'kk' ? 'Тегін' : lang === 'en' ? 'Free' : 'Бесплатно'}
          </div>
        ) : (
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
                {(course.discount_price ?? course.price).toLocaleString('ru-RU')} {t.common.currency}
              </span>
              {course.discount_price && (
                <span style={{ fontSize: 16, color: '#9CA3AF', textDecoration: 'line-through', fontWeight: 500 }}>
                  {course.price.toLocaleString('ru-RU')} {t.common.currency}
                </span>
              )}
            </div>
            {discountPct > 0 && (
              <span style={{
                display: 'inline-block', background: '#FEF3C7', color: '#92400E',
                fontWeight: 700, fontSize: 12, borderRadius: 6, padding: '2px 8px', marginBottom: 6,
              }}>
                −{discountPct}%
              </span>
            )}
            {course.discount_price && timer > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <Icon name="clock" size={12} style={{ color: '#F59E0B' }} />
                <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
                  {lang === 'kk' ? 'Жеңілдік аяқталады:' : lang === 'en' ? 'Offer ends:' : 'Скидка действует ещё:'}{' '}
                  {pad2(Math.floor(timer / 3600))}:{pad2(Math.floor((timer % 3600) / 60))}:{pad2(timer % 60)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {enrolled ? (
            <Link href={`/courses/${course.slug}/learn`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px 0', borderRadius: 10, background: '#1E3A8A', color: '#fff',
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
            }}>
              <Icon name="play" size={16} />
              {lang === 'kk' ? 'Жалғастыру' : lang === 'en' ? 'Continue learning' : 'Продолжить'}
            </Link>
          ) : (
            <>
              <button onClick={onEnroll} disabled={enrolling} style={{
                padding: '13px 0', borderRadius: 10, background: '#1E3A8A', color: '#fff',
                fontWeight: 700, fontSize: 15, border: 'none',
                cursor: enrolling ? 'not-allowed' : 'pointer', opacity: enrolling ? 0.7 : 1,
              }}>
                {enrolling ? t.common.loading : course.price > 0
                  ? (lang === 'kk' ? 'Курсқа жазылу' : lang === 'en' ? 'Enroll now' : 'Записаться на курс')
                  : t.course.enroll}
              </button>
              {course.price > 0 && (
                <button style={{
                  padding: '12px 0', borderRadius: 10, background: 'transparent',
                  color: '#1E3A8A', fontWeight: 600, fontSize: 14,
                  border: '1.5px solid #1E3A8A', cursor: 'pointer',
                }}>
                  {lang === 'kk' ? 'Тегін көру' : lang === 'en' ? 'Try for free' : 'Попробовать бесплатно'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Wishlist / Share */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
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

        {/* Divider */}
        <div style={{ height: 1, background: '#F3F4F6', margin: '18px 0' }} />

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <path d="m4 12 5 5L20 6"/>
              </svg>
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        {course.price > 0 && (
          <div style={{
            marginTop: 18, paddingTop: 16, borderTop: '1px solid #F3F4F6',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="shield" size={18} style={{ color: '#6B7280', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
              {lang === 'kk' ? '14 күн ішінде қайтарым кепілдігі'
                : lang === 'en' ? '14-day money-back guarantee'
                : '14 дней — вернём деньги без вопросов'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   PROGRAM TAB
════════════════════════════════════════════════════════ */
function ProgramTab({ course, sections, lang, t, expandedSections, toggleSection, totalLessons, totalDuration, tr }: any) {
  function fmtMin(sec: number) {
    const m = Math.floor(sec / 60); const h = Math.floor(m / 60)
    if (h) return `${h}:${String(m % 60).padStart(2,'0')} сағ`
    return `${m} мин`
  }

  return (
    <div>
      {/* Не үйренесіз */}
      {course.what_you_learn && course.what_you_learn.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
          padding: 24, marginBottom: 28,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
            {lang === 'kk' ? 'Не үйренесіз' : lang === 'en' ? "What you'll learn" : 'Чему вы научитесь'}
          </h2>
          <div style={{ display: 'grid', gap: '10px 32px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {course.what_you_learn.map((item: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#374151' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="m4 12 5 5L20 6"/>
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Бағдарлама header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {t.course.program}
          </h2>
          <span style={{ fontSize: 13, color: '#6B7280' }}>
            {sections.length} {lang === 'kk' ? 'бөлім' : lang === 'en' ? 'sections' : 'разделов'}{' · '}
            {totalLessons} {lang === 'kk' ? 'сабақ' : lang === 'en' ? 'lessons' : 'уроков'}{' · '}
            {fmtMin(totalDuration)}
          </span>
        </div>
        <button
          onClick={() => {/* toggle all — handled in parent */}}
          style={{ fontSize: 13, fontWeight: 600, color: '#1E3A8A', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {expandedSections.size === sections.length
            ? (lang === 'kk' ? 'Барлығын жабу' : lang === 'en' ? 'Collapse all' : 'Свернуть всё')
            : (lang === 'kk' ? 'Барлығын ашу' : lang === 'en' ? 'Expand all' : 'Развернуть всё')}
        </button>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[...sections].sort((a: any, b: any) => a.order_idx - b.order_idx).map((sec: any, si: number) => {
          const open   = expandedSections.has(sec.id)
          const secDur = sec.lessons.reduce((s: number, l: any) => s + l.duration_sec, 0)
          return (
            <div key={sec.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <button
                onClick={() => toggleSection(sec.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', textAlign: 'left',
                  background: open ? '#F8FAFF' : 'transparent',
                  border: 'none', cursor: 'pointer', minHeight: 56,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', minWidth: 22, flexShrink: 0 }}>
                  {String(si + 1).padStart(2, '0')}
                </span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#111827', textAlign: 'left' }}>
                  {tr(sec.title_kk, sec.title_ru, sec.title_en)}
                </span>
                <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {sec.lessons.length} {lang === 'kk' ? 'сабақ' : 'урок'} · {fmtMin(secDur)}
                </span>
                <Icon name={open ? 'chevronUp' : 'chevronDown'} size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              </button>

              {open && (
                <div style={{ borderTop: '1px solid #F3F4F6' }}>
                  {[...sec.lessons].sort((a: any, b: any) => a.order_idx - b.order_idx).map((lesson: any, li: number) => (
                    <div key={lesson.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 20px 12px 56px',
                      borderBottom: li < sec.lessons.length - 1 ? '1px solid #F9FAFB' : 'none',
                      minHeight: 48,
                    }}>
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
                          {fmtMin(lesson.duration_sec)}
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
  )
}

/* ════════════════════════════════════════════════════════
   INSTRUCTOR TAB
════════════════════════════════════════════════════════ */
function InstructorTab({ instructor, course, sections, reviews, lang, tr }: any) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 16, flexShrink: 0,
          background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 28,
        }}>
          {instructor.full_name?.[0] ?? '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {instructor.full_name}
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
            {lang === 'kk' ? 'Спикер' : lang === 'en' ? 'Instructor' : 'Спикер'}
          </div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[
              { n: course.rating.toFixed(1), lbl: lang === 'kk' ? 'рейтинг' : 'рейтинг' },
              { n: course.students_count.toLocaleString('ru-RU'), lbl: lang === 'kk' ? 'студент' : 'студентов' },
              { n: sections.length, lbl: lang === 'kk' ? 'модуль' : 'модулей' },
            ].map(({ n, lbl }) => (
              <div key={lbl}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{n}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {instructor.bio && (
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{instructor.bio}</p>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   REVIEWS TAB
════════════════════════════════════════════════════════ */
function ReviewsTab({ reviews, course, enrolled, alreadyReviewed, reviewSent, reviewRating, reviewHover, reviewComment, reviewSending, reviewError, setReviewRating, setReviewHover, setReviewComment, submitReview, lang }: any) {
  return (
    <div>
      {/* Rating summary */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, color: '#111827' }}>
            {course.rating.toFixed(1)}
          </div>
          <Stars value={course.rating} size={18} />
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
            {reviews.length} {lang === 'kk' ? 'пікір' : 'отзывов'}
          </div>
        </div>
      </div>

      {/* Review form */}
      {enrolled && !alreadyReviewed && !reviewSent && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#111827' }}>
            {lang === 'kk' ? 'Пікір жазу' : lang === 'en' ? 'Write a review' : 'Написать отзыв'}
          </div>
          <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((s: number) => (
                <button key={s} type="button"
                  onMouseEnter={() => setReviewHover(s)} onMouseLeave={() => setReviewHover(0)}
                  onClick={() => setReviewRating(s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24"
                    fill={(reviewHover || reviewRating) >= s ? '#F59E0B' : 'none'}
                    stroke="#F59E0B" strokeWidth="1.5">
                    <path d="M12 2 14.6 8.6 22 9.5l-5.5 4.8L18 22l-6-3.4L6 22l1.5-7.7L2 9.5l7.4-.9z"/>
                  </svg>
                </button>
              ))}
            </div>
            <textarea className="inp w-full" rows={3} value={reviewComment}
              onChange={(e: any) => setReviewComment(e.target.value)}
              placeholder={lang === 'kk' ? 'Курс туралы пікіріңіз...' : 'Ваши впечатления...'}
              style={{ resize: 'vertical' }} />
            {reviewError && (
              <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626' }}>
                {reviewError}
              </div>
            )}
            <button type="submit" disabled={reviewSending || !reviewRating} style={{
              alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 8,
              background: '#1E3A8A', color: '#fff', fontWeight: 600, fontSize: 14,
              border: 'none', cursor: reviewSending || !reviewRating ? 'not-allowed' : 'pointer',
              opacity: reviewSending || !reviewRating ? 0.6 : 1,
            }}>
              {reviewSending ? (lang === 'kk' ? 'Жіберілуде...' : 'Отправка...')
                : (lang === 'kk' ? 'Пікір жіберу' : 'Отправить отзыв')}
            </button>
          </form>
        </div>
      )}

      {reviewSent && (
        <div style={{ background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="m4 12 5 5L20 6"/></svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
            {lang === 'kk' ? 'Пікіріңіз жіберілді!' : 'Отзыв отправлен!'}
          </span>
        </div>
      )}

      {reviews.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>⭐</div>
          <div style={{ fontSize: 14 }}>
            {lang === 'kk' ? 'Пікір жоқ' : lang === 'en' ? 'No reviews yet' : 'Отзывов пока нет'}
          </div>
        </div>
      ) : (
        <div className="cd-rev grid gap-4">
          {reviews.map((rev: any) => (
            <div key={rev.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
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
              {rev.comment && <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>«{rev.comment}»</p>}
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                {new Date(rev.created_at).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
