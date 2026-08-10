-- ============================================================
-- Migration 023: estado tipo kanban en cada tarea
--
-- Por hacer → En progreso → Hecho. Reemplaza el simple done/no-done
-- por 3 estados. Se mantiene `done` sincronizado (done = 'hecho')
-- para no romper el resto del código.
-- ============================================================

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'por_hacer'
    CHECK (status IN ('por_hacer', 'en_progreso', 'hecho'));

-- Backfill: las que ya estaban marcadas como hechas → 'hecho'.
UPDATE tasks SET status = CASE WHEN done THEN 'hecho' ELSE 'por_hacer' END;
