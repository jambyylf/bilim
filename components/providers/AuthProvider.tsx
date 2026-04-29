'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
    // Бастапқы сессияны алу
    async function loadUser(userId: string) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .eq('id', userId)
        .single()
      setUser(profile ?? null)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUser(session.user.id).finally(() => setLoading(false))
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    // Auth күйінің өзгерісін тыңдау (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser(session.user.id)
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
