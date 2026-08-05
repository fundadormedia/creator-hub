'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock, CreditCard, ArrowRight, Loader2, AlertTriangle } from 'lucide-react'

// Acción de suscripción compartida (banner + gate). Lanza el checkout de Stripe.
function useSubscribe() {
  const [working, setWorking] = useState(false)
  async function subscribe() {
    setWorking(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle: 'monthly' }),
      })
      const data = await res.json()
      if (res.ok && data.url) window.location.href = data.url
      else setWorking(false)
    } catch {
      setWorking(false)
    }
  }
  return { subscribe, working }
}

// Banner superior cuando la prueba venció.
export function TrialBanner() {
  const { subscribe, working } = useSubscribe()
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-6 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
        <div className="text-sm">
          <span className="font-semibold text-amber-800 dark:text-amber-300">
            Tu período de prueba terminó.
          </span>{' '}
          <span className="text-amber-700 dark:text-amber-400">
            Suscríbete para seguir usando Lula.
          </span>
        </div>
      </div>
      <button
        onClick={subscribe}
        disabled={working}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Suscribirme · USD 14.99/mes
      </button>
    </div>
  )
}

// Pantalla de bloqueo que reemplaza el contenido de las secciones bloqueadas.
export function TrialLockGate() {
  const { subscribe, working } = useSubscribe()
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Lock className="h-7 w-7 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Tu período de prueba terminó
        </h2>
        <p className="mt-2 text-zinc-500">Suscríbete para acceder a esta sección.</p>
        <button
          onClick={subscribe}
          disabled={working}
          className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Suscribirme · USD 14.99/mes <ArrowRight className="h-4 w-4" />
        </button>
        <div className="mt-4">
          <Link href="/perfil" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            Ir a mi perfil
          </Link>
        </div>
      </div>
    </div>
  )
}
