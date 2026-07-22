-- ============================================================
-- Migration 010: Tareas
--
-- El kanban existente es un tablero sobre `content` (piezas de contenido),
-- no una lista de pendientes. Las tareas llevan tabla propia.
--
-- `source` distingue las que escribe el creador a mano de las que en el
-- futuro se generen solas desde una colaboración (entregas, cobros).
-- ============================================================

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title text NOT NULL,
  -- grabar | publicar | revisar | evento | cobro | otro
  type text NOT NULL DEFAULT 'otro',
  due_date date,
  notes text,
  done boolean NOT NULL DEFAULT false,

  source text NOT NULL DEFAULT 'manual',   -- manual | auto
  collaboration_id uuid REFERENCES collaborations(id) ON DELETE CASCADE,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_date
  ON tasks (user_id, done, due_date);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_owner" ON tasks;
CREATE POLICY "tasks_owner" ON tasks
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS set_user_id_tasks ON tasks;
CREATE TRIGGER set_user_id_tasks
  BEFORE INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_user_id();
