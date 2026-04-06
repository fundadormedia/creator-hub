'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  ExternalLink,
  PlaySquare,
  Camera,
  Music2,
  Hash,
  Check,
} from 'lucide-react'
import {
  type MediaKit,
  type YoutubeMetrics,
  type InstagramMetrics,
  type TiktokMetrics,
  type TwitterMetrics,
  getMediaKit,
  updateMediaKit,
} from '@/lib/mediakit-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ─── Reusable field components ────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors'

function TextInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  )
}

function NumberInput({ value, onChange, placeholder }: {
  value: number; onChange: (v: number) => void; placeholder?: string
}) {
  return (
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={placeholder}
      className={inputCls}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputCls} resize-none`}
    />
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 group"
    >
      <div
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
          checked ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 select-none">{label}</span>
    </button>
  )
}

// ─── Platform section wrapper ─────────────────────────────────────────────────

function PlatformSection({
  icon: Icon,
  color,
  name,
  enabled,
  onToggle,
  children,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  name: string
  enabled: boolean
  onToggle: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border transition-colors ${
      enabled
        ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
        : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-60'
    }`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</span>
        </div>
        <Toggle checked={enabled} onChange={onToggle} label={enabled ? 'Activa' : 'Inactiva'} />
      </div>
      <div className={`p-5 ${!enabled ? 'pointer-events-none' : ''}`}>
        {children}
      </div>
    </div>
  )
}

// ─── Save toast ───────────────────────────────────────────────────────────────

function SavedToast({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <Check className="w-4 h-4" />
      Guardado correctamente
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaKitEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [kit, setKit] = useState<MediaKit | null>(null)
  const [saved, setSaved] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Form state — mirrors the MediaKit shape
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Profile
  const [nombre, setNombre] = useState('')
  const [bio, setBio] = useState('')
  const [nicho, setNicho] = useState('')
  const [email, setEmail] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [ubicacion, setUbicacion] = useState('')

  // YouTube
  const [ytEnabled, setYtEnabled] = useState(false)
  const [yt, setYt] = useState<Omit<YoutubeMetrics, 'enabled'>>({
    suscriptores: 0, viewsTotales: 0, viewsPromedio: 0, engagementRate: 0, paisPrincipal: '',
  })

  // Instagram
  const [igEnabled, setIgEnabled] = useState(false)
  const [ig, setIg] = useState<Omit<InstagramMetrics, 'enabled'>>({
    seguidores: 0, alcanceMensual: 0, impresiones: 0, engagementRate: 0, edadPrincipal: '25-34',
  })

  // TikTok
  const [ttEnabled, setTtEnabled] = useState(false)
  const [tt, setTt] = useState<Omit<TiktokMetrics, 'enabled'>>({
    seguidores: 0, viewsPromedio: 0, likesTotales: 0, engagementRate: 0,
  })

  // Twitter
  const [twEnabled, setTwEnabled] = useState(false)
  const [tw, setTw] = useState<Omit<TwitterMetrics, 'enabled'>>({
    seguidores: 0, impresionesMensuales: 0,
  })

  const load = useCallback(() => {
    const k = getMediaKit(id)
    if (!k) { setNotFound(true); return }
    setKit(k)
    setName(k.name)
    setDescription(k.description)
    setNombre(k.profile.nombre)
    setBio(k.profile.bio)
    setNicho(k.profile.nicho)
    setEmail(k.profile.email)
    setFotoUrl(k.profile.fotoUrl)
    setUbicacion(k.profile.ubicacion)
    setYtEnabled(k.platforms.youtube.enabled)
    setYt({ suscriptores: k.platforms.youtube.suscriptores, viewsTotales: k.platforms.youtube.viewsTotales, viewsPromedio: k.platforms.youtube.viewsPromedio, engagementRate: k.platforms.youtube.engagementRate, paisPrincipal: k.platforms.youtube.paisPrincipal })
    setIgEnabled(k.platforms.instagram.enabled)
    setIg({ seguidores: k.platforms.instagram.seguidores, alcanceMensual: k.platforms.instagram.alcanceMensual, impresiones: k.platforms.instagram.impresiones, engagementRate: k.platforms.instagram.engagementRate, edadPrincipal: k.platforms.instagram.edadPrincipal })
    setTtEnabled(k.platforms.tiktok.enabled)
    setTt({ seguidores: k.platforms.tiktok.seguidores, viewsPromedio: k.platforms.tiktok.viewsPromedio, likesTotales: k.platforms.tiktok.likesTotales, engagementRate: k.platforms.tiktok.engagementRate })
    setTwEnabled(k.platforms.twitter.enabled)
    setTw({ seguidores: k.platforms.twitter.seguidores, impresionesMensuales: k.platforms.twitter.impresionesMensuales })
  }, [id])

  useEffect(load, [load])

  function handleSave() {
    updateMediaKit(id, {
      name,
      description,
      profile: { nombre, bio, nicho, email, fotoUrl, ubicacion },
      platforms: {
        youtube:  { enabled: ytEnabled, ...yt },
        instagram:{ enabled: igEnabled, ...ig },
        tiktok:   { enabled: ttEnabled, ...tt },
        twitter:  { enabled: twEnabled, ...tw },
      },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (notFound) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-zinc-500 dark:text-zinc-400 mb-4">Media Kit no encontrado.</p>
        <button onClick={() => router.push('/mediakit')} className="text-indigo-500 text-sm hover:underline">
          Volver a mis Media Kits
        </button>
      </div>
    )
  }

  if (!kit) return null

  return (
    <>
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push('/mediakit')}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate">{name}</h1>
              <p className="text-xs text-zinc-400 mt-0.5 truncate">{description || 'Sin descripción'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.open(`/public/mediakit/${id}`, '_blank')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver pública
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="perfil">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-full grid grid-cols-2">
            <TabsTrigger value="perfil" className="rounded-md text-sm">Perfil general</TabsTrigger>
            <TabsTrigger value="plataformas" className="rounded-md text-sm">Plataformas</TabsTrigger>
          </TabsList>

          {/* ── Perfil ────────────────────────────────────────────────────── */}
          <TabsContent value="perfil" className="mt-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Información del creador</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre del kit">
                  <TextInput value={name} onChange={setName} placeholder="Nombre del Media Kit" />
                </Field>
                <Field label="Nombre del creador">
                  <TextInput value={nombre} onChange={setNombre} placeholder="Tu nombre completo" />
                </Field>
              </div>

              <Field label="Bio corta">
                <Textarea
                  value={bio}
                  onChange={setBio}
                  placeholder="Cuéntale a las marcas quién eres y qué haces..."
                  rows={3}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nicho">
                  <TextInput value={nicho} onChange={setNicho} placeholder="ej. Tecnología & Productividad" />
                </Field>
                <Field label="Email de contacto">
                  <TextInput value={email} onChange={setEmail} placeholder="tu@email.com" />
                </Field>
                <Field label="Ubicación">
                  <TextInput value={ubicacion} onChange={setUbicacion} placeholder="ej. Madrid, España" />
                </Field>
                <Field label="URL de foto de perfil">
                  <TextInput value={fotoUrl} onChange={setFotoUrl} placeholder="https://..." />
                </Field>
              </div>

              <Field label="Descripción del kit">
                <Textarea
                  value={description}
                  onChange={setDescription}
                  placeholder="Para qué tipo de colaboraciones está pensado este kit..."
                  rows={2}
                />
              </Field>
            </div>
          </TabsContent>

          {/* ── Plataformas ───────────────────────────────────────────────── */}
          <TabsContent value="plataformas" className="mt-5 space-y-4">

            {/* YouTube */}
            <PlatformSection icon={PlaySquare} color="#ef4444" name="YouTube" enabled={ytEnabled} onToggle={setYtEnabled}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Suscriptores">
                  <NumberInput value={yt.suscriptores} onChange={(v) => setYt((p) => ({ ...p, suscriptores: v }))} placeholder="210000" />
                </Field>
                <Field label="Views totales">
                  <NumberInput value={yt.viewsTotales} onChange={(v) => setYt((p) => ({ ...p, viewsTotales: v }))} placeholder="4500000" />
                </Field>
                <Field label="Views promedio por vídeo">
                  <NumberInput value={yt.viewsPromedio} onChange={(v) => setYt((p) => ({ ...p, viewsPromedio: v }))} placeholder="21500" />
                </Field>
                <Field label="Engagement rate %">
                  <NumberInput value={yt.engagementRate} onChange={(v) => setYt((p) => ({ ...p, engagementRate: v }))} placeholder="4.2" />
                </Field>
                <Field label="País principal de audiencia">
                  <TextInput value={yt.paisPrincipal} onChange={(v) => setYt((p) => ({ ...p, paisPrincipal: v }))} placeholder="España" />
                </Field>
              </div>
            </PlatformSection>

            {/* Instagram */}
            <PlatformSection icon={Camera} color="#ec4899" name="Instagram" enabled={igEnabled} onToggle={setIgEnabled}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Seguidores">
                  <NumberInput value={ig.seguidores} onChange={(v) => setIg((p) => ({ ...p, seguidores: v }))} placeholder="185000" />
                </Field>
                <Field label="Alcance mensual">
                  <NumberInput value={ig.alcanceMensual} onChange={(v) => setIg((p) => ({ ...p, alcanceMensual: v }))} placeholder="420000" />
                </Field>
                <Field label="Impresiones mensuales">
                  <NumberInput value={ig.impresiones} onChange={(v) => setIg((p) => ({ ...p, impresiones: v }))} placeholder="1200000" />
                </Field>
                <Field label="Engagement rate %">
                  <NumberInput value={ig.engagementRate} onChange={(v) => setIg((p) => ({ ...p, engagementRate: v }))} placeholder="7.1" />
                </Field>
                <Field label="Edad principal de audiencia">
                  <select
                    value={ig.edadPrincipal}
                    onChange={(e) => setIg((p) => ({ ...p, edadPrincipal: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45+">45+</option>
                  </select>
                </Field>
              </div>
            </PlatformSection>

            {/* TikTok */}
            <PlatformSection icon={Music2} color="#06b6d4" name="TikTok" enabled={ttEnabled} onToggle={setTtEnabled}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Seguidores">
                  <NumberInput value={tt.seguidores} onChange={(v) => setTt((p) => ({ ...p, seguidores: v }))} placeholder="198000" />
                </Field>
                <Field label="Views promedio por vídeo">
                  <NumberInput value={tt.viewsPromedio} onChange={(v) => setTt((p) => ({ ...p, viewsPromedio: v }))} placeholder="45000" />
                </Field>
                <Field label="Likes totales">
                  <NumberInput value={tt.likesTotales} onChange={(v) => setTt((p) => ({ ...p, likesTotales: v }))} placeholder="2800000" />
                </Field>
                <Field label="Engagement rate %">
                  <NumberInput value={tt.engagementRate} onChange={(v) => setTt((p) => ({ ...p, engagementRate: v }))} placeholder="8.4" />
                </Field>
              </div>
            </PlatformSection>

            {/* Twitter / X */}
            <PlatformSection icon={Hash} color="#6366f1" name="Twitter / X" enabled={twEnabled} onToggle={setTwEnabled}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Seguidores">
                  <NumberInput value={tw.seguidores} onChange={(v) => setTw((p) => ({ ...p, seguidores: v }))} placeholder="41000" />
                </Field>
                <Field label="Impresiones mensuales">
                  <NumberInput value={tw.impresionesMensuales} onChange={(v) => setTw((p) => ({ ...p, impresionesMensuales: v }))} placeholder="380000" />
                </Field>
              </div>
            </PlatformSection>

          </TabsContent>
        </Tabs>

        {/* Bottom save bar */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar cambios
          </button>
        </div>
      </div>

      <SavedToast visible={saved} />
    </>
  )
}
