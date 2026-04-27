// БУЛ ROUTE-ТЫ ДЕПЛОЙДАН КЕЙІН БІР РЕТ ІСКЕ АСЫРЫП, СОДАН КЕЙ ӨШІРІҢІЗ
// POST /api/internal/migrate   (Bearer: SUPABASE_SERVICE_ROLE_KEY)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MIGRATION_SQL = `
-- increment_students_count функциясы
CREATE OR REPLACE FUNCTION increment_students_count(course_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE courses SET students_count = COALESCE(students_count, 0) + 1 WHERE id = course_id;
END;
$$;

-- Сертификат индекстері (кесте бұрын жасалған болса)
CREATE INDEX IF NOT EXISTS idx_certificates_cert_number ON certificates(cert_number);
CREATE INDEX IF NOT EXISTS idx_certificates_student     ON certificates(student_id);
`

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace('Bearer ', '').trim()

  if (token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const statements = MIGRATION_SQL
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)

  const errors: string[] = []

  for (const stmt of statements) {
    const { error } = await supabase.rpc('exec_sql' as any, { sql: stmt + ';' })
    if (error && !error.message.includes('already exists')) {
      errors.push(error.message)
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors })
  }

  return NextResponse.json({ ok: true, message: 'Migration applied successfully. Delete this route now!' })
}
