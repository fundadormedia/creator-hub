import Stripe from 'stripe'

// ============================================================
// Cliente Stripe (server-only) + configuración de precios.
// Las keys y los price IDs viven en variables de entorno.
// ============================================================

// Lazy: no instanciar al cargar el módulo (la key puede no existir en build).
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY no está configurada.')
  _stripe = new Stripe(key, { typescript: true })
  return _stripe
}

// Los precios se crean en el dashboard de Stripe y su ID se pega en env.
// Mensual: $14.99/mes · Anual: $119/año (~$10/mes).
export const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? '',
  annual: process.env.STRIPE_PRICE_ANNUAL ?? '',
} as const

export type BillingCycle = keyof typeof PRICES

export function priceIdFor(cycle: BillingCycle): string {
  return PRICES[cycle]
}

// URL base de la app para los redirects de checkout / portal.
export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'
  ).replace(/\/$/, '')
}
