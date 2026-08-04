'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Film, Plus, Trash2, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'

interface Item {
  url: string
  title: string
}

export function PortfolioCard() {
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<Item[]>([{ url: '', title: '' }])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (!uid) {
        setLoading(false)
        return
      }
      const { data: row } = await supabase
        .from('profiles')
        .select('mk_portfolio')
        .eq('user_id', uid)
        .maybeSingle()
      const list = (row?.mk_portfolio ?? []) as Item[]
      setItems(list.length > 0 ? list : [{ url: '', title: '' }])
      setLoading(false)
    })
  }, [])

  async function save() {
    if (!userId) {
      setError('Recarga la página e intenta de nuevo.')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
    // Solo guarda los que tienen link.
    const clean = items.filter((i) => i.url.trim())
    const { error: err } = await supabase.from('profiles').upsert(
      { user_id: userId, mk_portfolio: clean },
      { onConflict: 'user_id' }
    )
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return null

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Videos destacados
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Pega los enlaces de tus mejores videos (TikTok, Reels, YouTube). La marca los ve al final
          de tu media kit.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50 sm:flex-row">
            <input
              value={it.url}
              onChange={(e) =>
                setItems((p) => p.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))
              }
              placeholder="https://tiktok.com/@tu/video/..."
              className={cn(INPUT, 'flex-1')}
            />
            <input
              value={it.title}
              onChange={(e) =>
                setItems((p) => p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
              }
              placeholder="Título (opcional)"
              className={cn(INPUT, 'sm:w-56')}
            />
            <button
              onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
              className="shrink-0 self-center text-zinc-400 hover:text-red-500"
              aria-label="Quitar video"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          onClick={() => setItems((p) => [...p, { url: '', title: '' }])}
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          <Plus className="h-4 w-4" /> Agregar video
        </button>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
        >
          {saved && <Check className="h-4 w-4" />}
          {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar portafolio'}
        </button>
      </div>
    </section>
  )
}
