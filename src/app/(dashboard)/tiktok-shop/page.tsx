'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/use-user'
import { Clapperboard, Wand2, Loader2, CheckCircle2, Copy, BookmarkPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors'

const TEXTAREA = INPUT + ' resize-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ResultBox({
  result,
  onCopy,
  copied,
  extraAction,
}: {
  result: string
  onCopy: () => void
  copied: boolean
  extraAction?: React.ReactNode
}) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Script generado</span>
        <div className="flex items-center gap-2">
          {extraAction}
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-indigo-500 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>
      <div className="p-4 text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
        {result}
      </div>
    </div>
  )
}

const STYLES = [
  'POV / Historia personal',
  'Problema → Solución',
  'Review honesta',
  'Tutorial rápido',
  'Antes y después',
  'Storytime',
  'Top 3 razones',
  'Desafío o reto',
]

const PLATFORMS = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'Facebook Reels']

export default function ScriptUGCPage() {
  const { user } = useUser()
  const [product, setProduct] = useState('')
  const [audience, setAudience] = useState('')
  const [platform, setPlatform] = useState('')
  const [style, setStyle] = useState('')
  const [context, setContext] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!product.trim() || !style) return
    setError('')
    setResult('')
    setLoading(true)

    const res = await fetch('/api/tiktok-shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'crear-script', product, audience, price: '', style, context, platform }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setError(data.error ?? 'Error al generar el script')
    } else {
      setResult(data.result)
    }
    setLoading(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSaveToIdeas() {
    if (!result || !user) return
    setSaving(true)
    await supabase.from('ideas').insert({
      title: `Script UGC: ${product}`,
      description: result,
      platform: platform || 'General',
      priority: 'Alta',
      user_id: user.id,
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
          <Clapperboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Script UGC</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Genera scripts de storytelling con IA para cualquier producto o servicio</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-5">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Producto o servicio">
            <input
              className={INPUT}
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Ej: App de meditación, crema hidratante, curso de finanzas..."
            />
          </Field>
          <Field label="Tu audiencia">
            <input
              className={INPUT}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Ej: Mujeres 25-40 años interesadas en bienestar"
            />
          </Field>
        </div>

        <Field label="Plataforma">
          <div className="flex flex-wrap gap-2 mt-1">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  platform === p
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400 hover:text-indigo-500'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Estilo del video">
          <div className="flex flex-wrap gap-2 mt-1">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  style === s
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400 hover:text-indigo-500'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Contexto o experiencia personal (opcional)">
          <textarea
            className={TEXTAREA + ' h-24'}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ej: Lo probé durante 30 días y perdí 5kg sin pasar hambre..."
          />
        </Field>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading || !product.trim() || !style}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {loading ? 'Generando script...' : 'Generar script UGC'}
        </button>

        {result && (
          <ResultBox
            result={result}
            onCopy={handleCopy}
            copied={copied}
            extraAction={
              <button
                onClick={handleSaveToIdeas}
                disabled={saving || saved}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-500 transition-colors disabled:opacity-50"
              >
                {saved
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Guardado</>
                  : <><BookmarkPlus className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Guardar en Ideas'}</>
                }
              </button>
            }
          />
        )}
      </div>
    </div>
  )
}
