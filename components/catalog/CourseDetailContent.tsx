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

  const [enrolling, setEnrolling]     = useState(false)
  const [expanded, setExpanded]       = useState<Set<string>>(new Set(sections[0] ? [sections[0].id] : []))
  const [tab, setTab]                 = useState<'program' | 'instructor' | 'reviews'>('program')
  const [timer, setTimer]             = useState(2 * 3600 + 34 * 60 + 18)
  const [revRating, setRevRating]     = useState(0)
  const [revHover, setRevHover]       = useState(0)
  const [revText, setRevText]         = useState('')
  const [revSending, setRevSending]   = useState(false)
  const [revSent, setRevSent]         = useState(false)
  const [revError, setRevError]       = useState('')

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
    beginner:     lang === 'kk' ? 'Бастаушы'      : lang === 'en' ? 'Beginner'     : 'Начинающий',
    intermediate: lang === 'kk' ? 'Орта деңгей'   : lang === 'en' ? 'Intermediate' : 'Средний',
    advanced:     lang === 'kk' ? 'Жоғары деңгей' : lang === 'en' ? 'Advanced'     : 'Продвинутый',
  }
  const lngL: Record<string, string> = { kk: 'Қазақша', ru: 'Орысша', en: 'English' }

  async function enroll() {
    if (!userId) { router.push('/login?redirect=/courses/' + course.slug); return }
    if (course.price > 0) { router.push(`/checkout?course=${course.id}`); return }
    setEnrolling(true)
    await supabase.from('enrollments').insert({ student_id: userId, course_id: course.id })
    router.push(`/courses/${course.slug}/learn`)
    router.refresh()
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

  const features = [
    `${totalLessons} ${lang === 'kk' ? 'видео-сабақ' : lang === 'en' ? 'video lessons' : 'видео-урока'}`,
    lang === 'kk' ? 'Аяқтаған соң сертификат' : lang === 'en' ? 'Certificate' : 'Сертификат по окончании',
    lang === 'kk' ? 'Мәңгілік қолжетімді'     : lang === 'en' ? 'Lifetime access' : 'Доступ навсегда',
    lang === 'kk' ? 'Ментор қолдауы'           : lang === 'en' ? 'Mentor support' : 'Поддержка ментора',
    `${lngL[course.language] ?? course.language} · ${lvl[course.level] ?? course.level}`,
  ]

  /* ─── Purchase card (shared between hero-right and mobile bar) ─── */
  const card = (
    <div style={{
      background: '#fff', borderRadius: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.14)',
    }}>
      <div style={{ padding: '24px 22px' }}>

        {/* Price block */}
        {course.price === 0 ? (
          <div style={{ fontSize: 36, fontWeight: 800, color: '#0D9488', marginBottom: 18 }}>
            {lang === 'kk' ? 'Тегін' : lang === 'en' ? 'Free' : 'Бесплатно'}
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                {(course.discount_price ?? course.price).toLocaleString('ru-RU')} {t.common.currency}
              </span>
              {course.discount_price && (
                <span style={{ fontSize: 16, color: '#9CA3AF', textDecoration: 'line-through', fontWeight: 400 }}>
                  {course.price.toLocaleString('ru-RU')} {t.common.currency}
                </span>
              )}
            </div>
            {discPct > 0 && (
              <span style={{
                display: 'inline-block', marginTop: 8,
                background: '#FEF3C7', color: '#92400E',
                fontWeight: 700, fontSize: 12, borderRadius: 6, padding: '3px 9px',
              }}>
                −{discPct}%
              </span>
            )}
            {course.discount_price && timer > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                <Icon name="clock" size={12} style={{ color: '#F59E0B', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
                  {lang === 'kk' ? 'Жеңілдік аяқталады:' : lang === 'en' ? 'Offer ends:' : 'Скидка действует ещё:'}{' '}
                  {p2(Math.floor(timer / 3600))}:{p2(Math.floor((timer % 3600) / 60))}:{p2(timer % 60)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          {enrolled ? (
            <Link href={`/courses/${course.slug}/learn`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 0', borderRadius: 10, background: '#1E3A8A', color: '#fff',
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
            }}>
              <Icon name="play" size={16} />
              {lang === 'kk' ? 'Жалғастыру' : lang === 'en' ? 'Continue learning' : 'Продолжить'}
            </Link>
          ) : (
            <>
              <button onClick={enroll} disabled={enrolling} style={{
                padding: '14px 0', borderRadius: 10, background: '#1E3A8A', color: '#fff',
                fontWeight: 700, fontSize: 15, border: 'none',
                cursor: enrolling ? 'not-allowed' : 'pointer', opacity: enrolling ? 0.7 : 1,
              }}>
                {enrolling
                  ? t.common.loading
                  : course.price > 0
                    ? (lang === 'kk' ? 'Курсқа жазылу' : lang === 'en' ? 'Enroll now' : 'Записаться на курс')
                    : t.course.enroll}
              </button>
              {course.price > 0 && (
                <button style={{
                  padding: '13px 0', borderRadius: 10, background: 'transparent',
                  color: '#1E3A8A', fontWeight: 600, fontSize: 14,
                  border: '1.5px solid #1E3A8A', cursor: 'pointer',
                }}>
                  {lang === 'kk' ? 'Тегін көру' : lang === 'en' ? 'Try for free' : 'Попробовать бесплатно'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Wishlist / share */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[
            { icon: 'heart', label: lang === 'kk' ? 'Сақтау' : lang === 'en' ? 'Save' : 'В избранное' },
            { icon: 'upload', label: lang === 'kk' ? 'Бөлісу' : lang === 'en' ? 'Share' : 'Поделиться' },
          ].map(({ icon, label }) => (
            <button key={label} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', borderRadius: 8, background: '#F9FAFB',
              border: '1px solid #E5E7EB', color: '#374151', fontWeight: 500, fontSize: 13, cursor: 'pointer',
            }}>
              <Icon name={icon} size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#F3F4F6', margin: '18px 0 16px' }} />

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <path d="m4 12 5 5L20 6"/>
              </svg>
              <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        {course.price > 0 && (
          <div style={{
            marginTop: 18, paddingTop: 16, borderTop: '1px solid #F3F4F6',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="shield" size={18} style={{ color: '#9CA3AF', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
              {lang === 'kk'
                ? '14 күн ішінде ақша қайтарым кепілдігі'
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

      {/* ═══════════════════════════════════════════════
          HERO — dark gradient background
      ═══════════════════════════════════════════════ */}
      <section className={`thumb-grad-${grad} thumb-pattern`}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

          {/* Breadcrumbs */}
          <div style={{ paddingTop: 14, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Link href="/courses" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>
              {lang === 'kk' ? 'Каталог' : lang === 'en' ? 'Catalog' : 'Каталог'}
            </Link>
            {course.category && <>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>›</span>
              <Link href={`/courses?category=${course.category.slug}`}
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>
                {tr(course.category.name_kk, course.category.name_ru, course.category.name_en)}
              </Link>
            </>}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              {title.slice(0, 30)}{title.length > 30 ? '…' : ''}
            </span>
          </div>

          {/* Two-column grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 32,
            paddingTop: 20,
            paddingBottom: 48,
          }}
            className="cd-hero-grid"
          >
            {/* ── LEFT: info + video ── */}
            <div>
              {/* Chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {course.category && (
                  <span style={{
                    padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                  }}>
                    {tr(course.category.name_kk, course.category.name_ru, course.category.name_en)}
                  </span>
                )}
                <span style={{
                  padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  {lang === 'kk' ? 'Бастаушылар үшін' : lang === 'en' ? 'For beginners' : 'Для начинающих'}
                </span>
                {course.students_count > 100 && (
                  <span style={{
                    padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: '#F59E0B', color: '#000',
                  }}>
                    {lang === 'kk' ? 'Үздік таңдау' : lang === 'en' ? 'Bestseller' : 'Бестселлер'}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(20px, 2.8vw, 32px)', fontWeight: 800, color: '#fff',
                lineHeight: 1.25, marginBottom: 12, maxWidth: 640,
              }}>
                {title}
              </h1>

              {/* Description */}
              {desc && (
                <p style={{
                  fontSize: 15, color: 'rgba(255,255,255,0.8)',
                  maxWidth: 580, marginBottom: 16, lineHeight: 1.65,
                }}>
                  {desc.slice(0, 200)}{desc.length > 200 ? '…' : ''}
                </p>
              )}

              {/* Stats row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Stars value={course.rating} size={14} />
                  <span style={{ fontWeight: 700, color: '#F59E0B', fontSize: 14 }}>
                    {course.rating.toFixed(1)}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    ({reviews.length} {lang === 'kk' ? 'пікір' : lang === 'en' ? 'reviews' : 'голосов'})
                  </span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
                  👥 {course.students_count.toLocaleString('ru-RU')} {lang === 'kk' ? 'студент' : lang === 'en' ? 'students' : 'студентов'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
                  ⏱ {durH(totalDuration)}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
                  📚 {sections.length} · {totalLessons}
                </span>
              </div>

              {/* Video thumbnail */}
              <div style={{
                position: 'relative', width: '100%', maxWidth: 540,
                borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                aspectRatio: '16/9', background: '#000', marginBottom: 22,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                {course.thumbnail_url
                  ? <img src={course.thumbnail_url} alt={title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div className={`thumb-grad-${grad} thumb-pattern`} style={{ width: '100%', height: '100%' }} />
                }
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 4 }}>
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div style={{
                  position: 'absolute', bottom: 12, left: 12,
                  background: 'rgba(0,0,0,0.65)', color: '#fff',
                  fontSize: 12, fontWeight: 600, borderRadius: 6, padding: '4px 10px',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                  {lang === 'kk' ? 'Трейлерді көру' : lang === 'en' ? 'Watch trailer' : 'Смотреть трейлер'}
                  {totalDuration > 0 && ` · ${durM(Math.min(totalDuration, 180))}`}
                </div>
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}>
                    {course.instructor.full_name?.[0] ?? '?'}
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {course.instructor.full_name}
                  </span>
                </div>
              )}
            </div>

            {/* ── RIGHT: purchase card (desktop sticky) ── */}
            <div className="cd-card-col">
              <div style={{ position: 'sticky', top: 80 }}>{card}</div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (min-width: 960px) {
          .cd-hero-grid { grid-template-columns: minmax(0,1fr) 380px !important; gap: 40px !important; align-items: start; }
          .cd-card-col  { display: block !important; }
          .cd-mob-bar   { display: none !important; }
        }
        .cd-card-col { display: none; }
        .cd-mob-bar  { display: flex; }
      `}</style>

      {/* ═══════════════════════════════════════════════
          STICKY TABS
      ═══════════════════════════════════════════════ */}
      <div style={{
        position: 'sticky', top: 64, zIndex: 30,
        background: '#fff', borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', minWidth: 'max-content' }}>
            {([
              ['program',    t.course.program],
              ['instructor', t.course.aboutInstructor],
              ['reviews',    t.course.reviews],
            ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                padding: '16px 22px', fontSize: 14, fontWeight: tab === key ? 700 : 500,
                color: tab === key ? '#1E3A8A' : '#6B7280',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: tab === key ? '2px solid #1E3A8A' : '2px solid transparent',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          CONTENT (single column max-w-860)
      ═══════════════════════════════════════════════ */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 120px' }}>

        {/* ── PROGRAM ── */}
        {tab === 'program' && (
          <div>
            {/* What you'll learn */}
            {course.what_you_learn && course.what_you_learn.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24, marginBottom: 28 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
                  {lang === 'kk' ? 'Не үйренесіз' : lang === 'en' ? "What you'll learn" : 'Чему вы научитесь'}
                </h2>
                <div style={{ display: 'grid', gap: '10px 40px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {course.what_you_learn.map((item, i) => (
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

            {/* Curriculum header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                  {t.course.program}
                </h2>
                <span style={{ fontSize: 13, color: '#6B7280' }}>
                  {sections.length} {lang === 'kk' ? 'бөлімдер' : lang === 'en' ? 'sections' : 'разделов'}{' · '}
                  {totalLessons} {lang === 'kk' ? 'сабақ' : lang === 'en' ? 'lessons' : 'уроков'}{' · '}
                  {durH(totalDuration)}
                </span>
              </div>
              <button
                onClick={() => setExpanded(
                  expanded.size === sections.length
                    ? new Set()
                    : new Set(sections.map(s => s.id))
                )}
                style={{ fontSize: 13, fontWeight: 600, color: '#1E3A8A', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {expanded.size === sections.length
                  ? (lang === 'kk' ? 'Барлығын жабу' : lang === 'en' ? 'Collapse all' : 'Свернуть всё')
                  : (lang === 'kk' ? 'Барлығын ашу' : lang === 'en' ? 'Expand all' : 'Развернуть всё')}
              </button>
            </div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[...sections].sort((a, b) => a.order_idx - b.order_idx).map((sec, si) => {
                const open   = expanded.has(sec.id)
                const secDur = sec.lessons.reduce((s, l) => s + l.duration_sec, 0)
                return (
                  <div key={sec.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <button onClick={() => toggleSec(sec.id)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                      padding: '16px 20px', background: open ? '#F8FAFF' : '#fff',
                      border: 'none', cursor: 'pointer', textAlign: 'left', minHeight: 56,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', minWidth: 22, flexShrink: 0 }}>
                        {p2(si + 1)}
                      </span>
                      <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#111827' }}>
                        {tr(sec.title_kk, sec.title_ru, sec.title_en)}
                      </span>
                      <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                        {sec.lessons.length} {lang === 'kk' ? 'сабақ' : 'урок'} · {durM(secDur)}
                      </span>
                      <Icon name={open ? 'chevronUp' : 'chevronDown'} size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                    </button>

                    {open && (
                      <div style={{ borderTop: '1px solid #F3F4F6' }}>
                        {[...sec.lessons].sort((a, b) => a.order_idx - b.order_idx).map((lesson, li) => (
                          <div key={lesson.id} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '11px 20px 11px 56px',
                            borderBottom: li < sec.lessons.length - 1 ? '1px solid #F9FAFB' : 'none',
                            minHeight: 46,
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
        )}

        {/* ── INSTRUCTOR ── */}
        {tab === 'instructor' && course.instructor && (
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
                    { n: course.rating.toFixed(1), l: lang === 'kk' ? 'рейтинг' : 'рейтинг' },
                    { n: course.students_count.toLocaleString('ru-RU'), l: lang === 'kk' ? 'студент' : 'студентов' },
                    { n: String(sections.length), l: lang === 'kk' ? 'модуль' : 'модулей' },
                  ].map(({ n, l }) => (
                    <div key={l}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{n}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{l}</div>
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

        {/* ── REVIEWS ── */}
        {tab === 'reviews' && (
          <div>
            {/* Summary */}
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
            {enrolled && !alreadyReviewed && !revSent && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24, marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#111827' }}>
                  {lang === 'kk' ? 'Пікір жазу' : lang === 'en' ? 'Write a review' : 'Написать отзыв'}
                </div>
                <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  <textarea className="inp w-full" rows={3}
                    value={revText} onChange={e => setRevText(e.target.value)}
                    placeholder={lang === 'kk' ? 'Курс туралы пікіріңіз...' : 'Ваши впечатления...'}
                    style={{ resize: 'vertical' }} />
                  {revError && (
                    <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626' }}>
                      {revError}
                    </div>
                  )}
                  <button type="submit" disabled={revSending || !revRating} style={{
                    alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 8,
                    background: '#1E3A8A', color: '#fff', fontWeight: 600, fontSize: 14,
                    border: 'none', cursor: revSending || !revRating ? 'not-allowed' : 'pointer',
                    opacity: revSending || !revRating ? 0.6 : 1,
                  }}>
                    {revSending ? (lang === 'kk' ? 'Жіберілуде...' : 'Отправка...') : (lang === 'kk' ? 'Пікір жіберу' : 'Отправить отзыв')}
                  </button>
                </form>
              </div>
            )}

            {revSent && (
              <div style={{ background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="m4 12 5 5L20 6"/></svg>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                  {lang === 'kk' ? 'Пікіріңіз жіберілді!' : 'Отзыв отправлен!'}
                </span>
              </div>
            )}

            {reviews.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>⭐</div>
                <div style={{ fontSize: 14, color: '#9CA3AF' }}>
                  {lang === 'kk' ? 'Пікір жоқ' : lang === 'en' ? 'No reviews yet' : 'Отзывов пока нет'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {reviews.map(rev => (
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
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          MOBILE STICKY BAR
      ═══════════════════════════════════════════════ */}
      <div className="cd-mob-bar" style={{
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
            {lang === 'kk' ? 'Жалғастыру' : 'Продолжить'}
          </Link>
        ) : (
          <button onClick={enroll} disabled={enrolling} style={{
            flex: 1, padding: '13px 0', borderRadius: 10, background: '#1E3A8A',
            color: '#fff', fontWeight: 700, fontSize: 15, border: 'none',
            cursor: enrolling ? 'not-allowed' : 'pointer', opacity: enrolling ? 0.7 : 1,
          }}>
            {enrolling ? t.common.loading : course.price > 0
              ? (lang === 'kk' ? 'Сатып алу' : 'Купить')
              : t.course.enroll}
          </button>
        )}
      </div>
    </div>
  )
}
