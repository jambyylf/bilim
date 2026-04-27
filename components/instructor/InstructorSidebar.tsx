'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Logo from '@/components/shared/Logo'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  profile: { full_name: string | null; role: string; avatar_url: string | null } | null
}

export default function InstructorSidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLang()

  const NAV = [
    { href: '/instructor/dashboard', icon: 'chart',     label: t.instructor.dashboard },
    { href: '/instructor/courses',   icon: 'book',      label: t.instructor.myCourses },
    { href: '/instructor/earnings',  icon: 'dollar',    label: t.instructor.earnings },
    { href: '/instructor/analytics', icon: 'target',    label: t.instructor.analytics },
    { href: '/instructor/settings',  icon: 'settings',  label: t.instructor.settings },
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?'

  return (
    <aside
      className="flex flex-col shrink-0"
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
      {/* Логотип */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--b-line)' }}>
        <Link href="/" className="no-underline">
          <Logo size={28} />
        </Link>
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href || (href !== '/instructor/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline transition-all text-sm font-medium"
              style={{
                color:      active ? 'var(--b-primary)' : 'var(--b-text-2)',
                background: active ? 'var(--b-primary-50)' : 'transparent',
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon name={icon} size={17} stroke={active ? 2 : 1.75} />
              {label}
            </Link>
          )
        })}

        {/* Курс жасау батырмасы */}
        <div className="mt-4 px-3">
          <Link
            href="/instructor/courses/new"
            className="btn btn-primary btn-sm w-full flex items-center gap-2"
            style={{ justifyContent: 'center' }}
          >
            <Icon name="plus" size={14} />
            {t.instructor.createCourse}
          </Link>
        </div>
      </nav>

      {/* Пайдаланушы блогі */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderTop: '1px solid var(--b-line)' }}
      >
        <div
          className="b-avatar shrink-0"
          style={{ width: 36, height: 36, fontSize: 13, background: 'var(--b-primary)', color: '#fff' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="b-sm font-semibold truncate">{profile?.full_name ?? '—'}</div>
          <div className="b-xs truncate" style={{ color: 'var(--b-text-3)' }}>
            {t.instructor.title}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm shrink-0"
          title={t.nav.logout}
        >
          <Icon name="arrow" size={15} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </aside>
  )
}
