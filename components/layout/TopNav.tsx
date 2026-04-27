'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/shared/Logo'
import Icon from '@/components/shared/Icon'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useLang, type LangCode } from '@/components/providers/LangProvider'

interface TopNavProps {
  user?: { full_name: string | null; role: string } | null
}

const LANG_LABELS: Record<LangCode, string> = { kk: 'ҚАЗ', ru: 'РУС', en: 'ENG' }
const LANG_OPTIONS: { code: LangCode; label: string }[] = [
  { code: 'kk', label: 'Қазақша' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

export default function TopNav({ user }: TopNavProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { lang, t, setLang } = useLang()

  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  // Тізімнен тыс басқанда жабу
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navItems = [
    { href: '/',           label: t.nav.home },
    { href: '/courses',    label: t.nav.courses },
    { href: '/instructor', label: t.nav.teach },
    { href: '/business',   label: t.nav.business },
  ]

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-8 py-3.5 flex items-center gap-6">
        {/* Логотип */}
        <Link href="/" className="no-underline shrink-0">
          <Logo />
        </Link>

        {/* Liquid tabs навигациясы */}
        <nav className="liquid-tabs ml-2">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`liquid-tab no-underline ${pathname === href ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Іздеу жолағы */}
        <div className="flex-1 max-w-[360px] relative ml-auto">
          <Icon
            name="search"
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--b-text-4)',
              zIndex: 1,
            }}
          />
          <input
            className="inp"
            placeholder={t.nav.search}
            style={{
              paddingLeft: 38,
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.6)',
            }}
          />
        </div>

        {/* Оң жақ батырмалар */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Тема ауыстырғыш */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm"
            title={theme === 'light' ? t.theme.dark : t.theme.light}
            aria-label={theme === 'light' ? t.theme.dark : t.theme.light}
          >
            {theme === 'light' ? (
              <Icon name="moon" size={16} />
            ) : (
              <Icon name="sun" size={16} />
            )}
          </button>

          {/* Тіл таңдағыш */}
          <div className="relative" ref={langRef}>
            <button
              className="btn btn-ghost btn-sm flex gap-1.5 items-center"
              onClick={() => setLangOpen(v => !v)}
              aria-expanded={langOpen}
            >
              <Icon name="globe" size={14} />
              {LANG_LABELS[lang]}
            </button>

            {langOpen && (
              <div
                className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-2 z-50"
                style={{
                  background: 'var(--b-surface-1)',
                  border: '1px solid var(--b-line)',
                  minWidth: 120,
                }}
              >
                {LANG_OPTIONS.map(({ code, label }) => (
                  <button
                    key={code}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{
                      color: lang === code ? 'var(--b-primary)' : 'var(--b-text-1)',
                      fontWeight: lang === code ? 600 : 400,
                      background: 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--b-surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => { setLang(code); setLangOpen(false) }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link href="/cart" className="btn btn-ghost btn-sm">
                <Icon name="cart" size={16} />
              </Link>
              <Link href="/dashboard" className="btn btn-secondary btn-sm">
                {user.full_name?.split(' ')[0] ?? t.nav.profile}
              </Link>
            </>
          ) : (
            <>
              <div className="w-px h-5 mx-1.5" style={{ background: 'var(--b-line)' }} />
              <Link href="/login" className="btn btn-secondary btn-sm">
                {t.nav.login}
              </Link>
              <Link href="/register" className="btn btn-primary btn-fluid btn-sm">
                {t.nav.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
