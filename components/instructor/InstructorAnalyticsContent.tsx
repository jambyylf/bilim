'use client'

import { useLang } from '@/components/providers/LangProvider'

interface CourseStat {
  id: string
  title_ru: string | null
  title_kk: string | null
  students: number
  enrolled: number
  completed: number
  completionRate: number
  avgProgress: number
  status: string
}

interface Props {
  courseStats: CourseStat[]
  totalStudents: number
  totalCompleted: number
}

export default function InstructorAnalyticsContent({ courseStats, totalStudents, totalCompleted }: Props) {
  const { lang } = useLang()

  function ct(c: CourseStat) {
    return (lang === 'kk' ? c.title_kk : c.title_ru) ?? c.title_ru ?? '—'
  }

  const avgCompletion = courseStats.length > 0
    ? Math.round(courseStats.reduce((s, c) => s + c.completionRate, 0) / courseStats.length)
    : 0

  return (
    <div style={{ padding: '40px 48px' }}>
      <div className="mb-8">
        <div className="b-eyebrow mb-1">
          {lang === 'kk' ? 'Нұсқаушы' : lang === 'en' ? 'Instructor' : 'Инструктор'}
        </div>
        <h1 className="b-h1">
          {lang === 'kk' ? 'Аналитика' : lang === 'en' ? 'Analytics' : 'Аналитика'}
        </h1>
      </div>

      {/* KPI */}
      <div className="grid gap-5 mb-8" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: lang === 'kk' ? 'Барлық студент' : lang === 'en' ? 'Total students' : 'Всего студентов', value: totalStudents, color: '#3B82F6', bg: '#eff6ff' },
          { label: lang === 'kk' ? 'Курстар' : lang === 'en' ? 'Courses' : 'Курсы', value: courseStats.length, color: '#8B5CF6', bg: '#f5f3ff' },
          { label: lang === 'kk' ? 'Аяқтаған' : lang === 'en' ? 'Completed' : 'Завершили', value: totalCompleted, color: '#059669', bg: '#d1fae5' },
          { label: lang === 'kk' ? 'Орт. аяқтау %' : lang === 'en' ? 'Avg completion' : 'Ср. завершение', value: `${avgCompletion}%`, color: '#F59E0B', bg: '#fef3c7' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <div className="b-xs mb-1" style={{ color: 'var(--b-text-3)' }}>{label}</div>
            <div className="b-h2" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Course stats table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--b-line)' }}>
          <div className="b-h4">
            {lang === 'kk' ? 'Курс бойынша статистика' : lang === 'en' ? 'Course statistics' : 'Статистика по курсам'}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg-soft)' }}>
              {[
                lang === 'kk' ? 'Курс' : lang === 'en' ? 'Course' : 'Курс',
                lang === 'kk' ? 'Студенттер' : lang === 'en' ? 'Students' : 'Студентов',
                lang === 'kk' ? 'Аяқтаған' : lang === 'en' ? 'Completed' : 'Завершили',
                lang === 'kk' ? 'Аяқтау %' : lang === 'en' ? 'Completion %' : 'Завершение %',
                lang === 'kk' ? 'Орт. прогресс' : lang === 'en' ? 'Avg progress' : 'Ср. прогресс',
              ].map(h => (
                <th key={h} className="b-xs font-semibold text-left px-5 py-3" style={{ color: 'var(--b-text-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courseStats.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 b-sm" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'Курстар жоқ' : lang === 'en' ? 'No courses yet' : 'Курсов пока нет'}
                </td>
              </tr>
            ) : courseStats.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
                <td className="px-5 py-4">
                  <div className="b-sm font-medium" style={{ maxWidth: 220 }}>{ct(c)}</div>
                </td>
                <td className="px-5 py-4 b-sm font-semibold">{c.students}</td>
                <td className="px-5 py-4 b-sm">{c.completed}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div style={{ flex: 1, height: 6, background: 'var(--b-bg-soft)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${c.completionRate}%`,
                        height: '100%',
                        background: c.completionRate >= 70 ? '#059669' : c.completionRate >= 40 ? '#F59E0B' : '#dc2626',
                        borderRadius: 3,
                      }} />
                    </div>
                    <span className="b-xs font-semibold" style={{ width: 32, color: 'var(--b-text-2)' }}>{c.completionRate}%</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div style={{ flex: 1, height: 6, background: 'var(--b-bg-soft)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${c.avgProgress}%`,
                        height: '100%',
                        background: 'var(--b-primary)',
                        borderRadius: 3,
                      }} />
                    </div>
                    <span className="b-xs font-semibold" style={{ width: 32, color: 'var(--b-text-2)' }}>{c.avgProgress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
