'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Share2, Copy, Check, Globe, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

// Publica el media kit y da el link para compartir con marcas.
export function ShareMediaKit() {
  const [userId, setUserId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
    supabase
      .from('profiles')
      .select('mk_share_token, mk_public')
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setToken(data.mk_share_token ?? null)
          setIsPublic(Boolean(data.mk_public))
        }
        setLoading(false)
      })
  }, [])

  const link = token ? `${origin}/mk/${token}` : ''

  // Token aleatorio y limpio para URL, por si la fila es nueva y no lo tiene.
  function newToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(9)))
      .map((b) => b.toString(36))
      .join('')
      .slice(0, 12)
  }

  async function togglePublic() {
    if (!userId) return
    const next = !isPublic
    const ensuredToken = token ?? newToken()
    setIsPublic(next)
    setToken(ensuredToken)
    await supabase.from('profiles').upsert(
      { user_id: userId, mk_public: next, mk_share_token: ensuredToken },
      { onConflict: 'user_id' }
    )
  }

  function copy() {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return null

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/15">
            <Share2 className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">Compartir con marcas</p>
            <p className="mt-0.5 text-sm text-zinc-500">
              {isPublic
                ? 'Tu media kit es visible para cualquiera con el link.'
                : 'Actívalo para generar un link público que puedes mandarle a las marcas.'}
            </p>
          </div>
        </div>

        <button
          onClick={togglePublic}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
            isPublic
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          )}
        >
          {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {isPublic ? 'Público' : 'Publicar'}
        </button>
      </div>

      {isPublic && link && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1.5 pl-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <span className="flex-1 truncate text-sm text-zinc-600 dark:text-zinc-400">{link}</span>
          <button
            onClick={copy}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      )}
    </div>
  )
}
