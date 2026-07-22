'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Sparkles, ImagePlus, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Platform = 'instagram' | 'tiktok' | 'youtube'

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
]

const SLOTS = [0, 1, 2]

interface Shot {
  dataUrl: string
  media_type: string
  base64: string
}

interface Metrics {
  followers: number | null
  views: number | null
  engagement_rate: number | null
  posts: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  impressions: number | null
  reach: number | null
  clicks: number | null
}

// Orden en que se muestran para revisar.
const METRIC_FIELDS: { key: keyof Metrics; label: string }[] = [
  { key: 'followers', label: 'Seguidores' },
  { key: 'views', label: 'Vistas' },
  { key: 'engagement_rate', label: 'Engagement %' },
  { key: 'posts', label: 'Posts' },
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comentarios' },
  { key: 'shares', label: 'Compartidos' },
  { key: 'saves', label: 'Guardados' },
  { key: 'impressions', label: 'Impresiones' },
  { key: 'reach', label: 'Alcance' },
  { key: 'clicks', label: 'Clicks' },
]

const emptyMetrics = (): Metrics => ({
  followers: null,
  views: null,
  engagement_rate: null,
  posts: null,
  likes: null,
  comments: null,
  shares: null,
  saves: null,
  impressions: null,
  reach: null,
  clicks: null,
})

const currentMonth = () => new Date().toISOString().slice(0, 7)
const monthLabel = () => {
  const s = new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Sube capturas de analíticas → la IA extrae los números → tú corriges → se guardan. */
export function CapturasAnalyzer() {
  const [shots, setShots] = useState<Record<Platform, (Shot | null)[]>>({
    instagram: [null, null, null],
    tiktok: [null, null, null],
    youtube: [null, null, null],
  })
  const [metrics, setMetrics] = useState<Partial<Record<Platform, Metrics>> | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const totalShots = PLATFORMS.reduce(
    (acc, p) => acc + shots[p.id].filter(Boolean).length,
    0
  )

  function handleFile(platform: Platform, slot: number, file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Solo imágenes (PNG o JPG).')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Cada captura debe pesar menos de 4 MB.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      const base64 = dataUrl.split(',')[1] ?? ''
      setShots((prev) => {
        const next = [...prev[platform]]
        next[slot] = { dataUrl, media_type: file.type, base64 }
        return { ...prev, [platform]: next }
      })
    }
    reader.readAsDataURL(file)
  }

  function removeShot(platform: Platform, slot: number) {
    setShots((prev) => {
      const next = [...prev[platform]]
      next[slot] = null
      return { ...prev, [platform]: next }
    })
  }

  async function analyze() {
    if (totalShots === 0) {
      setError('Sube al menos una captura.')
      return
    }
    setAnalyzing(true)
    setError(null)
    setSaved(false)

    const payload = PLATFORMS.flatMap((p) =>
      shots[p.id]
        .filter((s): s is Shot => s !== null)
        .map((s) => ({ platform: p.id, media_type: s.media_type, data: s.base64 }))
    )

    try {
      const res = await fetch('/api/mediakit-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shots: payload }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'No se pudo analizar.')
        return
      }
      // Sólo mostramos las redes de las que se subió algo.
      const result: Partial<Record<Platform, Metrics>> = {}
      for (const p of PLATFORMS) {
        if (shots[p.id].some(Boolean)) {
          result[p.id] = { ...emptyMetrics(), ...(data.metrics?.[p.id] ?? {}) }
        }
      }
      setMetrics(result)
    } catch {
      setError('No pude conectar con el servidor.')
    } finally {
      setAnalyzing(false)
    }
  }

  function editMetric(platform: Platform, key: keyof Metrics, value: string) {
    setMetrics((prev) => ({
      ...prev,
      [platform]: {
        ...(prev?.[platform] ?? emptyMetrics()),
        [key]: value === '' ? null : Number(value),
      },
    }))
  }

  async function saveMetrics() {
    if (!metrics) return
    setSaving(true)
    setError(null)
    const month = currentMonth()

    const rows = (Object.keys(metrics) as Platform[]).map((p) => ({
      month,
      platform: p,
      followers: metrics[p]?.followers ?? null,
      views: metrics[p]?.views ?? null,
      engagement_rate: metrics[p]?.engagement_rate ?? null,
      posts: metrics[p]?.posts ?? null,
      likes: metrics[p]?.likes ?? null,
      comments: metrics[p]?.comments ?? null,
      shares: metrics[p]?.shares ?? null,
      saves: metrics[p]?.saves ?? null,
      impressions: metrics[p]?.impressions ?? null,
      reach: metrics[p]?.reach ?? null,
      clicks: metrics[p]?.clicks ?? null,
    }))

    const { error: err } = await supabase
      .from('media_kit_stats')
      .upsert(rows, { onConflict: 'user_id,month,platform' })

    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setSaved(true)
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Capturas de {monthLabel()}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Sube tus capturas y la IA las analiza por ti — no tienes que tipear los números a mano.
        </p>
      </div>

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-500/25 dark:bg-indigo-500/5">
        <p className="flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-4 w-4" />
          Cómo funciona
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Sube tus capturas de <strong>Insights de Instagram</strong>,{' '}
          <strong>Analíticas de TikTok</strong> y <strong>YouTube Studio</strong>.
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Toca <strong>Analizar capturas</strong> y la IA extrae{' '}
          <strong>seguidores, vistas, engagement, likes, comentarios, compartidos, guardados,
          impresiones, alcance y clicks</strong> por red. Revisas y corriges lo que haga falta antes
          de guardar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLATFORMS.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">{p.label}</p>
            <div className="grid grid-cols-3 gap-2">
              {SLOTS.map((slot) => {
                const shot = shots[p.id][slot]
                const key = `${p.id}-${slot}`
                return (
                  <div key={slot} className="relative">
                    <input
                      ref={(el) => {
                        inputRefs.current[key] = el
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleFile(p.id, slot, f)
                        e.target.value = ''
                      }}
                    />
                    {shot ? (
                      <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={shot.dataUrl}
                          alt={`Captura ${slot + 1} de ${p.label}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => removeShot(p.id, slot)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Quitar captura"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => inputRefs.current[key]?.click()}
                        className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-zinc-200 text-zinc-400 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700"
                      >
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-xs">Subir</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-500/25 dark:bg-indigo-500/5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Analiza tus capturas</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            La IA lee todas tus capturas y extrae las 11 métricas por red. Vas a poder revisar y
            corregir antes de confirmar.
          </p>
        </div>
        <button
          onClick={analyze}
          disabled={analyzing || totalShots === 0}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {analyzing ? 'Analizando…' : 'Analizar capturas'}
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      {metrics && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Revisa los números</p>
          <p className="mt-1 text-sm text-zinc-500">
            Corrige lo que la IA haya leído mal antes de guardar.
          </p>

          <div className="mt-4 space-y-4">
            {(Object.keys(metrics) as Platform[]).map((p) => (
              <div key={p} className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {PLATFORMS.find((x) => x.id === p)?.label}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {METRIC_FIELDS.map(({ key, label }) => (
                    <div key={key}>
                      <p className="mb-1 text-xs text-zinc-500">{label}</p>
                      <input
                        type="number"
                        value={metrics[p]?.[key] ?? ''}
                        onChange={(e) => editMetric(p, key, e.target.value)}
                        placeholder="—"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={saveMetrics}
            disabled={saving}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
          >
            {saved && <Check className="h-4 w-4" />}
            {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar métricas del mes'}
          </button>
        </div>
      )}
    </section>
  )
}
