'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/use-user'
import { Music2, Wand2, Video, ShieldCheck, Loader2, CheckCircle2, Copy, BookmarkPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Shared styles ────────────────────────────────────────────────────────────

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

// ─── Result box ───────────────────────────────────────────────────────────────

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
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Resultado</span>
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

// ─── Tab 1: Crear Script ──────────────────────────────────────────────────────

const STYLES = [
  'POV/Historia personal',
  'Problema→Solución',
  'Review honesta',
  'Tutorial rápido',
  'Antes y después',
  'Storytime',
  'Top 3 razones',
  'Trend/Audio viral',
]

function CreateScriptTab() {
  const { user } = useUser()
  const [product, setProduct] = useState('')
  const [audience, setAudience] = useState('')
  const [price, setPrice] = useState('')
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
      body: JSON.stringify({ action: 'crear-script', product, audience, price, style, context }),
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
      title: `Script TikTok Shop: ${product}`,
      description: result,
      platform: 'TikTok',
      priority: 'Alta',
      user_id: user.id,
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="¿Qué producto quieres promover?">
          <input
            className={INPUT}
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Ej: Suero vitamina C de TikTok Shop"
          />
        </Field>
        <Field label="Tu audiencia">
          <input
            className={INPUT}
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Ej: Mujeres latinas 25-40 años"
          />
        </Field>
      </div>

      <Field label="Precio / Comisión">
        <input
          className={INPUT}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Ej: $29.99 / 20% de comisión"
        />
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

      <Field label="Experiencia personal o contexto (opcional)">
        <textarea
          className={TEXTAREA + ' h-24'}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Ej: Lo usé durante 2 semanas y mi piel mejoró muchísimo, especialmente las manchas..."
        />
      </Field>

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      <button
        onClick={handleCreate}
        disabled={loading || !product.trim() || !style}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        {loading ? 'Generando script...' : '🚀 Crear mi script viral'}
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
  )
}

// ─── Tab 2: Extraer de Video ──────────────────────────────────────────────────

function ExtraerVideoTab() {
  const [url, setUrl] = useState('')
  const [language, setLanguage] = useState('Español')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleExtract() {
    if (!url.trim()) return
    setError('')
    setResult('')
    setLoading(true)

    const res = await fetch('/api/tiktok-shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extraer-video', url, language }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setError(data.error ?? 'Error al procesar')
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

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          <strong>Nota:</strong> Esta función analiza la URL y te guía sobre cómo extraer la información del video de TikTok.
        </p>
      </div>

      <Field label="URL del video de TikTok">
        <input
          className={INPUT}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.tiktok.com/@usuario/video/..."
        />
      </Field>

      <Field label="Idioma">
        <select
          className={INPUT}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="Español">Español</option>
          <option value="English">English</option>
        </select>
      </Field>

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      <button
        onClick={handleExtract}
        disabled={loading || !url.trim()}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
        {loading ? 'Procesando...' : 'Extraer información'}
      </button>

      {result && <ResultBox result={result} onCopy={handleCopy} copied={copied} />}
    </div>
  )
}

// ─── Tab 3: Policy Checker ────────────────────────────────────────────────────

const CATEGORIES = [
  'Belleza y cuidado personal',
  'Salud y bienestar',
  'Moda y accesorios',
  'Hogar y jardín',
  'Electrónica y gadgets',
  'Fitness y deporte',
  'Alimentación y suplementos',
  'Bebés y niños',
  'Mascotas',
  'Otro',
]

function PolicyCheckerTab() {
  const [script, setScript] = useState('')
  const [category, setCategory] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleCheck() {
    if (!script.trim() || !category) return
    setError('')
    setResult('')
    setLoading(true)

    const res = await fetch('/api/tiktok-shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'policy-checker', script, category }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setError(data.error ?? 'Error al verificar')
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

  return (
    <div className="space-y-5">
      <Field label="Pega tu script aquí">
        <textarea
          className={TEXTAREA + ' h-48'}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Escribe o pega el script que quieres verificar..."
        />
      </Field>

      <Field label="Categoría del producto">
        <select
          className={INPUT}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Selecciona una categoría</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      <button
        onClick={handleCheck}
        disabled={loading || !script.trim() || !category}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
        {loading ? 'Verificando...' : 'Verificar política'}
      </button>

      {result && <ResultBox result={result} onCopy={handleCopy} copied={copied} />}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'script' | 'video' | 'policy'

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'script', label: 'Crear Script',      icon: Wand2        },
  { id: 'video',  label: 'Extraer de Video',  icon: Video        },
  { id: 'policy', label: 'Policy Checker',    icon: ShieldCheck  },
]

export default function TikTokShopPage() {
  const [activeTab, setActiveTab] = useState<Tab>('script')

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
          <Music2 className="w-5 h-5 text-white dark:text-zinc-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">TikTok Shop</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Crea scripts virales y verifica tus videos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === id
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
        {activeTab === 'script' && <CreateScriptTab />}
        {activeTab === 'video'  && <ExtraerVideoTab />}
        {activeTab === 'policy' && <PolicyCheckerTab />}
      </div>
    </div>
  )
}
