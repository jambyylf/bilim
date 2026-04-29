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
  course: Course; userId: string; userEmail: string
  profile: { full_name: string | null; phone: string | null } | null
}

type PayMethod = 'card' | 'kaspi' | 'halyk' | 'apple'

export default function CheckoutContent({ course, userId, userEmail, profile }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()

  const [method, setMethod]   = useState<PayMethod>('card')
  const [promo, setPromo]     = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const price    = course.discount_price ?? course.price
  const discount = promoApplied ? Math.round(price * 0.15) : 0
  const total    = price - discount

  function tr(kk: string, ru: string, en: string) {
    if (lang === 'ru') return ru || kk
    if (lang === 'en') return en || ru || kk
    return kk || ru
  }

  function applyPromo() {
    if (promo.toUpperCase() === 'STUDENT15') {
      setPromoApplied(true)
    }
  }

  async function handlePay() {
    setLoading(true); setError('')
    try {
      const apiMethod = method === 'card' ? 'stripe' : 'kaspi'
      const endpoint  = apiMethod === 'stripe' ? '/api/payment/stripe/create-intent' : '/api/payment/kaspi/create'
      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.redirectUrl) { window.location.href = data.redirectUrl; return }
      router.push(`/checkout/success?order=${data.orderId}`)
    } catch (e: any) {
      setError(e.message || t.auth.genericError)
      setLoading(false)
    }
  }

  const tx = {
    title:    lang === 'kk' ? 'Тапсырыс рәсімдеу' : lang === 'en' ? 'Checkout'          : 'Оформление заказа',
    step1:    lang === 'kk' ? 'Себет'             : lang === 'en' ? 'Cart'              : 'Корзина',
    step2:    lang === 'kk' ? 'Төлем'             : lang === 'en' ? 'Payment'           : 'Оплата',
    step3:    lang === 'kk' ? 'Дайын'             : lang === 'en' ? 'Done'              : 'Готово',
    payMethod:lang === 'kk' ? 'Төлем әдісі'       : lang === 'en' ? 'Payment method'    : 'Способ оплаты',
    card:     lang === 'kk' ? 'Карта'             : lang === 'en' ? 'Card'              : 'Карта',
    items:    lang === 'kk' ? 'Себеттегі курс'    : lang === 'en' ? 'Course in cart'    : 'Курс в корзине',
    promo:    lang === 'kk' ? 'Промокод'          : lang === 'en' ? 'Promo code'        : 'Промокод',
    apply:    lang === 'kk' ? 'Қолдану'           : lang === 'en' ? 'Apply'             : 'Применить',
    subtotal: lang === 'kk' ? 'Қосындысы'         : lang === 'en' ? 'Subtotal'          : 'Подытог',
    discount: lang === 'kk' ? 'Жеңілдік'          : lang === 'en' ? 'Discount'          : 'Скидка',
    totalL:   lang === 'kk' ? 'Барлығы'           : lang === 'en' ? 'Total'             : 'Итого',
    pay:      lang === 'kk' ? 'Төлеу'             : lang === 'en' ? 'Pay'               : 'Оплатить',
    secure:   lang === 'kk' ? 'Қорғалған төлем'  : lang === 'en' ? 'Secured payment'   : 'Защищённая оплата',
    terms:    lang === 'kk' ? 'Түймені басу арқылы офертаны және қайтару саясатын қабылдайсыз' : lang === 'en' ? 'By clicking, you accept the offer and refund policy' : 'Нажимая кнопку, вы принимаете оферту и политику возврата',
    cardN:    lang === 'kk' ? 'Карта нөмірі'      : lang === 'en' ? 'Card number'       : 'Номер карты',
    expiry:   lang === 'kk' ? 'Мерзімі'           : lang === 'en' ? 'Expiry'            : 'Срок',
    save:     lang === 'kk' ? 'Картаны сақтау'    : lang === 'en' ? 'Save card'         : 'Сохранить карту',
    order:    lang === 'kk' ? 'Тапсырыс'          : lang === 'en' ? 'Order summary'     : 'Ваш заказ',
    guarantee:lang === 'kk' ? '14 күн — сұраусыз ақша қайтару' : lang === 'en' ? '14-day money-back guarantee' : '14 дней — возврат денег без вопросов',
  }

  const steps = [tx.step1, tx.step2, tx.step3]

  const payMethods: { id: PayMethod; label: string; sub: string; icon?: string; color?: string }[] = [
    { id: 'card',  label: tx.card,    sub: 'Visa / Mastercard', icon: 'dollar' },
    { id: 'kaspi', label: 'Kaspi Pay',sub: 'Kaspi Gold / QR',   color: '#F14635' },
    { id: 'halyk', label: 'Halyk',    sub: 'Halyk Bank',        color: '#00B14F' },
    { id: 'apple', label: 'Apple Pay',sub: 'Touch ID',          icon: 'shield' },
  ]

  return (
    <div style={{ background: 'var(--b-bg-soft)', minHeight: '100vh' }}>
      <TopNav />

      <style>{`
        .checkout-grid { grid-template-columns: 1fr; }
        @media(min-width:768px){ .checkout-grid { grid-template-columns: 1.4fr 1fr; } }
        .checkout-sticky { position: static; }
        @media(min-width:768px){ .checkout-sticky { position: sticky; top: 80px; } }
        .pay-tabs { grid-template-columns: repeat(2,1fr); }
        @media(min-width:480px){ .pay-tabs { grid-template-columns: repeat(4,1fr); } }
      `}</style>

      <div className="max-w-[1080px] mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i <= 1 ? 'var(--b-primary)' : 'var(--b-bg-tint, #f3f4f6)',
                color: i <= 1 ? '#fff' : 'var(--b-text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0,
              }}>
                {i === 0 ? (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3L11 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : `${i + 1}`}
              </span>
              <span className="b-sm" style={{ fontWeight: i === 1 ? 600 : 500, color: i <= 1 ? 'var(--b-text)' : 'var(--b-text-3)' }}>{s}</span>
              {i < steps.length - 1 && <div style={{ width: 48, height: 1, background: 'var(--b-line)', marginLeft: 6 }}/>}
            </div>
          ))}
        </div>

        <div className="checkout-grid grid gap-6">

          {/* Left: Payment form */}
          <div className="card" style={{ padding: 32 }}>
            <h2 className="b-h2" style={{ marginBottom: 24 }}>{tx.step2}</h2>

            {/* Payment method tabs */}
            <div className="pay-tabs grid gap-3 mb-7">
              {payMethods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  style={{
                    padding: '14px 10px',
                    border: `1.5px solid ${method === m.id ? 'var(--b-primary)' : 'var(--b-line)'}`,
                    borderRadius: 10, background: method === m.id ? 'var(--b-primary-50)' : 'var(--b-bg)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {m.icon ? (
                    <Icon name={m.icon} size={20} style={{ color: method === m.id ? 'var(--b-primary)' : 'var(--b-text-3)' }}/>
                  ) : (
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: m.color, flexShrink: 0 }}/>
                  )}
                  <span className="b-xs" style={{ fontWeight: 600 }}>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Card form */}
            {method === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="b-eyebrow">{tx.cardN}</span>
                  <input className="inp" placeholder="0000 0000 0000 0000" style={{ minHeight: 44 }}/>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="b-eyebrow">{tx.expiry}</span>
                    <input className="inp" placeholder="MM/YY" style={{ minHeight: 44 }}/>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="b-eyebrow">CVC</span>
                    <input className="inp" placeholder="•••" type="password" style={{ minHeight: 44 }}/>
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="b-eyebrow">{lang === 'kk' ? 'Аты-жөні картада' : lang === 'en' ? 'Name on card' : 'Имя на карте'}</span>
                  <input className="inp" placeholder="AIDAR ZHAKSYBEKOV" defaultValue={profile?.full_name?.toUpperCase() ?? ''} style={{ minHeight: 44 }}/>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 4 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid var(--b-primary)', background: 'var(--b-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span className="b-sm">{tx.save}</span>
                </label>
              </div>
            )}

            {method === 'kaspi' && (
              <div style={{ padding: 24, background: 'rgba(241,70,53,0.06)', border: '1px solid rgba(241,70,53,0.2)', borderRadius: 12, textAlign: 'center' }}>
                <div className="b-h4" style={{ color: '#c0392b', marginBottom: 8 }}>Kaspi Pay</div>
                <p className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'Kaspi.kz қосымшасы арқылы QR-кодты сканерлеңіз' : lang === 'en' ? 'Scan QR code with Kaspi.kz app' : 'Отсканируйте QR-код в приложении Kaspi.kz'}
                </p>
              </div>
            )}

            {(method === 'halyk' || method === 'apple') && (
              <div style={{ padding: 24, background: 'var(--b-bg-soft)', border: '1px solid var(--b-line)', borderRadius: 12, textAlign: 'center' }}>
                <p className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'Жақын арада қолжетімді болады' : lang === 'en' ? 'Coming soon' : 'Скоро доступно'}
                </p>
              </div>
            )}

            <div style={{ marginTop: 24, padding: 14, background: 'var(--b-bg-soft)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="lock" size={16} style={{ color: 'var(--b-success)', flexShrink: 0 }}/>
              <span className="b-xs" style={{ color: 'var(--b-text-2)' }}>{tx.secure} · 256-bit SSL · PCI DSS</span>
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: '#fef2f2', color: 'var(--b-error)', border: '1px solid #fecaca', fontSize: 14 }}>
                {error}
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          <aside>
            <div className="card checkout-sticky" style={{ padding: 24 }}>
              <h3 className="b-h3" style={{ marginBottom: 16 }}>{tx.items}</h3>

              {/* Course item */}
              <div style={{ display: 'flex', gap: 12, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--b-line)', alignItems: 'center' }}>
                <div className="thumb-grad-1 thumb-pattern rounded-lg shrink-0" style={{ width: 56, height: 40 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="b-sm" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tr(course.title_kk, course.title_ru, course.title_en)}
                  </div>
                  <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>{course.instructor?.full_name}</div>
                </div>
                <div className="b-sm" style={{ fontWeight: 600, flexShrink: 0 }}>{price.toLocaleString('ru-RU')} ₸</div>
              </div>

              {/* Promo code */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  className="inp"
                  placeholder={tx.promo}
                  value={promo}
                  onChange={e => setPromo(e.target.value)}
                  style={{ flex: 1, minHeight: 40 }}
                  disabled={promoApplied}
                />
                <button
                  className="btn btn-secondary"
                  onClick={applyPromo}
                  disabled={promoApplied || !promo}
                  style={{ minHeight: 40, flexShrink: 0 }}
                >
                  {promoApplied ? '✓' : tx.apply}
                </button>
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16, borderTop: '1px solid var(--b-line)', borderBottom: '1px solid var(--b-line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span className="b-sm" style={{ color: 'var(--b-text-3)' }}>{tx.subtotal}</span>
                  <span className="b-sm" style={{ fontWeight: 600 }}>{price.toLocaleString('ru-RU')} ₸</span>
                </div>
                {promoApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span className="b-sm" style={{ color: 'var(--b-success)' }}>{tx.discount} · STUDENT15</span>
                    <span className="b-sm" style={{ fontWeight: 600, color: 'var(--b-success)' }}>−{discount.toLocaleString('ru-RU')} ₸</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
                  <span className="b-h4">{tx.totalL}</span>
                  <span className="b-h2" style={{ fontSize: 24 }}>{total.toLocaleString('ru-RU')} ₸</span>
                </div>
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={handlePay}
                disabled={loading || method === 'halyk' || method === 'apple'}
                style={{ minHeight: 52, justifyContent: 'center', width: '100%', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}
              >
                {loading ? t.common.loading : (
                  <>
                    <Icon name="lock" size={15}/>
                    {tx.pay} {total.toLocaleString('ru-RU')} ₸
                  </>
                )}
              </button>

              <p className="b-xs text-center" style={{ color: 'var(--b-text-3)', lineHeight: 1.5 }}>{tx.terms}</p>

              {/* Guarantee */}
              <div style={{ marginTop: 16, padding: 12, background: 'var(--b-bg-soft)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="shield" size={18} style={{ color: 'var(--b-success)', flexShrink: 0 }}/>
                <span className="b-xs" style={{ color: 'var(--b-text-2)' }}>{tx.guarantee}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
