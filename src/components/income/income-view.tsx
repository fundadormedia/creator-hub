'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from 'next-themes'
import { supabase, transformIncomeToChart } from '@/lib/supabase'
import type { Income, Brand, IncomeChartData } from '@/lib/supabase'
import { DollarSign } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'

const dealStatusStyles: Record<string, string> = {
  activo: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  pendiente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  completado: 'bg-zinc-200/80 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 border border-zinc-300/60 dark:border-zinc-600/30',
}

const dealStatusLabels: Record<string, string> = {
  activo: 'Activo',
  pendiente: 'Pendiente',
  completado: 'Completado',
}

export function IncomeView() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [chartData, setChartData] = useState<IncomeChartData[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('income').select('*'),
      supabase.from('brands').select('*').order('delivery_date', { ascending: true }),
    ]).then(([incomeRes, brandsRes]) => {
      if (incomeRes.data) setChartData(transformIncomeToChart(incomeRes.data as Income[]))
      if (brandsRes.data) setBrands(brandsRes.data as Brand[])
      setLoading(false)
    })
  }, [])

  const totalIngresos = chartData.reduce(
    (acc, item) => acc + item.organico + item.sponsor + item.afiliados,
    0
  )
  const lastMonth = chartData[chartData.length - 1]
  const lastMonthTotal = lastMonth
    ? lastMonth.organico + lastMonth.sponsor + lastMonth.afiliados
    : 0

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
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Ingresos</h1>
        <p className="text-sm text-zinc-500 mt-1">Seguimiento de tu monetización</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={DollarSign}
          label="Total acumulado (6 meses)"
          value={`$${totalIngresos.toLocaleString()}`}
          trend={8}
        />
        <MetricCard
          icon={DollarSign}
          label="Ingresos este mes"
          value={`$${lastMonthTotal.toLocaleString()}`}
          subtitle={lastMonth?.mes ?? '—'}
        />
        <MetricCard
          icon={DollarSign}
          label="Promedio mensual"
          value={`$${chartData.length > 0 ? Math.round(totalIngresos / chartData.length).toLocaleString() : 0}`}
          subtitle="últimos 6 meses"
        />
      </div>

      {/* Line Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
          Evolución de ingresos
        </h2>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
              <Legend wrapperStyle={{ color: tickColor, fontSize: 12, paddingTop: 16 }} />
              <Line
                type="monotone"
                dataKey="organico"
                name="Orgánico"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="sponsor"
                name="Sponsor"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="afiliados"
                name="Afiliados"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Brand deals table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Acuerdos de marca</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Marca</th>
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Monto</th>
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Estado</th>
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Entrega</th>
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Plataforma</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((deal) => (
                <tr key={deal.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-6 py-3 text-zinc-800 dark:text-zinc-200 font-medium">{deal.name}</td>
                  <td className="px-6 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    ${deal.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${dealStatusStyles[deal.status]}`}>
                      {dealStatusLabels[deal.status]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-zinc-500 dark:text-zinc-400">{deal.delivery_date}</td>
                  <td className="px-6 py-3 text-zinc-500 dark:text-zinc-400">{deal.platform}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
