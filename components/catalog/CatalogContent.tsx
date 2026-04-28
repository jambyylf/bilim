'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import Icon from '@/components/shared/Icon'
import Stars from '@/components/shared/Stars'
import { useLang } from '@/components/providers/LangProvider'

interface Course {
  id: string
  slug: string
  title_kk: string
  title_ru: string
  title_en: string
  price: number
  discount_price: number | null
  language: string
  level: string
  status: string
  rating: number | null
  students_count: number | null
  thumbnail_url: string | null
  category: { slug: string; name_kk: string; name_ru: string; name_en: string } | null
  instructor: { full_name: string | null; avatar_url: string | null } | null
}

interface Category {
  id?: string
  slug: string
  name_kk: string
  name_ru: string
  name_en: string
  icon?: string | null
}

interface Filters { category: string; level: string; lang: string; q: string }

interface Props {
  courses: Course[]
  categories: Category[]
  total: number
  page: number
  pageSize: number
  filters: Filters
  userId: string | null
}

const GRAD_MAP: Record<string, number> = {
  design: 1, programming: 8, marketing: 4, business: 7,
  finance: 3, languages: 5, data: 2, 'soft-skills': 6,
}

export default function CatalogContent({ courses, categories, total, page, pageSize, filters }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(filters.q)

  function courseTitle(c: Course) {
    if (lang === 'ru') return c.title_ru || c.title_kk
    if (lang === 'en') return c.title_en || c.title_ru
    return c.title_kk || c.title_ru
  }

  function catName(c: Category) {
    if (lang === 'ru') return c.name_ru
    if (lang === 'en') return c.name_en
    return c.name_kk
  }

  function pushFilter(key: string, value: string) {
    const params = new URLSearchParams()
    const f = { ...filters, [key]: value, page: '1' }
    Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v) })
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    pushFilter('q', search)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div style={{ background: 'var(--b-bg)', minHeight: '100vh' }}>
      <TopNav />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10">
        {/* Тақырып + іздеу */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="b-h1" style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>{t.home.catalog}</h1>
            <p className="b-sm mt-1" style={{ color: 'var(--b-text-3)' }}>
              {total.toLocaleString('ru-RU')} {t.home.courses}
            </p>
          </div>
          <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
            <Icon name="search" size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--b-text-4)' }} />
            <input
              className="inp"
              style={{ paddingLeft: 36, width: '100%', maxWidth: 280 }}
              placeholder={t.nav.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Сүзгі панелі */}
          <aside className="w-full md:w-[220px] md:max-w-[220px] shrink-0">
            {/* Категориялар */}
            <div className="mb-6">
              <div className="b-eyebrow mb-3">{t.home.categories}</div>
              <div className="flex flex-col gap-1">
                <button
                  className="text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: !filters.category ? 'var(--b-primary-50)' : 'transparent',
                    color: !filters.category ? 'var(--b-primary)' : 'var(--b-text-2)',
                    fontWeight: !filters.category ? 600 : 400,
                  }}
                  onClick={() => pushFilter('category', '')}
                >
                  {t.home.all}
                </button>
                {categories.map(c => (
                  <button
                    key={c.slug}
                    className="text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                    style={{
                      background: filters.category === c.slug ? 'var(--b-primary-50)' : 'transparent',
                      color: filters.category === c.slug ? 'var(--b-primary)' : 'var(--b-text-2)',
                      fontWeight: filters.category === c.slug ? 600 : 400,
                    }}
                    onClick={() => pushFilter('category', c.slug)}
                  >
                    {c.icon && <Icon name={c.icon} size={14} />}
                    {catName(c)}
                  </button>
                ))}
              </div>
            </div>

            {/* Деңгей */}
            <div className="mb-6">
              <div className="b-eyebrow mb-3">{t.instructor.courseLevel}</div>
              <div className="flex flex-col gap-1">
                {['', 'beginner', 'intermediate', 'advanced'].map(lvl => (
                  <button
                    key={lvl}
                    className="text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      background: filters.level === lvl ? 'var(--b-primary-50)' : 'transparent',
                      color: filters.level === lvl ? 'var(--b-primary)' : 'var(--b-text-2)',
                      fontWeight: filters.level === lvl ? 600 : 400,
                    }}
                    onClick={() => pushFilter('level', lvl)}
                  >
                    {lvl === '' ? t.home.all : t.instructor.levels[lvl as 'beginner' | 'intermediate' | 'advanced']}
                  </button>
                ))}
              </div>
            </div>

            {/* Тіл */}
            <div className="mb-6">
              <div className="b-eyebrow mb-3">{t.instructor.courseLanguage}</div>
              <div className="flex flex-col gap-1">
                {['', 'kk', 'ru', 'en'].map(l => (
                  <button
                    key={l}
                    className="text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      background: filters.lang === l ? 'var(--b-primary-50)' : 'transparent',
                      color: filters.lang === l ? 'var(--b-primary)' : 'var(--b-text-2)',
                      fontWeight: filters.lang === l ? 600 : 400,
                    }}
                    onClick={() => pushFilter('lang', l)}
                  >
                    {l === '' ? t.home.all : t.instructor.languages[l as 'kk' | 'ru' | 'en']}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Курстар торы */}
          <div className="flex-1">
            {courses.length === 0 ? (
              <div className="card p-16 text-center">
                <Icon name="search" size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <div className="b-h3 mb-2" style={{ color: 'var(--b-text-2)' }}>
                  {lang === 'kk' ? 'Курс табылмады' : lang === 'en' ? 'No courses found' : 'Курсы не найдены'}
                </div>
                <button className="btn btn-secondary mt-4" onClick={() => router.push(pathname)}>
                  {t.common.filter} →
                </button>
              </div>
            ) : (
              <>
                <style>{`
                  .catalog-grid { grid-template-columns: 1fr; }
                  @media(min-width:560px){ .catalog-grid { grid-template-columns: repeat(2,1fr); } }
                  @media(min-width:900px){ .catalog-grid { grid-template-columns: repeat(3,1fr); } }
                `}</style>
                <div className="catalog-grid grid gap-4 md:gap-5">
                  {courses.map((course, i) => {
                    const grad = GRAD_MAP[course.category?.slug ?? ''] ?? ((i % 8) + 1)
                    return (
                      <Link key={course.id} href={`/courses/${course.slug}`} className="card flex flex-col no-underline group">
                        {/* Миниатюра */}
                        <div className={`thumb thumb-grad-${grad} thumb-pattern relative overflow-hidden`}>
                          {course.thumbnail_url && (
                            <img
                              src={course.thumbnail_url}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                            <div className="flex justify-between items-start">
                              {course.category && (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                                  {catName(course.category)}
                                </span>
                              )}
                              <span className="font-mono text-[11px] opacity-60 ml-auto">BILIM</span>
                            </div>
                            {course.level && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded self-start" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                {t.instructor.levels[course.level as 'beginner' | 'intermediate' | 'advanced']}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 flex flex-col gap-2 flex-1">
                          <div className="b-h4 leading-snug overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {courseTitle(course)}
                          </div>
                          <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                            {course.instructor?.full_name ?? '—'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Stars value={course.rating ?? 0} size={12} showNum={false} />
                            <span className="b-xs" style={{ color: 'var(--b-text-4)' }}>
                              {(course.rating ?? 0).toFixed(1)} · {(course.students_count ?? 0).toLocaleString('ru-RU')} {t.course.students}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid var(--b-line-soft)' }}>
                            <div>
                              {course.price === 0 ? (
                                <span className="b-h4" style={{ color: 'var(--b-teal)' }}>{t.common.free}</span>
                              ) : (
                                <>
                                  <span className="b-h4">
                                    {(course.discount_price ?? course.price).toLocaleString('ru-RU')} {t.common.currency}
                                  </span>
                                  {course.discount_price && (
                                    <span className="b-xs line-through ml-2" style={{ color: 'var(--b-text-4)' }}>
                                      {course.price.toLocaleString('ru-RU')} {t.common.currency}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            <span className="b-xs px-2 py-0.5 rounded" style={{ background: 'var(--b-primary-50)', color: 'var(--b-primary)' }}>
                              {t.instructor.languages[course.language as 'kk' | 'ru' | 'en']}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Беттеу */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {page > 1 && (
                      <button className="btn btn-secondary btn-sm" onClick={() => pushFilter('page', String(page - 1))}>
                        <Icon name="chevronLeft" size={14} /> {t.common.back}
                      </button>
                    )}
                    <span className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                      {page} / {totalPages}
                    </span>
                    {page < totalPages && (
                      <button className="btn btn-secondary btn-sm" onClick={() => pushFilter('page', String(page + 1))}>
                        {t.common.next} <Icon name="chevronRight" size={14} />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16" style={{ background: 'var(--b-bg-soft)', borderTop: '1px solid var(--b-line)', padding: '24px 32px' }}>
        <div className="max-w-[1280px] mx-auto flex justify-between b-xs" style={{ color: 'var(--b-text-3)' }}>
          <span>{t.common.copyright}</span>
          <span>KZ · RU · EN</span>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  )
}
