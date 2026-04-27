'use client'

import Link from 'next/link'
import TopNav from '@/components/layout/TopNav'
import Icon from '@/components/shared/Icon'
import Stars from '@/components/shared/Stars'
import { useLang } from '@/components/providers/LangProvider'

interface HomeContentProps {
  user?: { full_name: string | null; role: string } | null
}

const MOCK_COURSES = [
  { id: '1', slug: 'ui-ux-figma', grad: 1, catKey: 'design' as const,      titleKk: 'UI/UX дизайн негіздері: Figma-да нөлден product-қа', titleRu: 'UI/UX дизайн: от нуля до product в Figma',     titleEn: 'UI/UX Design: Figma from Zero to Product', author: 'Айдана Сапарова', rating: 4.8, reviews: 1240, price: 49900, oldPrice: 89900, hours: 28 },
  { id: '2', slug: 'js-react',    grad: 8, catKey: 'programming' as const, titleKk: 'JavaScript + React: заманауи веб-қосымшалар',         titleRu: 'JavaScript + React: современные веб-приложения', titleEn: 'JavaScript + React: Modern Web Apps',        author: 'Нұрлан Ерғали',   rating: 4.9, reviews: 2103, price: 64900, oldPrice: null,  hours: 42 },
  { id: '3', slug: 'smm-content', grad: 4, catKey: 'marketing' as const,   titleKk: 'SMM және контент: бренд құру мен өсіру',             titleRu: 'SMM и контент: создание и рост бренда',          titleEn: 'SMM & Content: Build and Grow a Brand',      author: 'Әлия Жұмабай',    rating: 4.7, reviews: 856,  price: 39900, oldPrice: 59900, hours: 18 },
  { id: '4', slug: 'startup-kz',  grad: 7, catKey: 'business' as const,    titleKk: 'Қазақстанда стартап бастау: А-дан Я-ға',             titleRu: 'Стартап в Казахстане: от А до Я',               titleEn: 'Startup in Kazakhstan: A to Z',              author: 'Бауыржан Әшім',   rating: 4.6, reviews: 432,  price: 79900, oldPrice: null,  hours: 36 },
]

const CATEGORY_ICONS: Record<string, string> = {
  design: 'palette', programming: 'code', marketing: 'target', business: 'briefcase',
  finance: 'dollar', languages: 'language', data: 'chart', 'soft-skills': 'sparkle',
}
const CATEGORY_COUNTS: Record<string, number> = {
  design: 124, programming: 186, marketing: 92, business: 78,
  finance: 56, languages: 64, data: 48, 'soft-skills': 38,
}
const CATEGORY_SLUGS = ['design', 'programming', 'marketing', 'business', 'finance', 'languages', 'data', 'soft-skills'] as const

export default function HomeContent({ user }: HomeContentProps) {
  const { lang, t } = useLang()

  function courseTitle(c: typeof MOCK_COURSES[0]) {
    if (lang === 'ru') return c.titleRu
    if (lang === 'en') return c.titleEn
    return c.titleKk
  }

  return (
    <div style={{ background: 'var(--b-bg)', minHeight: '100vh' }}>
      <TopNav user={user} />

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden" style={{ padding: '80px 32px 96px' }}>
        <div className="blob blob-1" style={{ top: -120, right: -80, opacity: 0.4 }} />
        <div className="blob blob-2" style={{ bottom: -100, left: 200, opacity: 0.3 }} />
        <div className="blob blob-3" style={{ top: 200, right: 280, opacity: 0.3 }} />

        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="grid gap-16 items-center" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>

            {/* Сол — мәтін */}
            <div>
              <div className="chip chip-primary inline-flex mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {t.home.badge}
              </div>
              <h1 className="b-display mb-6" style={{ maxWidth: 560 }}>
                {t.home.hero1}<br />
                <span style={{ color: 'var(--b-primary)' }}>
                  {t.home.hero2}<span style={{ color: 'var(--b-accent)' }}>.</span>
                </span>
              </h1>
              <p className="b-body mb-8" style={{ color: 'var(--b-text-2)', maxWidth: 480, fontSize: 17, lineHeight: 1.55 }}>
                {t.home.heroSub}
              </p>
              <div className="flex gap-3 mb-10">
                <Link href="/register" className="btn btn-primary btn-fluid btn-lg">{t.home.startFree}</Link>
                <Link href="/courses"  className="btn btn-secondary btn-lg glass">{t.home.catalog}</Link>
              </div>
              <div className="flex gap-8">
                {[['120K+', t.home.students], ['850+', t.home.courses], ['240+', t.home.instructors]].map(([n, label]) => (
                  <div key={label}>
                    <div className="b-h2">{n}</div>
                    <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Оң — визуал карточкалар */}
            <div className="relative" style={{ height: 520 }}>
              <div className="absolute top-0 right-0 thumb-grad-1 thumb-pattern rounded-2xl p-6 text-white overflow-hidden" style={{ width: 320, height: 200 }}>
                <div className="b-eyebrow mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>№ 01 · Design</div>
                <div className="b-h2" style={{ color: '#fff', lineHeight: 1.15 }}>UI/UX<br />Figma</div>
                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                  <div className="b-avatar" style={{ width: 24, height: 24, background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 10 }}>А</div>
                  <span className="b-sm" style={{ opacity: 0.85 }}>Айдана С.</span>
                </div>
              </div>

              <div className="card absolute p-6" style={{ top: 60, left: 0, width: 280, boxShadow: 'var(--sh-3)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg" style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }} />
                  <div>
                    <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>{t.categories.data} · {t.course.bestseller}</div>
                    <div className="b-h4">Data Analytics</div>
                  </div>
                </div>
                <div className="b-sm mb-3" style={{ color: 'var(--b-text-3)' }}>SQL → Python → Tableau</div>
                <div className="mb-3">
                  <div className="progress"><div className="progress-bar" style={{ width: '64%' }} /></div>
                  <div className="b-xs mt-1.5" style={{ color: 'var(--b-text-3)' }}>64% · 36 / 56 {t.course.lessons}</div>
                </div>
                <button className="btn btn-primary btn-sm w-full"><Icon name="play" size={11} />{t.common.next}</button>
              </div>

              <div className="card absolute p-4" style={{ bottom: 0, right: 60, width: 240 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="award" size={18} style={{ color: 'var(--b-accent)' }} />
                  <span className="b-sm font-semibold">{lang === 'kk' ? 'Сертификат' : lang === 'en' ? 'Certificate' : 'Сертификат'}</span>
                </div>
                <div className="b-xs" style={{ color: 'var(--b-text-3)' }}>
                  {lang === 'kk' ? 'ҚР-да 200+ компанияда мойындалады' : lang === 'en' ? 'Recognized by 200+ companies in Kazakhstan' : 'Признан в 200+ компаниях Казахстана'}
                </div>
              </div>

              <div className="absolute rounded-xl px-3 py-2.5 text-white text-sm font-medium" style={{ top: 240, right: 200, background: '#111827', boxShadow: 'var(--sh-3)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  4 200 {t.home.onlineNow}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TRUST STRIP ══════════ */}
      <section style={{ padding: '28px 32px', borderTop: '1px solid var(--b-line)', borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg-soft)' }}>
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <span className="b-eyebrow">{t.home.trustedBy}</span>
          <div className="flex gap-12 items-center" style={{ color: 'var(--b-text-3)' }}>
            {['KASPI.KZ','BEELINE','KCELL','CHOCOLIFE','AIR ASTANA','TENGRI BANK'].map(b => (
              <span key={b} style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', opacity: 0.55 }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ КАТЕГОРИЯЛАР ══════════ */}
      <section className="max-w-[1280px] mx-auto" style={{ padding: '80px 32px' }}>
        <div className="flex items-end justify-between mb-8">
          <h2 className="b-h1">{t.home.categories}</h2>
          <Link href="/courses" className="btn btn-link">{t.home.allCourses}</Link>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {CATEGORY_SLUGS.map(slug => (
            <Link key={slug} href={`/courses?category=${slug}`} className="card p-6 flex flex-col gap-4 no-underline cursor-pointer" style={{ minHeight: 140 }}>
              <div className="flex items-center justify-center rounded-[10px]" style={{ width: 44, height: 44, background: 'var(--b-primary-50)', color: 'var(--b-primary)' }}>
                <Icon name={CATEGORY_ICONS[slug]} size={22} stroke={2} />
              </div>
              <div>
                <div className="b-h4">{t.categories[slug]}</div>
                <div className="b-sm mt-0.5" style={{ color: 'var(--b-text-3)' }}>{CATEGORY_COUNTS[slug]} {t.home.courses}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════ ТАНЫМАЛ КУРСТАР ══════════ */}
      <section className="max-w-[1280px] mx-auto" style={{ padding: '0 32px 80px' }}>
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="b-eyebrow mb-2">{t.home.thisWeek}</div>
            <h2 className="b-h1">{t.home.popularCourses}</h2>
          </div>
          <div className="flex gap-2">
            {([t.home.all, t.categories.design, t.categories.programming, t.categories.marketing] as string[]).map((cat, i) => (
              <span key={cat} className={`chip ${i === 0 ? 'chip-active' : ''}`}>{cat}</span>
            ))}
          </div>
        </div>
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {MOCK_COURSES.map(course => (
            <Link key={course.id} href={`/courses/${course.slug}`} className="card flex flex-col no-underline">
              <div className={`thumb thumb-grad-${course.grad} thumb-pattern relative`}>
                <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                      {t.categories[course.catKey]}
                    </span>
                    <span className="font-mono text-[11px] opacity-70">BILIM</span>
                  </div>
                </div>
              </div>
              <div className="p-3.5 flex flex-col gap-2 flex-1">
                <div className="b-xs font-medium" style={{ color: 'var(--b-text-3)' }}>{t.categories[course.catKey]}</div>
                <div className="b-h4 leading-snug overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{courseTitle(course)}</div>
                <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>{course.author}</div>
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <Stars value={course.rating} />
                  <span className="b-xs" style={{ color: 'var(--b-text-4)' }}>({course.reviews.toLocaleString('ru-RU')})</span>
                </div>
                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--b-line-soft)' }}>
                  <div>
                    <div className="b-h4">{course.price.toLocaleString('ru-RU')} {t.common.currency}</div>
                    {course.oldPrice && <div className="b-xs line-through" style={{ color: 'var(--b-text-4)' }}>{course.oldPrice.toLocaleString('ru-RU')} {t.common.currency}</div>}
                  </div>
                  <span className="b-xs flex items-center gap-1" style={{ color: 'var(--b-text-3)' }}>
                    <Icon name="clock" size={12} />{course.hours}{t.course.hours}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════ РЕДАКЦИЯ БАННЕРІ ══════════ */}
      <section className="max-w-[1280px] mx-auto" style={{ padding: '0 32px 80px' }}>
        <div className="thumb-grad-1 thumb-pattern rounded-3xl overflow-hidden relative" style={{ padding: 56 }}>
          <div className="grid gap-12 items-center relative z-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <div className="b-eyebrow mb-4" style={{ color: 'var(--b-accent)' }}>{t.home.featured}</div>
              <h2 style={{ fontSize: 44, lineHeight: 1.1, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{t.home.becomeInstructor}</h2>
              <p className="b-body mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>{t.home.featuredSub}</p>
              <Link href="/courses" className="btn btn-accent btn-lg">{t.home.featuredBtn} <Icon name="arrow" size={14} /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Figma fundamentals','Design systems','User research','Portfolio + Job hunt'].map((m, i) => (
                <div key={m} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="font-mono text-[11px] mb-2" style={{ opacity: 0.6 }}>0{i + 1}</div>
                  <div className="font-semibold text-sm text-white">{m}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: 'var(--b-bg-soft)', borderTop: '1px solid var(--b-line)', padding: '48px 32px' }}>
        <div className="max-w-[1280px] mx-auto grid gap-12" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="7" fill="#1E3A8A"/>
                <path d="M10 9h7.5a4.5 4.5 0 0 1 .5 9 4.5 4.5 0 0 1-.5 9H10z" stroke="#fff" strokeWidth="1.8" fill="none"/>
                <circle cx="22.5" cy="9.5" r="1.6" fill="#F59E0B"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{t.common.platformName}</span>
            </div>
            <p className="b-sm" style={{ color: 'var(--b-text-3)', maxWidth: 280 }}>{t.common.tagline}</p>
          </div>
          {[
            [lang === 'kk' ? 'Студенттерге' : lang === 'en' ? 'For Students' : 'Студентам',
             [lang === 'kk' ? 'Каталог' : lang === 'en' ? 'Catalog' : 'Каталог',
              lang === 'kk' ? 'Сертификаттар' : lang === 'en' ? 'Certificates' : 'Сертификаты',
              'Career hub']],
            [lang === 'kk' ? 'Спикерлерге' : lang === 'en' ? 'For Speakers' : 'Спикерам',
             [lang === 'kk' ? 'Спикер болу' : lang === 'en' ? 'Become a Speaker' : 'Стать спикером',
              lang === 'kk' ? 'Ресурстар' : lang === 'en' ? 'Resources' : 'Ресурсы',
              lang === 'kk' ? 'Қауымдастық' : lang === 'en' ? 'Community' : 'Сообщество']],
            [lang === 'kk' ? 'Компания' : lang === 'en' ? 'Company' : 'Компания',
             [lang === 'kk' ? 'Біз туралы' : lang === 'en' ? 'About us' : 'О нас',
              lang === 'kk' ? 'Блог' : lang === 'en' ? 'Blog' : 'Блог',
              lang === 'kk' ? 'Контакттар' : lang === 'en' ? 'Contact' : 'Контакты']],
          ].map(([heading, links]) => (
            <div key={heading as string}>
              <div className="b-eyebrow mb-3">{heading as string}</div>
              <div className="flex flex-col gap-2">
                {(links as string[]).map(link => (
                  <a key={link} href="#" className="b-sm no-underline" style={{ color: 'var(--b-text-2)' }}>{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-[1280px] mx-auto flex justify-between mt-10 pt-6 b-xs" style={{ borderTop: '1px solid var(--b-line)', color: 'var(--b-text-3)' }}>
          <span>{t.common.copyright}</span>
          <span>KZ · RU · EN</span>
        </div>
      </footer>
    </div>
  )
}
