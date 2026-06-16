-- ============================================================
-- Migration 006: Stanley LatAm — "Voz ancla" del creador
-- Memoria persistente: 1 perfil de voz por usuario.
-- Es el activo central del módulo Stanley (los 4 sombreros leen de aquí).
-- ============================================================

CREATE TABLE IF NOT EXISTS creator_voice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Input crudo que el creador pegó (para re-extraer si mejora el prompt)
  raw_posts   text NOT NULL,        -- 5-10 posts pegados, separados por ---
  niche       text,                 -- nicho declarado por el creador
  objective   text,                 -- objetivo declarado (crecer / vender X)

  -- Output estructurado de la extracción (lo que consumen los 4 sombreros)
  voice_profile jsonb NOT NULL,     -- ver schema en /api/stanley (acción extraer-voz)

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- 1 voz activa por creador → upsert por user_id
  CONSTRAINT creator_voice_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_voice_user
  ON creator_voice (user_id);

-- Row Level Security: cada creador solo ve/edita su propia voz
ALTER TABLE creator_voice ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "creator_voice_owner" ON creator_voice;
CREATE POLICY "creator_voice_owner" ON creator_voice
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- updated_at automático
CREATE OR REPLACE FUNCTION set_creator_voice_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_creator_voice_updated_at ON creator_voice;
CREATE TRIGGER trg_creator_voice_updated_at
  BEFORE UPDATE ON creator_voice
  FOR EACH ROW EXECUTE FUNCTION set_creator_voice_updated_at();
