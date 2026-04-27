import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

// Қорғалған маршруттар — тек кірген пайдаланушылар
const PROTECTED_ROUTES = ['/dashboard', '/my-courses', '/learn', '/cart', '/checkout', '/certificates', '/settings']
// Нұсқаушы маршруттары
const INSTRUCTOR_ROUTES = ['/instructor']
// Admin маршруттары
const ADMIN_ROUTES = ['/admin']
// Кірген адам кіре алмайтын маршруттар (login, register)
const AUTH_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await createClient(request)
  const path = request.nextUrl.pathname

  // Кірмеген пайдаланушы қорғалған бетке кірмек болса → login-ге
  const isProtected = PROTECTED_ROUTES.some(r => path.startsWith(r))
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Кірген пайдаланушы login/register-ге кірмек болса → dashboard-ке
  const isAuthPage = AUTH_ROUTES.some(r => path.startsWith(r))
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
