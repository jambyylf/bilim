-- Студенттер санын ұлғайту функциясы (atomic)
CREATE OR REPLACE FUNCTION increment_students_count(course_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE courses
  SET students_count = COALESCE(students_count, 0) + 1
  WHERE id = course_id;
END;
$$;

-- Index for fast certificate lookup
CREATE INDEX IF NOT EXISTS idx_certificates_cert_number ON certificates(cert_number);
CREATE INDEX IF NOT EXISTS idx_certificates_student     ON certificates(student_id);

-- RLS policy for public certificate verification by cert_number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'certificates' AND policyname = 'Public cert verification'
  ) THEN
    CREATE POLICY "Public cert verification"
      ON certificates FOR SELECT
      USING (true);
  END IF;
END $$;
