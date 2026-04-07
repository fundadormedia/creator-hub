'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from 'next-themes'
import { CalendarDays, TrendingUp, Clock } from 'lucide-react'
import { MetricCard } from './metric-card'
import { PlatformBadge } from '@/components/content/platform-badge'
import { StatusBadge } from '@/components/content/status-badge'
import { supabase, transformIncomeToChart } from '@/lib/supabase'
import type { Content, Income, IncomeChartData } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DashboardView() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [content, setContent] = useState<Content[]>([])
  const [chartData, setChartData] = useState<IncomeChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('content').select('*').order('date', { ascending: false }),
      supabase.from('income').select('*'),
    ]).then(([contentRes, incomeRes]) => {
      if (contentRes.data) setContent(contentRes.data as Content[])
      if (incomeRes.data) setChartData(transformIncomeToChart(incomeRes.data as Income[]))
      setLoading(false)
    })
  }, [])

  const now = new Date()
  const dateLabel = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const publishedThisMonth = content.filter((c) => {
    const d = new Date(c.date)
    return c.status === 'publicado' && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
  }).length

  const sponsorCount = content.filter((c) => c.is_sponsor).length
  const ratioSponsor = content.length > 0 ? Math.round((sponsorCount / content.length) * 100) : 0
  const ratioOrganico = 100 - ratioSponsor

  const nextDelivery = content
    .filter((c) => c.status === 'programado')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  const recentContent = content.slice(0, 5)

  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const tickColor = isDark ? '#a1a1aa' : '#71717a'

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1 capitalize">{dateLabel}</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={CalendarDays}
          label="Publicados este mes"
          value={publishedThisMonth}
          subtitle="contenidos publicados"
          trend={12}
        />
        <MetricCard
          icon={TrendingUp}
          label="Ratio Orgánico / Sponsor"
          value={`${ratioOrganico}% / ${ratioSponsor}%`}
          subtitle="distribución de contenido"
        />
        <MetricCard
          icon={Clock}
          label="Próxima entrega"
          value={nextDelivery?.title ?? '—'}
          subtitle={nextDelivery ? `Fecha: ${nextDelivery.date}` : 'Sin entregas pendientes'}
        />
      </div>

      {/* Income Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
          Ingresos últimos 6 meses
        </h2>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 12 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#f4f4f5',
                }}
                formatter={(value) => [`$${value}`, '']}
              />
              <Legend
                wrapperStyle={{ color: tickColor, fontSize: 12, paddingTop: 16 }}
              />
              <Bar dataKey="organico" name="Orgánico" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sponsor" name="Sponsor" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="afiliados" name="Afiliados" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Contenido Reciente
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Título</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Plataforma</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Estado</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentContent.map((item) => (
              <TableRow key={item.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <TableCell className="text-zinc-800 dark:text-zinc-200 font-medium">
                  {item.title}
                </TableCell>
                <TableCell>
                  <PlatformBadge platform={item.platform} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-zinc-500 dark:text-zinc-400 text-sm">
                  {item.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
