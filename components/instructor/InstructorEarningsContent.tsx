'use client'

import { useLang } from '@/components/providers/LangProvider'

interface MonthData {
  month: string
  gross: number
  net: number
}

interface Props {
  monthlyData: MonthData[]
  totalGross: number
  totalNet: number
  orderCount: number
}

const MONTH_NAMES_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
const MONTH_NAMES_KK = ['Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау', 'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел']
const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function InstructorEarningsContent({ monthlyData, totalGross, totalNet, orderCount }: Props) {
  const { lang } = useLang()

  function monthLabel(key: string) {
    const [year, m] = key.split('-')
    const idx = parseInt(m) - 1
    const names = lang === 'kk' ? MONTH_NAMES_KK : lang === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_RU
    return `${names[idx]} ${year}`
  }

  const maxNet = Math.max(...monthlyData.map(d => d.net), 1)

  return (
    <div className="instr-earnings">
      <style>{`
        .instr-earnings { padding: 24px 16px; }
        @media (min-width: 768px) { .instr-earnings { padding: 40px 48px; } }
        .earnings-kpi { grid-template-columns: 1fr; }
        @media (min-width: 480px) { .earnings-kpi { grid-template-columns: repeat(3, 1fr); } }
        .earnings-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .earnings-table { min-width: 400px; }
      `}</style>

      <div className="mb-8">
        <div className="b-eyebrow mb-1">
          {lang === 'kk' ? 'Нұсқаушы' : lang === 'en' ? 'Instructor' : 'Инструктор'}
        </div>
        <h1 className="b-h1">
          {lang === 'kk' ? 'Табыс' : lang === 'en' ? 'Earnings' : 'Доходы'}
        </h1>
      </div>

      {/* KPI */}
      <div className="earnings-kpi grid gap-4 mb-8">
        <div className="card p-5">
          <div className="b-xs mb-1" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk' ? 'Жалпы сатылым' : lang === 'en' ? 'Total revenue' : 'Общий доход'}
          </div>
          <div className="b-h2">{Math.round(totalGross).toLocaleString('ru-RU')} ₸</div>
          <div className="b-xs mt-1" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk' ? '(платформа комиссиясынсыз)' : lang === 'en' ? '(before platform fee)' : '(до комиссии платформы)'}
          </div>
        </div>
        <div className="card p-5">
          <div className="b-xs mb-1" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk' ? 'Сіздің табысыңыз (80%)' : lang === 'en' ? 'Your earnings (80%)' : 'Ваш доход (80%)'}
          </div>
          <div className="b-h2" style={{ color: '#059669' }}>{Math.round(totalNet).toLocaleString('ru-RU')} ₸</div>
          <div className="b-xs mt-1" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk' ? '20% платформа алады' : lang === 'en' ? 'Platform takes 20%' : 'Платформа берёт 20%'}
          </div>
        </div>
        <div className="card p-5">
          <div className="b-xs mb-1" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk' ? 'Тапсырыстар саны' : lang === 'en' ? 'Total orders' : 'Количество заказов'}
          </div>
          <div className="b-h2">{orderCount}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6 mb-6">
        <div className="b-h4 mb-6">
          {lang === 'kk' ? 'Ай сайынғы табыс' : lang === 'en' ? 'Monthly earnings' : 'Ежемесячный доход'}
        </div>
        {monthlyData.length === 0 ? (
          <div className="text-center p-8 b-sm" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk' ? 'Деректер жоқ' : lang === 'en' ? 'No data yet' : 'Данных пока нет'}
          </div>
        ) : (
          <div className="flex items-end gap-2" style={{ height: 200 }}>
            {monthlyData.map(d => {
              const pct = (d.net / maxNet) * 100
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="b-xs font-semibold" style={{ color: '#059669' }}>
                    {d.net > 0 ? `${Math.round(d.net / 1000)}k` : ''}
                  </div>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{
                      width: '100%',
                      height: `${Math.max(pct, 4)}%`,
                      background: 'linear-gradient(180deg, #059669, #34d399)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease',
                    }} />
                  </div>
                  <div className="b-xs text-center" style={{ color: 'var(--b-text-3)', fontSize: 10 }}>
                    {monthLabel(d.month)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Monthly table */}
      {monthlyData.length > 0 && (
        <div className="card overflow-hidden">
          <div className="earnings-table-wrap">
            <table className="earnings-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg-soft)' }}>
                  {[
                    lang === 'kk' ? 'Ай' : lang === 'en' ? 'Month' : 'Месяц',
                    lang === 'kk' ? 'Жалпы' : lang === 'en' ? 'Gross' : 'Валовой',
                    lang === 'kk' ? 'Сіздің үлесіңіз (80%)' : lang === 'en' ? 'Your share (80%)' : 'Ваша доля (80%)',
                  ].map(h => (
                    <th key={h} className="b-xs font-semibold text-left px-5 py-3" style={{ color: 'var(--b-text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...monthlyData].reverse().map(d => (
                  <tr key={d.month} style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
                    <td className="px-5 py-4 b-sm">{monthLabel(d.month)}</td>
                    <td className="px-5 py-4 b-sm">{Math.round(d.gross).toLocaleString('ru-RU')} ₸</td>
                    <td className="px-5 py-4 b-sm font-semibold" style={{ color: '#059669' }}>
                      {Math.round(d.net).toLocaleString('ru-RU')} ₸
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
