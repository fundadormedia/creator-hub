-- ============================================================
-- Migration 009: triggers set_user_id para las tablas de la 008
--
-- El resto del proyecto no manda user_id desde el cliente: lo rellena
-- un trigger BEFORE INSERT (función set_user_id de la migración 002).
-- Sin esto, todo insert a las tablas nuevas falla por el NOT NULL.
-- ============================================================

DROP TRIGGER IF EXISTS set_user_id_collaborations  ON collaborations;
DROP TRIGGER IF EXISTS set_user_id_installments    ON collaboration_installments;
DROP TRIGGER IF EXISTS set_user_id_deliverables    ON collaboration_deliverables;
DROP TRIGGER IF EXISTS set_user_id_pr_packages     ON pr_packages;

CREATE TRIGGER set_user_id_collaborations
  BEFORE INSERT ON collaborations
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_installments
  BEFORE INSERT ON collaboration_installments
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_deliverables
  BEFORE INSERT ON collaboration_deliverables
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_pr_packages
  BEFORE INSERT ON pr_packages
  FOR EACH ROW EXECUTE FUNCTION set_user_id();
