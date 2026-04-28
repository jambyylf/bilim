// Курс карточкасы компоненті — дизайн файлынан аударылған
import Link from 'next/link'
import Stars from '@/components/shared/Stars'
import Icon from '@/components/shared/Icon'
import type { CourseWithInstructor } from '@/types/database'

// Курс карточкасының градиент индексін анықтайды
const GRAD_COUNT = 8

interface CourseCardProps {
  course: CourseWithInstructor
  lang?: 'kk' | 'ru' | 'en'
}

export default function CourseCard({ course, lang = 'kk' }: CourseCardProps) {
  // Тілге сай атау
  const title = lang === 'kk' ? course.title_kk
    : lang === 'en' ? course.title_en
    : course.title_ru

  // Slug-дан градиент нөмірін шығарамыз (тұрақты болуы үшін)
  const gradIdx = (course.slug.charCodeAt(0) % GRAD_COUNT) + 1
  const currentPrice = course.discount_price ?? course.price
  const hasDiscount = !!course.discount_price

  return (
    <Link href={`/courses/${course.slug}`} className="card flex flex-col no-underline group">
      {/* Thumbnail */}
      <div className={`thumb thumb-grad-${gradIdx} thumb-pattern relative`}>
        <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
          <div className="flex justify-between items-start">
            {course.categories && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                {lang === 'kk' ? course.categories.name_kk : course.categories.name_ru}
              </span>
            )}
            <span className="font-mono text-[11px] opacity-70">BILIM</span>
          </div>
        </div>
      </div>

      {/* Мазмұн */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div className="b-xs font-medium" style={{ color: 'var(--b-text-3)' }}>
          {course.categories && (lang === 'kk' ? course.categories.name_kk : course.categories.name_ru)}
        </div>

        <div className="b-h4 leading-snug line-clamp-2">{title}</div>

        <div className="b-sm" style={{ color: 'var(--b-text-3)' }}>
          {course.profiles?.full_name ?? '—'}
        </div>

        <div className="flex items-center gap-2 mt-auto pt-1">
          <Stars value={course.rating} />
          <span className="b-xs" style={{ color: 'var(--b-text-4)' }}>
            ({course.students_count.toLocaleString('ru-RU')})
          </span>
        </div>

        {/* Баға */}
        <div
          className="flex items-center justify-between pt-2"
          style={{ borderTop: '1px solid var(--b-line-soft)' }}
        >
          <div>
            <div className="b-h4">{currentPrice.toLocaleString('ru-RU')} ₸</div>
            {hasDiscount && (
              <div className="b-xs line-through" style={{ color: 'var(--b-text-4)' }}>
                {course.price.toLocaleString('ru-RU')} ₸
              </div>
            )}
          </div>
          <span className="b-xs flex items-center gap-1" style={{ color: 'var(--b-text-3)' }}>
            <Icon name="clock" size={12} />
            {/* Ұзақтығын lesson жиынтығынан есептеу керек — қазірше бос */}
          </span>
        </div>
      </div>
    </Link>
  )
}
