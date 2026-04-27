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

  let query = supabase
    .from('courses')
    .select(`
      id, slug, title_kk, title_ru, title_en,
      price, discount_price, language, level, status,
      rating, students_count, thumbnail_url,
      category:categories(slug, name_kk, name_ru, name_en),
      instructor:profiles!courses_instructor_id_fkey(full_name, avatar_url)
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('students_count', { ascending: false })
    .range(from, to)

  if (level) query = query.eq('level', level as any) as typeof query
  if (lang)  query = query.eq('language', lang as any) as typeof query

  if (q) {
    // Сөздерге бөліп, әрқайсысы бойынша іздеу (multi-token AND)
    const tokens = q.trim().split(/\s+/).filter(t => t.length >= 2)
    if (tokens.length > 1) {
      for (const tok of tokens) {
        query = query.or(
          `title_kk.ilike.%${tok}%,title_ru.ilike.%${tok}%,title_en.ilike.%${tok}%`
        ) as typeof query
      }
    } else {
      // Тақырып + сипаттама бойынша іздеу
      query = query.or(
        `title_kk.ilike.%${q}%,title_ru.ilike.%${q}%,title_en.ilike.%${q}%,description_kk.ilike.%${q}%,description_ru.ilike.%${q}%`
      ) as typeof query
    }
  }

  const { data: rawCourses, count } = await query
  const courses = rawCourses as any[]

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_kk, name_ru, name_en, icon')
    .order('name_ru')

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <CatalogContent
      courses={courses ?? []}
      categories={(categories as any) ?? []}
      total={count ?? 0}
      page={page}
      pageSize={pageSize}
      filters={{ category, level, lang, q }}
      userId={user?.id ?? null}
    />
  )
}
