'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'

interface Course {
  id: string
  title_ru: string | null
  title_kk: string | null
  title_en: string | null
  slug: string
  status: string
  price: number
  created_at: string
  instructor: { id: string; full_name: string | null; email: string | null } | null
}

interface Props {
  courses: Course[]
  statusFilter: string
  reviewId?: string
}

const STATUS_TABS = ['all', 'pending', 'published', 'draft', 'rejected']

const STATUS_STYLE: Record<string, { label_kk: string; label_ru: string; label_en: string; color: string; bg: string }> = {
  published: { label_kk: 'Жарияланды', label_ru: 'Опубликован', label_en: 'Published', color: '#059669', bg: '#d1fae5' },
  pending:   { label_kk: 'Тексеруде',  label_ru: 'На проверке', label_en: 'Pending',   color: '#d97706', bg: '#fef3c7' },
  draft:     { label_kk: 'Жоба',       label_ru: 'Черновик',    label_en: 'Draft',     color: '#6b7280', bg: '#f3f4f6' },
  rejected:  { label_kk: 'Қабылданбады', label_ru: 'Отклонён',  label_en: 'Rejected',  color: '#dc2626', bg: '#fee2e2' },
}

export default function AdminCoursesContent({ courses, statusFilter, reviewId }: Props) {
  const { lang } = useLang()
  const router   = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [reviewCourse, setReviewCourse] = useState<Course | null>(
    reviewId ? courses.find(c => c.id === reviewId) ?? null : null
  )

  function title(c: Course) {
    return (lang === 'kk' ? c.title_kk : lang === 'en' ? c.title_en : c.title_ru) ?? c.title_ru ?? '—'
  }

  function statusLabel(s: string) {
    const st = STATUS_STYLE[s]
    if (!st) return s
    return lang === 'kk' ? st.label_kk : lang === 'en' ? st.label_en : st.label_ru
  }

  async function updateStatus(courseId: string, newStatus: string) {
    setLoading(courseId + newStatus)
    await fetch('/api/admin/courses/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, status: newStatus }),
    })
    setLoading(null)
    setReviewCourse(null)
    router.refresh()
  }

  const TAB_LABELS: Record<string, string> = {
    all:       lang === 'kk' ? 'Барлығы'       : lang === 'en' ? 'All'       : 'Все',
    pending:   lang === 'kk' ? 'Тексеруде'     : lang === 'en' ? 'Pending'   : 'На проверке',
    published: lang === 'kk' ? 'Жарияланған'   : lang === 'en' ? 'Published' : 'Опубликованные',
    draft:     lang === 'kk' ? 'Жоба'          : lang === 'en' ? 'Draft'     : 'Черновики',
    rejected:  lang === 'kk' ? 'Қабылданбаған' : lang === 'en' ? 'Rejected'  : 'Отклонённые',
  }

  return (
    <div style={{ padding: '40px 48px' }}>
      <div className="mb-8">
        <div className="b-eyebrow mb-1">Admin</div>
        <h1 className="b-h1">{lang === 'kk' ? 'Курстар' : lang === 'en' ? 'Courses' : 'Курсы'}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map(s => (
          <Link
            key={s}
            href={`/admin/courses${s === 'all' ? '' : `?status=${s}`}`}
            className="px-4 py-2 rounded-lg b-sm font-medium transition-all"
            style={{
              background: statusFilter === s ? 'var(--b-primary)' : 'var(--b-bg-soft)',
              color: statusFilter === s ? '#fff' : 'var(--b-text-2)',
            }}
          >
            {TAB_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg-soft)' }}>
              {[
                lang === 'kk' ? 'Курс' : lang === 'en' ? 'Course' : 'Курс',
                lang === 'kk' ? 'Нұсқаушы' : lang === 'en' ? 'Instructor' : 'Инструктор',
                lang === 'kk' ? 'Баға' : lang === 'en' ? 'Price' : 'Цена',
                lang === 'kk' ? 'Күй' : lang === 'en' ? 'Status' : 'Статус',
                lang === 'kk' ? 'Күні' : lang === 'en' ? 'Date' : 'Дата',
                lang === 'kk' ? 'Әрекет' : lang === 'en' ? 'Actions' : 'Действия',
              ].map(h => (
                <th key={h} className="b-xs font-semibold text-left px-5 py-3" style={{ color: 'var(--b-text-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 b-sm" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'Курс табылмады' : lang === 'en' ? 'No courses found' : 'Курсы не найдены'}
                </td>
              </tr>
            ) : courses.map(c => {
              const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="thumb-grad-1 rounded-lg shrink-0" style={{ width: 40, height: 40, flexShrink: 0 }} />
                      <div className="min-w-0">
                        <div className="b-sm font-medium truncate" style={{ maxWidth: 200 }}>{title(c)}</div>
                        <div className="b-xs mt-0.5" style={{ color: 'var(--b-text-3)' }}>{c.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="b-sm">{c.instructor?.full_name ?? '—'}</div>
                    <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>{c.instructor?.email ?? ''}</div>
                  </td>
                  <td className="px-5 py-4 b-sm font-semibold">
                    {c.price === 0
                      ? (lang === 'kk' ? 'Тегін' : lang === 'en' ? 'Free' : 'Бесплатно')
                      : `${c.price.toLocaleString('ru-RU')} ₸`}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: st.color, background: st.bg }}>
                      {statusLabel(c.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 b-xs" style={{ color: 'var(--b-text-3)' }}>
                    {new Date(c.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/courses/${c.slug}`} target="_blank"
                        className="btn btn-ghost btn-sm" title="View">
                        <Icon name="arrow" size={14} />
                      </Link>
                      <button onClick={() => setReviewCourse(c)} className="btn btn-secondary btn-sm">
                        {lang === 'kk' ? 'Тексеру' : lang === 'en' ? 'Review' : 'Проверить'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Review modal */}
      {reviewCourse && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setReviewCourse(null)}
        >
          <div className="card p-8 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="b-eyebrow mb-1">{lang === 'kk' ? 'Тексеру' : lang === 'en' ? 'Review' : 'Проверка'}</div>
                <h2 className="b-h3">{title(reviewCourse)}</h2>
                <div className="b-sm mt-1" style={{ color: 'var(--b-text-3)' }}>{reviewCourse.instructor?.full_name}</div>
              </div>
              <button onClick={() => setReviewCourse(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="p-3 rounded-xl" style={{ background: 'var(--b-bg-soft)' }}>
                <div className="b-xs mb-0.5" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'Баға' : lang === 'en' ? 'Price' : 'Цена'}
                </div>
                <div className="b-sm font-semibold">
                  {reviewCourse.price === 0
                    ? (lang === 'kk' ? 'Тегін' : lang === 'en' ? 'Free' : 'Бесплатно')
                    : `${reviewCourse.price.toLocaleString('ru-RU')} ₸`}
                </div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--b-bg-soft)' }}>
                <div className="b-xs mb-0.5" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'Күй' : lang === 'en' ? 'Status' : 'Статус'}
                </div>
                <div className="b-sm font-semibold">{statusLabel(reviewCourse.status)}</div>
              </div>
            </div>

            <Link href={`/courses/${reviewCourse.slug}`} target="_blank"
              className="btn btn-ghost btn-sm mb-6 w-full" style={{ justifyContent: 'center' }}>
              {lang === 'kk' ? 'Курсты ашу' : lang === 'en' ? 'Open course' : 'Открыть курс'}
              <Icon name="arrow" size={14} />
            </Link>

            <div className="flex gap-3">
              <button
                onClick={() => updateStatus(reviewCourse.id, 'published')}
                disabled={loading !== null}
                className="btn btn-primary flex-1"
                style={{ justifyContent: 'center', background: '#059669', borderColor: '#059669' }}
              >
                {loading === reviewCourse.id + 'published'
                  ? '...'
                  : (lang === 'kk' ? 'Жариялау' : lang === 'en' ? 'Approve' : 'Одобрить')}
              </button>
              <button
                onClick={() => updateStatus(reviewCourse.id, 'rejected')}
                disabled={loading !== null}
                className="btn flex-1"
                style={{ justifyContent: 'center', background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
              >
                {loading === reviewCourse.id + 'rejected'
                  ? '...'
                  : (lang === 'kk' ? 'Қабылдамау' : lang === 'en' ? 'Reject' : 'Отклонить')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
