'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/components/providers/LangProvider'
import Logo from '@/components/shared/Logo'

export default function ForgotPasswordPage() {
  const { lang } = useLang()
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/reset-password`
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--b-bg-soft)' }}>
      <div className="card p-10 w-full" style={{ maxWidth: 420 }}>
        <div className="flex justify-center mb-8">
          <Link href="/"><Logo size={32} /></Link>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#d1fae5' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="b-h2 mb-3">
              {lang === 'kk' ? 'Хат жіберілді!' : lang === 'en' ? 'Email sent!' : 'Письмо отправлено!'}
            </h1>
            <p className="b-body mb-6" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk'
                ? `${email} мекенжайына құпия сөзді қалпына келтіру сілтемесі жіберілді.`
                : lang === 'en'
                ? `A password reset link has been sent to ${email}.`
                : `Ссылка для сброса пароля отправлена на ${email}.`}
            </p>
            <Link href="/login" className="btn btn-primary btn-fluid" style={{ justifyContent: 'center' }}>
              {lang === 'kk' ? 'Кіруге оралу' : lang === 'en' ? 'Back to login' : 'Вернуться ко входу'}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="b-h2 mb-2">
              {lang === 'kk' ? 'Құпия сөзді ұмыттыңыз ба?' : lang === 'en' ? 'Forgot password?' : 'Забыли пароль?'}
            </h1>
            <p className="b-body mb-6" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk'
                ? 'Email-ді енгізіңіз, қалпына келтіру сілтемесін жіберейік.'
                : lang === 'en'
                ? 'Enter your email and we\'ll send you a reset link.'
                : 'Введите email и мы отправим ссылку для сброса пароля.'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="b-label mb-1.5 block">Email</label>
                <input
                  type="email"
                  className="input w-full"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="b-sm rounded-lg p-3" style={{ background: '#fee2e2', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-fluid btn-lg" disabled={loading} style={{ justifyContent: 'center' }}>
                {loading
                  ? (lang === 'kk' ? 'Жіберілуде...' : lang === 'en' ? 'Sending...' : 'Отправка...')
                  : (lang === 'kk' ? 'Сілтемені жіберу' : lang === 'en' ? 'Send reset link' : 'Отправить ссылку')}
              </button>

              <div className="text-center b-sm" style={{ color: 'var(--b-text-3)' }}>
                <Link href="/login" style={{ color: 'var(--b-primary)' }}>
                  {lang === 'kk' ? '← Кіруге оралу' : lang === 'en' ? '← Back to login' : '← Вернуться ко входу'}
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
