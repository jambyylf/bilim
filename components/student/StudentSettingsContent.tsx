'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
      {/* Nav */}
      <div style={{ borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
            {lang === 'kk' ? 'Кабинет' : lang === 'en' ? 'Dashboard' : 'Кабинет'}
          </Link>
          <span style={{ color: 'var(--b-line)' }}>|</span>
          <span className="b-sm font-semibold">
            {lang === 'kk' ? 'Параметрлер' : lang === 'en' ? 'Settings' : 'Настройки'}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="b-h2 mb-8">
          {lang === 'kk' ? 'Профиль параметрлері' : lang === 'en' ? 'Profile settings' : 'Настройки профиля'}
        </h1>

        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 2fr' }}>
          {/* Avatar card */}
          <div className="card p-6 text-center">
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
          <div className="card p-8">
            <form onSubmit={save} className="flex flex-col gap-5">
              <div>
                <label className="b-label mb-1.5 block">
                  {lang === 'kk' ? 'Аты-жөні' : lang === 'en' ? 'Full name' : 'Полное имя'}
                </label>
                <input className="input w-full" value={form.full_name}
                  onChange={e => set('full_name', e.target.value)} required />
              </div>

              <div>
                <label className="b-label mb-1.5 block">Email</label>
                <input className="input w-full" value={profile.email ?? ''} disabled style={{ opacity: 0.6 }} />
                <div className="b-xs mt-1" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'Email-ді өзгерту мүмкін емес' : lang === 'en' ? 'Email cannot be changed' : 'Email нельзя изменить'}
                </div>
              </div>

              <div>
                <label className="b-label mb-1.5 block">
                  {lang === 'kk' ? 'Өзіңіз туралы' : lang === 'en' ? 'About you' : 'О себе'}
                </label>
                <textarea className="input w-full" rows={4}
                  placeholder={lang === 'kk' ? 'Өзіңіз туралы жазыңыз...' : lang === 'en' ? 'Write about yourself...' : 'Напишите о себе...'}
                  value={form.bio} onChange={e => set('bio', e.target.value)} style={{ resize: 'vertical' }} />
              </div>

              {error && (
                <div className="b-sm rounded-lg p-3" style={{ background: '#fee2e2', color: '#dc2626' }}>{error}</div>
              )}

              <div className="flex items-center gap-3">
                <button type="submit" className="btn btn-primary" disabled={saving}>
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
        </div>

        {/* Password change link */}
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="b-sm font-semibold mb-0.5">
                {lang === 'kk' ? 'Құпия сөзді өзгерту' : lang === 'en' ? 'Change password' : 'Изменить пароль'}
              </div>
              <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>
                {lang === 'kk' ? 'Email арқылы қалпына келтіру сілтемесін аласыз' : lang === 'en' ? 'You will receive a reset link via email' : 'Вы получите ссылку для сброса на email'}
              </div>
            </div>
            <Link href="/forgot-password" className="btn btn-secondary btn-sm">
              {lang === 'kk' ? 'Жіберу' : lang === 'en' ? 'Send link' : 'Отправить'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
