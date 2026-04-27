import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, role } = await req.json()
  if (!userId || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const allowed = ['student', 'instructor', 'admin']
  if (!allowed.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

  // Prevent changing own role
  if (userId === user.id) return NextResponse.json({ error: 'Cannot change own role' }, { status: 400 })

  const { error } = await supabase.from('profiles').update({ role } as any).eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
