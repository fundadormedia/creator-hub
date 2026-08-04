-- ============================================================
-- Migration 018: contacto del media kit
--
-- Email y WhatsApp para que la marca contacte con un clic.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mk_contact_email text,
  ADD COLUMN IF NOT EXISTS mk_whatsapp text;   -- solo dígitos, con código de país

-- La función pública ahora devuelve también el contacto.
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
    'contact_email', p.mk_contact_email, 'whatsapp', p.mk_whatsapp,
    'stats', COALESCE(stats, '[]'::jsonb));
END; $$;
