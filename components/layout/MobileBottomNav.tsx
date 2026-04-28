'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { lang } = useLang()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const tabs = [
    { href: '/',          icon: 'grid',   label: lang === 'kk' ? 'Басты'   : lang === 'en' ? 'Home'    : 'Главная', active: pathname === '/' },
    { href: '/courses',   icon: 'search', label: lang === 'kk' ? 'Іздеу'   : lang === 'en' ? 'Catalog' : 'Каталог', active: pathname.startsWith('/courses') },
    { href: '/dashboard', icon: 'book',   label: lang === 'kk' ? 'Менің'   : lang === 'en' ? 'My'      : 'Мои',     active: pathname === '/dashboard' },
    { href: '/settings',  icon: 'user',   label: lang === 'kk' ? 'Профиль' : lang === 'en' ? 'Profile' : 'Профиль', active: pathname === '/settings' },
  ]

  return (
    <nav
      className="md:hidden flex flex-row items-center"
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 12,
        padding: 8,
        borderRadius: 28,
        background: isDark ? 'rgba(10,14,26,0.85)' : 'rgba(255,255,255,0.72)',
        WebkitBackdropFilter: 'saturate(200%) blur(28px)',
        backdropFilter: 'saturate(200%) blur(28px)',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.7)',
        boxShadow: isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 40px rgba(0,0,0,0.6)'
          : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 36px rgba(17,24,39,0.18)',
        zIndex: 50,
      }}
    >
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            padding: '9px 4px',
            borderRadius: 18,
            textDecoration: 'none',
            fontSize: 10,
            fontWeight: 600,
            color: tab.active ? '#fff' : 'var(--b-text-3)',
            background: tab.active
              ? 'linear-gradient(180deg, var(--b-primary) 0%, #1e40af 100%)'
              : 'transparent',
            boxShadow: tab.active
              ? 'inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 14px rgba(30,58,138,0.4)'
              : 'none',
            transform: tab.active ? 'scale(1.04)' : 'scale(1)',
            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <Icon name={tab.icon} size={20} />
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
