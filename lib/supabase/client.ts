import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Клиент жағында (браузерде) қолданылатын Supabase клиенті
// Тек компоненттерде (use client) немесе хуктарда пайдалану
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
