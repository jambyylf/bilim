'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

interface Enrollment {
  id: string
  progress_pct: number
  status: string
  enrolled_at: string
  course: {
    id: string; slug: string
    title_kk: string; title_ru: string; title_en: string
    thumbnail_url: string | null
    level: string; language: string; students_count: number
    category: { slug: string; name_kk: string; name_ru: string; name_en: string } | null
    instructor: { full_name: string | null } | null
  } | null
}

interface Props {
  profile: { full_name: string | null; role: string; avatar_url: string | null } | null
  enrollments: Enrollment[]
}

const GRAD_MAP: Record<string, number> = {
  design: 1, programming: 8, marketing: 4, business: 7,
  finance: 3, languages: 5, data: 2, 'soft-skills': 6,
}

const ACHIEVEMENTS = [
  { icon: 'flame',   label: 'Серия 14д', unlocked: true  },
  { icon: 'rocket',  label: 'Старт',     unlocked: true  },
  { icon: 'award',   label: '1-ші курс', unlocked: true  },
  { icon: 'target',  label: '10с/апта',  unlocked: true  },
  { icon: 'users',   label: 'Команда',   unlocked: false },
  { icon: 'star',    label: 'Топ-100',   unlocked: false },
]

const ACTIVITY = [3, 5, 2, 6, 4, 7, 5]

function KPICard({ value, label, icon, accent }: { value: string | number; label: string; icon: string; accent: string }) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: accent + '22', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18}/>
      </div>
      <div>
        <div className="b-h1" style={{ fontSize: 32, marginBottom: 2, lineHeight: 1 }}>{value}</div>
        <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>{label}</div>
      </div>
    </div>
  )
}

export default function StudentDashboard({ profile, enrollments }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()

  function tr(kk: string, ru: string, en: string) {
    if (lang === 'ru') return ru || kk
    if (lang === 'en') return en || ru || kk
    return kk || ru
  }

  async function handleLogout() {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? ''
  const completedCount  = enrollments.filter(e => e.progress_pct >= 100).length
  const inProgressCount = enrollments.filter(e => e.progress_pct > 0 && e.progress_pct < 100).length
  const continueEnroll  = enrollments.find(e => e.progress_pct > 0 && e.progress_pct < 100) ?? enrollments[0]

  const tx = {
    hi:        lang === 'kk' ? 'Сәлем'              : lang === 'en' ? 'Hello'       : 'Привет',
    sub:       lang === 'kk' ? `Дұрыс жолдасың — ${inProgressCount} курс үстінде жұмыс істеп жатырсың` : lang === 'en' ? `Keep it up — ${inProgressCount} courses in progress` : `Ты на правильном пути — ${inProgressCount} курса в процессе`,
    lastTime:  lang === 'kk' ? 'Соңғы рет кеше оқыдың — серияны жалғастыр.' : lang === 'en' ? 'You studied yesterday — keep the streak!' : 'Последний раз учился вчера — продолжи серию.',
    nextLesson:lang === 'kk' ? 'Келесі сабақ'      : lang === 'en' ? 'Next lesson'  : 'Следующий урок',
    resume:    lang === 'kk' ? 'Жалғастыру'        : lang === 'en' ? 'Continue'     : 'Продолжить',
    streak:    lang === 'kk' ? 'күн қатарынан'     : lang === 'en' ? 'day streak'   : 'дней подряд',
    hours:     lang === 'kk' ? 'сағат осы айда'    : lang === 'en' ? 'hours this month' : 'часов в месяце',
    certs:     lang === 'kk' ? 'сертификат'        : lang === 'en' ? 'certificates' : 'сертификата',
    goal:      lang === 'kk' ? 'айлық мақсатқа'   : lang === 'en' ? 'to monthly goal' : 'к цели месяца',
    myCourses: lang === 'kk' ? 'Менің курстарым'  : lang === 'en' ? 'My Courses'   : 'Мои курсы',
    inProg:    lang === 'kk' ? 'Жалғасуда'        : lang === 'en' ? 'In Progress'  : 'В процессе',
    done:      lang === 'kk' ? 'Аяқталған'        : lang === 'en' ? 'Completed'    : 'Завершённые',
    wishlist:  lang === 'kk' ? 'Сақталған'        : lang === 'en' ? 'Wishlist'     : 'Избранное',
    achieve:   lang === 'kk' ? 'Жетістіктер'      : lang === 'en' ? 'Achievements' : 'Достижения',
    activity:  lang === 'kk' ? '7 күндік белсенділік' : lang === 'en' ? 'Activity (7 days)' : 'Активность за 7 дней',
    avg:       lang === 'kk' ? 'Орташа'            : lang === 'en' ? 'Average'      : 'В среднем',
    target:    lang === 'kk' ? 'Мақсат'            : lang === 'en' ? 'Goal'         : 'Цель',
    left:      lang === 'kk' ? 'Қалды'             : lang === 'en' ? 'Left'         : 'Осталось',
    lessons:   lang === 'kk' ? 'сабақ'             : lang === 'en' ? 'lessons'      : 'уроков',
    continue:  lang === 'kk' ? 'Жалғастыру'        : lang === 'en' ? 'Continue'     : 'Продолжить',
    start:     lang === 'kk' ? 'Бастау'            : lang === 'en' ? 'Start'        : 'Начать',
  }

  const dayLabels = lang === 'kk'
    ? ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жк']
    : lang === 'en'
    ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  return (
    <div style={{ background: 'var(--b-bg-soft)', minHeight: '100vh' }}>
      <TopNav />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 pb-28 md:pb-10">

        <style>{`
          .dash-top { grid-template-columns: 1fr; }
          @media(min-width:900px){ .dash-top { grid-template-columns: 1.4fr 1fr; } }
          .dash-kpi { grid-template-columns: repeat(2,1fr); }
          .dash-bottom { grid-template-columns: 1fr; }
          @media(min-width:900px){ .dash-bottom { grid-template-columns: 1.2fr 1fr; } }
          .dash-enrolled { grid-template-columns: 1fr; }
          @media(min-width:640px){ .dash-enrolled { grid-template-columns: repeat(2,1fr); } }
        `}</style>

        {/* Top: Greeting + KPI */}
        <div className="dash-top grid gap-6 mb-8">

          {/* Greeting card */}
          <div className="card" style={{ padding: 32 }}>
            <div className="b-eyebrow" style={{ marginBottom: 8 }}>
              {tx.hi}, {firstName} 👋
            </div>
            <h1 className="b-h1" style={{ marginBottom: 8, fontSize: 'clamp(20px, 3vw, 28px)' }}>{tx.sub}</h1>
            <p className="b-body" style={{ color: 'var(--b-text-3)', marginBottom: 24 }}>{tx.lastTime}</p>

            {continueEnroll?.course && (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, background: 'var(--b-bg-soft)', borderRadius: 12 }}>
                <div
                  className={`thumb-grad-${GRAD_MAP[continueEnroll.course.category?.slug ?? ''] ?? 1} thumb-pattern rounded-xl shrink-0`}
                  style={{ width: 84, height: 64 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="b-eyebrow" style={{ marginBottom: 4 }}>{tx.nextLesson}</div>
                  <div className="b-h4" style={{ marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tr(continueEnroll.course.title_kk, continueEnroll.course.title_ru, continueEnroll.course.title_en)}
                  </div>
                  <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>
                    {continueEnroll.course.instructor?.full_name} · {Math.round(continueEnroll.progress_pct)}%
                  </div>
                </div>
                <Link
                  href={`/courses/${continueEnroll.course.slug}/learn`}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, minHeight: 44 }}
                >
                  <Icon name="play" size={13}/>{tx.resume}
                </Link>
              </div>
            )}
          </div>

          {/* KPI 2×2 */}
          <div className="dash-kpi grid gap-4">
            <KPICard value="14"             label={tx.streak}  icon="flame"  accent="#F59E0B"/>
            <KPICard value="32"             label={tx.hours}   icon="clock"  accent="#1E3A8A"/>
            <KPICard value={completedCount} label={tx.certs}   icon="award"  accent="#0D9488"/>
            <KPICard value="86%"            label={tx.goal}    icon="target" accent="#059669"/>
          </div>
        </div>

        {/* My Courses */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 className="b-h2">{tx.myCourses}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="chip chip-active">{tx.inProg} · {inProgressCount}</span>
            <span className="chip">{tx.done} · {completedCount}</span>
            <span className="chip">{tx.wishlist}</span>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="card p-16 text-center mb-8">
            <Icon name="book" size={56} style={{ margin: '0 auto 16px', opacity: 0.2 }}/>
            <div className="b-h3 mb-2">{lang === 'kk' ? 'Курс жоқ' : lang === 'en' ? 'No courses yet' : 'Нет курсов'}</div>
            <Link href="/courses" className="btn btn-primary mt-4 inline-flex">{t.home.catalog}</Link>
          </div>
        ) : (
          <div className="dash-enrolled grid gap-4 mb-8">
            {enrollments.map(enroll => {
              const course = enroll.course
              if (!course) return null
              const grad = GRAD_MAP[course.category?.slug ?? ''] ?? 1
              const pct  = Math.round(enroll.progress_pct)
              const remaining = Math.round((100 - pct) * (course.students_count ?? 30) / 100)
              return (
                <div key={enroll.id} className="card" style={{ display: 'flex', padding: 0, overflow: 'hidden' }}>
                  <div style={{ width: 160, flexShrink: 0 }}>
                    <div
                      className={`thumb-grad-${grad} thumb-pattern`}
                      style={{ width: '100%', height: '100%', minHeight: 120, position: 'relative' }}
                    >
                      {course.thumbnail_url && (
                        <img src={course.thumbnail_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                      )}
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: 18, display: 'flex', flexDirection: 'column' }}>
                    <div className="b-xs" style={{ color: 'var(--b-text-3)', marginBottom: 4 }}>
                      {lang === 'kk' ? (course.category?.name_kk ?? '') : (course.category?.name_ru ?? '')} · {course.instructor?.full_name}
                    </div>
                    <div className="b-h4" style={{ marginBottom: 12, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {tr(course.title_kk, course.title_ru, course.title_en)}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="b-xs" style={{ color: 'var(--b-text-2)', fontWeight: 600 }}>{pct}%</span>
                        <span className="b-xs" style={{ color: 'var(--b-text-3)' }}>{tx.left} {remaining} {tx.lessons}</span>
                      </div>
                      <div className="progress"><div className="progress-bar" style={{ width: `${pct}%` }}/></div>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                      <Link
                        href={`/courses/${course.slug}/learn`}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        {pct === 0 ? tx.start : tx.continue}
                        <Icon name="chevronLeft" size={11} style={{ transform: 'rotate(180deg)' }}/>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom: Achievements + Activity */}
        <div className="dash-bottom grid gap-6">

          {/* Achievements */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="b-h3">{tx.achieve}</h3>
              <span className="b-sm" style={{ color: 'var(--b-text-3)' }}>{ACHIEVEMENTS.filter(a => a.unlocked).length} / {ACHIEVEMENTS.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
              {ACHIEVEMENTS.map((a, i) => (
                <div key={i} style={{
                  aspectRatio: '1', border: `1px solid ${a.unlocked ? 'var(--b-line)' : 'var(--b-line-soft)'}`,
                  borderRadius: 12, padding: 8, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 4,
                  opacity: a.unlocked ? 1 : 0.4,
                  background: a.unlocked ? 'var(--b-bg)' : 'var(--b-bg-soft)',
                }}>
                  <Icon name={a.unlocked ? a.icon : 'lock'} size={20} style={{ color: a.unlocked ? 'var(--b-accent)' : 'var(--b-text-4)' }}/>
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--b-text-3)', textAlign: 'center' }}>{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity chart */}
          <div className="card" style={{ padding: 24 }}>
            <h3 className="b-h3" style={{ marginBottom: 16 }}>{tx.activity}</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, marginBottom: 12 }}>
              {ACTIVITY.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', height: h * 14, background: i === 5 ? 'var(--b-accent)' : 'var(--b-primary)', borderRadius: 6, opacity: i === 6 ? 0.4 : 1, transition: 'height 0.3s' }}/>
                  <span className="b-xs" style={{ color: 'var(--b-text-4)' }}>{dayLabels[i]}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--b-line)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>{tx.avg}</div>
                <div className="b-h3">4.5 ч/{lang === 'kk' ? 'күн' : lang === 'en' ? 'day' : 'день'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>{tx.target}</div>
                <div className="b-h3" style={{ color: 'var(--b-success)' }}>+18%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile logout */}
        <div className="md:hidden mt-8">
          <button onClick={handleLogout} className="btn btn-ghost btn-sm w-full flex items-center justify-center gap-2" style={{ color: 'var(--b-error)', minHeight: 44 }}>
            <Icon name="logout" size={14}/>
            {lang === 'kk' ? 'Шығу' : lang === 'en' ? 'Logout' : 'Выйти'}
          </button>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}
