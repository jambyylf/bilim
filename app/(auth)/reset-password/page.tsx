'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/components/providers/LangProvider'
import Logo from '@/components/shared/Logo'

export default function ResetPasswordPage() {
  const { lang }          = useLang()
  const router            = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(lang === 'kk' ? 'Кемінде 8 таңба болуы керек' : lang === 'en' ? 'Minimum 8 characters' : 'Минимум 8 символов')
      return
    }
    if (password !== confirm) {
      setError(lang === 'kk' ? 'Құпия сөздер сәйкес емес' : lang === 'en' ? 'Passwords do not match' : 'Пароли не совпадают')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError(err.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--b-bg-soft)' }}>
      <div className="card p-10 w-full" style={{ maxWidth: 420 }}>
        <div className="flex justify-center mb-8">
          <Link href="/"><Logo size={32} /></Link>
        </div>

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#d1fae5' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                <path d="m4 12 5 5L20 6" />
              </svg>
            </div>
            <h1 className="b-h2 mb-3">
              {lang === 'kk' ? 'Құпия сөз жаңартылды!' : lang === 'en' ? 'Password updated!' : 'Пароль обновлён!'}
            </h1>
            <p className="b-body" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk' ? 'Кіру бетіне бағытталуда...' : lang === 'en' ? 'Redirecting to login...' : 'Перенаправление на страницу входа...'}
            </p>
          </div>
        ) : (
          <>
            <h1 className="b-h2 mb-2">
              {lang === 'kk' ? 'Жаңа құпия сөз' : lang === 'en' ? 'New password' : 'Новый пароль'}
            </h1>
            <p className="b-body mb-6" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk' ? 'Жаңа құпия сөзді енгізіңіз.' : lang === 'en' ? 'Enter your new password.' : 'Введите новый пароль.'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="b-label mb-1.5 block">
                  {lang === 'kk' ? 'Жаңа құпия сөз' : lang === 'en' ? 'New password' : 'Новый пароль'}
                </label>
                <input
                  type="password"
                  className="input w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="b-label mb-1.5 block">
                  {lang === 'kk' ? 'Қайталау' : lang === 'en' ? 'Confirm password' : 'Подтверждение'}
                </label>
                <input
                  type="password"
                  className="input w-full"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
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
                  ? (lang === 'kk' ? 'Сақталуда...' : lang === 'en' ? 'Saving...' : 'Сохранение...')
                  : (lang === 'kk' ? 'Сақтау' : lang === 'en' ? 'Save password' : 'Сохранить пароль')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
