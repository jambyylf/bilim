'use client'

import Link from 'next/link'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'

interface Props {
  stats: { totalUsers: number; totalCourses: number; totalOrders: number; platformRevenue: number }
  pendingCourses: any[]
  recentOrders: any[]
}

export default function AdminDashboardContent({ stats, pendingCourses, recentOrders }: Props) {
  const { lang } = useLang()

  const KPI = [
    { icon: 'users',   label: lang === 'kk' ? 'Қолданушылар' : lang === 'en' ? 'Users'           : 'Пользователи', value: stats.totalUsers,                       color: '#3B82F6', bg: '#eff6ff' },
    { icon: 'book',    label: lang === 'kk' ? 'Барлық курс'  : lang === 'en' ? 'Total courses'    : 'Всего курсов',  value: stats.totalCourses,                     color: '#8B5CF6', bg: '#f5f3ff' },
    { icon: 'dollar',  label: lang === 'kk' ? 'Сатылым'      : lang === 'en' ? 'Paid orders'      : 'Продаж',        value: stats.totalOrders,                      color: '#059669', bg: '#d1fae5' },
    { icon: 'target',  label: lang === 'kk' ? 'Платформа кіріс' : lang === 'en' ? 'Platform revenue' : 'Доход платформы',
      value: `${Math.round(stats.platformRevenue).toLocaleString('ru-RU')} ₸`,                                        color: '#F59E0B', bg: '#fef3c7' },
  ]

  const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    paid:    { label: lang === 'kk' ? 'Төленді'  : lang === 'en' ? 'Paid'    : 'Оплачен',   color: '#059669', bg: '#d1fae5' },
    pending: { label: lang === 'kk' ? 'Күтілуде' : lang === 'en' ? 'Pending' : 'Ожидает',   color: '#d97706', bg: '#fef3c7' },
    failed:  { label: lang === 'kk' ? 'Қате'     : lang === 'en' ? 'Failed'  : 'Ошибка',    color: '#dc2626', bg: '#fee2e2' },
  }

  return (
    <div className="admin-dash">
      <style>{`
        .admin-dash { padding: 24px 16px; }
        @media (min-width: 768px) { .admin-dash { padding: 40px 48px; } }
        .admin-kpi { grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 640px) { .admin-kpi { grid-template-columns: repeat(4, 1fr); } }
        .admin-main-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) { .admin-main-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="mb-8">
        <div className="b-eyebrow mb-1">Admin</div>
        <h1 className="b-h1">{lang === 'kk' ? 'Шолу' : lang === 'en' ? 'Overview' : 'Обзор'}</h1>
      </div>

      {/* KPI */}
      <div className="admin-kpi grid gap-4 mb-8">
        {KPI.map(({ icon, label, value, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="b-sm font-medium" style={{ color: 'var(--b-text-3)' }}>{label}</span>
              <div style={{ background: bg, color, borderRadius: 8, padding: '6px 8px' }}>
                <Icon name={icon} size={18} />
              </div>
            </div>
            <div className="b-h1" style={{ lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="admin-main-grid grid gap-6">
        {/* Тексеруді күтетін курстар */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--b-line)' }}>
            <div className="b-h4">{lang === 'kk' ? 'Тексеруде' : lang === 'en' ? 'Pending review' : 'На проверке'}</div>
            <Link href="/admin/courses?status=pending" className="btn btn-link b-sm">
              {lang === 'kk' ? 'Барлығы →' : lang === 'en' ? 'View all →' : 'Все →'}
            </Link>
          </div>
          {pendingCourses.length === 0 ? (
            <div className="p-8 text-center b-sm" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk' ? 'Тексеретін курс жоқ' : lang === 'en' ? 'No courses pending' : 'Нет курсов на проверке'}
            </div>
          ) : pendingCourses.map((c: any) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
              <div className="thumb-grad-1 rounded-lg shrink-0" style={{ width: 40, height: 40 }} />
              <div className="flex-1 min-w-0">
                <div className="b-sm font-medium truncate">{c.title_ru || c.title_kk}</div>
                <div className="b-xs mt-0.5" style={{ color: 'var(--b-text-3)' }}>{c.instructor?.full_name}</div>
              </div>
              <Link href={`/admin/courses?review=${c.id}`} className="btn btn-primary btn-sm shrink-0">
                {lang === 'kk' ? 'Тексеру' : lang === 'en' ? 'Review' : 'Проверить'}
              </Link>
            </div>
          ))}
        </div>

        {/* Соңғы тапсырыстар */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--b-line)' }}>
            <div className="b-h4">{lang === 'kk' ? 'Соңғы тапсырыстар' : lang === 'en' ? 'Recent orders' : 'Последние заказы'}</div>
            <Link href="/admin/orders" className="btn btn-link b-sm">
              {lang === 'kk' ? 'Барлығы →' : lang === 'en' ? 'View all →' : 'Все →'}
            </Link>
          </div>
          {recentOrders.map((o: any) => {
            const s = STATUS_MAP[o.payment_status] ?? STATUS_MAP.pending
            return (
              <div key={o.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
                <div className="min-w-0 flex-1">
                  <div className="b-sm font-medium truncate">{o.student?.full_name ?? '—'}</div>
                  <div className="b-xs mt-0.5" style={{ color: 'var(--b-text-3)' }}>
                    {new Date(o.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="b-sm font-semibold">{(o.total_amount ?? 0).toLocaleString('ru-RU')} ₸</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: s.color, background: s.bg }}>{s.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
