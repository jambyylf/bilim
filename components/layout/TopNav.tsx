'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '@/components/shared/Logo'
import Icon from '@/components/shared/Icon'
import NotificationBell from '@/components/layout/NotificationBell'
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
  const pathname  = usePathname()
  const router    = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { lang, t, setLang }   = useLang()

  const [langOpen,   setLangOpen]   = useState(false)
  const [searchQ,    setSearchQ]    = useState('')

  const desktopLangRef = useRef<HTMLDivElement>(null)
  const mobileLangRef  = useRef<HTMLDivElement>(null)

  // Сыртқа басқанда жабу — click (mousedown емес!) пайдаланамыз
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const inDesktop = desktopLangRef.current?.contains(e.target as Node)
      const inMobile  = mobileLangRef.current?.contains(e.target as Node)
      if (!inDesktop && !inMobile) setLangOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQ.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchQ.trim())}`)
    }
  }

  const navItems = [
    { href: '/',           label: t.nav.home },
    { href: '/courses',    label: t.nav.courses },
    { href: '/instructor', label: t.nav.teach },
    { href: '/business',   label: t.nav.business },
  ]

  return (
    <header className="glass-nav sticky top-0 z-50">
      {/* ── Desktop + Tablet nav ── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-3 flex items-center gap-3 md:gap-6">

        {/* Логотип */}
        <Link href="/" className="no-underline shrink-0">
          <Logo size={28} />
        </Link>

        {/* Liquid tabs — тек планшет/десктоп */}
        <div className="hidden md:block ml-1">
          <nav className="liquid-tabs">
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
        </div>

        {/* Іздеу — десктоп */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[360px] relative ml-auto hidden md:block">
          <Icon
            name="search" size={16}
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--b-text-4)', zIndex: 1 }}
          />
          <input
            className="nav-search-input inp"
            placeholder={t.nav.search}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </form>

        {/* Оң жақ — десктоп */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <button onClick={toggleTheme} className="btn btn-ghost btn-sm" aria-label="theme">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
          </button>

          <div className="relative" ref={desktopLangRef}>
            <button className="btn btn-ghost btn-sm gap-1.5" onClick={() => setLangOpen(v => !v)}>
              <Icon name="globe" size={14} />
              {LANG_LABELS[lang]}
            </button>
            {langOpen && (
              <div className="dropdown-menu absolute right-0 top-full mt-1 z-50">
                {LANG_OPTIONS.map(({ code, label }) => (
                  <button
                    key={code}
                    className="dropdown-item"
                    style={{ color: lang === code ? 'var(--b-primary)' : undefined, fontWeight: lang === code ? 600 : 400 }}
                    onClick={() => { setLang(code); setLangOpen(false) }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--b-line)' }} />

          {user ? (
            <>
              <NotificationBell />
              <Link href="/dashboard" className="btn btn-secondary btn-sm">
                {user.full_name?.split(' ')[0] ?? t.nav.profile}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login"    className="btn btn-secondary btn-sm">{t.nav.login}</Link>
              <Link href="/register" className="btn btn-fluid btn-sm">{t.nav.register}</Link>
            </>
          )}
        </div>

        {/* Мобильді оң жақ */}
        <div className="md:hidden flex items-center gap-1 ml-auto">
          <button onClick={toggleTheme} className="btn btn-ghost btn-sm" style={{ padding: 8 }} aria-label="theme">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
          </button>
          <div className="relative" ref={mobileLangRef}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: '6px 8px', fontSize: 11, fontWeight: 600 }}
              onClick={() => setLangOpen(v => !v)}
            >
              {LANG_LABELS[lang]}
            </button>
            {langOpen && (
              <div className="dropdown-menu absolute right-0 top-full mt-1 z-50">
                {LANG_OPTIONS.map(({ code, label }) => (
                  <button
                    key={code}
                    className="dropdown-item"
                    style={{ color: lang === code ? 'var(--b-primary)' : undefined, fontWeight: lang === code ? 600 : 400 }}
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
              <NotificationBell />
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', padding: 4 }}>
                <div className="b-avatar" style={{ width: 36, height: 36, background: 'var(--b-primary)', color: '#fff', fontSize: 15 }}>
                  {user.full_name?.[0] ?? '?'}
                </div>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Link href="/login"    className="btn btn-secondary btn-sm">{t.nav.login}</Link>
              <Link href="/register" className="btn btn-fluid btn-sm">{t.nav.register}</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
