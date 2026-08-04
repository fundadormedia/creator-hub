import { NextResponse, type NextRequest } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route'
import { getStripe, priceIdFor, appUrl, type BillingCycle } from '@/lib/stripe'

// ============================================================
// Crea una sesión de Stripe Checkout para suscribirse a Pro.
// Reutiliza el customer de Stripe si el perfil ya tiene uno.
// ============================================================

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe no está configurado.' }, { status: 500 })
  }

  try {
    const { cycle } = (await request.json()) as { cycle?: BillingCycle }
    if (cycle !== 'monthly' && cycle !== 'annual') {
      return NextResponse.json({ error: 'Ciclo inválido (monthly | annual).' }, { status: 400 })
    }

    const priceId = priceIdFor(cycle)
    if (!priceId) {
      return NextResponse.json({ error: 'Falta el price ID de este plan.' }, { status: 500 })
    }

    const supabase = await createRouteClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
    }

    // ¿Ya tiene customer de Stripe? Lo reutilizamos.
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan')
      .maybeSingle()

    if (profile?.plan === 'pro') {
      return NextResponse.json({ error: 'Ya tienes el plan Pro.' }, { status: 400 })
    }

    const stripe = getStripe()
    let customerId = profile?.stripe_customer_id ?? undefined
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('user_id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      // El webhook mapea por customer, pero guardamos el user_id por seguridad.
      subscription_data: { metadata: { supabase_user_id: user.id } },
      success_url: `${appUrl()}/perfil?checkout=success`,
      cancel_url: `${appUrl()}/perfil?checkout=cancel`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error en /api/checkout:', error)
    return NextResponse.json({ error: 'No se pudo iniciar el pago.' }, { status: 500 })
  }
}
