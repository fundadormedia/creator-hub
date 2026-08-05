-- ============================================================
-- Migration 022: crear el perfil automáticamente al registrarse
--
-- Antes el perfil solo se creaba cuando el usuario guardaba algo.
-- Un usuario recién registrado no tenía fila en profiles → el
-- sistema lo leía como "sin trial = vencido" y lo bloqueaba.
--
-- Ahora: cada nuevo usuario recibe su fila de perfil (con 7 días
-- de prueba vía los defaults de la columna) en el momento del signup.
-- ============================================================

-- 1) No pisar user_id cuando el INSERT viene de un contexto sin sesión
--    (el trigger de signup corre sin auth.uid()).
CREATE OR REPLACE FUNCTION set_profile_user_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  NEW.user_id := COALESCE(auth.uid(), NEW.user_id);
  RETURN NEW;
END;
$$;

-- 2) Crear el perfil al insertarse el usuario en auth.users.
--    trial_ends_at, plan y daily_email_enabled toman sus DEFAULTS.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) Backfill: crear perfil (con 7 días de prueba) para usuarios
--    ya existentes que no tengan uno.
INSERT INTO public.profiles (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;
