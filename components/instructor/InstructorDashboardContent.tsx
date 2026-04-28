'use client'

import Link from 'next/link'
import Icon from '@/components/shared/Icon'
import Stars from '@/components/shared/Stars'
import { useLang } from '@/components/providers/LangProvider'

interface Course {
  id: string
  title_kk: string | null
  title_ru: string | null
  title_en: string | null
  status: string
  price: number | null
  discount_price: number | null
  students_count: number | null
  rating: number | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  student_id: string
}

interface Props {
  courses: Course[]
  reviews: Review[]
  totalStudents: number
  avgRating: string
}

export default function InstructorDashboardContent({ courses, reviews, totalStudents, avgRating }: Props) {
  const { lang, t } = useLang()

  function courseTitle(c: Course) {
    if (lang === 'ru') return c.title_ru ?? c.title_kk ?? '—'
    if (lang === 'en') return c.title_en ?? c.title_ru ?? '—'
    return c.title_kk ?? c.title_ru ?? '—'
  }

  function statusChip(status: string) {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      published: { label: t.instructor.published, color: '#059669', bg: '#d1fae5' },
      draft:     { label: t.instructor.draft,     color: '#6b7280', bg: 'var(--b-bg-soft)' },
      pending:   { label: t.instructor.pending,   color: '#d97706', bg: '#fef3c7' },
      rejected:  { label: t.instructor.rejected,  color: '#dc2626', bg: '#fee2e2' },
    }
    const s = map[status] ?? map.draft
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: s.color, background: s.bg }}>
        {s.label}
      </span>
    )
  }

  const KPI = [
    { icon: 'dollar',  label: t.instructor.monthRevenue,   value: '—',            sub: '₸' },
    { icon: 'users',   label: t.instructor.totalStudents,  value: totalStudents,  sub: t.instructor.students },
    { icon: 'star',    label: t.instructor.avgRating,      value: avgRating,      sub: '/ 5.0' },
    { icon: 'book',    label: t.instructor.myCourses,      value: courses.length, sub: t.home.courses },
  ]

  return (
    <div className="instr-content">
      <style>{`
        .instr-content { padding: 24px 16px; max-width: 1100px; }
        @media (min-width: 768px) { .instr-content { padding: 40px 48px; } }
        .instr-kpi { grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 640px) { .instr-kpi { grid-template-columns: repeat(4, 1fr); } }
        .instr-main-grid { grid-template-columns: 1fr; }
        @media (min-width: 900px) { .instr-main-grid { grid-template-columns: 1.6fr 1fr; } }
      `}</style>

      {/* Тақырып */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="b-eyebrow mb-1">{t.instructor.title}</div>
          <h1 className="b-h1">{t.instructor.dashboard}</h1>
        </div>
        <Link href="/instructor/courses/new" className="btn btn-primary flex items-center gap-2">
          <Icon name="plus" size={15} />
          {t.instructor.createCourse}
        </Link>
      </div>

      {/* KPI карточкалары */}
      <div className="instr-kpi grid gap-4 mb-8">
        {KPI.map(({ icon, label, value, sub }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="b-sm font-medium" style={{ color: 'var(--b-text-3)' }}>{label}</div>
              <div style={{ color: 'var(--b-primary)', background: 'var(--b-primary-50)', borderRadius: 8, padding: '6px 8px' }}>
                <Icon name={icon} size={18} />
              </div>
            </div>
            <div className="b-h1" style={{ lineHeight: 1 }}>{value}</div>
            <div className="b-xs mt-1" style={{ color: 'var(--b-text-4)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Курстар кестесі + Соңғы пікірлер */}
      <div className="instr-main-grid grid gap-6">

        {/* Курстар */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--b-line)' }}>
            <div className="b-h4">{t.instructor.myCourses}</div>
            <Link href="/instructor/courses" className="btn btn-link b-sm">{t.home.allCourses}</Link>
          </div>

          {courses.length === 0 ? (
            <div className="p-10 text-center" style={{ color: 'var(--b-text-3)' }}>
              <Icon name="book" size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <div className="b-body">{t.instructor.newCourse}</div>
              <Link href="/instructor/courses/new" className="btn btn-primary btn-sm mt-4 inline-flex">
                <Icon name="plus" size={13} /> {t.instructor.createCourse}
              </Link>
            </div>
          ) : (
            <div>
              {courses.slice(0, 6).map(course => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 px-5 py-4"
                  style={{ borderBottom: '1px solid var(--b-line-soft)' }}
                >
                  <div
                    className={`thumb-grad-${(courses.indexOf(course) % 8) + 1} rounded-lg shrink-0`}
                    style={{ width: 44, height: 44 }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="b-sm font-semibold truncate">{courseTitle(course)}</div>
                    <div className="flex items-center gap-3 mt-1">
                      {statusChip(course.status)}
                      <span className="b-xs" style={{ color: 'var(--b-text-3)' }}>
                        {course.students_count ?? 0} {t.instructor.students}
                      </span>
                      {course.rating ? (
                        <span className="b-xs flex items-center gap-1" style={{ color: 'var(--b-text-3)' }}>
                          <Icon name="star" size={11} style={{ color: 'var(--b-accent)' }} />
                          {course.rating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/instructor/courses/${course.id}/edit`} className="btn btn-ghost btn-sm">
                      <Icon name="edit" size={14} />
                    </Link>
                    <Link href={`/courses/${course.id}`} className="btn btn-ghost btn-sm">
                      <Icon name="eye" size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Соңғы пікірлер */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--b-line)' }}>
            <div className="b-h4">{t.instructor.recentReviews}</div>
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--b-text-3)' }}>
              <Icon name="star" size={36} style={{ margin: '0 auto 10px', opacity: 0.25 }} />
              <div className="b-sm">{lang === 'kk' ? 'Пікір жоқ' : lang === 'en' ? 'No reviews yet' : 'Отзывов пока нет'}</div>
            </div>
          ) : (
            <div>
              {reviews.map(review => (
                <div key={review.id} className="px-5 py-4" style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="b-sm font-semibold">{review.student_id.slice(0, 8)}…</div>
                    <Stars value={review.rating} size={12} />
                  </div>
                  {review.comment && (
                    <p className="b-xs" style={{ color: 'var(--b-text-3)', lineHeight: 1.5 }}>
                      {review.comment.length > 100 ? review.comment.slice(0, 100) + '…' : review.comment}
                    </p>
                  )}
                  <button className="btn btn-ghost btn-sm mt-2 gap-1" style={{ color: 'var(--b-primary)', fontSize: 12 }}>
                    <Icon name="arrow" size={11} />{t.instructor.reply}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
