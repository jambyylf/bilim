import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CertificateVerifyContent from '@/components/certificate/CertificateVerifyContent'

export const metadata = { title: 'Сертификат тексеру' }

export default async function VerifyCertPage({ params }: { params: { cert: string } }) {
  const supabase = await createClient()

  const { data: cert } = await supabase
    .from('certificates')
    .select('id, cert_number, issued_at, student:profiles!certificates_student_id_fkey(full_name), course:courses!certificates_course_id_fkey(title_ru, title_kk, title_en, slug)')
    .eq('cert_number', params.cert)
    .single()

  if (!cert) notFound()

  return <CertificateVerifyContent cert={cert as any} />
}
