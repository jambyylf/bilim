'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/providers/LangProvider'

interface User {
  id: string
  full_name: string | null
  email: string | null
  role: string
  created_at: string
  avatar_url: string | null
}

interface Props {
  users: User[]
  roleFilter: string
  searchQuery: string
}

const ROLE_TABS = ['all', 'student', 'instructor', 'admin']

const ROLE_STYLE: Record<string, { color: string; bg: string }> = {
  student:    { color: '#3B82F6', bg: '#eff6ff' },
  instructor: { color: '#8B5CF6', bg: '#f5f3ff' },
  admin:      { color: '#dc2626', bg: '#fee2e2' },
}

export default function AdminUsersContent({ users, roleFilter, searchQuery }: Props) {
  const { lang } = useLang()
  const router   = useRouter()
  const [search, setSearch]   = useState(searchQuery)
  const [changing, setChanging] = useState<string | null>(null)

  function roleName(r: string) {
    if (lang === 'kk') return r === 'student' ? 'Студент' : r === 'instructor' ? 'Нұсқаушы' : r === 'admin' ? 'Әкімші' : r
    if (lang === 'en') return r === 'student' ? 'Student' : r === 'instructor' ? 'Instructor' : r === 'admin' ? 'Admin' : r
    return r === 'student' ? 'Студент' : r === 'instructor' ? 'Инструктор' : r === 'admin' ? 'Админ' : r
  }

  function tabLabel(r: string) {
    if (r === 'all') return lang === 'kk' ? 'Барлығы' : lang === 'en' ? 'All' : 'Все'
    return roleName(r)
  }

  async function changeRole(userId: string, newRole: string) {
    setChanging(userId)
    await fetch('/api/admin/users/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    })
    setChanging(null)
    router.refresh()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (roleFilter !== 'all') params.set('role', roleFilter)
    if (search) params.set('q', search)
    router.push(`/admin/users${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <div style={{ padding: '40px 48px' }}>
      <div className="mb-8">
        <div className="b-eyebrow mb-1">Admin</div>
        <h1 className="b-h1">
          {lang === 'kk' ? 'Қолданушылар' : lang === 'en' ? 'Users' : 'Пользователи'}
        </h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          {ROLE_TABS.map(r => (
            <Link key={r}
              href={`/admin/users${r === 'all' ? (search ? `?q=${search}` : '') : `?role=${r}${search ? `&q=${search}` : ''}`}`}
              className="px-4 py-2 rounded-lg b-sm font-medium transition-all"
              style={{
                background: roleFilter === r ? 'var(--b-primary)' : 'var(--b-bg-soft)',
                color: roleFilter === r ? '#fff' : 'var(--b-text-2)',
              }}
            >
              {tabLabel(r)}
            </Link>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <input
            className="input"
            placeholder={lang === 'kk' ? 'Іздеу...' : lang === 'en' ? 'Search...' : 'Поиск...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            {lang === 'kk' ? 'Іздеу' : lang === 'en' ? 'Search' : 'Найти'}
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg-soft)' }}>
              {[
                lang === 'kk' ? 'Қолданушы' : lang === 'en' ? 'User' : 'Пользователь',
                lang === 'kk' ? 'Email' : 'Email' ,
                lang === 'kk' ? 'Рөл' : lang === 'en' ? 'Role' : 'Роль',
                lang === 'kk' ? 'Тіркелген' : lang === 'en' ? 'Joined' : 'Зарегистрирован',
                lang === 'kk' ? 'Рөлді өзгерту' : lang === 'en' ? 'Change role' : 'Изменить роль',
              ].map(h => (
                <th key={h} className="b-xs font-semibold text-left px-5 py-3" style={{ color: 'var(--b-text-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 b-sm" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'Қолданушы табылмады' : lang === 'en' ? 'No users found' : 'Пользователи не найдены'}
                </td>
              </tr>
            ) : users.map(u => {
              const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.student
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="b-avatar" style={{ width: 36, height: 36, background: rs.bg, color: rs.color, fontSize: 14, flexShrink: 0 }}>
                        {u.full_name?.[0] ?? '?'}
                      </div>
                      <div className="b-sm font-medium">{u.full_name ?? '—'}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 b-sm" style={{ color: 'var(--b-text-2)' }}>{u.email ?? '—'}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: rs.color, background: rs.bg }}>
                      {roleName(u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-4 b-xs" style={{ color: 'var(--b-text-3)' }}>
                    {new Date(u.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={u.role}
                      disabled={changing === u.id}
                      onChange={e => changeRole(u.id, e.target.value)}
                      className="input"
                      style={{ padding: '4px 8px', fontSize: 13, width: 140 }}
                    >
                      <option value="student">{roleName('student')}</option>
                      <option value="instructor">{roleName('instructor')}</option>
                      <option value="admin">{roleName('admin')}</option>
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
