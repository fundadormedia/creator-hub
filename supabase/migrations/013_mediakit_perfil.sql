-- ============================================================
-- Migration 013: perfil del creador para el media kit
--
-- `profiles` ya tiene full_name, bio y avatar_url. Faltan las
-- categorías (varias) y los handles con seguidores por red.
-- ============================================================

ALTER TABLE profiles
  -- ["lifestyle","beauty","fashion"]
  ADD COLUMN IF NOT EXISTS mk_categories jsonb DEFAULT '[]'::jsonb,
  -- {"instagram":{"handle":"@sofilopez","followers":"80K"}, "tiktok":{...}, "youtube":{...}}
  ADD COLUMN IF NOT EXISTS mk_socials jsonb DEFAULT '{}'::jsonb;
