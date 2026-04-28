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
  deleted_at: string | null
  instructor: { id: string; full_name: string | null } | null
}

interface Props {
  courses: Course[]
  statusFilter: string
  reviewId?: string
}

const STATUS_TABS = ['all', 'pending', 'published', 'draft', 'rejected', 'trash']

const STATUS_STYLE: Record<string, { label_kk: string; label_ru: string; color: string; bg: string }> = {
  published: { label_kk: 'Жарияланды',   label_ru: 'Опубликован',  color: '#059669', bg: '#d1fae5' },
  pending:   { label_kk: 'Тексеруде',    label_ru: 'На проверке',  color: '#d97706', bg: '#fef3c7' },
  draft:     { label_kk: 'Жоба',         label_ru: 'Черновик',     color: '#6b7280', bg: '#f3f4f6' },
  rejected:  { label_kk: 'Қабылданбады', label_ru: 'Отклонён',    color: '#dc2626', bg: '#fee2e2' },
  deleted:   { label_kk: 'Жойылды',      label_ru: 'Удалён',       color: '#7c3aed', bg: '#ede9fe' },
}

function daysLeft(deletedAt: string | null): number {
  if (!deletedAt) return 7
  const diff = Date.now() - new Date(deletedAt).getTime()
  return Math.max(0, 7 - Math.floor(diff / 86400000))
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
    return lang === 'kk' ? st.label_kk : st.label_ru
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

  async function hardDelete(courseId: string) {
    if (!confirm(lang === 'kk' ? 'Мәңгілік жоясыз ба?' : 'Удалить навсегда?')) return
    setLoading(courseId + 'hard')
    await fetch('/api/admin/courses/status', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })
    setLoading(null)
    router.refresh()
  }

  const TAB_LABELS: Record<string, string> = {
    all:       lang === 'kk' ? 'Барлығы'       : 'Все',
    pending:   lang === 'kk' ? 'Тексеруде'     : 'На проверке',
    published: lang === 'kk' ? 'Жарияланған'   : 'Опубликованные',
    draft:     lang === 'kk' ? 'Жоба'          : 'Черновики',
    rejected:  lang === 'kk' ? 'Қабылданбаған' : 'Отклонённые',
    trash:     lang === 'kk' ? '🗑 Себет'       : '🗑 Корзина',
  }

  const displayCourses = statusFilter === 'trash'
    ? courses.filter(c => c.status === 'deleted')
    : statusFilter === 'all'
    ? courses.filter(c => c.status !== 'deleted')
    : courses.filter(c => c.status === statusFilter)

  return (
    <div className="admin-courses-wrap">
      <style>{`
        .admin-courses-wrap { padding: 24px 16px; }
        @media (min-width: 768px) { .admin-courses-wrap { padding: 40px 48px; } }
        .admin-courses-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .admin-courses-table { min-width: 680px; }
      `}</style>
      <div className="mb-8">
        <div className="b-eyebrow mb-1">Admin</div>
        <h1 className="b-h1">{lang === 'kk' ? 'Курстар' : 'Курсы'}</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map(s => (
          <Link
            key={s}
            href={`/admin/courses${s === 'all' ? '' : `?status=${s}`}`}
            className="px-4 py-2 rounded-lg b-sm font-medium transition-all"
            style={{
              background: statusFilter === s ? (s === 'trash' ? '#7c3aed' : 'var(--b-primary)') : 'var(--b-bg-soft)',
              color: statusFilter === s ? '#fff' : 'var(--b-text-2)',
            }}
          >
            {TAB_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Себет ескертуі */}
      {statusFilter === 'trash' && (
        <div className="p-4 rounded-xl mb-5 flex items-center gap-3 b-sm"
          style={{ background: '#ede9fe', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
          <Icon name="clock" size={16} />
          {lang === 'kk'
            ? 'Жойылған курстар 7 күн себетте сақталады. Осы мерзімде қалпына келтіруге болады.'
            : 'Удалённые курсы хранятся в корзине 7 дней. В течение этого времени их можно восстановить.'}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="admin-courses-table-wrap">
          <table className="admin-courses-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg-soft)' }}>
                {[
                  lang === 'kk' ? 'Курс' : 'Курс',
                  lang === 'kk' ? 'Нұсқаушы' : 'Инструктор',
                  lang === 'kk' ? 'Баға' : 'Цена',
                  lang === 'kk' ? 'Күй' : 'Статус',
                  lang === 'kk' ? 'Күні' : 'Дата',
                  lang === 'kk' ? 'Әрекет' : 'Действия',
                ].map(h => (
                  <th key={h} className="b-xs font-semibold text-left px-5 py-3" style={{ color: 'var(--b-text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 b-sm" style={{ color: 'var(--b-text-3)' }}>
                    {lang === 'kk' ? 'Курс табылмады' : 'Курсы не найдены'}
                  </td>
                </tr>
              ) : displayCourses.map(c => {
                const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft
                const days = daysLeft(c.deleted_at)
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="thumb-grad-1 rounded-lg shrink-0" style={{ width: 40, height: 40 }} />
                        <div className="min-w-0">
                          <div className="b-sm font-medium truncate" style={{ maxWidth: 200 }}>{title(c)}</div>
                          <div className="b-xs mt-0.5" style={{ color: 'var(--b-text-3)' }}>{c.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 b-sm">{c.instructor?.full_name ?? '—'}</td>
                    <td className="px-5 py-4 b-sm font-semibold">
                      {c.price === 0 ? (lang === 'kk' ? 'Тегін' : 'Бесплатно') : `${c.price.toLocaleString('ru-RU')} ₸`}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: st.color, background: st.bg }}>
                          {statusLabel(c.status)}
                        </span>
                        {c.status === 'deleted' && (
                          <div className="b-xs mt-1" style={{ color: '#7c3aed' }}>
                            {days > 0
                              ? (lang === 'kk' ? `${days} күн қалды` : `${days} дн. осталось`)
                              : (lang === 'kk' ? 'Бүгін жойылады' : 'Удаляется сегодня')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 b-xs" style={{ color: 'var(--b-text-3)' }}>
                      {new Date(c.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {c.status === 'deleted' ? (
                          <>
                            <button
                              onClick={() => updateStatus(c.id, 'rejected')}
                              disabled={loading !== null}
                              className="btn btn-sm"
                              style={{ background: '#059669', color: '#fff', borderColor: '#059669' }}
                            >
                              {loading === c.id + 'rejected' ? '...' : (lang === 'kk' ? 'Қалпына келтіру' : 'Восстановить')}
                            </button>
                            <button
                              onClick={() => hardDelete(c.id)}
                              disabled={loading !== null}
                              className="btn btn-sm"
                              style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
                            >
                              {loading === c.id + 'hard' ? '...' : (lang === 'kk' ? 'Мәңгілік жою' : 'Удалить навсегда')}
                            </button>
                          </>
                        ) : (
                          <>
                            <Link href={`/courses/${c.slug}`} target="_blank" className="btn btn-ghost btn-sm">
                              <Icon name="arrow" size={14} />
                            </Link>
                            <button onClick={() => setReviewCourse(c)} className="btn btn-secondary btn-sm">
                              {lang === 'kk' ? 'Тексеру' : 'Проверить'}
                            </button>
                            {c.status === 'rejected' && (
                              <button
                                onClick={() => updateStatus(c.id, 'deleted')}
                                disabled={loading !== null}
                                className="btn btn-sm"
                                style={{ background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' }}
                              >
                                {loading === c.id + 'deleted' ? '...' : (lang === 'kk' ? 'Жою' : 'Удалить')}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review modal */}
      {reviewCourse && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setReviewCourse(null)}>
          <div className="card p-8 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="b-eyebrow mb-1">{lang === 'kk' ? 'Тексеру' : 'Проверка'}</div>
                <h2 className="b-h3">{title(reviewCourse)}</h2>
                <div className="b-sm mt-1" style={{ color: 'var(--b-text-3)' }}>{reviewCourse.instructor?.full_name}</div>
              </div>
              <button onClick={() => setReviewCourse(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="p-3 rounded-xl" style={{ background: 'var(--b-bg-soft)' }}>
                <div className="b-xs mb-0.5" style={{ color: 'var(--b-text-3)' }}>{lang === 'kk' ? 'Баға' : 'Цена'}</div>
                <div className="b-sm font-semibold">
                  {reviewCourse.price === 0 ? (lang === 'kk' ? 'Тегін' : 'Бесплатно') : `${reviewCourse.price.toLocaleString('ru-RU')} ₸`}
                </div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--b-bg-soft)' }}>
                <div className="b-xs mb-0.5" style={{ color: 'var(--b-text-3)' }}>{lang === 'kk' ? 'Күй' : 'Статус'}</div>
                <div className="b-sm font-semibold">{statusLabel(reviewCourse.status)}</div>
              </div>
            </div>

            <Link href={`/courses/${reviewCourse.slug}`} target="_blank"
              className="btn btn-ghost btn-sm mb-6 w-full" style={{ justifyContent: 'center' }}>
              {lang === 'kk' ? 'Курсты ашу' : 'Открыть курс'} <Icon name="arrow" size={14} />
            </Link>

            <div className="flex gap-3">
              <button onClick={() => updateStatus(reviewCourse.id, 'published')}
                disabled={loading !== null} className="btn btn-primary flex-1"
                style={{ justifyContent: 'center', background: '#059669', borderColor: '#059669' }}>
                {loading === reviewCourse.id + 'published' ? '...' : (lang === 'kk' ? 'Жариялау' : 'Одобрить')}
              </button>
              <button onClick={() => updateStatus(reviewCourse.id, 'rejected')}
                disabled={loading !== null} className="btn flex-1"
                style={{ justifyContent: 'center', background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}>
                {loading === reviewCourse.id + 'rejected' ? '...' : (lang === 'kk' ? 'Қабылдамау' : 'Отклонить')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
