'use client'

import Link from 'next/link'
import { useLang } from '@/components/providers/LangProvider'

interface Order {
  id: string
  total_amount: number
  payment_method: string | null
  payment_status: string
  created_at: string
  student: { full_name: string | null; email: string | null } | null
}

interface Props {
  orders: Order[]
  total: number
  page: number
  pageSize: number
  statusFilter: string
  totalRevenue: number
}

const STATUS_TABS = ['all', 'paid', 'pending', 'failed']

const STATUS_STYLE: Record<string, { kk: string; ru: string; en: string; color: string; bg: string }> = {
  paid:    { kk: 'Төленді',  ru: 'Оплачен', en: 'Paid',    color: '#059669', bg: '#d1fae5' },
  pending: { kk: 'Күтілуде', ru: 'Ожидает', en: 'Pending', color: '#d97706', bg: '#fef3c7' },
  failed:  { kk: 'Қате',     ru: 'Ошибка',  en: 'Failed',  color: '#dc2626', bg: '#fee2e2' },
}

const METHOD_LABEL: Record<string, string> = {
  stripe: 'Stripe',
  kaspi:  'Kaspi Pay',
  forte:  'ForteBank',
}

export default function AdminOrdersContent({ orders, total, page, pageSize, statusFilter, totalRevenue }: Props) {
  const { lang } = useLang()
  const totalPages = Math.ceil(total / pageSize)

  function sl(s: string) {
    const st = STATUS_STYLE[s]
    if (!st) return s
    return lang === 'kk' ? st.kk : lang === 'en' ? st.en : st.ru
  }

  function tabLabel(s: string) {
    if (s === 'all') return lang === 'kk' ? 'Барлығы' : lang === 'en' ? 'All' : 'Все'
    return sl(s)
  }

  return (
    <div className="admin-orders">
      <style>{`
        .admin-orders { padding: 24px 16px; }
        @media (min-width: 768px) { .admin-orders { padding: 40px 48px; } }
        .orders-summary { grid-template-columns: 1fr; }
        @media (min-width: 480px) { .orders-summary { grid-template-columns: repeat(3, 1fr); } }
        .orders-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .orders-table { min-width: 640px; }
      `}</style>

      <div className="mb-8">
        <div className="b-eyebrow mb-1">Admin</div>
        <h1 className="b-h1">{lang === 'kk' ? 'Тапсырыстар' : lang === 'en' ? 'Orders' : 'Заказы'}</h1>
      </div>

      {/* Revenue summary cards */}
      <div className="orders-summary grid gap-4 mb-8">
        <div className="card p-5">
          <div className="b-xs mb-1" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk' ? 'Жалпы сатылым' : lang === 'en' ? 'Total revenue' : 'Общий доход'}
          </div>
          <div className="b-h2">{Math.round(totalRevenue).toLocaleString('ru-RU')} ₸</div>
        </div>
        <div className="card p-5">
          <div className="b-xs mb-1" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk' ? 'Платформа үлесі (20%)' : lang === 'en' ? 'Platform share (20%)' : 'Доля платформы (20%)'}
          </div>
          <div className="b-h2" style={{ color: '#F59E0B' }}>{Math.round(totalRevenue * 0.2).toLocaleString('ru-RU')} ₸</div>
        </div>
        <div className="card p-5">
          <div className="b-xs mb-1" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk' ? 'Нұсқаушыларға (80%)' : lang === 'en' ? 'To instructors (80%)' : 'Инструкторам (80%)'}
          </div>
          <div className="b-h2" style={{ color: '#059669' }}>{Math.round(totalRevenue * 0.8).toLocaleString('ru-RU')} ₸</div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        {STATUS_TABS.map(s => (
          <Link key={s}
            href={`/admin/orders${s === 'all' ? '' : `?status=${s}`}`}
            className="px-4 py-2 rounded-lg b-sm font-medium transition-all"
            style={{
              background: statusFilter === s ? 'var(--b-primary)' : 'var(--b-bg-soft)',
              color: statusFilter === s ? '#fff' : 'var(--b-text-2)',
            }}
          >
            {tabLabel(s)}
          </Link>
        ))}
        <span className="ml-auto b-sm" style={{ color: 'var(--b-text-3)' }}>
          {lang === 'kk' ? `Жалпы: ${total}` : lang === 'en' ? `Total: ${total}` : `Всего: ${total}`}
        </span>
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="orders-table-wrap">
          <table className="orders-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg-soft)' }}>
                {[
                  'ID',
                  lang === 'kk' ? 'Студент' : lang === 'en' ? 'Student' : 'Студент',
                  lang === 'kk' ? 'Сома' : lang === 'en' ? 'Amount' : 'Сумма',
                  lang === 'kk' ? 'Төлем тәсілі' : lang === 'en' ? 'Method' : 'Метод',
                  lang === 'kk' ? 'Күй' : lang === 'en' ? 'Status' : 'Статус',
                  lang === 'kk' ? 'Күні' : lang === 'en' ? 'Date' : 'Дата',
                ].map(h => (
                  <th key={h} className="b-xs font-semibold text-left px-5 py-3" style={{ color: 'var(--b-text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 b-sm" style={{ color: 'var(--b-text-3)' }}>
                    {lang === 'kk' ? 'Тапсырыс жоқ' : lang === 'en' ? 'No orders' : 'Нет заказов'}
                  </td>
                </tr>
              ) : orders.map(o => {
                const st = STATUS_STYLE[o.payment_status] ?? STATUS_STYLE.pending
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
                    <td className="px-5 py-4 b-xs font-mono" style={{ color: 'var(--b-text-3)' }}>
                      {o.id.slice(0, 8)}…
                    </td>
                    <td className="px-5 py-4">
                      <div className="b-sm font-medium">{o.student?.full_name ?? '—'}</div>
                      <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>{o.student?.email ?? ''}</div>
                    </td>
                    <td className="px-5 py-4 b-sm font-semibold">
                      {(o.total_amount ?? 0).toLocaleString('ru-RU')} ₸
                    </td>
                    <td className="px-5 py-4 b-sm" style={{ color: 'var(--b-text-2)' }}>
                      {METHOD_LABEL[o.payment_method ?? ''] ?? (o.payment_method ?? '—')}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: st.color, background: st.bg }}>
                        {sl(o.payment_status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 b-xs" style={{ color: 'var(--b-text-3)' }}>
                      {new Date(o.created_at).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link key={p}
              href={`/admin/orders?${statusFilter !== 'all' ? `status=${statusFilter}&` : ''}page=${p}`}
              className="w-9 h-9 flex items-center justify-center rounded-lg b-sm font-medium transition-all"
              style={{
                background: page === p ? 'var(--b-primary)' : 'var(--b-bg-soft)',
                color: page === p ? '#fff' : 'var(--b-text-2)',
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
