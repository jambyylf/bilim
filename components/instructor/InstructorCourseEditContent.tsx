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
  title_en: string | null
  order_idx: number
}

interface Lesson {
  id: string
  title_ru: string | null
  title_kk: string | null
  title_en: string | null
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

const TABS = ['basic', 'curriculum'] as const

export default function InstructorCourseEditContent({ course, sections, lessons }: Props) {
  const { lang } = useLang()
  const router   = useRouter()

  const [tab, setTab] = useState<typeof TABS[number]>('basic')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const [form, setForm] = useState({
    title_kk:       course.title_kk ?? '',
    title_ru:       course.title_ru ?? '',
    title_en:       course.title_en ?? '',
    description_kk: course.description_kk ?? '',
    description_ru: course.description_ru ?? '',
    description_en: course.description_en ?? '',
    price:          String(course.price),
    level:          course.level ?? 'beginner',
    language:       course.language ?? 'kk',
  })

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/instructor/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) || 0 }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    }
  }

  const TAB_LABELS = {
    basic:      lang === 'kk' ? 'Негізгі' : lang === 'en' ? 'Basic info' : 'Основная информация',
    curriculum: lang === 'kk' ? 'Бағдарлама' : lang === 'en' ? 'Curriculum' : 'Программа',
  }

  function lessonTitle(l: Lesson) {
    return (lang === 'kk' ? l.title_kk : lang === 'en' ? l.title_en : l.title_ru) ?? l.title_ru ?? '—'
  }

  function sectionTitle(s: Section) {
    return (lang === 'kk' ? s.title_kk : lang === 'en' ? s.title_en : s.title_ru) ?? s.title_ru ?? '—'
  }

  return (
    <div className="course-edit-wrap">
      <style>{`
        .course-edit-wrap { padding: 24px 16px; }
        @media (min-width: 768px) { .course-edit-wrap { padding: 40px 48px; } }
        .course-edit-grid { grid-template-columns: 1fr; }
        @media (min-width: 900px) { .course-edit-grid { grid-template-columns: 1.4fr 1fr; } }
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
          <button onClick={save} disabled={saving} className="btn btn-primary">
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
              color: tab === t ? 'var(--b-text-1)' : 'var(--b-text-3)',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <div className="grid gap-6" style={{ maxWidth: 680 }}>
          {/* Titles */}
          {(['kk', 'ru', 'en'] as const).map(l => (
            <div key={l}>
              <label className="b-label mb-1.5 block">
                {lang === 'kk'
                  ? (l === 'kk' ? 'Атауы (қазақша)' : l === 'ru' ? 'Атауы (орысша)' : 'Атауы (ағылшынша)')
                  : lang === 'en'
                  ? (l === 'kk' ? 'Title (Kazakh)' : l === 'ru' ? 'Title (Russian)' : 'Title (English)')
                  : (l === 'kk' ? 'Название (казахский)' : l === 'ru' ? 'Название (русский)' : 'Название (английский)')}
              </label>
              <input className="input w-full" value={form[`title_${l}` as keyof typeof form]}
                onChange={e => set(`title_${l}`, e.target.value)} />
            </div>
          ))}

          {/* Descriptions */}
          {(['kk', 'ru', 'en'] as const).map(l => (
            <div key={l}>
              <label className="b-label mb-1.5 block">
                {lang === 'kk'
                  ? (l === 'kk' ? 'Сипаттама (қазақша)' : l === 'ru' ? 'Сипаттама (орысша)' : 'Сипаттама (ағылшынша)')
                  : lang === 'en'
                  ? (l === 'kk' ? 'Description (Kazakh)' : l === 'ru' ? 'Description (Russian)' : 'Description (English)')
                  : (l === 'kk' ? 'Описание (казахский)' : l === 'ru' ? 'Описание (русский)' : 'Описание (английский)')}
              </label>
              <textarea className="input w-full" rows={4} value={form[`description_${l}` as keyof typeof form]}
                onChange={e => set(`description_${l}`, e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          ))}

          {/* Price / Level / Language */}
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <div>
              <label className="b-label mb-1.5 block">
                {lang === 'kk' ? 'Баға (₸)' : lang === 'en' ? 'Price (₸)' : 'Цена (₸)'}
              </label>
              <input type="number" className="input w-full" min={0} step={500}
                value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div>
              <label className="b-label mb-1.5 block">
                {lang === 'kk' ? 'Деңгей' : lang === 'en' ? 'Level' : 'Уровень'}
              </label>
              <CustomSelect
                value={form.level}
                onChange={v => set('level', v)}
                options={[
                  { value: 'beginner',     label: lang === 'kk' ? 'Бастауыш' : lang === 'en' ? 'Beginner' : 'Начинающий' },
                  { value: 'intermediate', label: lang === 'kk' ? 'Орта' : lang === 'en' ? 'Intermediate' : 'Средний' },
                  { value: 'advanced',     label: lang === 'kk' ? 'Жоғары' : lang === 'en' ? 'Advanced' : 'Продвинутый' },
                ]}
              />
            </div>
            <div>
              <label className="b-label mb-1.5 block">
                {lang === 'kk' ? 'Тілі' : lang === 'en' ? 'Language' : 'Язык'}
              </label>
              <CustomSelect
                value={form.language}
                onChange={v => set('language', v)}
                options={[
                  { value: 'kk', label: lang === 'kk' ? 'Қазақша' : lang === 'en' ? 'Kazakh' : 'Казахский' },
                  { value: 'ru', label: lang === 'kk' ? 'Орысша' : lang === 'en' ? 'Russian' : 'Русский' },
                  { value: 'en', label: lang === 'kk' ? 'Ағылшынша' : lang === 'en' ? 'English' : 'Английский' },
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'curriculum' && (
        <div style={{ maxWidth: 680 }}>
          {sections.length === 0 ? (
            <div className="card p-8 text-center b-sm" style={{ color: 'var(--b-text-3)' }}>
              {lang === 'kk' ? 'Бөлім жоқ' : lang === 'en' ? 'No sections yet' : 'Разделов нет'}
            </div>
          ) : sections.map(section => (
            <div key={section.id} className="card overflow-hidden mb-4">
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--b-line)', background: 'var(--b-bg-soft)' }}>
                <div className="b-sm font-semibold">{sectionTitle(section)}</div>
              </div>
              {lessons.filter(l => l.section_id === section.id).map(lesson => (
                <div key={lesson.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--b-line-soft)' }}>
                  <Icon name={lesson.mux_playback_id ? 'play' : 'document'} size={16} style={{ color: 'var(--b-text-3)', flexShrink: 0 }} />
                  <span className="b-sm flex-1">{lessonTitle(lesson)}</span>
                  {lesson.is_preview && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#eff6ff', color: '#3B82F6' }}>
                      {lang === 'kk' ? 'Алдын ала қарау' : lang === 'en' ? 'Preview' : 'Превью'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div className="b-sm mt-4" style={{ color: 'var(--b-text-3)' }}>
            {lang === 'kk'
              ? 'Бөлім мен сабақтарды жасау үшін жаңа курс формасын пайдаланыңыз.'
              : lang === 'en'
              ? 'To add sections and lessons, use the new course form.'
              : 'Для добавления разделов и уроков используйте форму создания курса.'}
          </div>
        </div>
      )}
    </div>
  )
}
