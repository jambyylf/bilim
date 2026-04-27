import { createClient } from '@/lib/supabase/server'
import NewCourseForm from '@/components/instructor/NewCourseForm'

export const metadata = { title: 'Жаңа курс' }

export default async function NewCoursePage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_kk, name_ru, name_en')
    .order('name_ru')

  return <NewCourseForm categories={categories ?? []} />
}
