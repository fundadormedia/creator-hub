import { Suspense } from 'react'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white">
          ✦
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Creator Hub</div>
          <div className="text-sm text-zinc-500">tu manager con IA</div>
        </div>
      </div>

      <Suspense fallback={<div className="h-96 rounded-2xl border border-zinc-200 bg-white shadow-sm" />}>
        <AuthCard initialMode="register" />
      </Suspense>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Al continuar, aceptas nuestros{' '}
        <a href="#" className="underline hover:text-zinc-700">términos de uso</a>.
      </p>
      <p className="mt-4 text-center text-sm">
        <Link href="/landing" className="text-zinc-500 hover:text-zinc-700">← Volver al inicio</Link>
      </p>
    </div>
  )
}
