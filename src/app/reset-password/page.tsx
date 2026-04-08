'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Zap } from 'lucide-react'

const INPUT =
  'w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors'

type PageState = 'loading' | 'ready' | 'invalid'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      setPageState('invalid')
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error: sessionError }) => {
      if (sessionError) {
        setPageState('invalid')
      } else {
        setPageState('ready')
      }
    })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.updateUser({ password })

    if (authError) {
      setError('No pudimos actualizar tu contraseña. Intenta solicitar un nuevo enlace.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  if (pageState === 'loading') {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Verificando enlace...</p>
      </div>
    )
  }

  if (pageState === 'invalid') {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Enlace inválido</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          El enlace de recuperación expiró o ya fue utilizado.
        </p>
        <Link href="/forgot-password" className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Nueva contraseña</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Elige una contraseña segura para tu cuenta.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
            Nueva contraseña
          </label>
          <input
            type="password"
            className={INPUT}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            autoComplete="new-password"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
            Confirmar contraseña
          </label>
          <input
            type="password"
            className={INPUT}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-zinc-900 dark:text-zinc-100 tracking-tight">
            Creator Hub
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
          <Suspense fallback={
            <div className="text-center py-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Verificando enlace...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
