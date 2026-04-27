'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/shared/Logo'
import { useLang } from '@/components/providers/LangProvider'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLang()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'instructor'>('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError(t.auth.passwordTooShort)
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError(t.auth.alreadyRegistered)
      } else {
        setError(t.auth.genericError)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  async function handleGoogleRegister() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--b-bg-soft)' }}>
        <div className="w-full max-w-[420px] card p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--b-primary-50)', color: 'var(--b-primary)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m4 12 5 5L20 6"/>
            </svg>
          </div>
          <h2 className="b-h2 mb-3">{t.auth.checkEmail}</h2>
          <p className="b-body mb-6" style={{ color: 'var(--b-text-3)' }}>
            {t.auth.checkEmailSub} <strong>{email}</strong>.
          </p>
          <Link href="/login" className="btn btn-primary btn-fluid w-full" style={{ justifyContent: 'center' }}>
            {t.auth.goToLogin}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--b-bg-soft)' }}>
      <div className="blob blob-1" style={{ top: -100, right: -60, opacity: 0.12 }} />

      <div className="w-full max-w-[460px] relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex">
            <Logo size={36} />
          </Link>
          <h1 className="b-h2 mt-4 mb-2">{t.auth.registerTitle}</h1>
          <p className="b-sm" style={{ color: 'var(--b-text-3)' }}>{t.auth.registerSub}</p>
        </div>

        <div className="card p-8">
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="btn btn-secondary w-full mb-4 gap-3"
            style={{ justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {t.auth.googleRegister}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'var(--b-line)' }} />
            <span className="b-xs" style={{ color: 'var(--b-text-4)' }}>{t.auth.or}</span>
            <div className="flex-1 h-px" style={{ background: 'var(--b-line)' }} />
          </div>

          {error && (
            <div className="text-sm p-3 rounded-md mb-4"
              style={{ background: '#fef2f2', color: 'var(--b-error)', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Рөл таңдау */}
            <div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['student',    t.auth.iAmStudent],
                  ['instructor', t.auth.iAmInstructor],
                ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRole(val)}
                    className="p-3 rounded-md text-sm font-medium text-left border transition-all"
                    style={{
                      borderColor: role === val ? 'var(--b-primary)' : 'var(--b-line)',
                      background:  role === val ? 'var(--b-primary-50)' : 'var(--b-bg)',
                      color:       role === val ? 'var(--b-primary)' : 'var(--b-text-2)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="b-sm font-medium block mb-1.5">{t.auth.fullName}</label>
              <input
                type="text"
                className="inp"
                placeholder="Айдана Сапарова"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="b-sm font-medium block mb-1.5">{t.auth.email}</label>
              <input
                type="email"
                className="inp"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="b-sm font-medium block mb-1.5">{t.auth.password}</label>
              <input
                type="password"
                className="inp"
                placeholder={t.auth.minPassword}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-fluid btn-lg w-full mt-1"
              disabled={loading}
            >
              {loading ? t.auth.registering : t.auth.register}
            </button>
          </form>

          <p className="b-xs text-center mt-4" style={{ color: 'var(--b-text-4)' }}>
            {t.auth.termsAgree}{' '}
            <Link href="/terms" style={{ color: 'var(--b-primary)' }}>{t.auth.terms}</Link>.
          </p>

          <p className="b-sm text-center mt-4" style={{ color: 'var(--b-text-3)' }}>
            {t.auth.hasAccount}{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--b-primary)' }}>
              {t.auth.loginLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
