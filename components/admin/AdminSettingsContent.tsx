'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

interface Props {
  profile: {
    id: string
    full_name: string | null
    role: string
    avatar_url: string | null
  }
  email: string
}

export default function AdminSettingsContent({ profile, email }: Props) {
  const { lang } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [name, setName]       = useState(profile.full_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const [oldPwd, setOldPwd]   = useState('')
  const [newPwd, setNewPwd]   = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg]   = useState('')
  const [pwdError, setPwdError]   = useState('')

  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A'

  const tx = {
    title:    lang === 'kk' ? 'Баптаулар'           : lang === 'en' ? 'Settings'            : 'Настройки',
    profile:  lang === 'kk' ? 'Профиль'             : lang === 'en' ? 'Profile'             : 'Профиль',
    fullName: lang === 'kk' ? 'Толық аты-жөні'      : lang === 'en' ? 'Full name'           : 'Полное имя',
    emailL:   lang === 'kk' ? 'Email'               : 'Email',
    avatarUrl:lang === 'kk' ? 'Аватар URL'          : lang === 'en' ? 'Avatar URL'          : 'URL аватара',
    roleL:    lang === 'kk' ? 'Рөл'                 : lang === 'en' ? 'Role'                : 'Роль',
    save:     lang === 'kk' ? 'Сақтау'              : lang === 'en' ? 'Save changes'        : 'Сохранить',
    saving:   lang === 'kk' ? 'Сақталуда...'        : lang === 'en' ? 'Saving...'           : 'Сохранение...',
    saved:    lang === 'kk' ? 'Сақталды!'           : lang === 'en' ? 'Saved!'              : 'Сохранено!',
    security: lang === 'kk' ? 'Қауіпсіздік'         : lang === 'en' ? 'Security'            : 'Безопасность',
    changePwd:lang === 'kk' ? 'Құпия сөзді өзгерту' : lang === 'en' ? 'Change password'     : 'Изменить пароль',
    newPwd:   lang === 'kk' ? 'Жаңа құпия сөз'      : lang === 'en' ? 'New password'        : 'Новый пароль',
    oldPwd:   lang === 'kk' ? 'Ескі құпия сөз'      : lang === 'en' ? 'Current password'    : 'Текущий пароль',
    updatePwd:lang === 'kk' ? 'Жаңарту'             : lang === 'en' ? 'Update password'     : 'Обновить пароль',
    platform: lang === 'kk' ? 'Платформа баптаулары' : lang === 'en' ? 'Platform settings'  : 'Настройки платформы',
    commission:lang === 'kk'? 'Платформа комиссиясы' : lang === 'en' ? 'Platform commission' : 'Комиссия платформы',
    instrShare:lang === 'kk'? 'Спикер үлесі'         : lang === 'en' ? 'Instructor share'    : 'Доля спикера',
    infoOnly:  lang === 'kk'? 'Ақпараттық ғана'      : lang === 'en' ? 'Info only'           : 'Только просмотр',
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: name.trim(), avatar_url: avatarUrl.trim() || null })
      .eq('id', profile.id)
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPwd || newPwd.length < 6) { setPwdError(lang === 'kk' ? 'Кемінде 6 символ' : 'Минимум 6 символов'); return }
    setPwdSaving(true); setPwdError(''); setPwdMsg('')
    const { error: err } = await supabase.auth.updateUser({ password: newPwd })
    setPwdSaving(false)
    if (err) { setPwdError(err.message); return }
    setPwdMsg(lang === 'kk' ? 'Құпия сөз жаңартылды!' : 'Пароль обновлён!')
    setOldPwd(''); setNewPwd('')
  }

  return (
    <div style={{ padding: '48px 32px 80px', background: 'var(--b-bg-soft)', minHeight: '100vh' }}>

      {/* Тақырып */}
      <div style={{ marginBottom: 32 }}>
        <div className="b-eyebrow" style={{ marginBottom: 6 }}>Admin Console</div>
        <h1 className="b-h1" style={{ fontSize: 32 }}>{tx.title}</h1>
      </div>

      <div style={{ display: 'grid', gap: 24, maxWidth: 860 }} className="settings-grid">

        {/* ── Профиль ── */}
        <div className="card" style={{ padding: 28, background: 'var(--b-bg)', border: 'none' }}>
          <h2 className="b-h3" style={{ marginBottom: 24 }}>{tx.profile}</h2>

          {/* Аватар preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 16,
              background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 24, flexShrink: 0, overflow: 'hidden',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setAvatarUrl('')}/>
                : initials
              }
            </div>
            <div>
              <div className="b-h4">{name || 'Admin'}</div>
              <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>Super Admin · {email}</div>
            </div>
          </div>

          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Аты */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="b-eyebrow">{tx.fullName}</span>
              <input
                className="inp"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Мадина Қасымова"
                style={{ minHeight: 44 }}
              />
            </label>

            {/* Email (тек оқу) */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="b-eyebrow">{tx.emailL}</span>
              <input className="inp" value={email} disabled style={{ minHeight: 44, opacity: 0.6 }} />
            </label>

            {/* Аватар URL */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="b-eyebrow">{tx.avatarUrl}</span>
              <input
                className="inp"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                style={{ minHeight: 44 }}
              />
            </label>

            {/* Рөл (тек оқу) */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="b-eyebrow">{tx.roleL}</span>
              <div className="inp" style={{ minHeight: 44, display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#fee2e2', color: '#dc2626' }}>
                  Super Admin
                </span>
              </div>
            </label>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626', fontSize: 13 }}>
                {error}
              </div>
            )}
            {saved && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F0FDF4', color: '#059669', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="m4 12 5 5L20 6"/></svg>
                {tx.saved}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ minHeight: 44, paddingInline: 28, opacity: saving ? 0.7 : 1 }}>
                {saving ? tx.saving : tx.save}
              </button>
            </div>
          </form>
        </div>

        {/* ── Қауіпсіздік ── */}
        <div className="card" style={{ padding: 28, background: 'var(--b-bg)', border: 'none' }}>
          <h2 className="b-h3" style={{ marginBottom: 24 }}>{tx.security}</h2>
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="b-eyebrow">{tx.oldPwd}</span>
              <input className="inp" type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="••••••••" style={{ minHeight: 44 }}/>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="b-eyebrow">{tx.newPwd}</span>
              <input className="inp" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" style={{ minHeight: 44 }}/>
            </label>

            {pwdError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626', fontSize: 13 }}>
                {pwdError}
              </div>
            )}
            {pwdMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F0FDF4', color: '#059669', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="m4 12 5 5L20 6"/></svg>
                {pwdMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={pwdSaving} className="btn btn-secondary" style={{ minHeight: 44, paddingInline: 28, opacity: pwdSaving ? 0.7 : 1 }}>
                {pwdSaving ? '...' : tx.updatePwd}
              </button>
            </div>
          </form>
        </div>

        {/* ── Платформа баптаулары ── */}
        <div className="card" style={{ padding: 28, background: 'var(--b-bg)', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="b-h3">{tx.platform}</h2>
            <span className="b-xs" style={{ color: 'var(--b-text-3)' }}>{tx.infoOnly}</span>
          </div>
          <div className="hairline">
            {[
              { label: tx.commission,  value: '20%', icon: 'dollar'  },
              { label: tx.instrShare,  value: '80%', icon: 'users'   },
              { label: 'JWT TTL',      value: '1ч / 30 күн', icon: 'clock' },
              { label: 'YouTube Embed', value: lang === 'kk' ? 'Қосулы' : 'Включено', icon: 'video' },
              { label: 'RLS (Supabase)', value: lang === 'kk' ? 'Қосулы' : 'Включено', icon: 'lock' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--b-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={icon} size={16} style={{ color: 'var(--b-text-3)' }}/>
                </div>
                <span className="b-sm" style={{ flex: 1 }}>{label}</span>
                <span className="b-sm" style={{ fontWeight: 600, color: 'var(--b-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .settings-grid { grid-template-columns: 1fr; }
        @media (min-width: 900px) { .settings-grid { grid-template-columns: 1fr; max-width: 680px; } }
      `}</style>
    </div>
  )
}
