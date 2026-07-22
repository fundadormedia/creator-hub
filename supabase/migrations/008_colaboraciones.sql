-- ============================================================
-- Migration 008: Colaboraciones 2.0
--
-- La tabla `brands` sólo guarda nombre/plataforma/monto/estado/fecha.
-- Una colaboración real necesita: cobro en cuotas, piezas de contenido
-- comprometidas por formato, plazo de pago, exclusividad y notas.
--
-- `brands` se mantiene intacta (el dashboard y el chat siguen leyéndola).
-- Migrar sus filas a `collaborations` es un paso posterior y manual.
-- ============================================================

CREATE TABLE IF NOT EXISTS collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  brand_name text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',   -- pendiente | activa | completada
  currency text NOT NULL DEFAULT 'USD',

  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  is_barter boolean NOT NULL DEFAULT false,   -- canje: producto en vez de dinero

  -- Mes en que se cierra el trato (YYYY-MM). Alimenta las estadísticas
  -- de ingresos, que no siempre coinciden con la fecha de cobro.
  close_month text,

  -- Días hábiles tras el último entregable publicado hasta el cobro.
  payment_terms_days integer NOT NULL DEFAULT 30,

  has_exclusivity boolean NOT NULL DEFAULT false,
  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cuotas de cobro. Una colaboración de pago único tiene exactamente una fila.
CREATE TABLE IF NOT EXISTS collaboration_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collaboration_id uuid NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,

  sequence integer NOT NULL,                  -- 1, 2, 3…
  amount numeric(12,2) NOT NULL DEFAULT 0,
  due_date date,
  paid_at date,                               -- NULL = todavía por cobrar

  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collaboration_id, sequence)
);

-- Piezas comprometidas por formato (2 reels + 1 story = dos filas).
CREATE TABLE IF NOT EXISTS collaboration_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collaboration_id uuid NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,

  -- reel | story | post | tiktok | yt_short | yt_video | evento
  format text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  delivered_count integer NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collaboration_id, format)
);

CREATE INDEX IF NOT EXISTS idx_collaborations_user_status
  ON collaborations (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_installments_collab
  ON collaboration_installments (collaboration_id, sequence);
CREATE INDEX IF NOT EXISTS idx_deliverables_collab
  ON collaboration_deliverables (collaboration_id);

-- ---------- RLS: cada usuario sólo ve lo suyo ----------

ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "collaborations_owner" ON collaborations;
CREATE POLICY "collaborations_owner" ON collaborations
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE collaboration_installments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "installments_owner" ON collaboration_installments;
CREATE POLICY "installments_owner" ON collaboration_installments
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE collaboration_deliverables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deliverables_owner" ON collaboration_deliverables;
CREATE POLICY "deliverables_owner" ON collaboration_deliverables
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------- PRs: productos que las marcas envían sin contrato ----------

CREATE TABLE IF NOT EXISTS pr_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  brand_name text NOT NULL,
  received_date date NOT NULL DEFAULT CURRENT_DATE,
  product_description text,
  notes text,
  posted boolean NOT NULL DEFAULT false,      -- ¿publicaste algo orgánico?
  posted_url text,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pr_packages_user_date
  ON pr_packages (user_id, received_date DESC);

ALTER TABLE pr_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pr_packages_owner" ON pr_packages;
CREATE POLICY "pr_packages_owner" ON pr_packages
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------- Preferencias que alimentan las recomendaciones de tarifa ----------

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pricing_stance text DEFAULT 'mercado',  -- competitivo | mercado | premium
  ADD COLUMN IF NOT EXISTS main_currency text DEFAULT 'USD';
