'use client'

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useTheme } from 'next-themes'
import {
  Users,
  TrendingUp,
  Eye,
  FileVideo,
  Share2,
  ExternalLink,
  Mail,
  PlaySquare,
  Camera,
  Hash,
  Music2,
  Briefcase,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { brandDeals } from '@/lib/mock-data'

// ─── Mock data ────────────────────────────────────────────────────────────────

const creadorInfo = {
  nombre: 'Carlos Rodríguez',
  iniciales: 'CR',
  bio: 'Creador de contenido sobre tecnología, productividad y emprendimiento digital. Ayudo a profesionales a construir su marca personal en internet.',
  nicho: 'Tecnología & Productividad',
  email: 'hola@carlosrodriguez.dev',
  ubicacion: 'Madrid, España',
}

const metricas = [
  { label: 'Seguidores totales', valor: '634K', icono: Users, color: 'text-indigo-500' },
  { label: 'Engagement promedio', valor: '5.8%', icono: TrendingUp, color: 'text-emerald-500' },
  { label: 'Alcance mensual', valor: '2.1M', icono: Eye, color: 'text-violet-500' },
  { label: 'Contenidos publicados', valor: '87', icono: FileVideo, color: 'text-amber-500' },
]

const mesesCortos = ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene']

const plataformas = [
  {
    id: 'youtube',
    nombre: 'YouTube',
    icono: PlaySquare,
    color: '#ef4444',
    seguidores: '210K',
    engagement: '4.2%',
    crecimiento: '+1.8K / mes',
    grafico: [
      { mes: 'Ago', val: 195000 },
      { mes: 'Sep', val: 198000 },
      { mes: 'Oct', val: 201000 },
      { mes: 'Nov', val: 204500 },
      { mes: 'Dic', val: 207000 },
      { mes: 'Ene', val: 210000 },
    ],
  },
  {
    id: 'instagram',
    nombre: 'Instagram',
    icono: Camera,
    color: '#ec4899',
    seguidores: '185K',
    engagement: '7.1%',
    crecimiento: '+2.3K / mes',
    grafico: [
      { mes: 'Ago', val: 171000 },
      { mes: 'Sep', val: 174000 },
      { mes: 'Oct', val: 177000 },
      { mes: 'Nov', val: 180000 },
      { mes: 'Dic', val: 182500 },
      { mes: 'Ene', val: 185000 },
    ],
  },
  {
    id: 'tiktok',
    nombre: 'TikTok',
    icono: Music2,
    color: '#06b6d4',
    seguidores: '198K',
    engagement: '8.4%',
    crecimiento: '+4.1K / mes',
    grafico: [
      { mes: 'Ago', val: 173000 },
      { mes: 'Sep', val: 179000 },
      { mes: 'Oct', val: 184000 },
      { mes: 'Nov', val: 190000 },
      { mes: 'Dic', val: 194000 },
      { mes: 'Ene', val: 198000 },
    ],
  },
  {
    id: 'twitter',
    nombre: 'Twitter / X',
    icono: Hash,
    color: '#6366f1',
    seguidores: '41K',
    engagement: '3.6%',
    crecimiento: '+680 / mes',
    grafico: [
      { mes: 'Ago', val: 37000 },
      { mes: 'Sep', val: 37800 },
      { mes: 'Oct', val: 38500 },
      { mes: 'Nov', val: 39400 },
      { mes: 'Dic', val: 40200 },
      { mes: 'Ene', val: 41000 },
    ],
  },
]

const audienciaEdad = [
  { rango: '18-24', porcentaje: 28, color: '#6366f1' },
  { rango: '25-34', porcentaje: 42, color: '#8b5cf6' },
  { rango: '35-44', porcentaje: 20, color: '#06b6d4' },
  { rango: '45+', porcentaje: 10, color: '#10b981' },
]

const audienciaGenero = [
  { tipo: 'Masculino', porcentaje: 62, color: '#6366f1' },
  { tipo: 'Femenino', porcentaje: 35, color: '#ec4899' },
  { tipo: 'Otro', porcentaje: 3, color: '#a1a1aa' },
]

const contenidosDestacados = [
  {
    id: '1',
    titulo: '5 herramientas de IA que uso cada día',
    plataforma: 'TikTok',
    vistas: '320K',
    likes: '28K',
    color: '#06b6d4',
  },
  {
    id: '2',
    titulo: 'Cómo aprendí TypeScript en 30 días',
    plataforma: 'YouTube',
    vistas: '45.2K',
    likes: '2.1K',
    color: '#ef4444',
  },
  {
    id: '3',
    titulo: 'Top 10 libros de finanzas personales',
    plataforma: 'TikTok',
    vistas: '215K',
    likes: '18.5K',
    color: '#06b6d4',
  },
  {
    id: '4',
    titulo: 'Mi rutina matutina de productividad',
    plataforma: 'Instagram',
    vistas: '128K',
    likes: '9.8K',
    color: '#ec4899',
  },
]

// ─── Custom tooltip para donuts ───────────────────────────────────────────────

const DonutTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 shadow-xl">
        <span className="font-medium">{payload[0].name}</span>
        <span className="ml-2 text-zinc-400">{payload[0].value}%</span>
      </div>
    )
  }
  return null
}

// ─── Platform icon helper ─────────────────────────────────────────────────────

function platformColor(plataforma: string) {
  const map: Record<string, string> = {
    TikTok: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30',
    YouTube: 'bg-red-500/15 text-red-500 border-red-500/30',
    Instagram: 'bg-pink-500/15 text-pink-500 border-pink-500/30',
    Twitter: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30',
    'Twitter / X': 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30',
  }
  return map[plataforma] ?? 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30'
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MediaKitView() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const lineColor = isDark ? '#52525b' : '#d4d4d8'

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="w-20 h-20 shrink-0">
            <AvatarFallback className="bg-indigo-500 text-white text-2xl font-bold">
              {creadorInfo.iniciales}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {creadorInfo.nombre}
              </h1>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                {creadorInfo.nicho}
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2 max-w-xl">
              {creadorInfo.bio}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{creadorInfo.ubicacion}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors shrink-0">
            <Share2 className="w-4 h-4" />
            Compartir Media Kit
          </button>
        </div>
      </div>

      {/* ── Métricas destacadas ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricas.map((m) => {
          const Icon = m.icono
          return (
            <div
              key={m.label}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${m.color}`} />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{m.label}</span>
              </div>
              <p className={`text-2xl font-bold ${m.color}`}>{m.valor}</p>
            </div>
          )
        })}
      </div>

      {/* ── Plataformas ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Plataformas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plataformas.map((p) => {
            const Icon = p.icono
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: p.color }} />
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {p.nombre}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{p.crecimiento}</span>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{p.seguidores}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">seguidores</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold" style={{ color: p.color }}>{p.engagement}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">engagement rate</p>
                    </div>
                  </div>
                  <div style={{ width: 120, height: 56 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={p.grafico}>
                        <Line
                          type="monotone"
                          dataKey="val"
                          stroke={p.color}
                          strokeWidth={2}
                          dot={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '6px',
                            color: '#f4f4f5',
                            fontSize: 11,
                          }}
                          formatter={(v) => {
                            const n = Number(v)
                            return [n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n, 'Seguidores'] as [string | number, string]
                          }}
                          labelFormatter={(l) => mesesCortos[l] ?? l}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Distribución de audiencia ────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Distribución de audiencia
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Edad */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">Por edad</p>
            <div className="flex items-center gap-6">
              <div style={{ width: 140, height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={audienciaEdad}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={60}
                      dataKey="porcentaje"
                      nameKey="rango"
                      strokeWidth={0}
                    >
                      {audienciaEdad.map((e) => (
                        <Cell key={e.rango} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {audienciaEdad.map((e) => (
                  <div key={e.rango} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">{e.rango}</span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{e.porcentaje}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Género */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">Por género</p>
            <div className="flex items-center gap-6">
              <div style={{ width: 140, height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={audienciaGenero}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={60}
                      dataKey="porcentaje"
                      nameKey="tipo"
                      strokeWidth={0}
                    >
                      {audienciaGenero.map((g) => (
                        <Cell key={g.tipo} fill={g.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {audienciaGenero.map((g) => (
                  <div key={g.tipo} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">{g.tipo}</span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{g.porcentaje}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Últimos contenidos destacados ───────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Últimos contenidos destacados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contenidosDestacados.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden group"
            >
              {/* Thumbnail placeholder */}
              <div
                className="h-28 flex items-center justify-center"
                style={{ backgroundColor: `${c.color}18` }}
              >
                <FileVideo className="w-8 h-8 opacity-40" style={{ color: c.color }} />
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug">
                  {c.titulo}
                </p>
                <span
                  className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${platformColor(c.plataforma)}`}
                >
                  {c.plataforma}
                </span>
                <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />{c.vistas}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />{c.likes}
                  </span>
                  <a
                    href="#"
                    className="text-indigo-500 hover:text-indigo-400 transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marcas con las que he trabajado ─────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Marcas con las que he trabajado
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex flex-wrap gap-3">
            {brandDeals.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-indigo-500/40 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{b.marca}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{b.plataforma}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Mail className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Contacto para colaboraciones</p>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{creadorInfo.email}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Mail className="w-4 h-4" />
          Contactar para colaboración
        </button>
      </div>

    </div>
  )
}
