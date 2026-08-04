import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase-admin'

// ============================================================
// Webhook de Stripe. Ruta PÚBLICA (abierta en proxy.ts): Stripe
// llama sin sesión. Verifica la firma y voltea profiles.plan.
// ============================================================

// Necesitamos el body crudo para verificar la firma.
export const runtime = 'nodejs'

type Plan = 'free' | 'pro'

// Una suscripción cuenta como Pro solo si está viva.
function planFromStatus(status: Stripe.Subscription.Status): Plan {
  return status === 'active' || status === 'trialing' ? 'pro' : 'free'
}

async function setPlanByCustomer(
  customerId: string,
  plan: Plan,
  subscriptionId: string | null
) {
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ plan, stripe_subscription_id: subscriptionId })
    .eq('stripe_customer_id', customerId)
  if (error) {
    console.error('Webhook: no se pudo actualizar el plan:', error.message)
    throw error
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe no está configurado.' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma.' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const body = await request.text()
    event = getStripe().webhooks.constructEvent(body, signature, secret)
  } catch (error) {
    console.error('Webhook: firma inválida:', error)
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const plan =
          event.type === 'customer.subscription.deleted' ? 'free' : planFromStatus(sub.status)
        await setPlanByCustomer(customerId, plan, plan === 'pro' ? sub.id : null)
        break
      }
      default:
        // Otros eventos no nos interesan; respondemos 200 igual.
        break
    }
  } catch {
    // Ya se logueó dentro. Devolver 500 para que Stripe reintente.
    return NextResponse.json({ error: 'Error procesando el evento.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
