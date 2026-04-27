'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'

interface Notification {
  id: string
  type: string
  title_kk: string
  title_ru: string
  body_kk: string | null
  body_ru: string | null
  link: string | null
  read: boolean
  created_at: string
}

export default function NotificationBell() {
  const { lang } = useLang()
  const [open, setOpen]                   = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]             = useState(false)
  const [fetched, setFetched]             = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  // Сыртқа басқанда жабу
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function fetchNotifications() {
    if (fetched) return
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const d = await res.json()
        setNotifications(d.notifications ?? [])
      }
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }

  async function markAllRead() {
    if (unread === 0) return
    await fetch('/api/notifications/read', { method: 'POST' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function toggle() {
    if (!open) fetchNotifications()
    setOpen(v => !v)
    if (!open && unread > 0) markAllRead()
  }

  function title(n: Notification) {
    return lang === 'kk' ? n.title_kk : n.title_ru
  }
  function body(n: Notification) {
    return lang === 'kk' ? n.body_kk : n.body_ru
  }

  const TYPE_ICONS: Record<string, string> = {
    course_approved: 'check',
    course_rejected: 'close',
    new_enrollment:  'users',
    review:          'star',
    system:          'bell',
  }

  const TYPE_COLORS: Record<string, string> = {
    course_approved: '#059669',
    course_rejected: '#dc2626',
    new_enrollment:  '#1E3A8A',
    review:          '#F59E0B',
    system:          '#6b7280',
  }

  function fmtDate(dt: string) {
    const d = new Date(dt)
    const now = new Date()
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000)
    if (diffMin < 1)  return lang === 'kk' ? 'Жаңа ғана' : 'Только что'
    if (diffMin < 60) return `${diffMin} ${lang === 'kk' ? 'мин' : 'мин'}`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24)   return `${diffH} ${lang === 'kk' ? 'сағ' : 'ч'}`
    return d.toLocaleDateString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="btn btn-ghost btn-sm"
        style={{ padding: 8, position: 'relative' }}
        aria-label="Notifications"
      >
        <Icon name="bell" size={18} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 16, height: 16, borderRadius: 999,
            background: '#dc2626', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 340, maxHeight: 480,
            background: 'var(--b-bg)', border: '1px solid var(--b-line)',
            borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-3)',
            overflow: 'hidden', zIndex: 200,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--b-line)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span className="b-h4">
              {lang === 'kk' ? 'Хабарламалар' : 'Уведомления'}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="b-xs"
                style={{ color: 'var(--b-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
              >
                {lang === 'kk' ? 'Барлығын оқыдым' : 'Все прочитаны'}
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--b-text-4)' }}>
                <Icon name="refresh" size={20} style={{ margin: '0 auto' }} />
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <Icon name="bell" size={32} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
                <div className="b-sm" style={{ color: 'var(--b-text-4)' }}>
                  {lang === 'kk' ? 'Хабарлама жоқ' : 'Нет уведомлений'}
                </div>
              </div>
            ) : (
              notifications.map(n => {
                const iconColor = TYPE_COLORS[n.type] ?? '#6b7280'
                const iconName  = TYPE_ICONS[n.type]  ?? 'bell'
                const content = (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex', gap: 12, padding: '12px 16px',
                      borderBottom: '1px solid var(--b-line-soft)',
                      background: n.read ? 'transparent' : 'var(--b-primary-50)',
                      cursor: n.link ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                      background: `${iconColor}18`, color: iconColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={iconName} size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="b-sm" style={{ fontWeight: n.read ? 500 : 700, lineHeight: 1.3, marginBottom: 2 }}>
                        {title(n)}
                      </div>
                      {body(n) && (
                        <div className="b-xs" style={{ color: 'var(--b-text-3)', lineHeight: 1.4 }}>
                          {body(n)}
                        </div>
                      )}
                      <div className="b-xs" style={{ color: 'var(--b-text-4)', marginTop: 4 }}>
                        {fmtDate(n.created_at)}
                      </div>
                    </div>
                    {!n.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1E3A8A', flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                )

                return n.link ? (
                  <Link key={n.id} href={n.link} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : content
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
