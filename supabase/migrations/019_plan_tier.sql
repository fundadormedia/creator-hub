-- ============================================================
-- Migration 019: tier de suscripción (free / pro)
--
-- Interruptor que el pago voltea a 'pro'. Por defecto todos
-- entran en 'free'. Los límites de uso del manager se leen de aquí.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro'));
