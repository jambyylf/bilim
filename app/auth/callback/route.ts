import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Google OAuth + email verify callback маршруты
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code     = searchParams.get('code')
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Google-дан кірген жаңа пайдаланушы үшін профиль жасау
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        await supabase.from('profiles').insert({
          id:        data.user.id,
          full_name: data.user.user_metadata?.full_name
                     ?? data.user.user_metadata?.name
                     ?? data.user.email?.split('@')[0]
                     ?? 'User',
          email:     data.user.email ?? '',
          role:      'student',
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
        } as any)
      }

      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
