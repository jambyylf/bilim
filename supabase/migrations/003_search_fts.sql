-- ════════════════════════════════════════════════
-- Full-Text Search (FTS) — курстарды іздеу
-- Supabase Dashboard → SQL Editor-де іске қосыңыз
-- ════════════════════════════════════════════════

-- 1. Курстарға search_vector генерацияланған баған қосу
ALTER TABLE courses ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce(title_ru,  '')), 'A') ||
    setweight(to_tsvector('simple',  coalesce(title_kk,  '')), 'A') ||
    setweight(to_tsvector('english', coalesce(title_en,  '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(description_ru, '')), 'B') ||
    setweight(to_tsvector('simple',  coalesce(description_kk, '')), 'B')
  ) STORED;

-- 2. GIN индексі (жылдам FTS іздеу)
CREATE INDEX IF NOT EXISTS idx_courses_search_vector ON courses USING GIN(search_vector);

-- 3. Тексеру индексі
CREATE INDEX IF NOT EXISTS idx_courses_status_students ON courses(status, students_count DESC);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);

-- 4. search_courses RPC функциясы
CREATE OR REPLACE FUNCTION search_courses(
  search_query  text    DEFAULT '',
  cat_slug      text    DEFAULT '',
  course_level  text    DEFAULT '',
  course_lang   text    DEFAULT '',
  p_from        int     DEFAULT 0,
  p_to          int     DEFAULT 11
)
RETURNS TABLE (
  id              uuid,
  slug            text,
  title_kk        text,
  title_ru        text,
  title_en        text,
  price           int,
  discount_price  int,
  language        text,
  level           text,
  status          text,
  rating          float,
  students_count  int,
  thumbnail_url   text,
  category_slug   text,
  category_name_kk text,
  category_name_ru text,
  category_name_en text,
  instructor_name text,
  total_count     bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tsq tsquery;
BEGIN
  -- websearch_to_tsquery — қауіпсіз, кез келген енгізуді өңдейді
  IF search_query != '' THEN
    tsq := websearch_to_tsquery('russian', search_query);
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT c.*,
           cat.slug         AS cat_slug,
           cat.name_kk      AS cat_name_kk,
           cat.name_ru      AS cat_name_ru,
           cat.name_en      AS cat_name_en,
           p.full_name      AS instr_name,
           CASE
             WHEN search_query = '' THEN 0
             ELSE ts_rank(c.search_vector, tsq)
           END AS rank
    FROM courses c
    LEFT JOIN categories cat ON cat.id = c.category_id
    LEFT JOIN profiles p     ON p.id  = c.instructor_id
    WHERE c.status = 'published'
      AND (cat_slug      = '' OR cat.slug    = cat_slug)
      AND (course_level  = '' OR c.level     = course_level)
      AND (course_lang   = '' OR c.language  = course_lang)
      AND (
        search_query = ''
        OR (tsq IS NOT NULL AND c.search_vector @@ tsq)
        OR c.title_ru  ILIKE '%' || search_query || '%'
        OR c.title_kk  ILIKE '%' || search_query || '%'
      )
  )
  SELECT
    f.id, f.slug, f.title_kk, f.title_ru, f.title_en,
    f.price, f.discount_price, f.language, f.level, f.status,
    f.rating, f.students_count, f.thumbnail_url,
    f.cat_slug, f.cat_name_kk, f.cat_name_ru, f.cat_name_en,
    f.instr_name,
    COUNT(*) OVER () AS total_count
  FROM filtered f
  ORDER BY
    CASE WHEN search_query != '' THEN f.rank ELSE 0 END DESC,
    f.students_count DESC
  LIMIT (p_to - p_from + 1)
  OFFSET p_from;
END;
$$;

-- RPC-ге public қол жеткізу
GRANT EXECUTE ON FUNCTION search_courses TO anon, authenticated;
