'use client'

import { useState } from 'react'
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
  created_at: string
}

export default function InstructorCoursesContent({ courses }: { courses: Course[] }) {
  const { lang, t } = useLang()
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'pending' | 'rejected'>('all')

  function title(c: Course) {
    if (lang === 'ru') return c.title_ru ?? c.title_kk ?? '—'
    if (lang === 'en') return c.title_en ?? c.title_ru ?? '—'
    return c.title_kk ?? c.title_ru ?? '—'
  }

  const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    published: { label: t.instructor.published, color: '#059669', bg: '#d1fae5' },
    draft:     { label: t.instructor.draft,     color: '#6b7280', bg: 'var(--b-surface-2)' },
    pending:   { label: t.instructor.pending,   color: '#d97706', bg: '#fef3c7' },
    rejected:  { label: t.instructor.rejected,  color: '#dc2626', bg: '#fee2e2' },
  }

  const filtered = filter === 'all' ? courses : courses.filter(c => c.status === filter)

  const FILTERS = [
    { key: 'all',       label: t.home.all },
    { key: 'published', label: t.instructor.published },
    { key: 'draft',     label: t.instructor.draft },
    { key: 'pending',   label: t.instructor.pending },
    { key: 'rejected',  label: t.instructor.rejected },
  ] as const

  return (
    <div style={{ padding: '40px 48px' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="b-eyebrow mb-1">{t.instructor.title}</div>
          <h1 className="b-h1">{t.instructor.myCourses}</h1>
        </div>
        <Link href="/instructor/courses/new" className="btn btn-primary flex items-center gap-2">
          <Icon name="plus" size={15} />
          {t.instructor.createCourse}
        </Link>
      </div>

      {/* Сүзгілер */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`chip ${filter === f.key ? 'chip-active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Icon name="book" size={56} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <div className="b-h3 mb-2">{t.instructor.newCourse}</div>
          <Link href="/instructor/courses/new" className="btn btn-primary mt-4 inline-flex gap-2">
            <Icon name="plus" size={14} />
            {t.instructor.createCourse}
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Кесте тақырыбы */}
          <div
            className="grid px-6 py-3 b-xs font-semibold uppercase"
            style={{
              gridTemplateColumns: '3fr 1fr 1fr 1fr 100px',
              color: 'var(--b-text-3)',
              borderBottom: '1px solid var(--b-line)',
              letterSpacing: '0.06em',
            }}
          >
            <span>{t.instructor.courseTitle}</span>
            <span>{t.instructor.coursePrice}</span>
            <span>{t.instructor.totalStudents}</span>
            <span>{t.instructor.avgRating}</span>
            <span></span>
          </div>

          {filtered.map((course, i) => {
            const s = STATUS_MAP[course.status] ?? STATUS_MAP.draft
            return (
              <div
                key={course.id}
                className="grid px-6 py-4 items-center"
                style={{
                  gridTemplateColumns: '3fr 1fr 1fr 1fr 100px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--b-line-soft)' : 'none',
                }}
              >
                {/* Атауы + статус */}
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`thumb-grad-${(i % 8) + 1} rounded-lg shrink-0`}
                    style={{ width: 48, height: 48 }}
                  />
                  <div className="min-w-0">
                    <div className="b-sm font-semibold truncate">{title(course)}</div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ color: s.color, background: s.bg }}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>

                {/* Баға */}
                <div>
                  <div className="b-sm font-semibold">
                    {course.price ? `${course.price.toLocaleString('ru-RU')} ₸` : t.common.free}
                  </div>
                  {course.discount_price && (
                    <div className="b-xs line-through" style={{ color: 'var(--b-text-4)' }}>
                      {course.discount_price.toLocaleString('ru-RU')} ₸
                    </div>
                  )}
                </div>

                {/* Студент */}
                <div className="b-sm">{course.students_count ?? 0} {t.instructor.students}</div>

                {/* Рейтинг */}
                <div>
                  {course.rating ? (
                    <div className="flex items-center gap-1.5">
                      <Stars value={course.rating} size={13} />
                      <span className="b-xs">{course.rating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="b-xs" style={{ color: 'var(--b-text-4)' }}>—</span>
                  )}
                </div>

                {/* Әрекеттер */}
                <div className="flex items-center gap-1 justify-end">
                  <Link href={`/instructor/courses/${course.id}/edit`} className="btn btn-ghost btn-sm" title={t.instructor.edit}>
                    <Icon name="edit" size={14} />
                  </Link>
                  <Link href={`/courses/${course.id}`} className="btn btn-ghost btn-sm" title={t.instructor.viewCourse}>
                    <Icon name="eye" size={14} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
