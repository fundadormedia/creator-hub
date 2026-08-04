-- ============================================================
-- Migration 016: demografía de audiencia en el media kit
--
-- Lo que más miran las marcas: género, países y edades.
-- Se guarda como un solo JSON en el perfil.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mk_audience jsonb;

-- Ejemplo de forma:
-- {
--   "engagement_rate": 6.54,
--   "gender": { "male": 62.5, "female": 37.5 },
--   "countries": [{ "name": "United States", "flag": "🇺🇸", "pct": 22.5 }, ...],
--   "ages": [{ "range": "25-34", "male": 28.5, "female": 15.7 }, ...]
-- }
