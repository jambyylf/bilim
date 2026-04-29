-- Сабаққа YouTube сілтемесі колонкасын қосу
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS youtube_url TEXT;
