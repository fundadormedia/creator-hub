'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import { Check, Sparkles, Loader2 } from 'lucide-react'

type Cycle = 'monthly' | 'annual'
type Plan = 'free' | 'pro'

const PRO_FEATURES = [
  'Manager IA sin tope práctico (200 mensajes/día)',
  'Los 4 modos: Finanzas · Analiza · Negocia · Recomienda',
  'Media kit público ilimitado',
  'Historial completo de colaboraciones y métricas',
  'Soporte prioritario',
]

const FREE_FEATURES = [
  'Media kit público',
  'Manager IA (40 mensajes/día)',
  'Métricas y colaboraciones básicas',
]

export default function PlanesPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-6 py-10" />}>
      <PlanesContent />
    </Suspense>
  )
}

function PlanesContent() {
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<Plan>('free')
  const [cycle, setCycle] = useState<Cycle>('annual')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  const checkoutState = searchParams.get('checkout')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('plan')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.plan === 'pro') setPlan('pro')
        setLoading(false)
      })
  }, [])

  async function upgrade() {
    setWorking(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo iniciar el pago.')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo falló.')
      setWorking(false)
    }
  }

  async function manage() {
    setWorking(true)
    setError('')
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo abrir el portal.')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo falló.')
      setWorking(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Planes</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tu manager IA, sin límites. Cancela cuando quieras.
        </p>
      </div>

      {checkoutState === 'success' && (
        <div className="mb-6 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          ¡Listo! Tu suscripción Pro se está activando. Puede tardar unos segundos.
        </div>
      )}
      {checkoutState === 'cancel' && (
        <div className="mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          Pago cancelado. Sigues en el plan gratuito.
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Toggle ciclo */}
      <div className="mb-6 inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-50 dark:bg-zinc-900">
        <button
          onClick={() => setCycle('monthly')}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            cycle === 'monthly'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => setCycle('annual')}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            cycle === 'annual'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          Anual <span className="text-emerald-600 dark:text-emerald-400 font-medium">−34%</span>
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Gratis</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">$0</span>
            <span className="text-sm text-zinc-500">/siempre</span>
          </div>
          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
                {f}
              </li>
            ))}
          </ul>
          {plan === 'free' && (
            <div className="mt-6 text-center text-sm text-zinc-400 py-2.5">Tu plan actual</div>
          )}
        </div>

        {/* Pro */}
        <div className="relative rounded-2xl border-2 border-indigo-500 p-6">
          <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1 text-xs font-medium text-white">
            <Sparkles className="w-3 h-3" /> Recomendado
          </div>
          <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Pro</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              {cycle === 'monthly' ? '$14.99' : '$9.92'}
            </span>
            <span className="text-sm text-zinc-500">/mes</span>
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            {cycle === 'annual' ? 'Facturado $119/año' : 'Facturado mensual'}
          </div>
          <ul className="mt-6 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                {f}
              </li>
            ))}
          </ul>

          {loading ? (
            <div className="mt-6 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ) : plan === 'pro' ? (
            <button
              onClick={manage}
              disabled={working}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              {working && <Loader2 className="w-4 h-4 animate-spin" />}
              Gestionar suscripción
            </button>
          ) : (
            <button
              onClick={upgrade}
              disabled={working}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {working && <Loader2 className="w-4 h-4 animate-spin" />}
              Subir a Pro
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
