'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Icon from '@/components/shared/Icon'
import { useLang } from '@/components/providers/LangProvider'

interface Category {
  id: string
  slug: string
  name_kk: string | null
  name_ru: string | null
  name_en: string | null
}

interface Props {
  categories: Category[]
}

type Tab = 'basic' | 'pricing' | 'curriculum'

export default function NewCourseForm({ categories }: Props) {
  const router = useRouter()
  const { lang, t } = useLang()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('basic')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Негізгі ақпарат
  const [titleKk, setTitleKk] = useState('')
  const [titleRu, setTitleRu] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [descKk, setDescKk]   = useState('')
  const [descRu, setDescRu]   = useState('')
  const [descEn, setDescEn]   = useState('')
  const [categoryId, setCategoryId]   = useState('')
  const [courseLang, setCourseLang]   = useState<'kk' | 'ru' | 'en'>('kk')
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')

  // Баға
  const [price, setPrice]               = useState('')
  const [discountPrice, setDiscountPrice] = useState('')

  // Бөлімдер + сабақтар
  const [sections, setSections] = useState<{
    id: string
    titleKk: string
    titleRu: string
    lessons: { id: string; titleKk: string; titleRu: string; freePreview: boolean; muxUploadId: string; uploading: boolean }[]
  }[]>([])

  function catName(c: Category) {
    if (lang === 'ru') return c.name_ru ?? c.name_kk ?? ''
    if (lang === 'en') return c.name_en ?? c.name_ru ?? ''
    return c.name_kk ?? c.name_ru ?? ''
  }

  function addSection() {
    setSections(s => [...s, { id: crypto.randomUUID(), titleKk: '', titleRu: '', lessons: [] }])
  }

  function addLesson(sectionId: string) {
    setSections(s => s.map(sec =>
      sec.id === sectionId
        ? { ...sec, lessons: [...sec.lessons, { id: crypto.randomUUID(), titleKk: '', titleRu: '', freePreview: false, muxUploadId: '', uploading: false }] }
        : sec
    ))
  }

  async function handleVideoUpload(sectionId: string, lessonId: string, file: File) {
    setSections(s => s.map(sec => ({
      ...sec,
      lessons: sec.lessons.map(l => l.id === lessonId ? { ...l, uploading: true } : l),
    })))

    const res = await fetch('/api/instructor/upload-video', { method: 'POST' })
    if (!res.ok) {
      setSections(s => s.map(sec => ({
        ...sec,
        lessons: sec.lessons.map(l => l.id === lessonId ? { ...l, uploading: false } : l),
      })))
      setError(t.instructor.uploadError)
      return
    }

    const { uploadUrl, uploadId } = await res.json()

    // Файлды Mux-қа тікелей жүктеу
    await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })

    setSections(s => s.map(sec => ({
      ...sec,
      lessons: sec.lessons.map(l => l.id === lessonId ? { ...l, uploading: false, muxUploadId: uploadId } : l),
    })))
  }

  async function saveCourse(isDraft: boolean) {
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError(t.auth.genericError); setSaving(false); return }

    const slugBase = (titleRu || titleKk || 'course')
      .toLowerCase()
      .replace(/[^a-zа-яёқңғүұіәөЁ0-9\s]/gi, '')
      .replace(/\s+/g, '-')
      .slice(0, 60)
    const slug = `${slugBase}-${Date.now()}`

    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .insert({
        slug,
        instructor_id:  user.id,
        title_kk:       titleKk || titleRu || '—',
        title_ru:       titleRu || titleKk || '—',
        title_en:       titleEn || '',
        description_kk: descKk || null,
        description_ru: descRu || null,
        description_en: descEn || null,
        category_id:    categoryId || null,
        language:       courseLang,
        level,
        price:          price ? Number(price) : 0,
        discount_price: discountPrice ? Number(discountPrice) : null,
        status:         isDraft ? 'draft' : 'pending',
      })
      .select('id')
      .single()

    if (courseErr || !course) {
      setError(t.auth.genericError)
      setSaving(false)
      return
    }

    // Бөлімдер мен сабақтарды сақтау
    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si]
      const { data: section } = await supabase
        .from('sections')
        .insert({ course_id: course.id, title_kk: sec.titleKk || '—', title_ru: sec.titleRu || '—', order_idx: si })
        .select('id')
        .single()

      if (!section) continue

      for (let li = 0; li < sec.lessons.length; li++) {
        const les = sec.lessons[li]
        await supabase.from('lessons').insert({
          section_id:  section.id,
          course_id:   course.id,
          title_kk:    les.titleKk || '—',
          title_ru:    les.titleKk || '—',
          order_idx:   li,
          is_preview:  les.freePreview,
        })
      }
    }

    router.push('/instructor/courses')
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'basic',       label: t.instructor.courseTitle,    icon: 'edit' },
    { id: 'pricing',     label: t.instructor.coursePrice,    icon: 'dollar' },
    { id: 'curriculum',  label: t.instructor.addSection,     icon: 'list' },
  ]

  return (
    <div style={{ padding: '40px 48px', maxWidth: 900 }}>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm">
          <Icon name="chevronLeft" size={16} />
        </button>
        <div>
          <div className="b-eyebrow mb-1">{t.instructor.title}</div>
          <h1 className="b-h1">{t.instructor.newCourse}</h1>
        </div>
      </div>

      {/* Табтар */}
      <div className="liquid-tabs mb-8">
        {TABS.map(tab_ => (
          <button
            key={tab_.id}
            className={`liquid-tab flex items-center gap-2 ${tab === tab_.id ? 'active' : ''}`}
            onClick={() => setTab(tab_.id)}
          >
            <Icon name={tab_.icon} size={14} />
            {tab_.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg text-sm" style={{ background: '#fef2f2', color: 'var(--b-error)', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* ── НЕГІЗГІ АҚПАРАТ ── */}
      {tab === 'basic' && (
        <div className="card p-7 flex flex-col gap-6">
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[
              { label: t.instructor.courseTitleKk, val: titleKk, set: setTitleKk, ph: 'Курс атауы...' },
              { label: t.instructor.courseTitleRu, val: titleRu, set: setTitleRu, ph: 'Название курса...' },
              { label: t.instructor.courseTitleEn, val: titleEn, set: setTitleEn, ph: 'Course title...' },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className="b-sm font-medium block mb-1.5">{label}</label>
                <input className="inp" placeholder={ph} value={val} onChange={e => set(e.target.value)} />
              </div>
            ))}
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[
              { label: t.instructor.courseDescKk, val: descKk, set: setDescKk, ph: 'Сипаттама...' },
              { label: t.instructor.courseDescRu, val: descRu, set: setDescRu, ph: 'Описание...' },
              { label: t.instructor.courseDescEn, val: descEn, set: setDescEn, ph: 'Description...' },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className="b-sm font-medium block mb-1.5">{label}</label>
                <textarea
                  className="inp"
                  placeholder={ph}
                  value={val}
                  onChange={e => set(e.target.value)}
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>
            ))}
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {/* Категория */}
            <div>
              <label className="b-sm font-medium block mb-1.5">{t.instructor.courseCategory}</label>
              <select className="inp" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">—</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{catName(c)}</option>
                ))}
              </select>
            </div>

            {/* Тіл */}
            <div>
              <label className="b-sm font-medium block mb-1.5">{t.instructor.courseLanguage}</label>
              <select className="inp" value={courseLang} onChange={e => setCourseLang(e.target.value as 'kk'|'ru'|'en')}>
                <option value="kk">{t.instructor.languages.kk}</option>
                <option value="ru">{t.instructor.languages.ru}</option>
                <option value="en">{t.instructor.languages.en}</option>
              </select>
            </div>

            {/* Деңгей */}
            <div>
              <label className="b-sm font-medium block mb-1.5">{t.instructor.courseLevel}</label>
              <select className="inp" value={level} onChange={e => setLevel(e.target.value as typeof level)}>
                <option value="beginner">{t.instructor.levels.beginner}</option>
                <option value="intermediate">{t.instructor.levels.intermediate}</option>
                <option value="advanced">{t.instructor.levels.advanced}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── БАҒА ── */}
      {tab === 'pricing' && (
        <div className="card p-7 flex flex-col gap-6">
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="b-sm font-medium block mb-1.5">{t.instructor.coursePrice}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 b-sm" style={{ color: 'var(--b-text-3)' }}>₸</span>
                <input
                  type="number"
                  className="inp"
                  style={{ paddingLeft: 28 }}
                  placeholder="49 900"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  min={0}
                />
              </div>
            </div>
            <div>
              <label className="b-sm font-medium block mb-1.5">{t.instructor.courseDiscountPrice}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 b-sm" style={{ color: 'var(--b-text-3)' }}>₸</span>
                <input
                  type="number"
                  className="inp"
                  style={{ paddingLeft: 28 }}
                  placeholder="29 900"
                  value={discountPrice}
                  onChange={e => setDiscountPrice(e.target.value)}
                  min={0}
                />
              </div>
            </div>
          </div>
          <p className="b-xs" style={{ color: 'var(--b-text-4)' }}>
            {lang === 'kk'
              ? 'Платформа комиссиясы: 20%. Сіздің үлесіңіз: 80%.'
              : lang === 'en'
              ? 'Platform commission: 20%. Your share: 80%.'
              : 'Комиссия платформы: 20%. Ваша доля: 80%.'}
          </p>
        </div>
      )}

      {/* ── ОҚУ ЖОСПАРЫ ── */}
      {tab === 'curriculum' && (
        <div className="flex flex-col gap-4">
          {sections.map((sec, si) => (
            <div key={sec.id} className="card overflow-hidden">
              {/* Бөлім тақырыбы */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--b-line)' }}>
                <Icon name="list" size={16} style={{ color: 'var(--b-text-3)' }} />
                <input
                  className="flex-1 b-h4 bg-transparent outline-none border-none"
                  placeholder={`${lang === 'kk' ? 'Бөлім' : lang === 'en' ? 'Section' : 'Раздел'} ${si + 1}`}
                  value={sec.titleKk}
                  onChange={e => setSections(s => s.map(s2 => s2.id === sec.id ? { ...s2, titleKk: e.target.value } : s2))}
                />
                <input
                  className="flex-1 b-sm bg-transparent outline-none border-none"
                  placeholder={lang === 'ru' ? 'Название (рус)' : 'Title (ru)'}
                  value={sec.titleRu}
                  onChange={e => setSections(s => s.map(s2 => s2.id === sec.id ? { ...s2, titleRu: e.target.value } : s2))}
                  style={{ color: 'var(--b-text-3)' }}
                />
              </div>

              {/* Сабақтар */}
              <div className="px-5">
                {sec.lessons.map((les, li) => (
                  <div
                    key={les.id}
                    className="flex items-center gap-3 py-3"
                    style={{ borderBottom: '1px solid var(--b-line-soft)' }}
                  >
                    <Icon name="play" size={13} style={{ color: 'var(--b-text-4)', flexShrink: 0 }} />
                    <input
                      className="flex-1 b-sm bg-transparent outline-none border-none"
                      placeholder={`${t.instructor.lessonTitle} ${li + 1}`}
                      value={les.titleKk}
                      onChange={e => setSections(s => s.map(s2 => ({
                        ...s2,
                        lessons: s2.lessons.map(l => l.id === les.id ? { ...l, titleKk: e.target.value } : l),
                      })))}
                    />

                    {/* Видео жүктеу */}
                    <label className="btn btn-ghost btn-sm flex items-center gap-1.5 cursor-pointer shrink-0">
                      {les.uploading ? (
                        <>
                          <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                          </svg>
                          {t.instructor.uploading}
                        </>
                      ) : les.muxUploadId ? (
                        <>
                          <Icon name="check" size={13} style={{ color: '#059669' }} />
                          <span style={{ color: '#059669' }}>{t.instructor.uploadSuccess}</span>
                        </>
                      ) : (
                        <>
                          <Icon name="upload" size={13} />
                          {t.instructor.uploadVideo}
                        </>
                      )}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) handleVideoUpload(sec.id, les.id, file)
                        }}
                      />
                    </label>

                    {/* Тегін қарау */}
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={les.freePreview}
                        onChange={e => setSections(s => s.map(s2 => ({
                          ...s2,
                          lessons: s2.lessons.map(l => l.id === les.id ? { ...l, freePreview: e.target.checked } : l),
                        })))}
                        style={{ accentColor: 'var(--b-primary)' }}
                      />
                      <span className="b-xs" style={{ color: 'var(--b-text-3)' }}>{t.instructor.freePreview}</span>
                    </label>
                  </div>
                ))}

                <button
                  className="btn btn-ghost btn-sm flex items-center gap-2 my-3"
                  onClick={() => addLesson(sec.id)}
                >
                  <Icon name="plus" size={13} />
                  {t.instructor.addLesson}
                </button>
              </div>
            </div>
          ))}

          <button
            className="btn btn-secondary flex items-center gap-2 self-start"
            onClick={addSection}
          >
            <Icon name="plus" size={14} />
            {t.instructor.addSection}
          </button>
        </div>
      )}

      {/* Сақтау батырмалары */}
      <div className="flex items-center gap-3 mt-8">
        <button
          className="btn btn-secondary btn-lg"
          onClick={() => saveCourse(true)}
          disabled={saving}
        >
          {saving ? t.instructor.saving : t.instructor.saveDraft}
        </button>
        <button
          className="btn btn-primary btn-fluid btn-lg"
          onClick={() => saveCourse(false)}
          disabled={saving || !titleKk && !titleRu}
        >
          {saving ? t.instructor.saving : t.instructor.submitReview}
        </button>
      </div>
    </div>
  )
}
