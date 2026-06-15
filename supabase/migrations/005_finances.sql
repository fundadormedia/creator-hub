-- ============================================================
-- Migration 005: Módulo de Finanzas — Gastos + Presupuestos
-- ============================================================

-- 1. Tabla de gastos
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  month text NOT NULL,
  year smallint NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Tabla de presupuestos (límite mensual por categoría, uno por usuario/categoría)
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  monthly_limit integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

-- 3. Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expenses_owner" ON expenses;
DROP POLICY IF EXISTS "budgets_owner"  ON budgets;

CREATE POLICY "expenses_owner" ON expenses USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "budgets_owner"  ON budgets  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4. Auto-set user_id en INSERT (reutiliza la función set_user_id de la migración 002)
DROP TRIGGER IF EXISTS set_user_id_expenses ON expenses;
DROP TRIGGER IF EXISTS set_user_id_budgets  ON budgets;

CREATE TRIGGER set_user_id_expenses
  BEFORE INSERT ON expenses
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_budgets
  BEFORE INSERT ON budgets
  FOR EACH ROW EXECUTE FUNCTION set_user_id();
