'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { lang } = useLang()

  const tabs = [
    {
      href: '/',
      icon: 'grid',
      label: lang === 'kk' ? 'Басты' : lang === 'en' ? 'Home' : 'Главная',
      active: pathname === '/',
    },
    {
      href: '/courses',
      icon: 'search',
      label: lang === 'kk' ? 'Каталог' : lang === 'en' ? 'Catalog' : 'Каталог',
      active: pathname.startsWith('/courses'),
    },
    {
      href: '/dashboard',
      icon: 'book',
      label: lang === 'kk' ? 'Курстарым' : lang === 'en' ? 'My courses' : 'Мои курсы',
      active: pathname === '/dashboard',
    },
    {
      href: '/settings',
      icon: 'user',
      label: lang === 'kk' ? 'Профиль' : lang === 'en' ? 'Profile' : 'Профиль',
      active: pathname === '/settings',
    },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'var(--b-bg)',
        borderTop: '1px solid var(--b-line)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div style={{ display: 'flex', height: 60 }}>
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
              color: tab.active ? 'var(--b-primary)' : 'var(--b-text-4)',
              textDecoration: 'none',
              fontSize: 10,
              fontWeight: tab.active ? 600 : 400,
              transition: 'color 0.15s',
              minWidth: 44,
            }}
          >
            <Icon name={tab.icon} size={22} />
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
