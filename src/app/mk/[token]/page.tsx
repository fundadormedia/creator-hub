'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Eye, TrendingUp } from 'lucide-react'

// Media kit PÚBLICO — sin login. Cualquiera con el link lo ve.
// Lee vía la función get_public_mediakit (solo campos públicos).

type Platform = 'instagram' | 'tiktok' | 'youtube'

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
}
const PLATFORM_DOT: Record<Platform, string> = {
  instagram: 'bg-pink-500',
  tiktok: 'bg-zinc-900',
  youtube: 'bg-red-500',
}

interface Stat {
  platform: Platform
  followers: number | null
  views: number | null
  engagement_rate: number | null
  likes: number | null
  reach: number | null
}

interface Social {
  handle?: string
  followers?: string
}

interface Kit {
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  categories: string[] | null
  socials: Partial<Record<Platform, Social>> | null
  stats: Stat[]
  audience: {
    engagement_rate: number | null
    gender: { male: number | null; female: number | null }
    countries: { name: string; flag: string; pct: number | null }[]
    ages: { range: string; male: number | null; female: number | null }[]
  } | null
}

function compact(n: number | null): string {
  if (n === null || n === undefined) return '—'
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export default function PublicMediaKit({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [kit, setKit] = useState<Kit | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading')

  useEffect(() => {
    supabase
      .rpc('get_public_mediakit', { token })
      .then(({ data, error }) => {
        if (error || !data) {
          setState('notfound')
          return
        }
        setKit(data as Kit)
        setState('ok')
      })
  }, [token])

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-400">Cargando…</p>
      </div>
    )
  }

  if (state === 'notfound' || !kit) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-zinc-50 px-6 text-center dark:bg-zinc-950">
        <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Este media kit no está disponible
        </p>
        <p className="text-sm text-zinc-500">
          El link puede estar mal o el creador aún no lo publicó.
        </p>
      </div>
    )
  }

  const totalFollowers = kit.stats.reduce((acc, s) => acc + (s.followers ?? 0), 0)
  const avgEng = (() => {
    const vals = kit.stats.map((s) => s.engagement_rate).filter((v): v is number => v !== null)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  })()
  const totalViews = kit.stats.reduce((acc, s) => acc + (s.views ?? 0), 0)

  const initials = (kit.full_name ?? 'C')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-zinc-50 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-6">
        {/* Cabecera del creador */}
        <div className="flex flex-col items-center text-center">
          {kit.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={kit.avatar_url}
              alt={kit.full_name ?? 'Creador'}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg dark:ring-zinc-800"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500 text-2xl font-bold text-white ring-4 ring-white shadow-lg dark:ring-zinc-800">
              {initials}
            </div>
          )}
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {kit.full_name ?? 'Creador de contenido'}
          </h1>
          {kit.bio && <p className="mt-2 max-w-md text-zinc-500 dark:text-zinc-400">{kit.bio}</p>}
          {kit.categories && kit.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {kit.categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Resumen */}
        {kit.stats.length > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: 'Seguidores', value: compact(totalFollowers) },
              { icon: TrendingUp, label: 'Engagement', value: avgEng === null ? '—' : `${avgEng.toFixed(1)}%` },
              { icon: Eye, label: 'Vistas', value: compact(totalViews) },
            ].map((k) => {
              const Icon = k.icon
              return (
                <div
                  key={k.label}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Icon className="mx-auto mb-2 h-5 w-5 text-indigo-500" />
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{k.value}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{k.label}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Por plataforma */}
        {kit.stats.length > 0 && (
          <div className="mt-6 space-y-3">
            {kit.stats.map((s) => {
              const social = kit.socials?.[s.platform]
              return (
                <div
                  key={s.platform}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                      <span className={`h-2.5 w-2.5 rounded-full ${PLATFORM_DOT[s.platform]}`} />
                      {PLATFORM_LABEL[s.platform]}
                    </span>
                    {social?.handle && (
                      <span className="text-sm text-zinc-400">{social.handle}</span>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {compact(s.followers)}
                      </p>
                      <p className="text-xs text-zinc-400">Seguidores</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {compact(s.reach ?? s.views)}
                      </p>
                      <p className="text-xs text-zinc-400">Alcance</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {s.engagement_rate === null ? '—' : `${s.engagement_rate.toFixed(1)}%`}
                      </p>
                      <p className="text-xs text-zinc-400">Engagement</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {kit.stats.length === 0 && (
          <p className="mt-10 text-center text-sm text-zinc-400">
            Este creador todavía no publicó sus métricas.
          </p>
        )}

        {/* Audiencia */}
        {kit.audience && (kit.audience.gender.male !== null || kit.audience.countries.some((c) => c.name)) && (
          <div className="mt-6 space-y-3">
            {(kit.audience.gender.male !== null || kit.audience.gender.female !== null) && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">Audiencia por género</p>
                <div className="flex overflow-hidden rounded-full">
                  <div className="bg-indigo-500 py-2 text-center text-xs font-semibold text-white" style={{ width: `${kit.audience.gender.male ?? 0}%` }}>
                    {kit.audience.gender.male !== null ? `${kit.audience.gender.male}%` : ''}
                  </div>
                  <div className="bg-orange-500 py-2 text-center text-xs font-semibold text-white" style={{ width: `${kit.audience.gender.female ?? 0}%` }}>
                    {kit.audience.gender.female !== null ? `${kit.audience.gender.female}%` : ''}
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" />Hombre</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" />Mujer</span>
                </div>
              </div>
            )}

            {kit.audience.countries.filter((c) => c.name).length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Principales países</p>
                <div className="space-y-3">
                  {kit.audience.countries.filter((c) => c.name).map((c, i) => (
                    <div key={i}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-zinc-700 dark:text-zinc-300">{c.flag} {c.name}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{c.pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (c.pct ?? 0) * 3)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kit.audience.ages.some((a) => a.male !== null || a.female !== null) && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Edad de la audiencia</p>
                <div className="space-y-2">
                  {kit.audience.ages.filter((a) => a.male !== null || a.female !== null).map((a) => {
                    const total = (a.male ?? 0) + (a.female ?? 0)
                    return (
                      <div key={a.range} className="flex items-center gap-3 text-sm">
                        <span className="w-14 text-zinc-500">{a.range}</span>
                        <div className="flex h-4 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div className="bg-indigo-500" style={{ width: `${(a.male ?? 0) * 2}%` }} />
                          <div className="bg-orange-500" style={{ width: `${(a.female ?? 0) * 2}%` }} />
                        </div>
                        <span className="w-12 text-right font-semibold text-zinc-900 dark:text-zinc-100">{total.toFixed(1)}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-zinc-400">
          Hecho con Creator Hub
        </p>
      </div>
    </div>
  )
}
