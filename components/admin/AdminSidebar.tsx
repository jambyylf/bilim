'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '@/components/shared/Logo'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

interface Props {
  profile: { full_name: string | null; role: string } | null
}

export default function AdminSidebar({ profile }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const { lang } = useLang()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const NAV = [
    { href: '/admin/dashboard', icon: 'chart',  label: lang === 'kk' ? 'Шолу'        : lang === 'en' ? 'Overview'  : 'Обзор' },
    { href: '/admin/courses',   icon: 'book',   label: lang === 'kk' ? 'Курстар'      : lang === 'en' ? 'Courses'   : 'Курсы' },
    { href: '/admin/users',     icon: 'users',  label: lang === 'kk' ? 'Қолданушылар' : lang === 'en' ? 'Users'     : 'Пользователи' },
    { href: '/admin/orders',    icon: 'dollar', label: lang === 'kk' ? 'Тапсырыстар'  : lang === 'en' ? 'Orders'    : 'Заказы' },
  ]

  async function logout() {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  const sidebarContent = (
    <>
      <div className="px-6 py-5 shrink-0" style={{ borderBottom: '1px solid var(--b-line)' }}>
        <div className="flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <Logo size={24} />
            <span className="b-xs font-bold" style={{ color: 'var(--b-error)', background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>ADMIN</span>
          </Link>
          <button
            className="md:hidden btn btn-ghost btn-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-3 rounded-lg no-underline text-sm font-medium transition-all"
              style={{
                color: active ? 'var(--b-primary)' : 'var(--b-text-2)',
                background: active ? 'var(--b-primary-50)' : 'transparent',
                fontWeight: active ? 600 : 400,
                minHeight: 44,
              }}>
              <Icon name={icon} size={16} stroke={active ? 2 : 1.75} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 flex items-center gap-3 shrink-0" style={{ borderTop: '1px solid var(--b-line)' }}>
        <div className="b-avatar shrink-0" style={{ width: 34, height: 34, background: '#dc2626', color: '#fff', fontSize: 13 }}>
          {profile?.full_name?.[0] ?? 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="b-sm font-semibold truncate">{profile?.full_name ?? 'Admin'}</div>
          <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>Administrator</div>
        </div>
        <button onClick={logout} className="btn btn-ghost btn-sm" style={{ minHeight: 44, minWidth: 44 }}>
          <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile: жоғарғы тақта ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4"
        style={{ height: 56, background: 'var(--b-bg)', borderBottom: '1px solid var(--b-line)' }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          className="btn btn-ghost btn-sm"
          aria-label="Open menu"
          style={{ minHeight: 44, minWidth: 44 }}
        >
          <Icon name="menu" size={22} />
        </button>
        <Logo size={24} />
        <span className="b-xs font-bold" style={{ color: 'var(--b-error)', background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>ADMIN</span>
      </header>

      {/* ── Mobile: overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[150]"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: drawer ── */}
      <aside
        className="md:hidden fixed top-0 left-0 bottom-0 z-[200] flex flex-col"
        style={{
          width: 280,
          background: 'var(--b-bg)',
          borderRight: '1px solid var(--b-line)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          overflowY: 'auto',
        }}
      >
        {sidebarContent}
      </aside>

      {/* ── Desktop: sidebar ── */}
      <aside
        className="hidden md:flex flex-col shrink-0"
        style={{
          width: 240,
          borderRight: '1px solid var(--b-line)',
          background: 'var(--b-bg)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
