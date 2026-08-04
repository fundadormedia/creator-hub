-- ============================================================
-- Migration 020: billing con Stripe
--
-- Guarda el customer y la suscripción de Stripe en el perfil para
-- mapear los eventos del webhook de vuelta al usuario correcto.
-- El paso de plan 'free' <-> 'pro' lo hace el webhook (migración 019).
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- El webhook busca el perfil por customer_id (llega sin sesión de usuario).
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles (stripe_customer_id);
