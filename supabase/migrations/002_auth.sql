-- ============================================================
-- Migration 002: Add user_id + RLS to all tables
-- ============================================================

-- 1. Add user_id column to all tables
ALTER TABLE content    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ideas      ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE income     ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE brands     ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Enable Row Level Security
ALTER TABLE content    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE income     ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands     ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "content_owner"    ON content;
DROP POLICY IF EXISTS "ideas_owner"      ON ideas;
DROP POLICY IF EXISTS "income_owner"     ON income;
DROP POLICY IF EXISTS "brands_owner"     ON brands;
DROP POLICY IF EXISTS "affiliates_owner" ON affiliates;

-- 4. Create RLS policies — users only see/modify their own rows
CREATE POLICY "content_owner"    ON content    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "ideas_owner"      ON ideas      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "income_owner"     ON income     USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "brands_owner"     ON brands     USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "affiliates_owner" ON affiliates USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 5. Auto-set user_id on INSERT via trigger function
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS set_user_id_content    ON content;
DROP TRIGGER IF EXISTS set_user_id_ideas      ON ideas;
DROP TRIGGER IF EXISTS set_user_id_income     ON income;
DROP TRIGGER IF EXISTS set_user_id_brands     ON brands;
DROP TRIGGER IF EXISTS set_user_id_affiliates ON affiliates;

-- Create triggers
CREATE TRIGGER set_user_id_content
  BEFORE INSERT ON content
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_ideas
  BEFORE INSERT ON ideas
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_income
  BEFORE INSERT ON income
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_brands
  BEFORE INSERT ON brands
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_affiliates
  BEFORE INSERT ON affiliates
  FOR EACH ROW EXECUTE FUNCTION set_user_id();
