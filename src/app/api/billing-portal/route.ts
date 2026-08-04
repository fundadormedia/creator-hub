import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route'
import { getStripe, appUrl } from '@/lib/stripe'

// ============================================================
// Abre el portal de facturación de Stripe para que el usuario
// gestione o cancele su suscripción.
// ============================================================

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe no está configurado.' }, { status: 500 })
  }

  try {
    const supabase = await createRouteClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .maybeSingle()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No tienes una suscripción activa.' }, { status: 400 })
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl()}/planes`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error en /api/billing-portal:', error)
    return NextResponse.json({ error: 'No se pudo abrir el portal.' }, { status: 500 })
  }
}
