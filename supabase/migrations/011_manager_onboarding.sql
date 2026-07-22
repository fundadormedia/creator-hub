-- ============================================================
-- Migration 011: onboarding del manager
--
-- Antes de abrir el chat libre, el manager entrevista al creador
-- (7 preguntas). Las respuestas quedan guardadas y se inyectan como
-- contexto en cada conversación, así no hay que repetirlas nunca.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS manager_profile jsonb,
  ADD COLUMN IF NOT EXISTS manager_onboarded boolean NOT NULL DEFAULT false;
