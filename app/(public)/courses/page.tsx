import { createClient } from '@/lib/supabase/server'
import CatalogContent from '@/components/catalog/CatalogContent'

export const metadata = { title: 'Курстар каталогы' }

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; level?: string; lang?: string; q?: string; page?: string }
}) {
  const supabase = await createClient()

  const category = searchParams.category ?? ''
  const level    = searchParams.level ?? ''
  const lang     = searchParams.lang ?? ''
  const q        = searchParams.q ?? ''
  const page     = Math.max(1, Number(searchParams.page ?? 1))
  const pageSize = 12
  const from     = (page - 1) * pageSize
  const to       = from + pageSize - 1

  // search_courses RPC — SECURITY DEFINER, RLS айналып өтеді
  const { data: rawCourses } = await supabase.rpc('search_courses', {
    search_query: q,
    cat_slug:     category,
    course_level: level,
    course_lang:  lang,
    p_from:       from,
    p_to:         to,
  })

  const courses = (rawCourses ?? []).map((c: any) => ({
    id:             c.id,
    slug:           c.slug,
    title_kk:       c.title_kk,
    title_ru:       c.title_ru,
    title_en:       c.title_en,
    price:          c.price,
    discount_price: c.discount_price,
    language:       c.language,
    level:          c.level,
    status:         c.status,
    rating:         c.rating,
    students_count: c.students_count,
    thumbnail_url:  c.thumbnail_url,
    category: c.category_slug ? {
      slug:     c.category_slug,
      name_kk:  c.category_name_kk,
      name_ru:  c.category_name_ru,
      name_en:  c.category_name_en,
    } : null,
    instructor: {
      full_name:  c.instructor_name ?? null,
      avatar_url: null,
    },
  }))

  const total = (rawCourses as any)?.[0]?.total_count ?? 0

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_kk, name_ru, name_en, icon')
    .order('name_ru')

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <CatalogContent
      courses={courses}
      categories={(categories as any) ?? []}
      total={Number(total)}
      page={page}
      pageSize={pageSize}
      filters={{ category, level, lang, q }}
      userId={user?.id ?? null}
    />
  )
}
