import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Google OAuth + email verify callback маршруты
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code        = searchParams.get('code')
  const redirect    = searchParams.get('redirect') ?? '/dashboard'
  const pendingRole = searchParams.get('role') ?? 'student'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // Жаңа пайдаланушы — профиль жасау (trigger жасамаса)
        const savedRole = pendingRole === 'instructor' ? 'instructor' : (data.user.user_metadata?.role ?? 'student')
        await supabase.from('profiles').insert({
          id:        data.user.id,
          full_name: data.user.user_metadata?.full_name
                     ?? data.user.user_metadata?.name
                     ?? data.user.email?.split('@')[0]
                     ?? 'User',
          role:      savedRole,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
        })
      } else if (pendingRole === 'instructor' && profile.role === 'student') {
        // Trigger student деп жасаған болса, instructor-ға ауыстыру
        await supabase.from('profiles').update({ role: 'instructor' }).eq('id', data.user.id)
      }

      // Instructor болса — спикер кабинетіне бағыттау
      const finalRole = pendingRole === 'instructor' ? 'instructor' : (profile?.role ?? 'student')
      const finalRedirect = redirect !== '/dashboard'
        ? redirect
        : finalRole === 'instructor' ? '/instructor/dashboard' : '/dashboard'

      return NextResponse.redirect(`${origin}${finalRedirect}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
