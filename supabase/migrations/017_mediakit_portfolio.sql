-- ============================================================
-- Migration 017: portafolio del media kit
--
-- Videos destacados: enlaces (TikTok, IG, YT) que la marca puede ver.
-- Se guardan como JSON en el perfil y se muestran al final del media kit.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mk_portfolio jsonb DEFAULT '[]'::jsonb;

-- Forma: [{ "url": "https://tiktok.com/...", "title": "Reel viral Nike" }, ...]

-- La función pública ahora también devuelve el portafolio.
CREATE OR REPLACE FUNCTION public.get_public_mediakit(token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p profiles%ROWTYPE; stats jsonb;
BEGIN
  SELECT * INTO p FROM profiles WHERE mk_share_token = token AND mk_public = true;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT jsonb_agg(row_to_json(latest)) INTO stats FROM (
    SELECT DISTINCT ON (platform) platform, month, followers, views, engagement_rate,
      posts, likes, comments, shares, saves, impressions, reach, clicks
    FROM media_kit_stats WHERE user_id = p.user_id ORDER BY platform, month DESC
  ) latest;
  RETURN jsonb_build_object(
    'full_name', p.full_name, 'bio', p.bio, 'avatar_url', p.avatar_url,
    'categories', p.mk_categories, 'socials', p.mk_socials, 'audience', p.mk_audience,
    'portfolio', COALESCE(p.mk_portfolio, '[]'::jsonb),
    'stats', COALESCE(stats, '[]'::jsonb));
END; $$;
