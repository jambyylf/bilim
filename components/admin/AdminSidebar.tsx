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
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const NAV = [
    { href: '/admin/dashboard', icon: 'grid',   label: 'Dashboard' },
    { href: '/admin/users',     icon: 'users',  label: lang === 'kk' ? 'Қолданушылар' : lang === 'en' ? 'Users'    : 'Пользователи' },
    { href: '/admin/courses',   icon: 'book',   label: lang === 'kk' ? 'Курстар'       : lang === 'en' ? 'Courses'  : 'Курсы', badge: null },
    { href: '/admin/orders',    icon: 'dollar', label: lang === 'kk' ? 'Кіріс'         : lang === 'en' ? 'Revenue'  : 'Доход' },
    { href: '/admin/courses?status=pending', icon: 'shield', label: lang === 'kk' ? 'Модерация' : lang === 'en' ? 'Moderate' : 'Модерация', badge: '!' },
    { href: '/admin/dashboard#analytics',   icon: 'chart',  label: 'Analytics' },
  ]

  async function logout() {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).slice(0, 2).join('')
    : 'A'

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 14px 24px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo color="var(--b-accent)" textColor="#fff" size={22} />
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {NAV.map(({ href, icon, label, badge }) => {
          const active = pathname === href || (href === '/admin/dashboard' && pathname === '/admin')
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 500,
              background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.15s',
            }}>
              <Icon name={icon} size={16} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && (
                <span style={{
                  background: 'var(--b-accent)', color: '#1f1300',
                  fontSize: 10, padding: '2px 6px', borderRadius: 999, fontWeight: 700,
                }}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User profile */}
      <div style={{
        margin: 14, padding: 10, borderRadius: 8,
        background: 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'var(--b-accent)', color: '#1f1300',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 11,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.full_name ?? 'Admin'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Super Admin</div>
        </div>
        <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 4 }}>
          <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 56, background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
      }}>
        <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 8 }}>
          <Icon name="menu" size={22} />
        </button>
        <Logo color="var(--b-accent)" textColor="#fff" size={22} />
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden" style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
        }} onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className="md:hidden" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
        width: 260, background: '#0f172a',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto',
      }}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:block" style={{
        width: 220, flexShrink: 0,
        background: '#0f172a',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {sidebarContent}
      </aside>
    </>
  )
}
