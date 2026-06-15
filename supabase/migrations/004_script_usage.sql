-- ============================================================
-- Migration 004: Rate limiting para generador de Script UGC
-- ============================================================

-- Tabla que registra cada generación de script por usuario
CREATE TABLE IF NOT EXISTS script_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para contar rápido por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_script_usage_user_date
  ON script_usage (user_id, created_at);

-- Row Level Security: cada usuario solo ve/inserta sus propias filas
ALTER TABLE script_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "script_usage_owner" ON script_usage;
CREATE POLICY "script_usage_owner" ON script_usage
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
