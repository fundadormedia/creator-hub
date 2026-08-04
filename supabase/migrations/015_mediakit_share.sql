-- ============================================================
-- Migration 015: link público del media kit
--
-- Cada perfil recibe un token aleatorio. La página pública lo lee por
-- token (no por user_id), así el link no se puede adivinar.
--
-- Para exponer los datos SIN abrir RLS a anónimos, se usa una función
-- SECURITY DEFINER que devuelve SÓLO los campos públicos. El visitante
-- llama a la función; nunca toca las tablas directamente.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mk_share_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS mk_public boolean NOT NULL DEFAULT false;

-- Token para las filas que aún no lo tienen, limpio para URL.
UPDATE profiles
SET mk_share_token = replace(replace(replace(encode(gen_random_bytes(9), 'base64'), '/', ''), '+', ''), '=', '')
WHERE mk_share_token IS NULL;

-- ---------- Función pública: media kit por token ----------

CREATE OR REPLACE FUNCTION public.get_public_mediakit(token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p profiles%ROWTYPE;
  stats jsonb;
BEGIN
  SELECT * INTO p FROM profiles WHERE mk_share_token = token AND mk_public = true;
  IF NOT FOUND THEN
    RETURN NULL;   -- token inválido o kit no publicado
  END IF;

  -- Métricas del mes más reciente que tenga cada red.
  SELECT jsonb_agg(row_to_json(latest))
  INTO stats
  FROM (
    SELECT DISTINCT ON (platform)
      platform, month, followers, views, engagement_rate,
      posts, likes, comments, shares, saves, impressions, reach, clicks
    FROM media_kit_stats
    WHERE user_id = p.user_id
    ORDER BY platform, month DESC
  ) latest;

  RETURN jsonb_build_object(
    'full_name', p.full_name,
    'bio', p.bio,
    'avatar_url', p.avatar_url,
    'categories', p.mk_categories,
    'socials', p.mk_socials,
    'stats', COALESCE(stats, '[]'::jsonb)
  );
END;
$$;

-- El visitante anónimo sólo puede ejecutar la función, nada más.
GRANT EXECUTE ON FUNCTION public.get_public_mediakit(text) TO anon;
