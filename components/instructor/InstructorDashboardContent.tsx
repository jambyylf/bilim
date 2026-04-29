'use client'

import Link from 'next/link'
import Icon from '@/components/shared/Icon'
import Stars from '@/components/shared/Stars'
import { useLang } from '@/components/providers/LangProvider'

interface Course {
  id: string
  title_kk: string | null; title_ru: string | null; title_en: string | null
  status: string
  price: number | null; discount_price: number | null
  students_count: number | null; rating: number | null
}

interface Review {
  id: string; rating: number; comment: string | null
  created_at: string; student_id: string
}

interface Props {
  courses: Course[]; reviews: Review[]
  totalStudents: number; avgRating: string
  profile?: { full_name: string | null; avatar_url: string | null } | null
}

function RevenueChart() {
  const d = [12, 18, 15, 22, 28, 24, 32, 38, 36, 44, 41, 50]
  const max = 50
  const W = 680, H = 180, P = 16
  const pts = d.map((v, i) => [P + (i * (W - 2 * P) / (d.length - 1)), H - P - (v / max) * (H - 2 * P)] as [number, number])
  const line = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ')
  const area = line + ` L${pts[pts.length - 1][0]},${H - P} L${pts[0][0]},${H - P} Z`
  const months = ['Мам', 'Мау', 'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел', 'Қаң', 'Ақп', 'Нау', 'Сәу']
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 180 }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.16"/>
          <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={P} x2={W - P} y1={P + i * ((H - 2 * P) / 3)} y2={P + i * ((H - 2 * P) / 3)} stroke="var(--b-line-soft)" strokeWidth="1"/>
      ))}
      <path d={area} fill="url(#chartGrad)"/>
      <path d={line} fill="none" stroke="#1E3A8A" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 3} fill="var(--b-bg)" stroke="#1E3A8A" strokeWidth="2.5"/>
      ))}
      {months.map((m, i) => (
        <text key={i} x={pts[i][0]} y={H - 2} fontSize="9" fill="var(--b-text-4)" textAnchor="middle" fontFamily="Inter">{m}</text>
      ))}
    </svg>
  )
}

export default function InstructorDashboardContent({ courses, reviews, totalStudents, avgRating, profile }: Props) {
  const { lang, t } = useLang()

  function courseTitle(c: Course) {
    if (lang === 'ru') return c.title_ru ?? c.title_kk ?? '—'
    if (lang === 'en') return c.title_en ?? c.title_ru ?? '—'
    return c.title_kk ?? c.title_ru ?? '—'
  }

  function statusChip(status: string) {
    const map: Record<string, { label: string; color: string; bg: string; dot: string }> = {
      published: { label: t.instructor.published, color: '#059669', bg: 'rgba(5,150,105,0.1)', dot: '#059669' },
      draft:     { label: t.instructor.draft,     color: 'var(--b-text-3)', bg: 'var(--b-bg-soft)', dot: 'var(--b-text-4)' },
      pending:   { label: t.instructor.pending,   color: '#d97706', bg: '#fef3c7', dot: '#d97706' },
      rejected:  { label: t.instructor.rejected,  color: '#dc2626', bg: '#fee2e2', dot: '#dc2626' },
    }
    const s = map[status] ?? map.draft
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, borderRadius: 999, padding: '3px 10px' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }}/>
        {s.label}
      </span>
    )
  }

  const tx = {
    title:    lang === 'kk' ? 'Спикер кабинеті'     : lang === 'en' ? 'Instructor Dashboard' : 'Кабинет спикера',
    create:   lang === 'kk' ? 'Курс жасау'          : lang === 'en' ? 'Create course'        : 'Создать курс',
    revenue:  lang === 'kk' ? 'Айлық кіріс'         : lang === 'en' ? 'Monthly revenue'      : 'Доход за месяц',
    students: lang === 'kk' ? 'Студент'             : lang === 'en' ? 'Students'             : 'Студентов',
    rating:   lang === 'kk' ? 'Орташа рейтинг'      : lang === 'en' ? 'Avg rating'           : 'Средний рейтинг',
    courses:  lang === 'kk' ? 'Курстарым'           : lang === 'en' ? 'My Courses'           : 'Мои курсы',
    earnings: lang === 'kk' ? 'Кіріс динамикасы'    : lang === 'en' ? 'Revenue dynamics'     : 'Динамика дохода',
    last12:   lang === 'kk' ? 'Соңғы 12 ай'         : lang === 'en' ? 'Last 12 months'       : 'Последние 12 месяцев',
    tasks:    lang === 'kk' ? 'Тапсырмалар'         : lang === 'en' ? 'Tasks'                : 'Задачи',
    today:    lang === 'kk' ? 'Бүгін'               : lang === 'en' ? 'Today'                : 'Сегодня',
    published2: lang === 'kk' ? 'Жарияланған'       : lang === 'en' ? 'Published'            : 'Опубликовано',
    drafts2:  lang === 'kk' ? 'Жобалар'             : lang === 'en' ? 'Drafts'               : 'Черновики',
    viewAll:  lang === 'kk' ? 'Барлығы →'           : lang === 'en' ? 'All →'                : 'Все →',
    recentR:  lang === 'kk' ? 'Жаңа пікірлер'       : lang === 'en' ? 'Recent reviews'       : 'Свежие отзывы',
    reply:    lang === 'kk' ? 'Жауап беру'          : lang === 'en' ? 'Reply'                : 'Ответить',
    course:   lang === 'kk' ? 'Курс'                : lang === 'en' ? 'Course'               : 'Курс',
    income:   lang === 'kk' ? 'Кіріс'              : lang === 'en' ? 'Revenue'              : 'Доход',
  }

  const tasks = [
    { icon: 'edit',  label: lang === 'kk' ? '4-модульді бекіту' : lang === 'en' ? 'Approve module 4' : 'Утвердить модуль 4',    meta: `UI/UX · ${tx.today}`, urgent: true },
    { icon: 'video', label: lang === 'kk' ? '3 сабақ жүктеу'   : lang === 'en' ? 'Upload 3 lessons' : 'Загрузить 3 урока',     meta: `Motion · 2 ${lang === 'kk' ? 'күн' : lang === 'en' ? 'days' : 'дня'}` },
    { icon: 'bell',  label: lang === 'kk' ? '14 студентке жауап' : lang === 'en' ? 'Reply to 14 students' : 'Ответить 14 студентам', meta: `Q&A · 1 ${lang === 'kk' ? 'күн' : lang === 'en' ? 'day' : 'день'}` },
    { icon: 'chart', label: lang === 'kk' ? 'Есепті қарау'     : lang === 'en' ? 'View report'     : 'Просмотреть отчёт',      meta: lang === 'kk' ? 'Маркетинг' : 'Marketing' },
  ]

  const publishedCount = courses.filter(c => c.status === 'published').length
  const draftCount     = courses.filter(c => c.status !== 'published').length

  return (
    <div className="instr-dash-content">
      <style>{`
        .instr-dash-content { padding: 40px 32px 80px; max-width: 1100px; }
        @media(max-width:768px){ .instr-dash-content { padding: 24px 16px 80px; } }
        .instr-kpi4 { grid-template-columns: repeat(2,1fr); }
        @media(min-width:640px){ .instr-kpi4 { grid-template-columns: repeat(4,1fr); } }
        .instr-mid { grid-template-columns: 1fr; }
        @media(min-width:900px){ .instr-mid { grid-template-columns: 1.6fr 1fr; } }
        .instr-bot { grid-template-columns: 1fr; }
        @media(min-width:900px){ .instr-bot { grid-template-columns: 1fr 1fr; } }
        .instr-table-row { grid-template-columns: 2fr 1fr 1fr 1fr 1fr 52px; }
        @media(max-width:640px){ .instr-table-row { grid-template-columns: 1fr 80px; } }
      `}</style>

      {/* Profile header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, flexShrink: 0, overflow: 'hidden' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : (profile?.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? 'СП')
            }
          </div>
          <div>
            <div className="b-eyebrow" style={{ marginBottom: 6 }}>{tx.title}</div>
            <h1 className="b-h1" style={{ fontSize: 'clamp(20px, 3vw, 28px)' }}>
              {profile?.full_name ?? (lang === 'kk' ? 'Спикер кабинеті' : lang === 'en' ? 'Instructor Panel' : 'Кабинет спикера')}
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="settings" size={14}/>Settings
          </button>
          <Link href="/instructor/courses/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="plus" size={14}/>{tx.create}
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="instr-kpi4 grid gap-4 mb-8">
        {[
          { label: tx.revenue,  value: '2 487 600 ₸', delta: '+18%',   positive: true  },
          { label: tx.students, value: totalStudents.toLocaleString('ru-RU'), delta: '+340', positive: true },
          { label: tx.rating,   value: avgRating,      delta: '+0.04', positive: true  },
          { label: lang === 'kk' ? 'Аяқталу' : lang === 'en' ? 'Completion' : 'Завершаемость', value: '73%', delta: '+5%', positive: true },
        ].map(({ label, value, delta, positive }) => (
          <div key={label} className="card" style={{ padding: 20 }}>
            <div className="b-sm" style={{ color: 'var(--b-text-3)', marginBottom: 6 }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="b-h1" style={{ fontSize: 26, lineHeight: 1 }}>{value}</span>
            </div>
            <div className="b-xs" style={{ color: positive ? 'var(--b-success)' : 'var(--b-error)', marginTop: 8, fontWeight: 600 }}>{delta}</div>
          </div>
        ))}
      </div>

      {/* Chart + Tasks */}
      <div className="instr-mid grid gap-6 mb-8">
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h3 className="b-h3" style={{ marginBottom: 4 }}>{tx.earnings}</h3>
              <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>{tx.last12}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="chip">12М</span>
              <span className="chip chip-active">6М</span>
              <span className="chip">3М</span>
            </div>
          </div>
          <RevenueChart />
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 className="b-h3" style={{ marginBottom: 16 }}>{tx.tasks}</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tasks.map((task, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i < tasks.length - 1 ? '1px solid var(--b-line-soft)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: task.urgent ? 'rgba(245,158,11,0.12)' : 'var(--b-bg-soft)', color: task.urgent ? '#92400e' : 'var(--b-text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={task.icon} size={14}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="b-sm" style={{ fontWeight: 500 }}>{task.label}</div>
                  <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>{task.meta}</div>
                </div>
                <Icon name="chevronLeft" size={14} style={{ color: 'var(--b-text-4)', transform: 'rotate(180deg)' }}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Courses table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottom: '1px solid var(--b-line)' }}>
          <h3 className="b-h3">{tx.courses}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="chip chip-active">{tx.published2} · {publishedCount}</span>
            <span className="chip">{tx.drafts2} · {draftCount}</span>
          </div>
        </div>

        {/* Table header */}
        <div className="instr-table-row hidden md:grid gap-4 px-6 py-3" style={{ background: 'var(--b-bg-soft)', borderBottom: '1px solid var(--b-line)' }}>
          {[tx.course, tx.students, lang === 'kk' ? 'Рейтинг' : 'Rating', tx.income, lang === 'kk' ? 'Статус' : 'Status', ''].map((h, i) => (
            <div key={i} className="b-eyebrow">{h}</div>
          ))}
        </div>

        {courses.length === 0 ? (
          <div className="p-16 text-center" style={{ color: 'var(--b-text-3)' }}>
            <Icon name="book" size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }}/>
            <div className="b-body">{t.instructor.newCourse}</div>
            <Link href="/instructor/courses/new" className="btn btn-primary btn-sm mt-4 inline-flex">
              <Icon name="plus" size={13}/> {tx.create}
            </Link>
          </div>
        ) : (
          courses.slice(0, 8).map((course, i) => (
            <div key={course.id} className="instr-table-row grid gap-4 px-6 py-4 items-center" style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                <div className={`thumb-grad-${(i % 8) + 1} rounded-lg shrink-0`} style={{ width: 56, height: 36 }}/>
                <div className="b-sm" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {courseTitle(course)}
                </div>
              </div>
              <div className="b-sm">{(course.students_count ?? 0).toLocaleString('ru-RU')}</div>
              <div className="b-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="star" size={11} style={{ color: 'var(--b-accent)' }}/>
                {course.rating?.toFixed(1) ?? '—'}
              </div>
              <div className="b-sm" style={{ fontWeight: 600 }}>—</div>
              <div>{statusChip(course.status)}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <Link href={`/instructor/courses/${course.id}/edit`} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                  <Icon name="edit" size={14}/>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
