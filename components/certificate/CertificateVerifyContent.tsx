'use client'

import Link from 'next/link'
import { useLang } from '@/components/providers/LangProvider'

interface CertData {
  id: string
  cert_number: string
  issued_at: string
  student: { full_name: string | null } | null
  course: { title_ru: string | null; title_kk: string | null; title_en: string | null; slug: string } | null
}

export default function CertificateVerifyContent({ cert }: { cert: CertData }) {
  const { lang } = useLang()

  function courseTitle() {
    if (!cert.course) return '—'
    return (lang === 'kk' ? cert.course.title_kk : lang === 'en' ? cert.course.title_en : cert.course.title_ru) ?? cert.course.title_ru ?? '—'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--b-bg-soft)' }}>
      <div className="w-full" style={{ maxWidth: 640 }}>
        {/* Certificate card */}
        <div className="card overflow-hidden mb-6">
          {/* Header gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%)',
            padding: '40px 48px',
            textAlign: 'center',
            color: '#fff',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', opacity: 0.8, marginBottom: 8 }}>
              BILIM PLATFORM
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
              {lang === 'kk' ? 'Аяқтау куәлігі' : lang === 'en' ? 'Certificate of Completion' : 'Сертификат об окончании'}
            </h1>
          </div>

          {/* Body */}
          <div style={{ padding: '40px 48px', textAlign: 'center' }}>
            <div className="b-sm mb-2" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk' ? 'Бұл сертификат беріледі' : lang === 'en' ? 'This certifies that' : 'Настоящий сертификат подтверждает, что'}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: 'var(--b-text-1)' }}>
              {cert.student?.full_name ?? '—'}
            </div>
            <div className="b-sm mb-4" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk' ? 'келесі курсты сәтті аяқтады:' : lang === 'en' ? 'has successfully completed the course:' : 'успешно завершил(а) курс:'}
            </div>
            <div className="b-h3 mb-6" style={{ color: 'var(--b-primary)' }}>
              {courseTitle()}
            </div>

            <div className="flex items-center justify-center gap-8">
              <div>
                <div className="b-xs mb-1" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'Берілген күні' : lang === 'en' ? 'Issue date' : 'Дата выдачи'}
                </div>
                <div className="b-sm font-semibold">
                  {new Date(cert.issued_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div style={{ width: 1, height: 40, background: 'var(--b-line)' }} />
              <div>
                <div className="b-xs mb-1" style={{ color: 'var(--b-text-3)' }}>ID</div>
                <div className="b-xs font-mono" style={{ color: 'var(--b-text-2)' }}>{cert.cert_number.slice(0, 16).toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid var(--b-line)', padding: '20px 48px', background: '#d1fae5', textAlign: 'center' }}>
            <div className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                <path d="m4 12 5 5L20 6" />
              </svg>
              <span style={{ color: '#059669', fontWeight: 600, fontSize: 14 }}>
                {lang === 'kk' ? 'Сертификат шынайы және расталды' : lang === 'en' ? 'Certificate is authentic and verified' : 'Сертификат является подлинным и проверенным'}
              </span>
            </div>
          </div>
        </div>

        {/* Verification URL */}
        <div className="card p-5 text-center">
          <div className="b-xs mb-2" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk' ? 'Тексеру сілтемесі' : lang === 'en' ? 'Verification URL' : 'Ссылка для проверки'}
          </div>
          <div className="b-sm font-mono" style={{ color: 'var(--b-primary)', wordBreak: 'break-all' }}>
            {typeof window !== 'undefined' ? window.location.href : `https://bilim.kz/verify/${cert.cert_number}`}
          </div>
        </div>

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => window.open(`/verify/${cert.cert_number}/print`, '_blank')}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8" rx="1"/>
            </svg>
            {lang === 'kk' ? 'PDF жүктеу' : lang === 'en' ? 'Download PDF' : 'Скачать PDF'}
          </button>
          <Link href="/" className="btn btn-secondary">
            {lang === 'kk' ? 'Басты бетке' : lang === 'en' ? 'Go to homepage' : 'На главную'}
          </Link>
        </div>
      </div>
    </div>
  )
}
