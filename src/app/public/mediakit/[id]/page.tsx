'use client'

import { use, useState, useEffect } from 'react'
import {
  PlaySquare,
  Camera,
  Music2,
  Hash,
  Mail,
  Users,
  TrendingUp,
  Eye,
  MapPin,
  Zap,
  ExternalLink,
} from 'lucide-react'
import {
  type MediaKit,
  getMediaKit,
  fmt,
  totalFollowers,
  avgEngagement,
} from '@/lib/mediakit-store'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// ─── Platform config ──────────────────────────────────────────────────────────

const platformConfig = {
  youtube: {
    label: 'YouTube',
    icon: PlaySquare,
    color: '#ef4444',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-600 dark:text-red-400',
  },
  instagram: {
    label: 'Instagram',
    icon: Camera,
    color: '#ec4899',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    text: 'text-pink-600 dark:text-pink-400',
  },
  tiktok: {
    label: 'TikTok',
    icon: Music2,
    color: '#06b6d4',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
  twitter: {
    label: 'Twitter / X',
    icon: Hash,
    color: '#6366f1',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
}

// ─── Platform card ────────────────────────────────────────────────────────────

function PlatformCard({ platformKey, kit }: { platformKey: keyof typeof platformConfig; kit: MediaKit }) {
  const cfg = platformConfig[platformKey]
  const Icon = cfg.icon
  const p = kit.platforms

  const stats: { label: string; value: string }[] = []

  if (platformKey === 'youtube') {
    const d = p.youtube
    stats.push(
      { label: 'Suscriptores', value: fmt(d.suscriptores) },
      { label: 'Views promedio', value: fmt(d.viewsPromedio) },
      { label: 'Engagement', value: `${d.engagementRate}%` },
      { label: 'Audiencia', value: d.paisPrincipal || '—' },
    )
  } else if (platformKey === 'instagram') {
    const d = p.instagram
    stats.push(
      { label: 'Seguidores', value: fmt(d.seguidores) },
      { label: 'Alcance mensual', value: fmt(d.alcanceMensual) },
      { label: 'Engagement', value: `${d.engagementRate}%` },
      { label: 'Edad principal', value: d.edadPrincipal },
    )
  } else if (platformKey === 'tiktok') {
    const d = p.tiktok
    stats.push(
      { label: 'Seguidores', value: fmt(d.seguidores) },
      { label: 'Views promedio', value: fmt(d.viewsPromedio) },
      { label: 'Likes totales', value: fmt(d.likesTotales) },
      { label: 'Engagement', value: `${d.engagementRate}%` },
    )
  } else if (platformKey === 'twitter') {
    const d = p.twitter
    stats.push(
      { label: 'Seguidores', value: fmt(d.seguidores) },
      { label: 'Impresiones / mes', value: fmt(d.impresionesMensuales) },
    )
  }

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-6`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
          <Icon className="w-5 h-5" style={{ color: cfg.color }} />
        </div>
        <span className={`text-base font-semibold ${cfg.text}`}>{cfg.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/60 dark:bg-zinc-900/60 rounded-xl p-3">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicMediaKitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [kit, setKit] = useState<MediaKit | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const k = getMediaKit(id)
    if (!k) setNotFound(true)
    else setKit(k)
  }, [id])

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-center p-8">
        <Zap className="w-10 h-10 text-indigo-500 mb-4" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Media Kit no encontrado</h1>
        <p className="text-sm text-zinc-500">Este Media Kit no existe o ha sido eliminado.</p>
      </div>
    )
  }

  if (!kit) return null

  const enabledPlatforms = (Object.keys(platformConfig) as Array<keyof typeof platformConfig>).filter(
    (k) => kit.platforms[k].enabled
  )

  const followers = totalFollowers(kit)
  const engagement = avgEngagement(kit)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Creado con <span className="text-zinc-700 dark:text-zinc-200 font-semibold">Creator Hub</span>
            </span>
          </div>
          <a
            href={`mailto:${kit.profile.email}`}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Contactar
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* ── Profile header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg">
            {kit.profile.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={kit.profile.fotoUrl}
                alt={kit.profile.nombre}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              initials(kit.profile.nombre)
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {kit.profile.nombre}
              </h1>
              {kit.profile.nicho && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                  {kit.profile.nicho}
                </span>
              )}
            </div>
            {kit.profile.ubicacion && (
              <div className="flex items-center gap-1 text-xs text-zinc-400 mb-2">
                <MapPin className="w-3 h-3" />
                {kit.profile.ubicacion}
              </div>
            )}
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              {kit.profile.bio}
            </p>
          </div>
        </div>

        {/* ── Global metrics ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center">
            <Users className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{fmt(followers)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Seguidores totales</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center">
            <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{engagement}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Engagement promedio</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center col-span-2 sm:col-span-1">
            <Eye className="w-5 h-5 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{enabledPlatforms.length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Plataformas activas</p>
          </div>
        </div>

        {/* ── Platforms ───────────────────────────────────────────────────── */}
        {enabledPlatforms.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-5">
              Plataformas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enabledPlatforms.map((p) => (
                <PlatformCard key={p} platformKey={p} kit={kit} />
              ))}
            </div>
          </section>
        )}

        {/* ── Contact section ──────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-indigo-500" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            ¿Interesado en colaborar?
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
            Si quieres trabajar con {kit.profile.nombre.split(' ')[0]}, escríbele directamente.
          </p>
          {kit.profile.email && (
            <a
              href={`mailto:${kit.profile.email}?subject=Propuesta de colaboración`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" />
              Contactar para colaboración
            </a>
          )}
          {kit.profile.email && (
            <p className="text-xs text-zinc-400 mt-3">{kit.profile.email}</p>
          )}
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="text-center pt-4 pb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-zinc-400">
              Creado con <span className="font-semibold text-zinc-500">Creator Hub</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
