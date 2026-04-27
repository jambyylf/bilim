-- ══════════════════════════════════════════════════════════════════
-- Bilim Platform — Негізгі дерекқор схемасы
-- Бұл файлды Supabase Dashboard → SQL Editor-да іске қосыңыз
-- ══════════════════════════════════════════════════════════════════

-- ── Enum типтерін жасау ──────────────────────────────────────────
CREATE TYPE user_role    AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE lang_code    AS ENUM ('kk', 'ru', 'en');
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE course_status AS ENUM ('draft', 'pending', 'published', 'rejected');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'refunded');
CREATE TYPE payment_method AS ENUM ('kaspi', 'forte', 'stripe', 'card');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE currency_code AS ENUM ('KZT', 'USD');

-- ══════════════════════════════════════════════════════════════════
-- 1. ПРОФИЛЬДЕР (auth.users кеңейтімі)
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  role        user_role   NOT NULL DEFAULT 'student',
  phone       TEXT,
  lang_pref   lang_code   NOT NULL DEFAULT 'ru',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Жаңа пайдаланушы тіркелгенде автоматты профиль жасайды
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════════════════════
-- 2. КАТЕГОРИЯЛАР
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE,
  name_kk     TEXT        NOT NULL,
  name_ru     TEXT        NOT NULL,
  name_en     TEXT        NOT NULL,
  icon        TEXT,
  parent_id   UUID        REFERENCES categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Бастапқы категориялар
INSERT INTO categories (slug, name_kk, name_ru, name_en, icon) VALUES
  ('design',        'Дизайн',        'Дизайн',          'Design',       'palette'),
  ('programming',   'Программалау',  'Программирование', 'Programming',  'code'),
  ('marketing',     'Маркетинг',     'Маркетинг',        'Marketing',    'target'),
  ('business',      'Бизнес',        'Бизнес',           'Business',     'briefcase'),
  ('finance',       'Қаржы',         'Финансы',          'Finance',      'dollar'),
  ('languages',     'Тілдер',        'Языки',            'Languages',    'language'),
  ('data',          'Дата',          'Дата',             'Data',         'chart'),
  ('soft-skills',   'Soft skills',   'Soft skills',      'Soft skills',  'sparkle');

-- ══════════════════════════════════════════════════════════════════
-- 3. КУРСТАР
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE courses (
  id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT         NOT NULL UNIQUE,
  instructor_id           UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id             UUID         REFERENCES categories(id) ON DELETE SET NULL,
  title_kk                TEXT         NOT NULL,
  title_ru                TEXT         NOT NULL,
  title_en                TEXT         NOT NULL DEFAULT '',
  description_kk          TEXT,
  description_ru          TEXT,
  description_en          TEXT,
  price                   NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_price          NUMERIC(10,2),
  language                lang_code    NOT NULL DEFAULT 'ru',
  level                   course_level NOT NULL DEFAULT 'beginner',
  status                  course_status NOT NULL DEFAULT 'draft',
  thumbnail_url           TEXT,
  trailer_mux_id          TEXT,
  trailer_mux_playback_id TEXT,
  rating                  NUMERIC(3,2) NOT NULL DEFAULT 0,
  students_count          INTEGER      NOT NULL DEFAULT 0,
  what_you_learn          TEXT[],
  requirements            TEXT[],
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  published_at            TIMESTAMPTZ
);

-- ══════════════════════════════════════════════════════════════════
-- 4. БӨЛІМДЕР (модульдер)
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE sections (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_kk   TEXT        NOT NULL,
  title_ru   TEXT        NOT NULL,
  title_en   TEXT        NOT NULL DEFAULT '',
  order_idx  INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- 5. САБАҚТАР (видео)
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE lessons (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id       UUID        NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  course_id        UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_kk         TEXT        NOT NULL,
  title_ru         TEXT        NOT NULL,
  title_en         TEXT        NOT NULL DEFAULT '',
  mux_asset_id     TEXT,
  mux_playback_id  TEXT,
  duration_sec     INTEGER     NOT NULL DEFAULT 0,
  order_idx        INTEGER     NOT NULL DEFAULT 0,
  is_preview       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- 6. ЖАЗЫЛЫМДАР (сатып алулар)
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE enrollments (
  id           UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id    UUID              NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  order_id     UUID,
  status       enrollment_status NOT NULL DEFAULT 'active',
  progress_pct NUMERIC(5,2)      NOT NULL DEFAULT 0,
  enrolled_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

-- ══════════════════════════════════════════════════════════════════
-- 7. САБАҚ ПРОГРЕСІ
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE lesson_progress (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrollment_id UUID        NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id     UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed     BOOLEAN     NOT NULL DEFAULT FALSE,
  last_position INTEGER     NOT NULL DEFAULT 0,
  watch_time    INTEGER     NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- ══════════════════════════════════════════════════════════════════
-- 8. ТАПСЫРЫСТАР (төлем)
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE orders (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount   NUMERIC(10,2)  NOT NULL,
  net_amount     NUMERIC(10,2)  NOT NULL,
  payment_method payment_method,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_ref    TEXT,
  currency       currency_code  NOT NULL DEFAULT 'KZT',
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- 9. ТАПСЫРЫС ЭЛЕМЕНТТЕРІ + КОМИССИЯ
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE order_items (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  course_id       UUID          NOT NULL REFERENCES courses(id),
  instructor_id   UUID          NOT NULL REFERENCES profiles(id),
  price           NUMERIC(10,2) NOT NULL,
  platform_fee    NUMERIC(10,2) NOT NULL, -- 20%
  instructor_earn NUMERIC(10,2) NOT NULL  -- 80%
);

-- ══════════════════════════════════════════════════════════════════
-- 10. ПІКІРЛЕР / РЕЙТИНГ
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE reviews (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_verified BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, student_id)
);

-- Курс рейтингін автоматты жаңарту триггері
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses
  SET rating = (
    SELECT ROUND(AVG(rating)::NUMERIC, 2)
    FROM reviews
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
  )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_course_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_course_rating();

-- ══════════════════════════════════════════════════════════════════
-- 11. СЕРТИФИКАТТАР
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE certificates (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  cert_number TEXT        NOT NULL UNIQUE DEFAULT 'BILIM-' || UPPER(SUBSTR(gen_random_uuid()::TEXT, 1, 8)),
  issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- ══════════════════════════════════════════════════════════════════
-- ИНДЕКСТЕР (іздеу жылдамдығы үшін)
-- ══════════════════════════════════════════════════════════════════
CREATE INDEX idx_courses_status        ON courses(status);
CREATE INDEX idx_courses_instructor    ON courses(instructor_id);
CREATE INDEX idx_courses_category      ON courses(category_id);
CREATE INDEX idx_courses_slug          ON courses(slug);
CREATE INDEX idx_enrollments_student   ON enrollments(student_id);
CREATE INDEX idx_enrollments_course    ON enrollments(course_id);
CREATE INDEX idx_lessons_course        ON lessons(course_id);
CREATE INDEX idx_lessons_section       ON lessons(section_id);
CREATE INDEX idx_reviews_course        ON reviews(course_id);
CREATE INDEX idx_orders_student        ON orders(student_id);

-- ══════════════════════════════════════════════════════════════════
-- RLS (Row Level Security) — Қатар деңгейіндегі қауіпсіздік
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates    ENABLE ROW LEVEL SECURITY;

-- ── Профильдер саясаты ──
CREATE POLICY "Профилін өзі ғана оқи алады"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Профилін өзі ғана өзгерте алады"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Жалпы профиль оқуы (avatar, name)"
  ON profiles FOR SELECT USING (TRUE);

-- ── Категориялар (жалпыға ашық) ──
CREATE POLICY "Категорияларды барлығы оқи алады"
  ON categories FOR ALL USING (TRUE);

-- ── Курстар саясаты ──
CREATE POLICY "Жарияланған курстарды барлығы көреді"
  ON courses FOR SELECT USING (status = 'published');
CREATE POLICY "Нұсқаушы өз курсын барлық күйде көреді"
  ON courses FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "Нұсқаушы курс жасайды"
  ON courses FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Нұсқаушы өз курсын өзгертеді"
  ON courses FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "Admin барлық курсты көреді"
  ON courses FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Сабақтар (жазылған студент немесе нұсқаушы көре алады) ──
CREATE POLICY "Тегін сабақтарды барлығы көреді"
  ON lessons FOR SELECT USING (is_preview = TRUE);
CREATE POLICY "Жазылған студент барлық сабақты көреді"
  ON lessons FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE student_id = auth.uid() AND course_id = lessons.course_id AND status = 'active'
    )
  );
CREATE POLICY "Нұсқаушы өз сабақтарын көреді"
  ON lessons FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE id = lessons.course_id AND instructor_id = auth.uid())
  );
CREATE POLICY "Нұсқаушы сабақ жасайды/өзгертеді"
  ON lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM courses WHERE id = lessons.course_id AND instructor_id = auth.uid())
  );

-- ── Жазылымдар ──
CREATE POLICY "Студент өз жазылымдарын көреді"
  ON enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Студент жазылым жасайды"
  ON enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- ── Прогресс ──
CREATE POLICY "Студент өз прогресін басқарады"
  ON lesson_progress FOR ALL USING (auth.uid() = student_id);

-- ── Тапсырыстар ──
CREATE POLICY "Студент өз тапсырыстарын көреді"
  ON orders FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Студент тапсырыс жасайды"
  ON orders FOR INSERT WITH CHECK (auth.uid() = student_id);

-- ── Пікірлер ──
CREATE POLICY "Пікірлерді барлығы оқи алады"
  ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Тек жазылған студент пікір жаза алады"
  ON reviews FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE student_id = auth.uid() AND course_id = reviews.course_id
    )
  );

-- ── Сертификаттар ──
CREATE POLICY "Студент өз сертификатын көреді"
  ON certificates FOR SELECT USING (auth.uid() = student_id);
