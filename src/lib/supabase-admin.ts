import { createClient } from '@supabase/supabase-js'

// ============================================================
// Cliente Supabase con service-role. SOLO para el servidor
// (webhooks sin sesión de usuario). Salta RLS: nunca importar
// esto en código de cliente.
// ============================================================

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.'
    )
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
