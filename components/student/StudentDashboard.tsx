'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'

interface Enrollment {
  id: string
  progress_pct: number
  status: string
  enrolled_at: string
  course: {
    id: string
    slug: string
    title_kk: string; title_ru: string; title_en: string
    thumbnail_url: string | null
    level: string; language: string
    students_count: number
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

export default function StudentDashboard({ profile, enrollments }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()

  function tr(kk: string, ru: string, en: string) {
    if (lang === 'ru') return ru || kk
    if (lang === 'en') return en || ru || kk
    return kk || ru
  }

  const completedCount = enrollments.filter(e => e.progress_pct >= 100).length
  const inProgressCount = enrollments.filter(e => e.progress_pct > 0 && e.progress_pct < 100).length
  const continueEnroll = enrollments.find(e => e.progress_pct > 0 && e.progress_pct < 100)

  return (
    <div style={{ background: 'var(--b-bg)', minHeight: '100vh' }}>
      <TopNav user={profile} />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10">
        {/* Сәлем */}
        <div className="flex items-center gap-4 mb-6 md:mb-10">
          <div className="b-avatar" style={{ width: 56, height: 56, fontSize: 22, background: 'var(--b-primary)', color: '#fff' }}>
            {profile?.full_name?.[0] ?? '?'}
          </div>
          <div className="flex-1">
            <h1 className="b-h1">
              {lang === 'kk' ? `Сәлем, ${profile?.full_name?.split(' ')[0] ?? ''}!`
               : lang === 'en' ? `Hello, ${profile?.full_name?.split(' ')[0] ?? ''}!`
               : `Привет, ${profile?.full_name?.split(' ')[0] ?? ''}!`}
            </h1>
            <p className="b-sm mt-1" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk' ? 'Бүгін не үйренеміз?' : lang === 'en' ? "What's learning today?" : 'Что изучим сегодня?'}
            </p>
          </div>
          <Link href="/settings" className="btn btn-secondary btn-sm hidden md:flex items-center gap-2">
            <Icon name="settings" size={14} />
            {lang === 'kk' ? 'Параметрлер' : lang === 'en' ? 'Settings' : 'Настройки'}
          </Link>
        </div>

        {/* Мобильді іздеу */}
        <div className="md:hidden mb-5 relative">
          <Icon
            name="search" size={16}
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--b-text-4)', zIndex: 1 }}
          />
          <input
            className="inp w-full"
            placeholder={lang === 'kk' ? 'Курс іздеу…' : lang === 'en' ? 'Search courses…' : 'Поиск курсов…'}
            style={{ paddingLeft: 40, background: 'var(--b-bg-soft)', border: 'none' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim()
                if (val) router.push(`/courses?q=${encodeURIComponent(val)}`)
              }
            }}
          />
        </div>

        {/* Жалғастыру карточкасы — тек мобильде */}
        {continueEnroll?.course && (
          <div className="md:hidden mb-6">
            <div
              className="card"
              style={{ display: 'flex', padding: 0, background: 'var(--b-primary)', border: 'none', overflow: 'hidden' }}
            >
              <div
                className={`thumb-grad-${GRAD_MAP[continueEnroll.course.category?.slug ?? ''] ?? 1} thumb-pattern`}
                style={{ width: 100, flexShrink: 0 }}
              />
              <div style={{ flex: 1, padding: 14, color: '#fff' }}>
                <div className="b-xs" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                  {lang === 'kk' ? 'Жалғастыру' : lang === 'en' ? 'Continue' : 'Продолжить'} · {Math.round(continueEnroll.progress_pct)}%
                </div>
                <div className="b-sm" style={{ fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>
                  {tr(continueEnroll.course.title_kk, continueEnroll.course.title_ru, continueEnroll.course.title_en).slice(0, 50)}
                </div>
                <div className="progress" style={{ background: 'rgba(255,255,255,0.2)', marginBottom: 10 }}>
                  <div className="progress-bar" style={{ width: `${continueEnroll.progress_pct}%`, background: 'var(--b-accent)' }} />
                </div>
                <Link
                  href={`/courses/${continueEnroll.course.slug}/learn`}
                  className="btn btn-accent btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Icon name="play" size={10} />
                  {lang === 'kk' ? 'Жалғастыру' : lang === 'en' ? 'Continue' : 'Продолжить'}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Статистика */}
        <style>{`
          .dash-stats { grid-template-columns: repeat(3,1fr); }
          @media(max-width:640px){ .dash-stats { grid-template-columns: 1fr; } }
          .dash-courses { grid-template-columns: repeat(3,1fr); }
          @media(max-width:560px){ .dash-courses { grid-template-columns: 1fr; } }
          @media(min-width:561px) and (max-width:900px){ .dash-courses { grid-template-columns: repeat(2,1fr); } }
        `}</style>
        <div className="dash-stats grid gap-4 mb-8">
          {[
            { icon: 'book',   label: t.nav.myCourses,                 value: enrollments.length },
            { icon: 'chart',  label: lang === 'kk' ? 'Аяқталуда' : lang === 'en' ? 'In progress' : 'В процессе', value: inProgressCount },
            { icon: 'award',  label: lang === 'kk' ? 'Аяқталды'   : lang === 'en' ? 'Completed'   : 'Завершено',  value: completedCount },
          ].map(({ icon, label, value }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div style={{ background: 'var(--b-primary-50)', color: 'var(--b-primary)', borderRadius: 10, padding: '10px 12px' }}>
                <Icon name={icon} size={22} />
              </div>
              <div>
                <div className="b-h2" style={{ lineHeight: 1 }}>{value}</div>
                <div className="b-sm mt-1" style={{ color: 'var(--b-text-3)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Курстар */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="b-h2">{t.nav.myCourses}</h2>
          <Link href="/courses" className="btn btn-secondary btn-sm flex items-center gap-2">
            <Icon name="search" size={14} />
            {lang === 'kk' ? 'Жаңа курс табу' : lang === 'en' ? 'Find new courses' : 'Найти курсы'}
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="card p-16 text-center">
            <Icon name="book" size={56} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <div className="b-h3 mb-2">
              {lang === 'kk' ? 'Курс жоқ' : lang === 'en' ? 'No courses yet' : 'Нет курсов'}
            </div>
            <p className="b-body mb-6" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk' ? 'Каталогтан курс таңдаңыз' : lang === 'en' ? 'Browse the catalog to find a course' : 'Перейдите в каталог, чтобы найти курс'}
            </p>
            <Link href="/courses" className="btn btn-primary btn-fluid">
              {t.home.catalog}
            </Link>
          </div>
        ) : (
          <div className="dash-courses grid gap-4 md:gap-5">
            {enrollments.map(enroll => {
              const course = enroll.course
              if (!course) return null
              const grad = GRAD_MAP[course.category?.slug ?? ''] ?? 1
              const pct  = Math.round(enroll.progress_pct)
              return (
                <div key={enroll.id} className="card flex flex-col overflow-hidden">
                  {/* Миниатюра */}
                  <div className={`thumb-grad-${grad} thumb-pattern relative`} style={{ height: 140 }}>
                    {course.thumbnail_url && (
                      <img src={course.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                      {pct >= 100 ? (
                        <span className="self-start text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(5,150,105,0.85)', color: '#fff' }}>
                          ✓ {lang === 'kk' ? 'Аяқталды' : lang === 'en' ? 'Completed' : 'Завершено'}
                        </span>
                      ) : pct > 0 ? (
                        <span className="self-start text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>
                          {pct}%
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Мазмұн */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="b-h4 leading-snug overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {tr(course.title_kk, course.title_ru, course.title_en)}
                    </div>
                    <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                      {course.instructor?.full_name ?? '—'}
                    </div>

                    {/* Прогресс */}
                    <div className="mt-auto pt-2">
                      <div className="flex justify-between b-xs mb-1" style={{ color: 'var(--b-text-3)' }}>
                        <span>{t.instructor.completion}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <Link
                      href={`/courses/${course.slug}/learn`}
                      className="btn btn-primary btn-sm w-full mt-2 flex items-center gap-2"
                      style={{ justifyContent: 'center' }}
                    >
                      <Icon name="play" size={12} />
                      {pct === 0
                        ? (lang === 'kk' ? 'Бастау' : lang === 'en' ? 'Start' : 'Начать')
                        : pct >= 100
                        ? (lang === 'kk' ? 'Қайталау' : lang === 'en' ? 'Review' : 'Повторить')
                        : (lang === 'kk' ? 'Жалғастыру' : lang === 'en' ? 'Continue' : 'Продолжить')
                      }
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  )
}
