'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Check, ImagePlus, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'

interface Item {
  url: string
  title: string
  thumb: string // dataURL de la miniatura, o '' si es YouTube/auto
}

// Saca la miniatura de un link de YouTube (los demás requieren subirla a mano).
function youtubeThumb(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
}

export function PortfolioCard() {
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<Item[]>([{ url: '', title: '', thumb: '' }])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

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
      setItems(
        list.length > 0
          ? list.map((x) => ({ url: x.url ?? '', title: x.title ?? '', thumb: x.thumb ?? '' }))
          : [{ url: '', title: '', thumb: '' }]
      )
      setLoading(false)
    })
  }, [])

  // Comprime la miniatura a 480px de ancho para no inflar la fila.
  function handleThumb(index: number, file: File) {
    if (!file.type.startsWith('image/')) {
      setError('La miniatura debe ser una imagen.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const w = 480
        const h = Math.round((img.height / img.width) * w)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0, w, h)
        const thumb = canvas.toDataURL('image/jpeg', 0.75)
        setItems((p) => p.map((x, j) => (j === index ? { ...x, thumb } : x)))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  }

  async function save() {
    if (!userId) {
      setError('Recarga la página e intenta de nuevo.')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
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
          Pega el enlace de cada video y sube una miniatura (un screenshot del video). En YouTube la
          saco sola. La marca ve un preview con botón de play que la lleva al video.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {items.map((it, i) => {
          const preview = it.thumb || youtubeThumb(it.url)
          return (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50 sm:flex-row sm:items-start"
            >
              {/* Miniatura */}
              <div className="shrink-0">
                <input
                  ref={(el) => {
                    fileRefs.current[i] = el
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleThumb(i, f)
                    e.target.value = ''
                  }}
                />
                <button
                  onClick={() => fileRefs.current[i]?.click()}
                  className="group relative flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {preview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="Miniatura" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="h-5 w-5 fill-white text-white" />
                      </span>
                    </>
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-zinc-400">
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px]">Miniatura</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Enlace + título */}
              <div className="flex flex-1 flex-col gap-2">
                <input
                  value={it.url}
                  onChange={(e) =>
                    setItems((p) => p.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))
                  }
                  placeholder="https://tiktok.com/@tu/video/..."
                  className={INPUT}
                />
                <input
                  value={it.title}
                  onChange={(e) =>
                    setItems((p) => p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                  }
                  placeholder="Título / marca (ej: GAP)"
                  className={INPUT}
                />
              </div>

              <button
                onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                className="shrink-0 self-center text-zinc-400 hover:text-red-500"
                aria-label="Quitar video"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}

        <button
          onClick={() => setItems((p) => [...p, { url: '', title: '', thumb: '' }])}
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
