'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  full_name: string | null
  role: string
  avatar_url: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser(sessionUser: User) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .eq('id', sessionUser.id)
        .single()

      if (profile) {
        setUser(profile)
        return
      }

      // Профиль жоқ (телефон немесе Google арқылы тіркелген) — жасаймыз
      const displayName =
        sessionUser.user_metadata?.full_name ??
        sessionUser.user_metadata?.name ??
        sessionUser.phone ??
        sessionUser.email?.split('@')[0] ??
        'Қолданушы'

      const { data: newProfile } = await supabase
        .from('profiles')
        .upsert(
          { id: sessionUser.id, full_name: displayName, role: 'student', lang_pref: 'ru' },
          { onConflict: 'id', ignoreDuplicates: true }
        )
        .select('id, full_name, role, avatar_url')
        .single()

      setUser(newProfile ?? {
        id: sessionUser.id,
        full_name: displayName,
        role: 'student',
        avatar_url: null,
      })
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUser(session.user).finally(() => setLoading(false))
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
