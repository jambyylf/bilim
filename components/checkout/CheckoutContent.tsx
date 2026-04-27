'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'

interface Course {
  id: string; slug: string
  title_kk: string; title_ru: string; title_en: string
  price: number; discount_price: number | null
  language: string; level: string
  thumbnail_url: string | null
  instructor: { full_name: string | null } | null
}

interface Props {
  course: Course
  userId: string
  userEmail: string
  profile: { full_name: string | null; phone: string | null } | null
}

type PayMethod = 'stripe' | 'kaspi'

export default function CheckoutContent({ course, userId, userEmail, profile }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()

  const [method, setMethod] = useState<PayMethod>('stripe')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const price = course.discount_price ?? course.price

  function tr(kk: string, ru: string, en: string) {
    if (lang === 'ru') return ru || kk
    if (lang === 'en') return en || ru || kk
    return kk || ru
  }

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      if (method === 'stripe') {
        const res = await fetch('/api/payment/stripe/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id, userId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        router.push(`/checkout/success?order=${data.orderId}`)
      } else {
        const res = await fetch('/api/payment/kaspi/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id, userId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl
        } else {
          router.push(`/checkout/success?order=${data.orderId}`)
        }
      }
    } catch (e: any) {
      setError(e.message || t.auth.genericError)
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--b-bg)', minHeight: '100vh' }}>
      <TopNav />

      <style>{`
        .checkout-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) { .checkout-grid { grid-template-columns: 1fr 360px; } }
        .checkout-summary-sticky { position: static; }
        @media (min-width: 768px) { .checkout-summary-sticky { position: sticky; top: 80px; } }
      `}</style>

      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Хлебные крошки */}
        <div className="flex items-center gap-2 b-sm mb-6 flex-wrap" style={{ color: 'var(--b-text-3)' }}>
          <Link href="/courses" style={{ color: 'var(--b-primary)' }}>{t.home.catalog}</Link>
          <span>/</span>
          <Link href={`/courses/${course.slug}`} style={{ color: 'var(--b-primary)' }}>
            {tr(course.title_kk, course.title_ru, course.title_en).slice(0, 40)}…
          </Link>
          <span>/</span>
          <span>{lang === 'kk' ? 'Төлем' : lang === 'en' ? 'Checkout' : 'Оплата'}</span>
        </div>

        <h1 className="b-h1 mb-6 md:mb-8">
          {lang === 'kk' ? 'Төлем' : lang === 'en' ? 'Checkout' : 'Оформление заказа'}
        </h1>

        <div className="checkout-grid grid gap-6">
          {/* Сол — төлем әдісі */}
          <div className="flex flex-col gap-5">
            {/* Төлем әдісін таңдау */}
            <div className="card p-5 md:p-6">
              <h2 className="b-h3 mb-5">
                {lang === 'kk' ? 'Төлем әдісі' : lang === 'en' ? 'Payment method' : 'Способ оплаты'}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {([
                  {
                    id: 'stripe' as const,
                    label: lang === 'kk' ? 'Банк картасы' : lang === 'en' ? 'Bank card' : 'Банковская карта',
                    sub: 'Visa / Mastercard',
                    icon: 'dollar',
                  },
                  {
                    id: 'kaspi' as const,
                    label: 'Kaspi Pay',
                    sub: 'Kaspi Gold / QR',
                    icon: 'shield',
                  },
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setMethod(opt.id)}
                    className="flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left"
                    style={{
                      borderColor: method === opt.id ? 'var(--b-primary)' : 'var(--b-line)',
                      background:  method === opt.id ? 'var(--b-primary-50)' : 'var(--b-bg)',
                      minHeight: 72,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={opt.icon} size={18} style={{ color: method === opt.id ? 'var(--b-primary)' : 'var(--b-text-3)' }} />
                      <span className="b-sm font-semibold" style={{ color: method === opt.id ? 'var(--b-primary)' : 'var(--b-text-1)' }}>{opt.label}</span>
                    </div>
                    <span className="b-xs" style={{ color: 'var(--b-text-3)' }}>{opt.sub}</span>
                  </button>
                ))}
              </div>

              {method === 'stripe' && (
                <div className="mt-5 p-4 rounded-xl" style={{ background: 'var(--b-bg-soft)', border: '1px solid var(--b-line)' }}>
                  <div className="b-sm font-medium mb-3">
                    {lang === 'kk' ? 'Карта деректері' : lang === 'en' ? 'Card details' : 'Данные карты'}
                  </div>
                  <input className="inp mb-3" placeholder="1234 5678 9012 3456" style={{ minHeight: 44 }} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="inp" placeholder="MM / YY" style={{ minHeight: 44 }} />
                    <input className="inp" placeholder="CVV" style={{ minHeight: 44 }} />
                  </div>
                  <p className="b-xs mt-3" style={{ color: 'var(--b-text-4)' }}>
                    <Icon name="lock" size={11} style={{ display: 'inline', marginRight: 4 }} />
                    {lang === 'kk' ? 'Stripe арқылы қауіпсіз өңделеді' : lang === 'en' ? 'Secured by Stripe' : 'Защищено Stripe'}
                  </p>
                </div>
              )}

              {method === 'kaspi' && (
                <div className="mt-5 p-4 rounded-xl text-center" style={{ background: '#fff3f0', border: '1px solid #ffccc7' }}>
                  <div className="b-sm font-medium mb-1" style={{ color: '#c0392b' }}>Kaspi Pay</div>
                  <p className="b-xs" style={{ color: '#7f8c8d' }}>
                    {lang === 'kk' ? 'Kaspi.kz қосымшасы арқылы QR-кодты сканерлеңіз'
                     : lang === 'en' ? 'Scan QR code with Kaspi.kz app'
                     : 'Отсканируйте QR-код в приложении Kaspi.kz'}
                  </p>
                </div>
              )}
            </div>

            {/* Контакт деректері */}
            <div className="card p-5 md:p-6">
              <h2 className="b-h3 mb-5">
                {lang === 'kk' ? 'Байланыс' : lang === 'en' ? 'Contact info' : 'Контактные данные'}
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="b-sm font-medium block mb-1.5">{t.auth.fullName}</label>
                  <input className="inp" defaultValue={profile?.full_name ?? ''} readOnly style={{ minHeight: 44 }} />
                </div>
                <div>
                  <label className="b-sm font-medium block mb-1.5">{t.auth.email}</label>
                  <input className="inp" defaultValue={userEmail} readOnly style={{ minHeight: 44 }} />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm" style={{ background: '#fef2f2', color: 'var(--b-error)', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}
          </div>

          {/* Оң — тапсырыс жиынтығы */}
          <div>
            <div className="card p-5 md:p-6 checkout-summary-sticky">
              <h2 className="b-h3 mb-5">
                {lang === 'kk' ? 'Тапсырыс' : lang === 'en' ? 'Order summary' : 'Ваш заказ'}
              </h2>

              <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: '1px solid var(--b-line)' }}>
                <div className="thumb-grad-1 thumb-pattern rounded-lg shrink-0" style={{ width: 56, height: 56 }} />
                <div className="flex-1 min-w-0">
                  <div className="b-sm font-semibold truncate">{tr(course.title_kk, course.title_ru, course.title_en)}</div>
                  <div className="b-xs mt-0.5" style={{ color: 'var(--b-text-3)' }}>{course.instructor?.full_name}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-5 pb-5" style={{ borderBottom: '1px solid var(--b-line)' }}>
                {course.discount_price && (
                  <div className="flex justify-between b-sm">
                    <span style={{ color: 'var(--b-text-3)' }}>{lang === 'kk' ? 'Бастапқы баға' : lang === 'en' ? 'Original price' : 'Цена'}</span>
                    <span className="line-through" style={{ color: 'var(--b-text-4)' }}>{course.price.toLocaleString('ru-RU')} ₸</span>
                  </div>
                )}
                {course.discount_price && (
                  <div className="flex justify-between b-sm">
                    <span style={{ color: '#059669' }}>{lang === 'kk' ? 'Жеңілдік' : lang === 'en' ? 'Discount' : 'Скидка'}</span>
                    <span style={{ color: '#059669' }}>−{(course.price - course.discount_price).toLocaleString('ru-RU')} ₸</span>
                  </div>
                )}
                <div className="flex justify-between b-h3 mt-1">
                  <span>{lang === 'kk' ? 'Барлығы' : lang === 'en' ? 'Total' : 'Итого'}</span>
                  <span>{price.toLocaleString('ru-RU')} ₸</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-fluid w-full"
                onClick={handlePay}
                disabled={loading}
                style={{ minHeight: 52, justifyContent: 'center' }}
              >
                {loading ? t.common.loading : (
                  <>
                    <Icon name="lock" size={15} />
                    {lang === 'kk' ? `${price.toLocaleString('ru-RU')} ₸ төлеу`
                     : lang === 'en' ? `Pay ${price.toLocaleString('ru-RU')} ₸`
                     : `Оплатить ${price.toLocaleString('ru-RU')} ₸`}
                  </>
                )}
              </button>

              <p className="b-xs text-center mt-4" style={{ color: 'var(--b-text-4)' }}>
                {lang === 'kk' ? '30 күн ішінде ақшаны қайтаруға болады'
                 : lang === 'en' ? '30-day money-back guarantee'
                 : '30 дней на возврат средств'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
