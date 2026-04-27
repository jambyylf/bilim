'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/shared/Logo'
import { useLang } from '@/components/providers/LangProvider'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const { t } = useLang()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(t.auth.wrongCredentials)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?redirect=${redirect}`,
      },
    })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--b-bg-soft)' }}
    >
      <div className="blob blob-1" style={{ top: -120, right: -80, opacity: 0.15 }} />
      <div className="blob blob-2" style={{ bottom: -100, left: -80, opacity: 0.1 }} />

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex">
            <Logo size={36} />
          </Link>
          <h1 className="b-h2 mt-4 mb-2">{t.auth.welcome}</h1>
          <p className="b-sm" style={{ color: 'var(--b-text-3)' }}>{t.auth.loginSub}</p>
        </div>

        <div className="card p-8">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn btn-secondary w-full mb-4 gap-3"
            style={{ justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {t.auth.googleLogin}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'var(--b-line)' }} />
            <span className="b-xs" style={{ color: 'var(--b-text-4)' }}>{t.auth.or}</span>
            <div className="flex-1 h-px" style={{ background: 'var(--b-line)' }} />
          </div>

          {error && (
            <div
              className="text-sm p-3 rounded-md mb-4"
              style={{ background: '#fef2f2', color: 'var(--b-error)', border: '1px solid #fecaca' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="b-sm font-medium">{t.auth.password}</label>
                <Link href="/forgot-password" className="b-sm" style={{ color: 'var(--b-primary)' }}>
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <input
                type="password"
                className="inp"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-fluid btn-lg w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  {t.auth.loggingIn}
                </span>
              ) : t.auth.login}
            </button>
          </form>

          <p className="b-sm text-center mt-5" style={{ color: 'var(--b-text-3)' }}>
            {t.auth.noAccount}{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--b-primary)' }}>
              {t.auth.registerLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
