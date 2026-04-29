-- Сабақтарға Mux upload ID колонкасын қосу
-- Видео Mux-та өңделіп жатқанда upload_id сақталады,
-- дайын болғанда webhook арқылы mux_asset_id мен mux_playback_id жаңартылады.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS mux_upload_id TEXT;

CREATE INDEX IF NOT EXISTS idx_lessons_mux_upload ON lessons(mux_upload_id) WHERE mux_upload_id IS NOT NULL;
