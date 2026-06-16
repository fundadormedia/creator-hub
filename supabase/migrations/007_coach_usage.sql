-- ============================================================
-- Migration 007: Rate limiting para Content Coach (módulo Stanley)
-- Registra cada generación por usuario y acción para topar el uso diario
-- y proteger los créditos de Anthropic mientras el acceso es gratuito.
-- ============================================================

CREATE TABLE IF NOT EXISTS coach_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,           -- 'extraer-voz' | 'escribir-post' | ...
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coach_usage_user_action_date
  ON coach_usage (user_id, action, created_at);

ALTER TABLE coach_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach_usage_owner" ON coach_usage;
CREATE POLICY "coach_usage_owner" ON coach_usage
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
