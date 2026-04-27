'use client'

import { useEffect, useRef, useState } from 'react'

interface CertData {
  id: string
  cert_number: string
  issued_at: string
  student: { full_name: string | null } | null
  course: { title_ru: string | null; title_kk: string | null; title_en: string | null } | null
}

export default function CertificatePrintContent({ cert }: { cert: CertData }) {
  const certRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    // Бет жүктелгеннен кейін автоматты басып шығару
    setTimeout(() => window.print(), 500)
  }, [])

  async function downloadPDF() {
    if (!certRef.current || downloading) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: certRef.current.offsetWidth,
        height: certRef.current.offsetHeight,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)
      const fileName = `bilim-cert-${cert.cert_number.slice(0, 8)}.pdf`
      pdf.save(fileName)
    } catch (err) {
      console.error('PDF error', err)
    } finally {
      setDownloading(false)
    }
  }

  const studentName = cert.student?.full_name ?? '—'
  const courseTitle  = cert.course?.title_ru ?? cert.course?.title_kk ?? '—'
  const issueDate    = new Date(cert.issued_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
  const certId       = cert.cert_number.slice(0, 16).toUpperCase()

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 0; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', system-ui, sans-serif; background: #f9fafb; }
      `}</style>

      {/* Басқару батырмалары */}
      <div className="no-print" style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button
          onClick={downloadPDF}
          disabled={downloading}
          style={{ background: '#1E3A8A', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: downloading ? 'wait' : 'pointer', opacity: downloading ? 0.7 : 1 }}
        >
          {downloading ? '⏳ Жүктелуде...' : '⬇️ PDF жүктеу'}
        </button>
        <button
          onClick={() => window.print()}
          style={{ background: '#0D9488', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          🖨️ Басып шығару
        </button>
        <button
          onClick={() => history.back()}
          style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}
        >
          ✕ Жабу
        </button>
      </div>

      {/* Сертификат — A4 landscape */}
      <div
        ref={certRef}
        style={{
          width: '297mm',
          height: '210mm',
          margin: '20px auto',
          background: '#fff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        }}
      >
        {/* Жоғарғы декоративтік жолақ */}
        <div style={{ height: 10, background: 'linear-gradient(90deg, #1E3A8A 0%, #0D9488 50%, #F59E0B 100%)' }} />

        {/* Бүйір өрнегі */}
        <div style={{
          position: 'absolute', left: 0, top: 10, bottom: 8, width: 8,
          background: 'linear-gradient(180deg, #1E3A8A 0%, #0D9488 50%, #F59E0B 100%)',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 10, bottom: 8, width: 8,
          background: 'linear-gradient(180deg, #F59E0B 0%, #0D9488 50%, #1E3A8A 100%)',
        }} />

        {/* Фон өрнегі */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(30,58,138,0.04) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(13,148,136,0.04) 0%, transparent 50%)',
        }} />

        {/* Негізгі мазмұн */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 80px', textAlign: 'center', position: 'relative' }}>

          {/* Логотип */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>B</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.12em', color: '#1E3A8A' }}>BILIM PLATFORM</span>
          </div>

          {/* Тақырып */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0D9488', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20 }}>
            Certificate of Completion · Аяқтау куәлігі
          </div>

          {/* Негізгі мәтін */}
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 6 }}>
            This is to certify that
          </div>

          {/* Аты */}
          <div style={{
            fontSize: 38, fontWeight: 800, color: '#111827',
            lineHeight: 1.15, marginBottom: 14,
            borderBottom: '3px solid #F59E0B',
            paddingBottom: 10, minWidth: 280,
          }}>
            {studentName}
          </div>

          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
            has successfully completed the course
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1E3A8A', marginBottom: 28, maxWidth: 520, lineHeight: 1.3 }}>
            {courseTitle}
          </div>

          {/* Деректер */}
          <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Берілген күн / Issue Date</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{issueDate}</div>
            </div>

            <div style={{ width: 1, height: 40, background: '#e5e7eb' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сертификат ID</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>{certId}</div>
            </div>

            <div style={{ width: 1, height: 40, background: '#e5e7eb' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Тексеру / Verify</div>
              <div style={{ fontSize: 10, color: '#1E3A8A', fontFamily: 'monospace' }}>
                bilim.kz/verify/{cert.cert_number.slice(0, 8)}
              </div>
            </div>
          </div>
        </div>

        {/* Төменгі жолақ */}
        <div style={{ height: 8, background: 'linear-gradient(90deg, #1E3A8A 0%, #0D9488 50%, #F59E0B 100%)' }} />
      </div>
    </>
  )
}
