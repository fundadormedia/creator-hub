-- ============================================================
-- Migration 024: categoría (editable) + estado kanban en Ideas
--
-- Como la base de Notion de Andre: cada idea tiene una categoría
-- libre (Business, Marca Personal, etc. o la que él escriba) y un
-- estado Idea → En progreso → Hecho.
-- ============================================================

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'idea'
    CHECK (status IN ('idea', 'en_progreso', 'hecho'));
