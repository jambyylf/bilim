'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/providers/LangProvider'

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  bio: string | null
  avatar_url: string | null
  role: string
}

export default function InstructorSettingsContent({ profile }: { profile: Profile }) {
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
    <div style={{ padding: '40px 48px' }}>
      <div className="mb-8">
        <div className="b-eyebrow mb-1">
          {lang === 'kk' ? 'Нұсқаушы' : lang === 'en' ? 'Instructor' : 'Инструктор'}
        </div>
        <h1 className="b-h1">
          {lang === 'kk' ? 'Параметрлер' : lang === 'en' ? 'Settings' : 'Настройки'}
        </h1>
      </div>

      <div style={{ maxWidth: 540 }}>
        <div className="card p-8">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8">
            <div className="b-avatar" style={{ width: 72, height: 72, fontSize: 28, background: 'var(--b-primary)', color: '#fff', flexShrink: 0 }}>
              {profile.full_name?.[0] ?? '?'}
            </div>
            <div>
              <div className="b-sm font-semibold">{profile.full_name ?? '—'}</div>
              <div className="b-xs mt-0.5" style={{ color: 'var(--b-text-3)' }}>{profile.email}</div>
            </div>
          </div>

          <form onSubmit={save} className="flex flex-col gap-5">
            {/* Name */}
            <div>
              <label className="b-label mb-1.5 block">
                {lang === 'kk' ? 'Аты-жөні' : lang === 'en' ? 'Full name' : 'Полное имя'}
              </label>
              <input
                className="input w-full"
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                required
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="b-label mb-1.5 block">Email</label>
              <input
                className="input w-full"
                value={profile.email ?? ''}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="b-label mb-1.5 block">
                {lang === 'kk' ? 'Биография' : lang === 'en' ? 'Bio' : 'Биография'}
              </label>
              <textarea
                className="input w-full"
                rows={5}
                placeholder={lang === 'kk' ? 'Өзіңіз туралы жазыңыз...' : lang === 'en' ? 'Write about yourself...' : 'Напишите о себе...'}
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {error && (
              <div className="b-sm rounded-lg p-3" style={{ background: '#fee2e2', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? (lang === 'kk' ? 'Сақталуда...' : lang === 'en' ? 'Saving...' : 'Сохранение...')
                  : (lang === 'kk' ? 'Сақтау' : lang === 'en' ? 'Save changes' : 'Сохранить')}
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
    </div>
  )
}
