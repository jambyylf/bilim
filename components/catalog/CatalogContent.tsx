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
  id: string; slug: string
  title_kk: string; title_ru: string; title_en: string
  price: number; discount_price: number | null
  language: string; level: string; status: string
  rating: number | null; students_count: number | null
  thumbnail_url: string | null
  category: { slug: string; name_kk: string; name_ru: string; name_en: string } | null
  instructor: { full_name: string | null; avatar_url: string | null } | null
}
interface Category {
  id?: string; slug: string
  name_kk: string; name_ru: string; name_en: string; icon?: string | null
}
interface Filters { category: string; level: string; lang: string; q: string }
interface Props {
  courses: Course[]; categories: Category[]
  total: number; page: number; pageSize: number
  filters: Filters; userId: string | null
}

const GRAD_MAP: Record<string, number> = {
  design: 1, programming: 8, marketing: 4, business: 7,
  finance: 3, languages: 5, data: 2, 'soft-skills': 6,
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--b-line)' }}>
      <div className="b-sm" style={{ fontWeight: 600, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

function FilterCheck({ label, count, checked, onClick }: { label: string; count?: number; checked?: boolean; onClick: () => void }) {
  return (
    <label
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', cursor: 'pointer' }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 16, height: 16, flexShrink: 0,
          border: `1.5px solid ${checked ? 'var(--b-primary)' : 'var(--b-line)'}`,
          background: checked ? 'var(--b-primary)' : 'var(--b-bg)',
          borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {checked && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
        <span className="b-sm" style={{ color: 'var(--b-text)' }}>{label}</span>
      </span>
      {count !== undefined && <span className="b-xs" style={{ color: 'var(--b-text-4)' }}>{count}</span>}
    </label>
  )
}

export default function CatalogContent({ courses, categories, total, page, pageSize, filters }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(filters.q)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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
  function clearFilters() {
    setSearch('')
    startTransition(() => router.push(pathname))
  }

  const totalPages = Math.ceil(total / pageSize)
  const activeFilters = [
    filters.category && { key: 'category', label: categories.find(c => c.slug === filters.category) ? catName(categories.find(c => c.slug === filters.category)!) : filters.category },
    filters.level && { key: 'level', label: t.instructor.levels[filters.level as 'beginner' | 'intermediate' | 'advanced'] },
    filters.lang && { key: 'lang', label: t.instructor.languages[filters.lang as 'kk' | 'ru' | 'en'] },
    filters.q && { key: 'q', label: `"${filters.q}"` },
  ].filter(Boolean) as { key: string; label: string }[]

  const homeLabel  = lang === 'kk' ? 'Басты бет'      : lang === 'en' ? 'Home'     : 'Главная'
  const clearLabel = lang === 'kk' ? 'Тазалау'        : lang === 'en' ? 'Clear'    : 'Очистить'
  const sortLabel  = lang === 'kk' ? 'Танымалдығы бойынша' : lang === 'en' ? 'By popularity' : 'По популярности'
  const filterLabel = lang === 'kk' ? 'Сүзгілер'      : lang === 'en' ? 'Filters'  : 'Фильтры'
  const foundLabel = lang === 'kk' ? 'табылды'        : lang === 'en' ? 'found'    : 'найдено'
  const coursesLabel = lang === 'kk' ? 'курс'         : lang === 'en' ? 'courses'  : 'курсов'

  return (
    <div style={{ background: 'var(--b-bg)', minHeight: '100vh' }}>
      <TopNav />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8">

        {/* Header */}
        <section style={{ padding: '48px 0 32px' }}>
          <div className="b-sm" style={{ color: 'var(--b-text-3)', marginBottom: 12 }}>
            <Link href="/" style={{ color: 'var(--b-text-3)', textDecoration: 'none' }}>{homeLabel}</Link>
            {' · '}
            <span style={{ color: 'var(--b-text)' }}>{t.home.catalog}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="b-h1" style={{ marginBottom: 8 }}>{t.home.catalog}</h1>
              <p className="b-body" style={{ color: 'var(--b-text-3)' }}>
                {total.toLocaleString('ru-RU')}+ {lang === 'kk' ? 'курс үздік спикерлерден' : lang === 'en' ? 'courses from top instructors' : 'курсов от лучших спикеров'}
              </p>
            </div>
            <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
              <Icon name="search" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--b-text-4)' }}/>
              <input
                className="inp"
                placeholder={lang === 'kk' ? 'Курс іздеу…' : lang === 'en' ? 'Search courses…' : 'Поиск курса…'}
                style={{ paddingLeft: 38, width: '100%' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </form>
          </div>
        </section>

        {/* Body */}
        <section style={{ paddingBottom: 80 }}>
          <style>{`
            .catalog-layout { display: block; }
            @media(min-width:768px){ .catalog-layout { display: grid; grid-template-columns: 260px 1fr; gap: 40px; } }
            .catalog-grid-inner { grid-template-columns: 1fr; }
            @media(min-width:560px){ .catalog-grid-inner { grid-template-columns: repeat(2,1fr); } }
            @media(min-width:900px){ .catalog-grid-inner { grid-template-columns: repeat(3,1fr); } }
          `}</style>
          <div className="catalog-layout">

            {/* Sidebar filters */}
            <aside style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className="b-h4">{filterLabel}</span>
                {activeFilters.length > 0 && (
                  <button className="btn btn-link" style={{ fontSize: 13 }} onClick={clearFilters}>{clearLabel}</button>
                )}
              </div>

              {/* Categories */}
              <FilterGroup title={t.home.categories}>
                <FilterCheck
                  label={t.home.all}
                  count={total}
                  checked={!filters.category}
                  onClick={() => pushFilter('category', '')}
                />
                {categories.map(c => (
                  <FilterCheck
                    key={c.slug}
                    label={catName(c)}
                    checked={filters.category === c.slug}
                    onClick={() => pushFilter('category', c.slug)}
                  />
                ))}
              </FilterGroup>

              {/* Level */}
              <FilterGroup title={t.instructor.courseLevel}>
                {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                  <FilterCheck
                    key={lvl}
                    label={t.instructor.levels[lvl]}
                    checked={filters.level === lvl}
                    onClick={() => pushFilter('level', filters.level === lvl ? '' : lvl)}
                  />
                ))}
              </FilterGroup>

              {/* Language */}
              <FilterGroup title={t.instructor.courseLanguage}>
                {(['kk', 'ru', 'en'] as const).map(l => (
                  <FilterCheck
                    key={l}
                    label={t.instructor.languages[l]}
                    checked={filters.lang === l}
                    onClick={() => pushFilter('lang', filters.lang === l ? '' : l)}
                  />
                ))}
              </FilterGroup>
            </aside>

            {/* Results */}
            <div>
              {/* Sort row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <span className="b-sm" style={{ color: 'var(--b-text-3)' }}>
                  <strong style={{ color: 'var(--b-text)' }}>{total.toLocaleString('ru-RU')} {coursesLabel}</strong>
                  {' · '}{foundLabel}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {sortLabel} <Icon name="chevronDown" size={12}/>
                  </button>
                  <div style={{ display: 'flex', border: '1px solid var(--b-line)', borderRadius: 8, padding: 2, gap: 2 }}>
                    <button
                      onClick={() => setViewMode('grid')}
                      style={{ padding: '5px 7px', borderRadius: 6, border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'var(--b-primary)' : 'transparent', color: viewMode === 'grid' ? '#fff' : 'var(--b-text-3)' }}
                    >
                      <Icon name="grid" size={14}/>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      style={{ padding: '5px 7px', borderRadius: 6, border: 'none', cursor: 'pointer', background: viewMode === 'list' ? 'var(--b-primary)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--b-text-3)' }}
                    >
                      <Icon name="list" size={14}/>
                    </button>
                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilters.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {activeFilters.map(f => (
                    <button
                      key={f.key}
                      onClick={() => pushFilter(f.key, '')}
                      className="chip chip-active"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}
                    >
                      {f.label} <Icon name="close" size={11}/>
                    </button>
                  ))}
                </div>
              )}

              {courses.length === 0 ? (
                <div className="card p-16 text-center">
                  <Icon name="search" size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }}/>
                  <div className="b-h3 mb-2" style={{ color: 'var(--b-text-2)' }}>
                    {lang === 'kk' ? 'Курс табылмады' : lang === 'en' ? 'No courses found' : 'Курсы не найдены'}
                  </div>
                  <button className="btn btn-secondary mt-4" onClick={clearFilters}>
                    {clearLabel}
                  </button>
                </div>
              ) : (
                <>
                  <div className={`catalog-grid-inner grid gap-5`}>
                    {courses.map((course, i) => {
                      const grad = GRAD_MAP[course.category?.slug ?? ''] ?? ((i % 8) + 1)
                      const price = course.discount_price ?? course.price
                      return (
                        <Link key={course.id} href={`/courses/${course.slug}`} className="card flex flex-col no-underline group" style={{ overflow: 'hidden' }}>
                          {/* Thumbnail */}
                          <div className={`thumb thumb-grad-${grad} thumb-pattern relative overflow-hidden`} style={{ borderRadius: 0 }}>
                            {course.thumbnail_url && (
                              <img src={course.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover"/>
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
                              <Stars value={course.rating ?? 0} size={12} showNum={false}/>
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
                                    <span className="b-h4">{price.toLocaleString('ru-RU')} {t.common.currency}</span>
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

                  {/* Numbered pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, gap: 4, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        disabled={page <= 1}
                        onClick={() => pushFilter('page', String(page - 1))}
                      >
                        <Icon name="chevronLeft" size={14}/>
                      </button>
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let p: number | '...'
                        if (totalPages <= 7) {
                          p = i + 1
                        } else if (i === 0) {
                          p = 1
                        } else if (i === 6) {
                          p = totalPages
                        } else if (page <= 4) {
                          p = i === 5 ? '...' : i + 1
                        } else if (page >= totalPages - 3) {
                          p = i === 1 ? '...' : totalPages - (6 - i)
                        } else {
                          p = i === 1 || i === 5 ? '...' : page + (i - 3)
                        }
                        if (p === '...') return (
                          <button key={`dots-${i}`} className="btn btn-ghost btn-sm" style={{ minWidth: 36, cursor: 'default' }} disabled>…</button>
                        )
                        return (
                          <button
                            key={p}
                            className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                            style={{ minWidth: 36 }}
                            onClick={() => typeof p === 'number' && pushFilter('page', String(p))}
                          >
                            {p}
                          </button>
                        )
                      })}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        disabled={page >= totalPages}
                        onClick={() => pushFilter('page', String(page + 1))}
                      >
                        <Icon name="chevronLeft" size={14} style={{ transform: 'rotate(180deg)' }}/>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer style={{ background: 'var(--b-bg-soft)', borderTop: '1px solid var(--b-line)', padding: '24px 32px' }}>
        <div className="max-w-[1280px] mx-auto flex justify-between b-xs" style={{ color: 'var(--b-text-3)' }}>
          <span>{t.common.copyright}</span>
          <span>KZ · RU · EN</span>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  )
}
