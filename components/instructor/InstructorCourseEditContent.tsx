'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/providers/LangProvider'
import Icon from '@/components/shared/Icon'
import CustomSelect from '@/components/shared/CustomSelect'

interface Course {
  id: string
  title_ru: string | null
  title_kk: string | null
  title_en: string | null
  description_ru: string | null
  description_kk: string | null
  description_en: string | null
  slug: string
  price: number
  level: string | null
  language: string | null
  status: string
  thumbnail_url: string | null
  category_id: string | null
}

interface Category {
  id: string
  name_ru: string | null
  name_kk: string | null
  name_en: string | null
  slug: string
}

interface Section {
  id: string
  title_ru: string | null
  title_kk: string | null
  order_idx: number
}

interface Lesson {
  id: string
  title_ru: string | null
  title_kk: string | null
  section_id: string
  order_idx: number
  is_preview: boolean
  mux_playback_id: string | null
}

interface Props {
  course: Course
  categories: Category[]
  sections: Section[]
  lessons: Lesson[]
}

interface LocalLesson {
  id?: string
  title_kk: string
  title_ru: string
  order_idx: number
  is_preview: boolean
  mux_upload_id?: string
  uploading: boolean
  hasVideo: boolean
}

interface LocalSection {
  id?: string
  title_kk: string
  title_ru: string
  order_idx: number
  lessons: LocalLesson[]
}

const TABS = ['basic', 'curriculum'] as const

export default function InstructorCourseEditContent({ course, categories, sections, lessons }: Props) {
  const { lang } = useLang()
  const router   = useRouter()

  const [tab, setTab] = useState<typeof TABS[number]>('basic')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const [form, setForm] = useState<Record<string, string>>({
    title_kk:       course.title_kk ?? '',
    title_ru:       course.title_ru ?? '',
    title_en:       course.title_en ?? '',
    description_kk: course.description_kk ?? '',
    description_ru: course.description_ru ?? '',
    description_en: course.description_en ?? '',
    price:          String(course.price ?? 0),
    level:          course.level ?? 'beginner',
    language:       course.language ?? 'kk',
    category_id:    course.category_id ?? '',
  })

  // Бағдарлама күйі
  const [localSections, setLocalSections] = useState<LocalSection[]>(() =>
    sections.map(s => ({
      id:        s.id,
      title_kk:  s.title_kk ?? '',
      title_ru:  s.title_ru ?? '',
      order_idx: s.order_idx,
      lessons: lessons
        .filter(l => l.section_id === s.id)
        .sort((a, b) => a.order_idx - b.order_idx)
        .map(l => ({
          id:            l.id,
          title_kk:      l.title_kk ?? '',
          title_ru:      l.title_ru ?? '',
          order_idx:     l.order_idx,
          is_preview:    l.is_preview,
          hasVideo:      !!l.mux_playback_id,
          uploading:     false,
        })),
    }))
  )

  function setField(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  // ── Негізгі ақпаратты сақтау ──
  async function saveBasic() {
    setSaving(true)
    await fetch(`/api/instructor/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) || 0 }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  // ── Бағдарламаны сақтау (admin тексеруіне кетеді) ──
  async function saveCurriculum() {
    setSaving(true)
    await fetch(`/api/instructor/courses/${course.id}/curriculum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sections: localSections.map((s, si) => ({
          ...s,
          order_idx: si,
          lessons: s.lessons.map((l, li) => ({ ...l, order_idx: li })),
        })),
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  // ── Бөлім CRUD ──
  function addSection() {
    setLocalSections(s => [...s, { title_kk: '', title_ru: '', order_idx: s.length, lessons: [] }])
  }

  function updateSection(idx: number, key: 'title_kk' | 'title_ru', val: string) {
    setLocalSections(s => s.map((sec, i) => i === idx ? { ...sec, [key]: val } : sec))
  }

  function removeSection(idx: number) {
    if (!confirm(lang === 'kk' ? 'Бөлімді жою керек пе?' : lang === 'en' ? 'Delete section?' : 'Удалить раздел?')) return
    setLocalSections(s => s.filter((_, i) => i !== idx))
  }

  // ── Сабақ CRUD ──
  function addLesson(sIdx: number) {
    setLocalSections(s => s.map((sec, i) => i === sIdx
      ? { ...sec, lessons: [...sec.lessons, { title_kk: '', title_ru: '', order_idx: sec.lessons.length, is_preview: false, uploading: false, hasVideo: false }] }
      : sec
    ))
  }

  function updateLesson(sIdx: number, lIdx: number, key: string, val: string | boolean) {
    setLocalSections(s => s.map((sec, i) => i !== sIdx ? sec : {
      ...sec,
      lessons: sec.lessons.map((l, j) => j === lIdx ? { ...l, [key]: val } : l),
    }))
  }

  function removeLesson(sIdx: number, lIdx: number) {
    if (!confirm(lang === 'kk' ? 'Сабақты жою керек пе?' : lang === 'en' ? 'Delete lesson?' : 'Удалить урок?')) return
    setLocalSections(s => s.map((sec, i) => i !== sIdx ? sec : {
      ...sec,
      lessons: sec.lessons.filter((_, j) => j !== lIdx),
    }))
  }

  // ── Видео жүктеу ──
  async function uploadVideo(sIdx: number, lIdx: number, file: File) {
    updateLesson(sIdx, lIdx, 'uploading', true)

    const res = await fetch('/api/instructor/upload-video', { method: 'POST' })
    if (!res.ok) {
      updateLesson(sIdx, lIdx, 'uploading', false)
      alert(lang === 'kk' ? 'Жүктеу қатесі' : 'Upload error')
      return
    }

    const { uploadUrl, uploadId } = await res.json()
    await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })

    setLocalSections(s => s.map((sec, i) => i !== sIdx ? sec : {
      ...sec,
      lessons: sec.lessons.map((l, j) => j !== lIdx ? l : { ...l, uploading: false, hasVideo: true, mux_upload_id: uploadId }),
    }))
  }

  const TAB_LABELS = {
    basic:      lang === 'kk' ? 'Негізгі'    : lang === 'en' ? 'Basic info'  : 'Основная информация',
    curriculum: lang === 'kk' ? 'Бағдарлама' : lang === 'en' ? 'Curriculum'  : 'Программа',
  }

  function catName(c: Category) {
    return (lang === 'kk' ? c.name_kk : lang === 'en' ? c.name_en : c.name_ru) ?? c.name_ru ?? ''
  }

  return (
    <div className="course-edit-wrap">
      <style>{`
        .course-edit-wrap { padding: 24px 16px; }
        @media (min-width: 768px) { .course-edit-wrap { padding: 40px 48px; } }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="b-eyebrow mb-1">
            {lang === 'kk' ? 'Курсты өңдеу' : lang === 'en' ? 'Edit course' : 'Редактировать курс'}
          </div>
          <h1 className="b-h2">{course.title_ru ?? course.title_kk ?? '—'}</h1>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="b-sm" style={{ color: '#059669' }}>
              {lang === 'kk' ? '✓ Сақталды' : lang === 'en' ? '✓ Saved' : '✓ Сохранено'}
            </span>
          )}
          <button
            onClick={tab === 'basic' ? saveBasic : saveCurriculum}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving
              ? (lang === 'kk' ? 'Сақталуда...' : lang === 'en' ? 'Saving...' : 'Сохранение...')
              : (lang === 'kk' ? 'Сақтау' : lang === 'en' ? 'Save' : 'Сохранить')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--b-bg-soft)', width: 'fit-content' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-lg b-sm font-medium transition-all"
            style={{
              background: tab === t ? 'var(--b-bg)' : 'transparent',
              color: tab === t ? 'var(--b-text)' : 'var(--b-text-3)',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── НЕГІЗГІ АҚПАРАТ ── */}
      {tab === 'basic' && (
        <div className="flex flex-col gap-6" style={{ maxWidth: 680 }}>
          {(['kk', 'ru', 'en'] as const).map(l => (
            <div key={l}>
              <label className="b-label mb-1.5 block">
                {lang === 'kk'
                  ? (l === 'kk' ? 'Атауы (қазақша)' : l === 'ru' ? 'Атауы (орысша)' : 'Атауы (ағылшынша)')
                  : (l === 'kk' ? 'Название (казахский)' : l === 'ru' ? 'Название (русский)' : 'Название (английский)')}
              </label>
              <input className="inp w-full" value={form[`title_${l}` as keyof typeof form]}
                onChange={e => setField(`title_${l}`, e.target.value)} />
            </div>
          ))}

          {(['kk', 'ru', 'en'] as const).map(l => (
            <div key={`desc_${l}`}>
              <label className="b-label mb-1.5 block">
                {lang === 'kk'
                  ? (l === 'kk' ? 'Сипаттама (қазақша)' : l === 'ru' ? 'Сипаттама (орысша)' : 'Сипаттама (ағылшынша)')
                  : (l === 'kk' ? 'Описание (казахский)' : l === 'ru' ? 'Описание (русский)' : 'Описание (английский)')}
              </label>
              <textarea className="inp w-full" rows={3} value={form[`description_${l}` as keyof typeof form]}
                onChange={e => setField(`description_${l}`, e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          ))}

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <div>
              <label className="b-label mb-1.5 block">{lang === 'kk' ? 'Баға (₸)' : lang === 'en' ? 'Price (₸)' : 'Цена (₸)'}</label>
              <input type="number" className="inp w-full" min={0} step={500}
                value={form.price} onChange={e => setField('price', e.target.value)} />
            </div>
            <div>
              <label className="b-label mb-1.5 block">{lang === 'kk' ? 'Деңгей' : lang === 'en' ? 'Level' : 'Уровень'}</label>
              <CustomSelect
                value={form.level}
                onChange={v => setField('level', v)}
                options={[
                  { value: 'beginner',     label: lang === 'kk' ? 'Бастауыш' : lang === 'en' ? 'Beginner' : 'Начинающий' },
                  { value: 'intermediate', label: lang === 'kk' ? 'Орта' : lang === 'en' ? 'Intermediate' : 'Средний' },
                  { value: 'advanced',     label: lang === 'kk' ? 'Жоғары' : lang === 'en' ? 'Advanced' : 'Продвинутый' },
                ]}
              />
            </div>
            <div>
              <label className="b-label mb-1.5 block">{lang === 'kk' ? 'Тілі' : lang === 'en' ? 'Language' : 'Язык'}</label>
              <CustomSelect
                value={form.language}
                onChange={v => setField('language', v)}
                options={[
                  { value: 'kk', label: lang === 'kk' ? 'Қазақша' : lang === 'en' ? 'Kazakh' : 'Казахский' },
                  { value: 'ru', label: lang === 'kk' ? 'Орысша' : lang === 'en' ? 'Russian' : 'Русский' },
                  { value: 'en', label: lang === 'kk' ? 'Ағылшынша' : lang === 'en' ? 'English' : 'Английский' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="b-label mb-1.5 block">{lang === 'kk' ? 'Категория' : lang === 'en' ? 'Category' : 'Категория'}</label>
            <CustomSelect
              value={form.category_id ?? ''}
              onChange={v => setField('category_id', v)}
              options={categories.map(c => ({ value: c.id, label: catName(c) }))}
              placeholder="—"
            />
          </div>
        </div>
      )}

      {/* ── БАҒДАРЛАМА ── */}
      {tab === 'curriculum' && (
        <div style={{ maxWidth: 720 }}>
          {/* Курс күйіне байланысты баннер */}
          {course.status === 'published' ? (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 b-xs"
              style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>
              <Icon name="check" size={14} />
              {lang === 'kk'
                ? 'Курс жарияланған. Өзгерістер сақталса, қайта тексеруге жіберіледі.'
                : lang === 'en'
                ? 'Course is published. Saving changes will send it for re-review.'
                : 'Курс опубликован. При сохранении изменений он будет отправлен на повторную проверку.'}
            </div>
          ) : course.status === 'pending' ? (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 b-xs"
              style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
              <Icon name="clock" size={14} />
              {lang === 'kk'
                ? 'Курс тексерілуде. Admin бекіткеннен кейін жарияланады.'
                : lang === 'en'
                ? 'Course is under review. It will be published after admin approval.'
                : 'Курс на проверке. Будет опубликован после одобрения админа.'}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 b-xs"
              style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
              <Icon name="clock" size={14} />
              {lang === 'kk'
                ? 'Бағдарламаны сақтағанда курс тексеруге жіберіледі. Admin бекіткеннен кейін жарияланады.'
                : lang === 'en'
                ? 'Saving curriculum will send the course for review. It will be published after admin approval.'
                : 'При сохранении программы курс будет отправлен на проверку. Будет опубликован после одобрения админа.'}
            </div>
          )}

          {localSections.length === 0 && (
            <div className="card p-8 text-center b-sm mb-4" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk' ? 'Бөлім жоқ. Төменде бөлім қосыңыз.' : lang === 'en' ? 'No sections yet. Add one below.' : 'Разделов нет. Добавьте ниже.'}
            </div>
          )}

          {localSections.map((sec, sIdx) => (
            <div key={sIdx} className="card overflow-hidden mb-4">
              {/* Бөлім тақырыбы */}
              <div className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg-soft)' }}>
                <Icon name="list" size={15} style={{ color: 'var(--b-text-3)', flexShrink: 0 }} />
                <input
                  className="flex-1 b-sm font-semibold bg-transparent border-none outline-none"
                  placeholder={lang === 'kk' ? `Бөлім ${sIdx + 1} атауы (қаз)` : `Раздел ${sIdx + 1} (каз)`}
                  value={sec.title_kk}
                  onChange={e => updateSection(sIdx, 'title_kk', e.target.value)}
                />
                <input
                  className="flex-1 b-sm bg-transparent border-none outline-none"
                  placeholder={lang === 'kk' ? 'Атауы (орыс)' : 'Название (рус)'}
                  value={sec.title_ru}
                  onChange={e => updateSection(sIdx, 'title_ru', e.target.value)}
                  style={{ color: 'var(--b-text-3)' }}
                />
                <button onClick={() => removeSection(sIdx)} className="btn btn-ghost btn-sm shrink-0"
                  style={{ color: '#dc2626' }}>
                  <Icon name="trash" size={13} />
                </button>
              </div>

              {/* Сабақтар */}
              <div className="px-4">
                {sec.lessons.map((les, lIdx) => (
                  <div key={lIdx} className="flex items-center gap-2 py-3 flex-wrap"
                    style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
                    <Icon name="play" size={12} style={{ color: 'var(--b-text-4)', flexShrink: 0 }} />

                    <input
                      className="b-sm bg-transparent border-none outline-none"
                      style={{ flex: 2, minWidth: 100 }}
                      placeholder={lang === 'kk' ? 'Сабақ атауы (қаз)' : 'Урок (каз)'}
                      value={les.title_kk}
                      onChange={e => updateLesson(sIdx, lIdx, 'title_kk', e.target.value)}
                    />
                    <input
                      className="b-sm bg-transparent border-none outline-none"
                      style={{ flex: 2, minWidth: 100, color: 'var(--b-text-3)' }}
                      placeholder={lang === 'kk' ? 'Атауы (орыс)' : 'Урок (рус)'}
                      value={les.title_ru}
                      onChange={e => updateLesson(sIdx, lIdx, 'title_ru', e.target.value)}
                    />

                    {/* Видео жүктеу */}
                    <label className="btn btn-ghost btn-sm flex items-center gap-1 cursor-pointer shrink-0"
                      style={{ fontSize: 12 }}>
                      {les.uploading ? (
                        <>
                          <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                          </svg>
                          {lang === 'kk' ? 'Жүктелуде...' : lang === 'en' ? 'Uploading...' : 'Загрузка...'}
                        </>
                      ) : les.hasVideo ? (
                        <>
                          <Icon name="check" size={12} style={{ color: '#059669' }} />
                          <span style={{ color: '#059669' }}>{lang === 'kk' ? 'Видео бар' : lang === 'en' ? 'Video added' : 'Видео есть'}</span>
                        </>
                      ) : (
                        <>
                          <Icon name="upload" size={12} />
                          {lang === 'kk' ? 'Видео' : 'Видео'}
                        </>
                      )}
                      <input type="file" accept="video/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadVideo(sIdx, lIdx, f) }} />
                    </label>

                    {/* Тегін қарау */}
                    <label className="flex items-center gap-1 cursor-pointer shrink-0 b-xs"
                      style={{ color: 'var(--b-text-3)' }}>
                      <input type="checkbox" checked={les.is_preview}
                        onChange={e => updateLesson(sIdx, lIdx, 'is_preview', e.target.checked)}
                        style={{ accentColor: 'var(--b-primary)' }} />
                      {lang === 'kk' ? 'Тегін' : lang === 'en' ? 'Free' : 'Бесп.'}
                    </label>

                    <button onClick={() => removeLesson(sIdx, lIdx)}
                      className="btn btn-ghost btn-sm shrink-0" style={{ color: '#dc2626' }}>
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                ))}

                <button onClick={() => addLesson(sIdx)}
                  className="btn btn-ghost btn-sm flex items-center gap-1.5 my-2"
                  style={{ fontSize: 12 }}>
                  <Icon name="plus" size={12} />
                  {lang === 'kk' ? '+ Сабақ қосу' : lang === 'en' ? '+ Add lesson' : '+ Добавить урок'}
                </button>
              </div>
            </div>
          ))}

          <button onClick={addSection} className="btn btn-secondary flex items-center gap-2 mb-6">
            <Icon name="plus" size={14} />
            {lang === 'kk' ? 'Бөлім қосу' : lang === 'en' ? 'Add section' : 'Добавить раздел'}
          </button>
        </div>
      )}
    </div>
  )
}
