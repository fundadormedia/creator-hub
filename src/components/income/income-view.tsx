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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { DollarSign, Plus, Pencil, Trash2 } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const SOURCES: { value: Income['source']; label: string }[] = [
  { value: 'organic', label: 'Orgánico' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'affiliate', label: 'Afiliado' },
]
const SOURCE_LABELS: Record<Income['source'], string> = {
  organic: 'Orgánico',
  sponsor: 'Sponsor',
  affiliate: 'Afiliado',
}
const SOURCE_STYLES: Record<Income['source'], string> = {
  organic: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
  sponsor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
  affiliate: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
}

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

const INPUT =
  'w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors'

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

type IncomeForm = { month: string; year: number; amount: number; source: Income['source'] }

const defaultIncomeForm = (): IncomeForm => ({
  month: 'Ene',
  year: new Date().getFullYear(),
  amount: 0,
  source: 'organic',
})

export function IncomeView() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [incomeRecords, setIncomeRecords] = useState<Income[]>([])
  const [chartData, setChartData] = useState<IncomeChartData[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Income | null>(null)
  const [form, setForm] = useState<IncomeForm>(defaultIncomeForm())
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('income').select('*'),
      supabase.from('brands').select('*').order('delivery_date', { ascending: true }),
    ]).then(([incomeRes, brandsRes]) => {
      if (incomeRes.data) {
        const records = incomeRes.data as Income[]
        setIncomeRecords(records)
        setChartData(transformIncomeToChart(records))
      }
      if (brandsRes.data) setBrands(brandsRes.data as Brand[])
      setLoading(false)
    })
  }, [])

  function openCreate() {
    setEditingItem(null)
    setForm(defaultIncomeForm())
    setModalOpen(true)
  }

  function openEdit(item: Income) {
    setEditingItem(item)
    setForm({ month: item.month, year: item.year, amount: item.amount, source: item.source })
    setModalOpen(true)
  }

  const set = <K extends keyof IncomeForm>(k: K, v: IncomeForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  async function handleSave() {
    setSaving(true)
    if (editingItem) {
      const { data, error } = await supabase
        .from('income')
        .update(form)
        .eq('id', editingItem.id)
        .select()
        .single()
      if (!error && data) {
        const updated = incomeRecords.map((r) => (r.id === data.id ? (data as Income) : r))
        setIncomeRecords(updated)
        setChartData(transformIncomeToChart(updated))
      }
    } else {
      const { data, error } = await supabase.from('income').insert(form).select().single()
      if (!error && data) {
        const updated = [...incomeRecords, data as Income]
        setIncomeRecords(updated)
        setChartData(transformIncomeToChart(updated))
      }
    }
    setSaving(false)
    setModalOpen(false)
    setEditingItem(null)
  }

  async function handleDelete() {
    if (!deletingId) return
    setDeleting(true)
    await supabase.from('income').delete().eq('id', deletingId)
    const updated = incomeRecords.filter((r) => r.id !== deletingId)
    setIncomeRecords(updated)
    setChartData(transformIncomeToChart(updated))
    setDeletingId(null)
    setDeleting(false)
  }

  const totalIngresos = chartData.reduce(
    (acc, item) => acc + item.organico + item.sponsor + item.afiliados,
    0
  )
  const lastMonth = chartData[chartData.length - 1]
  const lastMonthTotal = lastMonth ? lastMonth.organico + lastMonth.sponsor + lastMonth.afiliados : 0

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
          label="Total acumulado"
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
          subtitle="por mes"
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
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5' }}
                formatter={(value) => [`$${value}`, '']}
              />
              <Legend wrapperStyle={{ color: tickColor, fontSize: 12, paddingTop: 16 }} />
              <Line type="monotone" dataKey="organico" name="Orgánico" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              <Line type="monotone" dataKey="sponsor" name="Sponsor" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
              <Line type="monotone" dataKey="afiliados" name="Afiliados" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income records table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Registros de ingresos</h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo ingreso
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Mes</th>
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Año</th>
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Fuente</th>
                <th className="text-right px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Monto</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {incomeRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 group"
                >
                  <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300">{record.month}</td>
                  <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300">{record.year}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_STYLES[record.source]}`}>
                      {SOURCE_LABELS[record.source]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    ${record.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(record)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(record.id)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <td className="px-6 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">${deal.amount.toLocaleString()}</td>
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

      {/* Add / Edit income modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar ingreso' : 'Nuevo ingreso'}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Mes">
                <select className={INPUT} value={form.month} onChange={(e) => set('month', e.target.value)}>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Año">
                <input
                  type="number"
                  className={INPUT}
                  value={form.year}
                  onChange={(e) => set('year', Number(e.target.value))}
                  min={2020}
                  max={2030}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fuente">
                <select
                  className={INPUT}
                  value={form.source}
                  onChange={(e) => set('source', e.target.value as Income['source'])}
                >
                  {SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Monto ($)">
                <input
                  type="number"
                  className={INPUT}
                  value={form.amount}
                  onChange={(e) => set('amount', Number(e.target.value))}
                  min={0}
                />
              </Field>
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {saving ? 'Guardando...' : editingItem ? 'Guardar cambios' : 'Crear'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              ¿Eliminar este registro de ingreso? Esta acción no se puede deshacer.
            </p>
          </DialogBody>
          <DialogFooter>
            <button
              onClick={() => setDeletingId(null)}
              className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
