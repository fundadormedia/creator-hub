-- ============================================================
-- Migration 021: modelo de prueba de 7 días
--
-- Cada creador arranca con 7 días de acceso completo. Al vencer,
-- debe suscribirse (plan='pro') para seguir usando el manager.
-- Sin plan gratuito permanente.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  ADD COLUMN IF NOT EXISTS daily_email_enabled boolean NOT NULL DEFAULT false;

-- Los perfiles ya existentes reciben 7 días desde la migración
-- (evita que se queden bloqueados de golpe).
UPDATE profiles SET trial_ends_at = now() + interval '7 days'
  WHERE trial_ends_at < now();
