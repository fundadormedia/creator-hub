-- ============================================================
-- Migration 012: métricas mensuales del media kit
--
-- El creador sube capturas de Insights/Analytics, la IA extrae los
-- números y aquí quedan guardados mes a mes por red.
-- ============================================================

CREATE TABLE IF NOT EXISTS media_kit_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  month text NOT NULL,                 -- 'YYYY-MM'
  platform text NOT NULL,              -- instagram | tiktok | youtube

  followers bigint,
  views bigint,
  engagement_rate numeric(5,2),        -- porcentaje, ej 4.75

  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month, platform)
);

CREATE INDEX IF NOT EXISTS idx_media_kit_stats_user_month
  ON media_kit_stats (user_id, month);

ALTER TABLE media_kit_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_kit_stats_owner" ON media_kit_stats;
CREATE POLICY "media_kit_stats_owner" ON media_kit_stats
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS set_user_id_media_kit_stats ON media_kit_stats;
CREATE TRIGGER set_user_id_media_kit_stats
  BEFORE INSERT ON media_kit_stats
  FOR EACH ROW EXECUTE FUNCTION set_user_id();
