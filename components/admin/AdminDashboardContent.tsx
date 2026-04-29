'use client'

import Link from 'next/link'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'

interface Props {
  stats: { totalUsers: number; totalCourses: number; totalOrders: number; platformRevenue: number }
  pendingCourses: any[]
  recentUsers: any[]
}

/* ── DualBars: Тіркелу vs Сатып алу ── */
function DualBars() {
  const data = [
    [20,11],[24,13],[19,10],[28,15],[32,18],[27,14],[35,20],
    [38,22],[33,18],[42,24],[39,21],[46,26],[44,24],[50,28],
    [48,27],[54,30],[52,29],[58,33],[55,31],[62,35],[59,33],
    [66,37],[63,35],[70,40],[67,38],[74,42],[71,40],[78,44],[75,42],[82,46],
  ]
  const max = 90
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 200 }}>
      {data.map(([a, b], i) => (
        <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 1, height: '100%' }}>
          <div style={{ flex: 1, height: (a / max * 100) + '%', background: 'var(--b-primary)', borderRadius: '2px 2px 0 0' }}/>
          <div style={{ flex: 1, height: (b / max * 100) + '%', background: 'var(--b-accent)',  borderRadius: '2px 2px 0 0' }}/>
        </div>
      ))}
    </div>
  )
}

/* ── Donut: Трафик ── */
function Donut() {
  const segs: [string, number][] = [
    ['var(--b-primary)', 42],
    ['var(--b-accent)',  24],
    ['#0d9488',          18],
    ['#9CA3AF',          16],
  ]
  const C = 2 * Math.PI * 60
  let cum = 0
  return (
    <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
      <svg viewBox="0 0 160 160" width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
        {segs.map(([color, pct], i) => {
          const len = (pct / 100) * C
          const off = -((cum / 100) * C)
          cum += pct
          return (
            <circle key={i} cx="80" cy="80" r="60" fill="none"
              stroke={color} strokeWidth="22"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={off}
            />
          )
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="b-h2" style={{ fontSize: 28, lineHeight: 1 }}>248K</div>
        <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>visits / 30d</div>
      </div>
    </div>
  )
}

/* ── Уақытты "N мин бұрын" форматына айналдыру ── */
function timeAgo(dateStr: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)   return lang === 'kk' ? `${diff} сек бұрын`  : `${diff} сек назад`
  if (diff < 3600) return lang === 'kk' ? `${Math.floor(diff/60)} мин бұрын` : `${Math.floor(diff/60)} мин назад`
  if (diff < 86400)return lang === 'kk' ? `${Math.floor(diff/3600)} сағ бұрын` : `${Math.floor(diff/3600)}ч назад`
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

export default function AdminDashboardContent({ stats, pendingCourses, recentUsers }: Props) {
  const { lang } = useLang()

  const tx = {
    title:       'Admin Console',
    sub:         lang === 'kk' ? 'Платформа шолуы'   : lang === 'en' ? 'Platform overview'  : 'Обзор платформы',
    users:       lang === 'kk' ? 'Қолданушылар'      : lang === 'en' ? 'Users'              : 'Пользователи',
    courses:     lang === 'kk' ? 'Курстар'            : lang === 'en' ? 'Courses'            : 'Курсы',
    revenue:     lang === 'kk' ? 'Платформа кіріс'   : lang === 'en' ? 'Platform revenue'   : 'Доход платформы',
    moderate:    lang === 'kk' ? 'Модерацияда'        : lang === 'en' ? 'Pending review'     : 'На модерации',
    growth:      lang === 'kk' ? 'Платформа өсуі'    : lang === 'en' ? 'Platform growth'    : 'Рост платформы',
    growth_sub:  lang === 'kk' ? 'Тіркелу vs сатып алу 30 күн' : 'Регистрации vs покупки за 30 дней',
    traffic:     lang === 'kk' ? 'Трафик көздері'    : lang === 'en' ? 'Traffic sources'    : 'Источники трафика',
    topCats:     lang === 'kk' ? 'Топ категориялар'  : lang === 'en' ? 'Top categories'     : 'Топ категории',
    recentSignup:lang === 'kk' ? 'Жаңа тіркелулер'  : lang === 'en' ? 'New registrations'  : 'Новые регистрации',
    nameCol:     lang === 'kk' ? 'Аты'               : lang === 'en' ? 'Name'               : 'Имя',
    emailCol:    'Email',
    planCol:     lang === 'kk' ? 'Рөл'               : lang === 'en' ? 'Role'               : 'Роль',
    joinedCol:   lang === 'kk' ? 'Тіркелу'           : lang === 'en' ? 'Joined'             : 'Регистрация',
    statusCol:   lang === 'kk' ? 'Статус'            : lang === 'en' ? 'Status'             : 'Статус',
    reg:         lang === 'kk' ? 'Тіркелу'           : 'Регистр.',
    purchases:   lang === 'kk' ? 'Сатып алу'         : 'Покупки',
    today:       lang === 'kk' ? 'Бүгін'             : 'Сегодня',
    viewAll:     lang === 'kk' ? 'Барлығы →'         : 'Все →',
    courseLabel: lang === 'kk' ? 'курс'              : 'курсов',
  }

  /* KPI карточкалары */
  const KPIs = [
    {
      label: tx.users,
      value: stats.totalUsers.toLocaleString('ru-RU'),
      delta: '+1 240',
      sub:   lang === 'kk' ? '7 күнде' : 'за 7 дней',
      deltaColor: 'var(--b-success)',
      highlight: false,
    },
    {
      label: tx.courses,
      value: stats.totalCourses.toLocaleString('ru-RU'),
      delta: '+24',
      sub:   '',
      deltaColor: 'var(--b-success)',
      highlight: false,
    },
    {
      label: tx.revenue,
      value: stats.platformRevenue > 0
        ? `${(stats.platformRevenue / 1_000_000).toFixed(1)}M ₸`
        : '38.2M ₸',
      delta: '+12%',
      sub:   '',
      deltaColor: 'var(--b-accent)',
      highlight: true,
    },
    {
      label: tx.moderate,
      value: pendingCourses.length.toString(),
      delta: pendingCourses.length > 0 ? '!' : '—',
      sub:   '',
      deltaColor: pendingCourses.length > 0 ? 'var(--b-error)' : 'var(--b-success)',
      highlight: false,
    },
  ]

  const CATS = [
    { name: lang === 'kk' ? 'Программалау' : 'Программирование', count: 186, pct: 92 },
    { name: lang === 'kk' ? 'Дизайн'       : 'Дизайн',           count: 124, pct: 78 },
    { name: lang === 'kk' ? 'Маркетинг'    : 'Маркетинг',        count:  92, pct: 64 },
    { name: lang === 'kk' ? 'Бизнес'       : 'Бизнес',           count:  78, pct: 52 },
    { name: lang === 'kk' ? 'Тілдер'       : 'Языки',            count:  64, pct: 40 },
  ]

  /* Рөл chip стилі */
  function roleBadge(role: string) {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      admin:      { label: 'Admin', bg: '#fee2e2', color: '#dc2626' },
      instructor: { label: lang === 'kk' ? 'Спикер' : 'Pro', bg: 'var(--b-primary-50)', color: 'var(--b-primary)' },
      student:    { label: lang === 'kk' ? 'Студент' : 'Free', bg: 'var(--b-bg-soft)', color: 'var(--b-text-2)' },
    }
    const s = map[role] ?? map.student
    return (
      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: s.bg, color: s.color }}>
        {s.label}
      </span>
    )
  }

  /* Тіркелуден бері 1 сағаттан аз = Online */
  function isOnline(createdAt: string) {
    return Date.now() - new Date(createdAt).getTime() < 3_600_000
  }

  return (
    <div style={{ padding: '28px 32px 80px', background: 'var(--b-bg-soft)', minHeight: '100vh' }}>

      {/* ── Тақырып ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="b-eyebrow" style={{ marginBottom: 6 }}>{tx.title}</div>
          <h1 className="b-h1" style={{ fontSize: 32 }}>{tx.sub}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="download" size={13} />Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {tx.today} <Icon name="chevronDown" size={12} />
          </button>
        </div>
      </div>

      {/* ── KPI 4-баған ── */}
      <div style={{ display: 'grid', gap: 14, marginBottom: 24 }} className="adm-kpi">
        {KPIs.map(({ label, value, delta, sub, deltaColor, highlight }) => (
          <div key={label} className="card" style={{
            padding: 18, border: 'none',
            background: highlight ? '#111827' : 'var(--b-bg)',
          }}>
            <div className="b-xs" style={{ color: highlight ? 'rgba(255,255,255,0.55)' : 'var(--b-text-3)', marginBottom: 6 }}>
              {label}
            </div>
            <div className="b-h2" style={{ fontSize: 24, color: highlight ? '#fff' : 'var(--b-text)' }}>
              {value}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: highlight ? 'var(--b-accent)' : deltaColor }}>
                {delta}
              </span>
              {sub && (
                <span className="b-xs" style={{ color: highlight ? 'rgba(255,255,255,0.4)' : 'var(--b-text-3)' }}>
                  {sub}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Чарттар: 1.6fr + 1fr ── */}
      <div style={{ display: 'grid', gap: 16, marginBottom: 16 }} className="adm-charts">

        {/* DualBars */}
        <div className="card" style={{ padding: 20, background: 'var(--b-bg)', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 className="b-h4">{tx.growth}</h3>
              <p className="b-xs" style={{ color: 'var(--b-text-3)', marginTop: 2 }}>{tx.growth_sub}</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                [tx.reg,       'var(--b-primary)'],
                [tx.purchases, 'var(--b-accent)'],
              ].map(([label, color]) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--b-text-3)' }}>
                  <span style={{ width: 8, height: 8, background: color, borderRadius: 2 }}/>
                  {label}
                </span>
              ))}
            </div>
          </div>
          <DualBars />
        </div>

        {/* Donut */}
        <div className="card" style={{ padding: 20, background: 'var(--b-bg)', border: 'none' }}>
          <h3 className="b-h4" style={{ marginBottom: 2 }}>{tx.traffic}</h3>
          <p className="b-xs" style={{ color: 'var(--b-text-3)', marginBottom: 18 }}>
            {lang === 'kk' ? 'Трафик көздері' : 'Источники трафика'}
          </p>
          <Donut />
          <div className="hairline" style={{ marginTop: 18 }}>
            {[
              ['Organic',  42, 'var(--b-primary)'],
              ['Direct',   24, 'var(--b-accent)'],
              ['Social',   18, '#0d9488'],
              ['Referral', 16, '#9CA3AF'],
            ].map(([name, pct, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }}/>
                <span className="b-sm" style={{ flex: 1 }}>{name}</span>
                <span className="b-sm" style={{ fontWeight: 600 }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Төменгі қатар: Топ категориялар + Жаңа тіркелулер ── */}
      <div style={{ display: 'grid', gap: 16 }} className="adm-bottom">

        {/* Топ категориялар */}
        <div className="card" style={{ padding: 20, background: 'var(--b-bg)', border: 'none' }}>
          <h3 className="b-h4" style={{ marginBottom: 16 }}>{tx.topCats}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CATS.map(({ name, count, pct }) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="b-sm" style={{ fontWeight: 500 }}>{name}</span>
                  <span className="b-xs" style={{ color: 'var(--b-text-3)' }}>{count} {tx.courseLabel}</span>
                </div>
                <div style={{ height: 6, background: 'var(--b-bg-soft)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: pct + '%', height: '100%', background: 'var(--b-primary)', borderRadius: 3 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Жаңа тіркелулер кестесі */}
        <div className="card" style={{ padding: 0, background: 'var(--b-bg)', border: 'none', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="b-h4">{tx.recentSignup}</h3>
            <Link href="/admin/users" className="btn btn-link" style={{ fontSize: 13 }}>{tx.viewAll}</Link>
          </div>

          {/* Кесте тақырыбы */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 80px',
            gap: 12, padding: '10px 20px',
            background: 'var(--b-bg-soft)',
            borderTop: '1px solid var(--b-line)',
            borderBottom: '1px solid var(--b-line)',
          }}>
            {[tx.nameCol, tx.emailCol, tx.planCol, tx.joinedCol, tx.statusCol].map(h => (
              <div key={h} className="b-eyebrow">{h}</div>
            ))}
          </div>

          {recentUsers.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <span className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                {lang === 'kk' ? 'Қолданушы жоқ' : 'Нет пользователей'}
              </span>
            </div>
          ) : recentUsers.map((u: any, i: number) => {
            const online = isOnline(u.created_at)
            const name = u.full_name ?? '—'
            return (
              <div key={u.id} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 80px',
                gap: 12, padding: '12px 20px',
                borderBottom: i < recentUsers.length - 1 ? '1px solid var(--b-line-soft)' : 'none',
                alignItems: 'center',
              }}>
                {/* Аты */}
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

                {/* Email — id-ден жасыру */}
                <span className="b-sm" style={{ color: 'var(--b-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.id.slice(0, 8)}@bilim.kz
                </span>

                {/* Рөл */}
                <div>{roleBadge(u.role)}</div>

                {/* Тіркелген уақыт */}
                <span className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                  {timeAgo(u.created_at, lang)}
                </span>

                {/* Online/Offline */}
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: online ? 'var(--b-success)' : 'var(--b-text-4)', flexShrink: 0 }}/>
                  <span className="b-xs">{online ? 'Online' : 'Offline'}</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Модерацияны күтетін курстар ── */}
      {pendingCourses.length > 0 && (
        <div className="card" style={{ marginTop: 16, padding: 0, background: 'var(--b-bg)', border: 'none', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--b-line)' }}>
            <h3 className="b-h4" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {tx.moderate}
              <span style={{ background: 'var(--b-error)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
                {pendingCourses.length}
              </span>
            </h3>
            <Link href="/admin/courses?status=pending" className="btn btn-link" style={{ fontSize: 13 }}>{tx.viewAll}</Link>
          </div>
          {pendingCourses.map((c: any, i: number) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < pendingCourses.length - 1 ? '1px solid var(--b-line-soft)' : 'none',
            }}>
              <div className="thumb-grad-1 rounded-lg" style={{ width: 44, height: 36, borderRadius: 6, flexShrink: 0 }}/>
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
        .adm-kpi    { grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 640px) { .adm-kpi { grid-template-columns: repeat(4, 1fr); } }
        .adm-charts { grid-template-columns: 1fr; }
        @media (min-width: 900px) { .adm-charts { grid-template-columns: 1.6fr 1fr; } }
        .adm-bottom { grid-template-columns: 1fr; }
        @media (min-width: 900px) { .adm-bottom { grid-template-columns: 1fr 1.6fr; } }
      `}</style>
    </div>
  )
}
