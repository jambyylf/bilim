-- ════════════════════════════════════════════════════
-- Bilim Platform — Барлық миграция (Dashboard-та іске қосыңыз)
-- Supabase → SQL Editor → New query → Paste → Run
-- ════════════════════════════════════════════════════

-- ── 1. NOTIFICATIONS КЕСТЕСІ ──────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       text NOT NULL,
  title_kk   text NOT NULL,
  title_ru   text NOT NULL,
  body_kk    text,
  body_ru    text,
  link       text,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id) WHERE read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications'
    AND policyname = 'User sees own notifications'
  ) THEN
    CREATE POLICY "User sees own notifications"
      ON notifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications'
    AND policyname = 'System can insert notifications'
  ) THEN
    CREATE POLICY "System can insert notifications"
      ON notifications FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications'
    AND policyname = 'User marks own as read'
  ) THEN
    CREATE POLICY "User marks own as read"
      ON notifications FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ── 2. FULL-TEXT SEARCH (FTS) ──────────────────────
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce(title_ru,  '')), 'A') ||
    setweight(to_tsvector('simple',  coalesce(title_kk,  '')), 'A') ||
    setweight(to_tsvector('english', coalesce(title_en,  '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(description_ru, '')), 'B') ||
    setweight(to_tsvector('simple',  coalesce(description_kk, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_courses_search_vector
  ON courses USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_courses_status_students
  ON courses(status, students_count DESC);

CREATE INDEX IF NOT EXISTS idx_courses_category
  ON courses(category_id);

-- ── 3. SEARCH RPC ФУНКЦИЯСЫ ───────────────────────
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
  IF search_query != '' THEN
    tsq := websearch_to_tsquery('russian', search_query);
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT c.*,
           cat.slug      AS cat_slug,
           cat.name_kk   AS cat_name_kk,
           cat.name_ru   AS cat_name_ru,
           cat.name_en   AS cat_name_en,
           p.full_name   AS instr_name,
           CASE
             WHEN search_query = '' THEN 0
             ELSE ts_rank(c.search_vector, tsq)
           END AS rank
    FROM courses c
    LEFT JOIN categories cat ON cat.id = c.category_id
    LEFT JOIN profiles   p   ON p.id   = c.instructor_id
    WHERE c.status = 'published'
      AND (cat_slug     = '' OR cat.slug   = cat_slug)
      AND (course_level = '' OR c.level    = course_level)
      AND (course_lang  = '' OR c.language = course_lang)
      AND (
        search_query = ''
        OR (tsq IS NOT NULL AND c.search_vector @@ tsq)
        OR c.title_ru ILIKE '%' || search_query || '%'
        OR c.title_kk ILIKE '%' || search_query || '%'
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

GRANT EXECUTE ON FUNCTION search_courses TO anon, authenticated;

-- ── 4. CERTIFICATES КЕСТЕСІ (егер жоқ болса) ──────
CREATE TABLE IF NOT EXISTS certificates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  cert_number text NOT NULL UNIQUE,
  issued_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'certificates'
    AND policyname = 'Student sees own certs'
  ) THEN
    CREATE POLICY "Student sees own certs"
      ON certificates FOR SELECT
      USING (auth.uid() = student_id);
  END IF;
END $$;

-- ── АЯҚТАЛДЫ ──────────────────────────────────────
SELECT 'Migration completed successfully!' AS result;
