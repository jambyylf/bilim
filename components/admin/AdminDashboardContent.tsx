'use client'

import Link from 'next/link'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'

interface Props {
  stats: { totalUsers: number; totalCourses: number; totalOrders: number; platformRevenue: number }
  pendingCourses: any[]
  recentOrders: any[]
}

/* ── SVG Charts ── */
function DualBars() {
  const data = [20,28,22,35,30,42,38,48,44,52,46,58,54,62,58,66,60,70,65,72,68,75,70,78,72,80,75,82,78,86]
  const max = 90
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 200 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 1, height: '100%' }}>
          <div style={{ flex: 1, height: (v / max) * 100 + '%', background: 'var(--b-primary)', borderRadius: 2 }}/>
          <div style={{ flex: 1, height: (Math.round(v * 0.55) / max) * 100 + '%', background: 'var(--b-accent)', borderRadius: 2 }}/>
        </div>
      ))}
    </div>
  )
}

function Donut() {
  const segs: [string, number][] = [['var(--b-primary)', 42], ['var(--b-accent)', 24], ['#0d9488', 18], ['#9CA3AF', 16]]
  const C = 2 * Math.PI * 60
  let cum = 0
  return (
    <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto' }}>
      <svg viewBox="0 0 160 160" width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
        {segs.map(([c, v], i) => {
          const len = (v / 100) * C
          const off = -((cum / 100) * C)
          cum += v
          return <circle key={i} cx="80" cy="80" r="60" fill="none" stroke={c} strokeWidth="22" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={off}/>
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="b-h2" style={{ fontSize: 26, lineHeight: 1 }}>248K</div>
        <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>visits/30d</div>
      </div>
    </div>
  )
}

export default function AdminDashboardContent({ stats, pendingCourses, recentOrders }: Props) {
  const { lang } = useLang()

  const tx = {
    title:    'Admin Console',
    sub:      lang === 'kk' ? 'Платформа шолуы' : lang === 'en' ? 'Platform overview' : 'Обзор платформы',
    users:    lang === 'kk' ? 'Қолданушылар'  : lang === 'en' ? 'Users'           : 'Пользователи',
    courses:  lang === 'kk' ? 'Курстар'        : lang === 'en' ? 'Courses'         : 'Курсы',
    revenue:  lang === 'kk' ? 'Кіріс'          : lang === 'en' ? 'Revenue'         : 'Доход',
    moderate: lang === 'kk' ? 'Модерацияда'    : lang === 'en' ? 'Pending review'  : 'На модерации',
    growth:   lang === 'kk' ? 'Платформа өсуі' : lang === 'en' ? 'Platform growth' : 'Рост платформы',
    traffic:  lang === 'kk' ? 'Трафик көздері' : lang === 'en' ? 'Traffic sources' : 'Источники трафика',
    topCats:  lang === 'kk' ? 'Топ категориялар' : lang === 'en' ? 'Top categories' : 'Топ категории',
    recentR:  lang === 'kk' ? 'Соңғы тапсырыстар' : lang === 'en' ? 'Recent orders' : 'Последние заказы',
    today:    lang === 'kk' ? 'Бүгін' : lang === 'en' ? 'Today' : 'Сегодня',
    export:   'Export CSV',
    reg:      lang === 'kk' ? 'Тіркелу' : lang === 'en' ? 'Signups' : 'Регистр.',
    purchases:lang === 'kk' ? 'Сатып алу' : lang === 'en' ? 'Purchases' : 'Покупки',
    name:     lang === 'kk' ? 'Аты' : lang === 'en' ? 'Name' : 'Имя',
    amount:   lang === 'kk' ? 'Сомасы' : lang === 'en' ? 'Amount' : 'Сумма',
    method:   lang === 'kk' ? 'Төлем' : lang === 'en' ? 'Method' : 'Способ',
    date:     lang === 'kk' ? 'Күні' : lang === 'en' ? 'Date' : 'Дата',
    status:   lang === 'kk' ? 'Статус' : lang === 'en' ? 'Status' : 'Статус',
  }

  const KPIs = [
    { label: tx.users,    value: stats.totalUsers.toLocaleString('ru-RU'),                    delta: '+1 240', sub: lang === 'kk' ? '7 күнде' : 'за 7 дней', deltaColor: 'var(--b-success)', highlight: false },
    { label: tx.courses,  value: stats.totalCourses.toLocaleString('ru-RU'),                  delta: '+24',    sub: '',                                         deltaColor: 'var(--b-success)', highlight: false },
    { label: tx.revenue,  value: `${Math.round(stats.platformRevenue / 1000)}K ₸`,             delta: '+12%',   sub: '',                                         deltaColor: 'var(--b-accent)',  highlight: true  },
    { label: tx.moderate, value: pendingCourses.length.toString(),                             delta: '!',      sub: '',                                         deltaColor: 'var(--b-error)',   highlight: false },
  ]

  const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    paid:    { label: lang === 'kk' ? 'Төленді'  : 'Оплачен',  color: '#059669', bg: 'rgba(5,150,105,0.1)' },
    pending: { label: lang === 'kk' ? 'Күтілуде' : 'Ожидает',  color: '#d97706', bg: '#fef3c7' },
    failed:  { label: lang === 'kk' ? 'Қате'     : 'Ошибка',   color: '#dc2626', bg: '#fee2e2' },
  }

  const CATS = [
    { name: lang === 'kk' ? 'Программалау' : 'Программирование', count: 186, pct: 92 },
    { name: lang === 'kk' ? 'Дизайн' : 'Дизайн',                 count: 124, pct: 78 },
    { name: lang === 'kk' ? 'Маркетинг' : 'Маркетинг',           count:  92, pct: 64 },
    { name: lang === 'kk' ? 'Бизнес' : 'Бизнес',                  count:  78, pct: 52 },
    { name: lang === 'kk' ? 'Тілдер' : 'Языки',                   count:  64, pct: 40 },
  ]

  return (
    <div style={{ padding: '28px 32px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="b-eyebrow" style={{ marginBottom: 6 }}>{tx.title}</div>
          <h1 className="b-h1" style={{ fontSize: 32 }}>{tx.sub}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="download" size={13} />{tx.export}
          </button>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {tx.today} <Icon name="chevronDown" size={12} />
          </button>
        </div>
      </div>

      {/* KPI 4-col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }} className="admin-kpi">
        {KPIs.map(({ label, value, delta, sub, deltaColor, highlight }) => (
          <div key={label} className="card" style={{
            padding: 18, border: 'none',
            background: highlight ? 'var(--b-text)' : 'var(--b-bg)',
            color: highlight ? 'var(--b-bg)' : 'inherit',
          }}>
            <div className="b-xs" style={{ color: highlight ? 'rgba(255,255,255,0.6)' : 'var(--b-text-3)', marginBottom: 6 }}>{label}</div>
            <div className="b-h2" style={{ fontSize: 24, color: highlight ? '#fff' : 'inherit' }}>{value}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: highlight ? 'var(--b-accent)' : deltaColor }}>{delta}</span>
              {sub && <span className="b-xs" style={{ color: highlight ? 'rgba(255,255,255,0.5)' : 'var(--b-text-3)' }}>{sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }} className="admin-charts">
        {/* DualBars */}
        <div className="card" style={{ padding: 20, background: 'var(--b-bg)', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 className="b-h4">{tx.growth}</h3>
              <p className="b-xs" style={{ color: 'var(--b-text-3)', marginTop: 2 }}>
                {lang === 'kk' ? 'Тіркелу vs сатып алу 30 күн' : 'Регистрации vs покупки за 30 дней'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--b-text-3)' }}>
                <span style={{ width: 8, height: 8, background: 'var(--b-primary)', borderRadius: 2 }}/>{tx.reg}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--b-text-3)' }}>
                <span style={{ width: 8, height: 8, background: 'var(--b-accent)', borderRadius: 2 }}/>{tx.purchases}
              </span>
            </div>
          </div>
          <DualBars />
        </div>

        {/* Donut */}
        <div className="card" style={{ padding: 20, background: 'var(--b-bg)', border: 'none' }}>
          <h3 className="b-h4" style={{ marginBottom: 4 }}>{tx.traffic}</h3>
          <p className="b-xs" style={{ color: 'var(--b-text-3)', marginBottom: 16 }}>
            {lang === 'kk' ? 'Трафик көздері' : 'Источники трафика'}
          </p>
          <Donut />
          <div className="hairline" style={{ marginTop: 16 }}>
            {[
              ['Organic', 42, 'var(--b-primary)'],
              ['Direct',  24, 'var(--b-accent)'],
              ['Social',  18, '#0d9488'],
              ['Referral',16, '#9CA3AF'],
            ].map(([n, v, c]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }}/>
                <span className="b-sm" style={{ flex: 1 }}>{n}</span>
                <span className="b-sm" style={{ fontWeight: 600 }}>{v}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }} className="admin-bottom">

        {/* Top categories */}
        <div className="card" style={{ padding: 20, background: 'var(--b-bg)', border: 'none' }}>
          <h3 className="b-h4" style={{ marginBottom: 16 }}>{tx.topCats}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CATS.map(({ name, count, pct }) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="b-sm" style={{ fontWeight: 500 }}>{name}</span>
                  <span className="b-xs" style={{ color: 'var(--b-text-3)' }}>
                    {count} {lang === 'kk' ? 'курс' : 'курсов'}
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--b-bg-soft)', borderRadius: 3 }}>
                  <div style={{ width: pct + '%', height: '100%', background: 'var(--b-primary)', borderRadius: 3 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders table */}
        <div className="card" style={{ padding: 0, background: 'var(--b-bg)', border: 'none', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="b-h4">{tx.recentR}</h3>
            <Link href="/admin/orders" className="btn btn-link b-sm">
              {lang === 'kk' ? 'Барлығы →' : 'Все →'}
            </Link>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 80px',
            gap: 12, padding: '10px 20px',
            background: 'var(--b-bg-soft)',
            borderTop: '1px solid var(--b-line)', borderBottom: '1px solid var(--b-line)',
          }}>
            {[tx.name, tx.amount, tx.method, tx.date, tx.status].map(h => (
              <div key={h} className="b-eyebrow">{h}</div>
            ))}
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                {lang === 'kk' ? 'Тапсырыс жоқ' : 'Нет заказов'}
              </div>
            </div>
          ) : recentOrders.slice(0, 6).map((o: any, i: number) => {
            const s = STATUS_MAP[o.payment_status] ?? STATUS_MAP.pending
            const name = o.student?.full_name ?? '—'
            return (
              <div key={o.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 80px',
                gap: 12, padding: '12px 20px',
                borderBottom: i < recentOrders.length - 1 ? '1px solid var(--b-line-soft)' : 'none',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--b-primary-50)', color: 'var(--b-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 11,
                  }}>
                    {name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="b-sm" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </span>
                </div>
                <span className="b-sm" style={{ fontWeight: 600 }}>
                  {(o.total_amount ?? 0).toLocaleString('ru-RU')} ₸
                </span>
                <span className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                  {o.payment_method ?? '—'}
                </span>
                <span className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                  {new Date(o.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
                  color: s.color, background: s.bg,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }}/>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending courses (if any) */}
      {pendingCourses.length > 0 && (
        <div className="card" style={{ marginTop: 16, padding: 0, background: 'var(--b-bg)', border: 'none', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--b-line)' }}>
            <h3 className="b-h4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {tx.moderate}
              <span style={{ background: 'var(--b-error)', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 700 }}>
                {pendingCourses.length}
              </span>
            </h3>
            <Link href="/admin/courses?status=pending" className="btn btn-link b-sm">
              {lang === 'kk' ? 'Барлығы →' : 'Все →'}
            </Link>
          </div>
          {pendingCourses.map((c: any, i: number) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < pendingCourses.length - 1 ? '1px solid var(--b-line-soft)' : 'none',
            }}>
              <div className="thumb-grad-1 rounded-lg" style={{ width: 44, height: 36, flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="b-sm" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.title_ru || c.title_kk}
                </div>
                <div className="b-xs" style={{ color: 'var(--b-text-3)', marginTop: 2 }}>
                  {c.instructor?.full_name}
                </div>
              </div>
              <Link href={`/admin/courses?review=${c.id}`} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                {lang === 'kk' ? 'Тексеру' : 'Проверить'}
              </Link>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .admin-kpi { grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 640px) { .admin-kpi { grid-template-columns: repeat(4, 1fr); } }
        .admin-charts { grid-template-columns: 1fr; }
        @media (min-width: 900px) { .admin-charts { grid-template-columns: 1.6fr 1fr; } }
        .admin-bottom { grid-template-columns: 1fr; }
        @media (min-width: 900px) { .admin-bottom { grid-template-columns: 1fr 1.6fr; } }
      `}</style>
    </div>
  )
}
