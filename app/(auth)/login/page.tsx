'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/shared/Logo'
import { useLang } from '@/components/providers/LangProvider'

type Tab = 'email' | 'phone'
type PhoneStep = 'phone' | 'otp'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const { lang } = useLang()

  const [tab, setTab]         = useState<Tab>('email')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('phone')

  // Email fields
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')

  // Phone fields
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const supabase = createClient()

  // ── Email login ──
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(tr('Қате email немесе құпиясөз', 'Неверный email или пароль')); setLoading(false); return }
    router.push(redirect); router.refresh()
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?redirect=${redirect}` },
    })
  }

  // ── Phone: жіберу ──
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const formatted = phone.startsWith('+') ? phone : `+7${phone.replace(/\D/g,'')}`
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
    setLoading(false)
    if (error) { setError(tr('SMS жіберілмеді. Нөмерді тексеріңіз.', 'Не удалось отправить SMS. Проверьте номер.')); return }
    setPhoneStep('otp')
  }

  // ── Phone: OTP тексеру ──
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const formatted = phone.startsWith('+') ? phone : `+7${phone.replace(/\D/g,'')}`
    const { error } = await supabase.auth.verifyOtp({ phone: formatted, token: otp, type: 'sms' })
    setLoading(false)
    if (error) { setError(tr('Код қате немесе мерзімі өтті', 'Код неверный или устарел')); return }
    router.push(redirect); router.refresh()
  }

  function tr(kk: string, ru: string) { return lang === 'kk' ? kk : ru }

  const GOOGLE_ICON = (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--b-bg-soft)' }}>
      <div className="blob blob-1" style={{ top: -120, right: -80, opacity: 0.15 }} />
      <div className="blob blob-2" style={{ bottom: -100, left: -80, opacity: 0.1 }} />

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <Link href="/"><Logo size={36} /></Link>
          <h1 className="b-h2 mt-4 mb-2">{tr('Қош келдіңіз', 'С возвращением')}<span style={{ color: 'var(--b-accent)' }}>.</span></h1>
          <p className="b-sm" style={{ color: 'var(--b-text-3)' }}>
            {tr('Оқуды жалғастыру үшін кіріңіз', 'Войдите, чтобы продолжить обучение')}
          </p>
        </div>

        <div className="card p-8">
          {/* Tabs: Email / Телефон */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--b-bg-tint)', borderRadius: 10, padding: 4, marginBottom: 20 }}>
            {(['email', 'phone'] as Tab[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(''); setPhoneStep('phone') }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: 13, transition: 'all 0.18s',
                  background: tab === t ? 'var(--b-bg)' : 'transparent',
                  color: tab === t ? 'var(--b-primary)' : 'var(--b-text-3)',
                  boxShadow: tab === t ? 'var(--sh-1)' : 'none',
                }}
              >
                {t === 'email' ? 'Email' : tr('📱 Телефон', '📱 Телефон')}
              </button>
            ))}
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogleLogin} className="btn btn-secondary w-full mb-4 gap-3" style={{ justifyContent: 'center' }}>
            {GOOGLE_ICON}
            {tr('Google арқылы кіру', 'Войти через Google')}
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'var(--b-line)' }} />
            <span className="b-xs" style={{ color: 'var(--b-text-4)' }}>{tr('немесе', 'или')}</span>
            <div className="flex-1 h-px" style={{ background: 'var(--b-line)' }} />
          </div>

          {error && (
            <div className="b-sm p-3 rounded-md mb-4" style={{ background: '#fef2f2', color: 'var(--b-error)', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          {/* ── EMAIL TAB ── */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
              <div>
                <label className="b-sm font-medium block mb-1.5">Email</label>
                <input type="email" className="inp" placeholder="email@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="b-sm font-medium">{tr('Құпиясөз', 'Пароль')}</label>
                  <Link href="/forgot-password" className="b-sm" style={{ color: 'var(--b-primary)' }}>
                    {tr('Ұмыттыңыз ба?', 'Забыли?')}
                  </Link>
                </div>
                <input type="password" className="inp" placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <button type="submit" className="btn btn-primary btn-fluid btn-lg w-full" disabled={loading}>
                {loading ? tr('Кіру...', 'Вход...') : tr('Кіру', 'Войти')}
              </button>
            </form>
          )}

          {/* ── PHONE TAB ── */}
          {tab === 'phone' && phoneStep === 'phone' && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div>
                <label className="b-sm font-medium block mb-1.5">{tr('Телефон нөмері', 'Номер телефона')}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="inp" style={{ width: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--b-text-2)' }}>+7</span>
                  <input type="tel" className="inp" style={{ flex: 1 }} placeholder="777 123 45 67"
                    value={phone} onChange={e => setPhone(e.target.value)} required maxLength={15} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-fluid btn-lg w-full" disabled={loading}>
                {loading ? tr('Жіберілуде...', 'Отправка...') : tr('SMS код жіберу', 'Отправить SMS код')}
              </button>
            </form>
          )}

          {tab === 'phone' && phoneStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="b-sm p-3 rounded-lg" style={{ background: 'var(--b-primary-50)', color: 'var(--b-primary)' }}>
                {tr(`+7${phone.replace(/\D/g,'')} нөміріне SMS жіберілді`, `SMS отправлен на +7${phone.replace(/\D/g,'')}`)}
              </div>
              <div>
                <label className="b-sm font-medium block mb-1.5">{tr('SMS кодын енгізіңіз', 'Введите код из SMS')}</label>
                <input type="text" className="inp" placeholder="123456" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
                  required maxLength={6} autoComplete="one-time-code"
                  style={{ letterSpacing: '0.3em', fontSize: 20, textAlign: 'center' }} />
              </div>
              <button type="submit" className="btn btn-primary btn-fluid btn-lg w-full" disabled={loading}>
                {loading ? tr('Тексерілуде...', 'Проверка...') : tr('Кіру', 'Войти')}
              </button>
              <button type="button" className="btn btn-link w-full" onClick={() => setPhoneStep('phone')} style={{ justifyContent: 'center' }}>
                {tr('Нөмерді өзгерту', 'Изменить номер')}
              </button>
            </form>
          )}

          <p className="b-sm text-center mt-5" style={{ color: 'var(--b-text-3)' }}>
            {tr('Аккаунт жоқ па?', 'Нет аккаунта?')}{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--b-primary)' }}>
              {tr('Тіркелу', 'Регистрация')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginPageInner /></Suspense>
}
