-- ============================================================
-- Migration 014: métricas granulares
--
-- media_kit_stats guardaba sólo followers/views/engagement.
-- El panel de Métricas necesita el desglose completo por red y mes.
-- ============================================================

ALTER TABLE media_kit_stats
  ADD COLUMN IF NOT EXISTS posts integer,
  ADD COLUMN IF NOT EXISTS likes bigint,
  ADD COLUMN IF NOT EXISTS comments bigint,
  ADD COLUMN IF NOT EXISTS shares bigint,
  ADD COLUMN IF NOT EXISTS saves bigint,
  ADD COLUMN IF NOT EXISTS impressions bigint,
  ADD COLUMN IF NOT EXISTS reach bigint,
  ADD COLUMN IF NOT EXISTS clicks bigint;
