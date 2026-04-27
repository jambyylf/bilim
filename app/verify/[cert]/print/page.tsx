import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CertificatePrintContent from '@/components/certificate/CertificatePrintContent'

export const metadata = { title: 'Сертификат' }

export default async function CertificatePrintPage({ params }: { params: { cert: string } }) {
  const supabase = await createClient()

  const { data: cert } = await supabase
    .from('certificates')
    .select('id, cert_number, issued_at, student:profiles!certificates_student_id_fkey(full_name), course:courses!certificates_course_id_fkey(title_ru, title_kk, title_en, slug)')
    .eq('cert_number', params.cert)
    .single()

  if (!cert) notFound()

  return <CertificatePrintContent cert={cert as any} />
}
