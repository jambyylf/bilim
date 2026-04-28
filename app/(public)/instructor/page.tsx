'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/shared/Logo'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'

export default function BecomeInstructorPage() {
  const { lang } = useLang()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function tr(kk: string, ru: string, en = ru) {
    if (lang === 'ru') return ru
    if (lang === 'en') return en
    return kk
  }

  async function handleBecome() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/profile/become-instructor', { method: 'POST' })
    if (!res.ok) {
      const data = await res.json()
      if (res.status === 401) {
        router.push('/register?role=instructor')
        return
      }
      setError(data.error ?? tr('Қате орын алды', 'Произошла ошибка', 'An error occurred'))
      setLoading(false)
      return
    }
    router.push('/instructor/dashboard')
    router.refresh()
  }

  const benefits = [
    {
      icon: 'dollar',
      title: tr('Табыс табыңыз', 'Зарабатывайте', 'Earn money'),
      desc: tr('Әр сатылымнан 80% алыңыз', 'Получайте 80% с каждой продажи', 'Earn 80% per sale'),
    },
    {
      icon: 'users',
      title: tr('Кең аудитория', 'Широкая аудитория', 'Wide audience'),
      desc: tr('10 000+ белсенді оқушы', '10 000+ активных учеников', '10,000+ active students'),
    },
    {
      icon: 'chart',
      title: tr('Аналитика', 'Аналитика', 'Analytics'),
      desc: tr('Нақты уақытта статистика', 'Статистика в реальном времени', 'Real-time statistics'),
    },
    {
      icon: 'shield',
      title: tr('Қауіпсіз төлем', 'Безопасная оплата', 'Secure payments'),
      desc: tr('Kaspi Pay, Stripe арқылы', 'Через Kaspi Pay, Stripe', 'Via Kaspi Pay, Stripe'),
    },
  ]

  return (
    <div style={{ background: 'var(--b-bg)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'var(--b-primary)', color: '#fff', paddingBottom: 80 }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <Link href="/"><Logo size={28} /></Link>
          <Link href="/login" className="btn btn-ghost btn-sm" style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            {tr('Кіру', 'Войти', 'Login')}
          </Link>
        </div>
        <div className="max-w-[760px] mx-auto px-4 md:px-8 pt-8 pb-4 text-center">
          <div className="b-xs mb-4" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Bilim · {tr('Спикер кабинеті', 'Кабинет спикера', 'Instructor Studio')}
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            {tr('Білімді бөлісіп, табыс табыңыз', 'Делитесь знаниями и зарабатывайте', 'Share knowledge & earn')}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', maxWidth: 520, margin: '0 auto 36px' }}>
            {tr(
              'Bilim-де спикер болып, өз курсыңызды жасаңыз. Тіркелу тегін.',
              'Станьте спикером на Bilim и создайте свой курс. Регистрация бесплатна.',
              'Become an instructor on Bilim and create your course. Free to join.'
            )}
          </p>
          {error && (
            <div className="b-sm p-3 rounded-lg mb-4 mx-auto max-w-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}
          <button
            onClick={handleBecome}
            disabled={loading}
            style={{
              background: 'var(--b-accent)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '16px 40px',
              fontSize: 17, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}
          >
            <Icon name="sparkle" size={18} />
            {loading
              ? tr('Белсендірілуде...', 'Активируется...', 'Activating...')
              : tr('Спикер болу — тегін', 'Стать спикером — бесплатно', 'Become Instructor — Free')}
          </button>
          <p className="b-xs mt-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {tr('Бір батырма — аккаунт дайын', 'Один клик — аккаунт готов', 'One click — account ready')}
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-[1000px] mx-auto px-4 md:px-8" style={{ marginTop: -40 }}>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {benefits.map(b => (
            <div key={b.icon} className="card p-6 flex flex-col gap-3">
              <div style={{ background: 'var(--b-primary-50)', color: 'var(--b-primary)', borderRadius: 10, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={b.icon} size={22} />
              </div>
              <div className="b-h4">{b.title}</div>
              <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>{b.desc}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="card p-8 mt-6 mb-10">
          <h2 className="b-h3 mb-6 text-center">{tr('3 қадамда бастаңыз', 'Начните за 3 шага', 'Start in 3 steps')}</h2>
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { n: 1, t: tr('Спикер болу', 'Стать спикером', 'Become instructor'), d: tr('Жоғарыдағы батырманы басыңыз', 'Нажмите кнопку выше', 'Click the button above') },
              { n: 2, t: tr('Курс жасаңыз', 'Создайте курс', 'Create a course'), d: tr('Атауы, бағасы, бейне сабақтар', 'Название, цена, видеоуроки', 'Title, price, video lessons') },
              { n: 3, t: tr('Табыс табыңыз', 'Зарабатывайте', 'Earn money'), d: tr('Ай сайын есеп айырысу', 'Ежемесячные выплаты', 'Monthly payouts') },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--b-primary)', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {s.n}
                </div>
                <div>
                  <div className="b-sm font-semibold mb-1">{s.t}</div>
                  <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
