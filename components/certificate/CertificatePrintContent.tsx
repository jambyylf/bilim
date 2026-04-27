'use client'

import { useEffect } from 'react'

interface CertData {
  id: string
  cert_number: string
  issued_at: string
  student: { full_name: string | null } | null
  course: { title_ru: string | null; title_kk: string | null; title_en: string | null } | null
}

export default function CertificatePrintContent({ cert }: { cert: CertData }) {
  useEffect(() => {
    // Бет жүктелгеннен кейін автоматты басып шығару
    setTimeout(() => window.print(), 500)
  }, [])

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${cert.cert_number}`
    : `https://bilim.kz/verify/${cert.cert_number}`

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 0; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', system-ui, sans-serif; background: #fff; }
      `}</style>

      {/* Print controls — экранда ғана көрінеді */}
      <div className="no-print" style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => window.print()}
          style={{ background: '#1E3A8A', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          🖨️ Басып шығару / Print
        </button>
        <button onClick={() => window.close()}
          style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>
          ✕ Жабу
        </button>
      </div>

      {/* Сертификат — A4 landscape */}
      <div style={{
        width: '297mm',
        height: '210mm',
        margin: '0 auto',
        background: '#fff',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Жоғарғы декоративтік жолақ */}
        <div style={{ height: 12, background: 'linear-gradient(90deg, #1E3A8A, #0D9488, #F59E0B)' }} />

        {/* Негізгі мазмұн */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 64px', textAlign: 'center' }}>
          {/* Логотип / бренд */}
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#6b7280', marginBottom: 8 }}>
            BILIM PLATFORM
          </div>

          {/* Тақырып */}
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0D9488', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>
            Certificate of Completion · Аяқтау куәлігі
          </div>

          {/* Негізгі мәтін */}
          <div style={{ fontSize: 15, color: '#6b7280', marginBottom: 8 }}>
            This is to certify that
          </div>

          {/* Аты */}
          <div style={{
            fontSize: 42,
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.1,
            marginBottom: 16,
            borderBottom: '3px solid #F59E0B',
            paddingBottom: 12,
            minWidth: 300,
          }}>
            {cert.student?.full_name ?? '—'}
          </div>

          {/* Курс атауы */}
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
            has successfully completed the course
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1E3A8A', marginBottom: 32, maxWidth: 600 }}>
            {cert.course?.title_ru ?? cert.course?.title_kk ?? '—'}
          </div>

          {/* Деректер */}
          <div style={{ display: 'flex', gap: 64, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4, letterSpacing: '0.1em' }}>БЕРІЛГЕН КҮН / ISSUE DATE</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                {new Date(cert.issued_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 48, background: '#e5e7eb' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4, letterSpacing: '0.1em' }}>СЕРТИФИКАТ ID</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>
                {cert.cert_number.slice(0, 16).toUpperCase()}
              </div>
            </div>

            <div style={{ width: 1, height: 48, background: '#e5e7eb' }} />

            {/* QR-код орнына тексеру URL */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4, letterSpacing: '0.1em' }}>ТЕКСЕРУ / VERIFY</div>
              <div style={{ fontSize: 10, color: '#1E3A8A', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: 160 }}>
                bilim.kz/verify/<br/>{cert.cert_number.slice(0, 8)}…
              </div>
            </div>
          </div>
        </div>

        {/* Төменгі жолақ */}
        <div style={{ height: 8, background: 'linear-gradient(90deg, #1E3A8A, #0D9488, #F59E0B)' }} />
      </div>
    </>
  )
}
