'use client'

import Link from 'next/link'
import { useLang } from '@/components/providers/LangProvider'
import Logo from '@/components/shared/Logo'

export default function NotFound() {
  const { lang } = useLang()

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--b-bg-soft)' }}>
      <div className="text-center" style={{ maxWidth: 480 }}>
        <div className="flex justify-center mb-8">
          <Link href="/"><Logo size={36} /></Link>
        </div>

        <div style={{
          fontSize: 120,
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #1E3A8A, #0D9488)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 16,
        }}>
          404
        </div>

        <h1 className="b-h2 mb-3">
          {lang === 'kk' ? 'Бет табылмады' : lang === 'en' ? 'Page not found' : 'Страница не найдена'}
        </h1>
        <p className="b-body mb-8" style={{ color: 'var(--b-text-3)' }}>
          {lang === 'kk'
            ? 'Сіз іздеген бет жоқ немесе жойылған.'
            : lang === 'en'
            ? 'The page you are looking for does not exist or has been removed.'
            : 'Страница, которую вы ищете, не существует или была удалена.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn btn-primary">
            {lang === 'kk' ? 'Басты бетке' : lang === 'en' ? 'Go home' : 'На главную'}
          </Link>
          <Link href="/courses" className="btn btn-secondary">
            {lang === 'kk' ? 'Курстар' : lang === 'en' ? 'Browse courses' : 'Все курсы'}
          </Link>
        </div>
      </div>
    </div>
  )
}
