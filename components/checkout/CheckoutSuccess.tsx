'use client'

import Link from 'next/link'
import { useLang } from '@/components/providers/LangProvider'

export default function CheckoutSuccess({ courseSlug }: { courseSlug: string }) {
  const { lang } = useLang()
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--b-bg-soft)' }}>
      <div className="card p-12 text-center max-w-md w-full">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: '#d1fae5' }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
            <path d="m4 12 5 5L20 6" />
          </svg>
        </div>
        <h1 className="b-h1 mb-3">
          {lang === 'kk' ? 'Төлем сәтті өтті!' : lang === 'en' ? 'Payment successful!' : 'Оплата прошла успешно!'}
        </h1>
        <p className="b-body mb-8" style={{ color: 'var(--b-text-3)' }}>
          {lang === 'kk' ? 'Курс сіздің кабинетіңізге қосылды.'
           : lang === 'en' ? 'The course has been added to your dashboard.'
           : 'Курс добавлен в ваш личный кабинет.'}
        </p>
        <div className="flex flex-col gap-3">
          {courseSlug && (
            <Link href={`/courses/${courseSlug}/learn`} className="btn btn-primary btn-fluid btn-lg" style={{ justifyContent: 'center' }}>
              {lang === 'kk' ? 'Оқуды бастау' : lang === 'en' ? 'Start learning' : 'Начать обучение'}
            </Link>
          )}
          <Link href="/dashboard" className="btn btn-secondary btn-lg" style={{ justifyContent: 'center' }}>
            {lang === 'kk' ? 'Кабинетке өту' : lang === 'en' ? 'Go to dashboard' : 'Перейти в кабинет'}
          </Link>
        </div>
      </div>
    </div>
  )
}
