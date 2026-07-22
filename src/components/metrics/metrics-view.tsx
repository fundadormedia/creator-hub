'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis, XAxis } from 'recharts'
import { BarChart3, Users, TrendingUp, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Platform = 'instagram' | 'tiktok' | 'youtube'

const PLATFORMS: { id: Platform; label: string; dot: string }[] = [
  { id: 'instagram', label: 'Instagram', dot: 'bg-pink-500' },
  { id: 'tiktok', label: 'TikTok', dot: 'bg-zinc-900 dark:bg-zinc-100' },
  { id: 'youtube', label: 'YouTube', dot: 'bg-red-500' },
]

const PERIODS = [
  { months: 3, label: '3 meses' },
  { months: 6, label: '6 meses' },
  { months: 12, label: '12 meses' },
] as const

interface StatRow {
  month: string
  platform: Platform
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

// 341500 → "341.5k" · 9900000 → "9.9M"
function compact(n: number | null): string {
  if (n === null || n === undefined) return '—'
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

const full = (n: number | null) => (n === null ? '—' : new Intl.NumberFormat('es').format(n))

function monthsBack(n: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 7)
}

function monthLabel(m: string): string {
  const [y, mo] = m.split('-')
  const d = new Date(Number(y), Number(mo) - 1)
  return d.toLocaleDateString('es', { month: 'short' })
}

export function MetricsView() {
  const [rows, setRows] = useState<StatRow[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<number>(6)
  const [platform, setPlatform] = useState<Platform | 'todas'>('todas')

  useEffect(() => {
    supabase
      .from('media_kit_stats')
      .select('*')
      .order('month')
      .then(({ data }) => {
        if (data) setRows(data as StatRow[])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    const from = monthsBack(period)
    return rows.filter((r) => r.month >= from && (platform === 'todas' || r.platform === platform))
  }, [rows, period, platform])

  // Serie de seguidores: suma de todas las redes por mes.
  const followerSeries = useMemo(() => {
    const byMonth = new Map<string, number>()
    for (const r of filtered) {
      byMonth.set(r.month, (byMonth.get(r.month) ?? 0) + (r.followers ?? 0))
    }
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, followers]) => ({ month, label: monthLabel(month), followers }))
  }, [filtered])

  const totalFollowers = followerSeries.at(-1)?.followers ?? 0
  const prevFollowers = followerSeries.at(-2)?.followers ?? 0
  const followerDelta = totalFollowers - prevFollowers

  // Suma de una métrica en el período.
  const sum = (key: keyof StatRow) =>
    filtered.reduce((acc, r) => acc + (Number(r[key]) || 0), 0)

  const avgEngagement = useMemo(() => {
    const vals = filtered.map((r) => r.engagement_rate).filter((v): v is number => v !== null)
    if (vals.length === 0) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }, [filtered])

  const kpis: { label: string; value: string }[] = [
    { label: 'Eng. rate promedio', value: avgEngagement === null ? '—' : `${avgEngagement.toFixed(2)}%` },
    { label: 'Likes', value: compact(sum('likes')) },
    { label: 'Comentarios', value: compact(sum('comments')) },
    { label: 'Compartidos', value: compact(sum('shares')) },
    { label: 'Guardados', value: compact(sum('saves')) },
    { label: 'Vistas', value: compact(sum('views')) },
    { label: 'Impresiones', value: compact(sum('impressions')) },
    { label: 'Alcance', value: compact(sum('reach')) },
    { label: 'Clicks', value: compact(sum('clicks')) },
  ]

  // Una fila por red, sumando todos sus meses del período.
  const breakdown = useMemo(() => {
    return PLATFORMS.map((p) => {
      const rs = filtered.filter((r) => r.platform === p.id)
      if (rs.length === 0) return null
      const agg = (key: keyof StatRow) => rs.reduce((a, r) => a + (Number(r[key]) || 0), 0)
      const engs = rs.map((r) => r.engagement_rate).filter((v): v is number => v !== null)
      return {
        ...p,
        posts: agg('posts'),
        reach: agg('reach'),
        impressions: agg('impressions'),
        likes: agg('likes'),
        comments: agg('comments'),
        shares: agg('shares'),
        saves: agg('saves'),
        views: agg('views'),
        engagement: engs.length ? engs.reduce((a, b) => a + b, 0) / engs.length : null,
      }
    }).filter((x): x is NonNullable<typeof x> => x !== null)
  }, [filtered])

  const totalPosts = breakdown.reduce((a, b) => a + b.posts, 0)

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            <BarChart3 className="h-7 w-7 text-indigo-500" />
            Métricas
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Todas tus publicaciones en un solo lugar — comparativa de plataformas y evolución mes a
            mes.
          </p>
        </div>

        <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {PERIODS.map((p) => (
            <button
              key={p.months}
              onClick={() => setPeriod(p.months)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
                period === p.months
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por red */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPlatform('todas')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            platform === 'todas'
              ? 'border-indigo-400 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
              : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
          )}
        >
          Todas
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={cn(
              'flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              platform === p.id
                ? 'border-indigo-400 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', p.dot)} />
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-zinc-400">Cargando métricas…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/15">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Todavía no hay métricas
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
            Sube tus capturas en Media Kit y la IA las convierte en números. Aparecerán aquí mes a
            mes.
          </p>
        </div>
      ) : (
        <>
          {/* Seguidores + evolución */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Users className="h-4 w-4" />
              Seguidores
              <span className="text-zinc-400">
                {platform === 'todas' ? '· todas las redes combinadas' : `· ${platform}`}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-4">
              <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {full(totalFollowers)}
              </p>
              {prevFollowers > 0 && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    followerDelta >= 0 ? 'text-emerald-600' : 'text-red-500'
                  )}
                >
                  {followerDelta >= 0 ? '+' : ''}
                  {compact(followerDelta)} vs mes anterior
                </span>
              )}
            </div>

            <div className="mt-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={followerSeries}>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                    tickFormatter={(v) => compact(Number(v))}
                    width={45}
                  />
                  <Tooltip
                    formatter={(v) => [full(Number(v)), 'Seguidores']}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e4e4e7',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="followers"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  {k.label}
                </p>
                <p className="mt-1.5 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {k.value}
                </p>
              </div>
            ))}
          </div>

          {/* Desglose por plataforma */}
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between px-6 py-4">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Desglose por plataforma
              </p>
              <span className="text-xs text-zinc-400">{totalPosts} posts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-zinc-200 text-[11px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                    <th className="px-6 py-2.5 text-left font-medium">Plataforma</th>
                    {['Posts', 'Alcance', 'Impres.', 'Likes', 'Coment.', 'Comp.', 'Guard.', 'Vistas', 'Engagement'].map(
                      (h) => (
                        <th key={h} className="px-4 py-2.5 text-right font-medium">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                    >
                      <td className="whitespace-nowrap px-6 py-3">
                        <span className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                          <span className={cn('h-2 w-2 rounded-full', b.dot)} />
                          {b.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                        {b.posts || '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                        {compact(b.reach)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                        {compact(b.impressions)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                        {compact(b.likes)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                        {compact(b.comments)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                        {compact(b.shares)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                        {compact(b.saves)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                        {compact(b.views)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                          {b.engagement === null ? '—' : `${b.engagement.toFixed(2)}%`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Plus className="h-3 w-3" />
            Los números salen de las capturas que subes en Media Kit.
          </p>
        </>
      )}
    </div>
  )
}
