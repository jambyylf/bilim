'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useLang } from '@/components/providers/LangProvider'
import Icon from '@/components/shared/Icon'

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  bio: string | null
  avatar_url: string | null
  role: string
}

export default function StudentSettingsContent({ profile }: { profile: Profile }) {
  const { lang } = useLang()
  const router   = useRouter()

  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    bio:       profile.bio ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error ?? 'Error')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--b-bg-soft)' }}>
      <TopNav />

      <style>{`
        .settings-grid { grid-template-columns: 1fr; }
        @media (min-width: 640px) { .settings-grid { grid-template-columns: 200px 1fr; } }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10 pb-24 md:pb-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ minHeight: 44 }}>
            <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
          </Link>
          <h1 className="b-h2">
            {lang === 'kk' ? 'Профиль параметрлері' : lang === 'en' ? 'Profile settings' : 'Настройки профиля'}
          </h1>
        </div>

        <div className="settings-grid grid gap-6">
          {/* Avatar card */}
          <div className="card p-6 text-center h-fit">
            <div className="b-avatar mx-auto mb-4" style={{ width: 80, height: 80, fontSize: 32, background: 'var(--b-primary)', color: '#fff' }}>
              {profile.full_name?.[0] ?? '?'}
            </div>
            <div className="b-sm font-semibold mb-0.5">{profile.full_name ?? '—'}</div>
            <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>
              {profile.role === 'instructor'
                ? (lang === 'kk' ? 'Нұсқаушы' : lang === 'en' ? 'Instructor' : 'Инструктор')
                : (lang === 'kk' ? 'Студент' : lang === 'en' ? 'Student' : 'Студент')}
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-5">
            <div className="card p-5 md:p-8">
              <form onSubmit={save} className="flex flex-col gap-5">
                <div>
                  <label className="b-label mb-1.5 block">
                    {lang === 'kk' ? 'Аты-жөні' : lang === 'en' ? 'Full name' : 'Полное имя'}
                  </label>
                  <input className="inp w-full" value={form.full_name}
                    onChange={e => set('full_name', e.target.value)} required style={{ minHeight: 44 }} />
                </div>

                <div>
                  <label className="b-label mb-1.5 block">Email</label>
                  <input className="inp w-full" value={profile.email ?? ''} disabled style={{ opacity: 0.6, minHeight: 44 }} />
                  <div className="b-xs mt-1" style={{ color: 'var(--b-text-3)' }}>
                    {lang === 'kk' ? 'Email-ді өзгерту мүмкін емес' : lang === 'en' ? 'Email cannot be changed' : 'Email нельзя изменить'}
                  </div>
                </div>

                <div>
                  <label className="b-label mb-1.5 block">
                    {lang === 'kk' ? 'Өзіңіз туралы' : lang === 'en' ? 'About you' : 'О себе'}
                  </label>
                  <textarea className="inp w-full" rows={4}
                    placeholder={lang === 'kk' ? 'Өзіңіз туралы жазыңыз...' : lang === 'en' ? 'Write about yourself...' : 'Напишите о себе...'}
                    value={form.bio} onChange={e => set('bio', e.target.value)} style={{ resize: 'vertical' }} />
                </div>

                {error && (
                  <div className="b-sm rounded-lg p-3" style={{ background: '#fee2e2', color: '#dc2626' }}>{error}</div>
                )}

                <div className="flex items-center gap-3">
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ minHeight: 44 }}>
                    {saving
                      ? (lang === 'kk' ? 'Сақталуда...' : lang === 'en' ? 'Saving...' : 'Сохранение...')
                      : (lang === 'kk' ? 'Сақтау' : lang === 'en' ? 'Save' : 'Сохранить')}
                  </button>
                  {saved && (
                    <span className="b-sm" style={{ color: '#059669' }}>
                      {lang === 'kk' ? '✓ Сақталды' : lang === 'en' ? '✓ Saved' : '✓ Сохранено'}
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Құпия сөз */}
            <div className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="b-sm font-semibold mb-0.5">
                    {lang === 'kk' ? 'Құпия сөзді өзгерту' : lang === 'en' ? 'Change password' : 'Изменить пароль'}
                  </div>
                  <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>
                    {lang === 'kk' ? 'Email арқылы сілтеме аласыз' : lang === 'en' ? 'Reset link via email' : 'Ссылка для сброса на email'}
                  </div>
                </div>
                <Link href="/forgot-password" className="btn btn-secondary btn-sm" style={{ minHeight: 44 }}>
                  {lang === 'kk' ? 'Жіберу' : lang === 'en' ? 'Send link' : 'Отправить'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}
