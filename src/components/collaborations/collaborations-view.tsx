'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  DELIVERABLE_LABELS,
  type Collaboration,
  type CollaborationInstallment,
  type CollaborationDeliverable,
  type CollabStatus,
  type DeliverableFormat,
} from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Plus,
  Briefcase,
  Trash2,
  Minus,
  Repeat,
  Lock,
  Check,
  ChevronLeft,
  Search,
  Film,
  Image as ImageIcon,
  Camera,
  Music2,
  Play,
  Video,
  CalendarHeart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors'

const STATUSES: {
  id: CollabStatus
  label: string
  pill: string
  selected: string
}[] = [
  {
    id: 'pendiente',
    label: 'Pendiente',
    pill: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    selected: 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-zinc-950',
  },
  {
    id: 'activa',
    label: 'Activa',
    pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    selected: 'ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-zinc-950',
  },
  {
    id: 'completada',
    label: 'Completada',
    pill: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    selected: 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-zinc-950',
  },
]

const PAYMENT_TERMS = [15, 30, 45, 60, 90]
const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 6]

// Cada formato con su icono y color de marca, como en la referencia.
const FORMAT_META: Record<
  DeliverableFormat,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  reel: { icon: Film, color: 'text-pink-500' },
  story: { icon: Camera, color: 'text-pink-500' },
  post: { icon: ImageIcon, color: 'text-pink-500' },
  tiktok: { icon: Music2, color: 'text-zinc-900 dark:text-zinc-100' },
  yt_short: { icon: Play, color: 'text-red-500' },
  yt_video: { icon: Video, color: 'text-red-500' },
  evento: { icon: CalendarHeart, color: 'text-indigo-500' },
}
const FORMATS = Object.keys(DELIVERABLE_LABELS) as DeliverableFormat[]

type Tab = 'activas' | 'cobro' | 'historial'

interface FullCollab extends Collaboration {
  installments: CollaborationInstallment[]
  deliverables: CollaborationDeliverable[]
}

interface FormState {
  brand_name: string
  status: CollabStatus
  total_amount: string
  is_barter: boolean
  close_month: string
  payment_terms_days: number
  has_exclusivity: boolean
  notes: string
  installmentCount: number
  installments: { amount: string; due_date: string }[]
  deliverables: Record<DeliverableFormat, number>
}

function emptyForm(): FormState {
  return {
    brand_name: '',
    status: 'pendiente',
    total_amount: '',
    is_barter: false,
    close_month: '',
    payment_terms_days: 30,
    has_exclusivity: false,
    notes: '',
    installmentCount: 1,
    installments: [{ amount: '', due_date: '' }],
    deliverables: FORMATS.reduce(
      (acc, f) => ({ ...acc, [f]: 0 }),
      {} as Record<DeliverableFormat, number>
    ),
  }
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{children}</p>
      {hint && <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>}
    </div>
  )
}

const money = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('es', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

export function CollaborationsView() {
  const [collabs, setCollabs] = useState<FullCollab[]>([])
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<'lista' | 'nueva'>('lista')
  const [tab, setTab] = useState<Tab>('activas')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    const [c, i, d] = await Promise.all([
      supabase.from('collaborations').select('*').order('created_at', { ascending: false }),
      supabase.from('collaboration_installments').select('*').order('sequence'),
      supabase.from('collaboration_deliverables').select('*'),
    ])
    const installments = (i.data ?? []) as CollaborationInstallment[]
    const deliverables = (d.data ?? []) as CollaborationDeliverable[]
    setCollabs(
      ((c.data ?? []) as Collaboration[]).map((col) => ({
        ...col,
        installments: installments.filter((x) => x.collaboration_id === col.id),
        deliverables: deliverables.filter((x) => x.collaboration_id === col.id),
      }))
    )
    setLoading(false)
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  function setInstallmentCount(n: number) {
    const total = parseFloat(form.total_amount) || 0
    const each = total > 0 ? (total / n).toFixed(2) : ''
    setForm((p) => ({
      ...p,
      installmentCount: n,
      installments: Array.from({ length: n }, (_, idx) => ({
        amount: each,
        due_date: p.installments[idx]?.due_date ?? '',
      })),
    }))
  }

  function bumpDeliverable(f: DeliverableFormat, delta: number) {
    setForm((p) => ({
      ...p,
      deliverables: { ...p.deliverables, [f]: Math.max(0, p.deliverables[f] + delta) },
    }))
  }

  function openNew() {
    setForm(emptyForm())
    setError(null)
    setScreen('nueva')
  }

  async function handleSave() {
    if (!form.brand_name.trim()) {
      setError('Ponle el nombre de la marca.')
      return
    }
    setSaving(true)
    setError(null)

    const { data: collab, error: collabError } = await supabase
      .from('collaborations')
      .insert({
        brand_name: form.brand_name.trim(),
        status: form.status,
        total_amount: parseFloat(form.total_amount) || 0,
        is_barter: form.is_barter,
        close_month: form.close_month || null,
        payment_terms_days: form.payment_terms_days,
        has_exclusivity: form.has_exclusivity,
        notes: form.notes.trim() || null,
      })
      .select()
      .single()

    if (collabError || !collab) {
      setError(collabError?.message ?? 'No se pudo guardar la colaboración.')
      setSaving(false)
      return
    }

    const rows = form.installments.map((inst, idx) => ({
      collaboration_id: collab.id,
      sequence: idx + 1,
      amount: parseFloat(inst.amount) || 0,
      due_date: inst.due_date || null,
    }))
    if (rows.length > 0) await supabase.from('collaboration_installments').insert(rows)

    const deliverableRows = FORMATS.filter((f) => form.deliverables[f] > 0).map((f) => ({
      collaboration_id: collab.id,
      format: f,
      quantity: form.deliverables[f],
    }))
    if (deliverableRows.length > 0)
      await supabase.from('collaboration_deliverables').insert(deliverableRows)

    setSaving(false)
    setScreen('lista')
    void load()
  }

  async function handleDelete() {
    if (!deletingId) return
    await supabase.from('collaborations').delete().eq('id', deletingId)
    setCollabs((prev) => prev.filter((c) => c.id !== deletingId))
    setDeletingId(null)
  }

  async function togglePaid(inst: CollaborationInstallment) {
    const paid_at = inst.paid_at ? null : new Date().toISOString().slice(0, 10)
    await supabase.from('collaboration_installments').update({ paid_at }).eq('id', inst.id)
    setCollabs((prev) =>
      prev.map((c) => ({
        ...c,
        installments: c.installments.map((i) => (i.id === inst.id ? { ...i, paid_at } : i)),
      }))
    )
  }

  const totalPiezas = FORMATS.reduce((acc, f) => acc + form.deliverables[f], 0)

  // ============ PANTALLA: NUEVA COLABORACIÓN ============
  if (screen === 'nueva') {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <button
          onClick={() => setScreen('lista')}
          className="mb-4 flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Nueva colaboración</h1>

        <div className="mt-8 space-y-8">
          {/* Marca — el input es el título de la pantalla */}
          <div>
            <input
              value={form.brand_name}
              onChange={(e) => set('brand_name', e.target.value)}
              placeholder="Nombre de la marca"
              className="w-full border-0 bg-transparent p-0 text-4xl font-bold tracking-tight text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-700"
            />
            <p className="mt-1 text-sm text-zinc-400">
              El nombre de la marca con la que estás colaborando.
            </p>
          </div>

          {/* Estado */}
          <div>
            <Label>Estado</Label>
            <div className="flex flex-wrap gap-3">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => set('status', s.id)}
                  className={cn(
                    'rounded-full px-5 py-2 text-sm font-medium transition-all',
                    s.pill,
                    form.status === s.id ? s.selected : 'opacity-60 hover:opacity-100'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cobro */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Cobro</p>
              <button
                onClick={() => set('is_barter', !form.is_barter)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                  form.is_barter
                    ? 'border-indigo-400 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-zinc-200 text-zinc-500 hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-800'
                )}
              >
                <Repeat className="h-3.5 w-3.5" />
                Intercambio
              </button>
            </div>

            <Label>Monto total a cobrar</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-400">$</span>
              <input
                type="number"
                value={form.total_amount}
                onChange={(e) => set('total_amount', e.target.value)}
                placeholder="0"
                className={cn(INPUT, 'py-3 pl-9 text-lg font-semibold')}
              />
            </div>

            <div className="mt-6">
              <Label>Número de cuotas</Label>
              <div className="flex gap-2 rounded-xl border border-zinc-200 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-900">
                {INSTALLMENT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setInstallmentCount(n)}
                    className={cn(
                      'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                      form.installmentCount === n
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {form.installmentCount === 1
                  ? 'Pago único. Si quieres puedes cargar la fecha estimada.'
                  : `El total se repartió en ${form.installmentCount} cuotas iguales — ajústalas si hace falta.`}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {form.installments.map((inst, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <p className="mb-3 text-xs font-medium text-zinc-400">
                    Cuota {idx + 1} / {form.installmentCount}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Monto
                      </p>
                      <input
                        type="number"
                        value={inst.amount}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            installments: p.installments.map((x, i) =>
                              i === idx ? { ...x, amount: e.target.value } : x
                            ),
                          }))
                        }
                        placeholder="$"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Fecha estimada
                      </p>
                      <input
                        type="date"
                        value={inst.due_date}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            installments: p.installments.map((x, i) =>
                              i === idx ? { ...x, due_date: e.target.value } : x
                            ),
                          }))
                        }
                        className={INPUT}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mes de cierre + días de pago */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label hint="Usado en estadísticas de ingresos.">Mes de cierre del trato</Label>
              <input
                type="month"
                value={form.close_month}
                onChange={(e) => set('close_month', e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <Label hint="Días hábiles después del último entregable publicado.">
                Días de pago
              </Label>
              <div className="flex gap-2 rounded-xl border border-zinc-200 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-900">
                {PAYMENT_TERMS.map((d) => (
                  <button
                    key={d}
                    onClick={() => set('payment_terms_days', d)}
                    className={cn(
                      'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                      form.payment_terms_days === d
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Entregables */}
          <div>
            <div className="mb-2 flex items-end justify-between">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Contenidos a entregar
              </p>
              <span className="text-xs text-zinc-400">
                {totalPiezas} {totalPiezas === 1 ? 'pieza' : 'piezas'}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {FORMATS.map((f) => {
                const meta = FORMAT_META[f]
                const Icon = meta.icon
                const value = form.deliverables[f]
                return (
                  <div
                    key={f}
                    className={cn(
                      'flex items-center justify-between rounded-xl border px-4 py-3 transition-colors',
                      value > 0
                        ? 'border-indigo-300 bg-indigo-50/50 dark:border-indigo-500/30 dark:bg-indigo-500/5'
                        : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Icon className={cn('h-4 w-4 shrink-0', meta.color)} />
                      <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {DELIVERABLE_LABELS[f]}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <button
                        onClick={() => bumpDeliverable(f, -1)}
                        className="text-zinc-300 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                        aria-label={`Quitar ${DELIVERABLE_LABELS[f]}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-4 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {value}
                      </span>
                      <button
                        onClick={() => bumpDeliverable(f, 1)}
                        className="rounded-full bg-indigo-500 p-1.5 text-white transition-colors hover:bg-indigo-600"
                        aria-label={`Agregar ${DELIVERABLE_LABELS[f]}`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </span>
                  </div>
                )
              })}
            </div>
            {totalPiezas === 0 && (
              <div className="mt-3 rounded-xl border border-dashed border-zinc-300 py-6 text-center text-sm text-zinc-400 dark:border-zinc-700">
                Suma contenidos con los botones +.
              </div>
            )}
          </div>

          {/* Exclusividad */}
          <label
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors',
              form.has_exclusivity
                ? 'border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'
                : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
            )}
          >
            <input
              type="checkbox"
              checked={form.has_exclusivity}
              onChange={(e) => set('has_exclusivity', e.target.checked)}
              className="h-4 w-4 rounded accent-amber-500"
            />
            <Lock className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              La campaña tiene cláusula de exclusividad
            </span>
          </label>

          {/* Notas */}
          <div>
            <Label>Notas internas</Label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={4}
              placeholder="Recordatorios, condiciones especiales, contactos…"
              className={cn(INPUT, 'resize-none')}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pb-8">
            <button
              onClick={() => setScreen('lista')}
              className="rounded-xl px-5 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar colaboración'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============ PANTALLA: LISTA ============
  const hasPending = (c: FullCollab) => c.installments.some((i) => !i.paid_at)
  const filtered = collabs.filter((c) => {
    if (search && !c.brand_name.toLowerCase().includes(search.toLowerCase())) return false
    if (tab === 'activas') return c.status === 'pendiente' || c.status === 'activa'
    if (tab === 'cobro') return c.status === 'completada' && hasPending(c)
    return c.status === 'completada' && !hasPending(c)
  })

  const counts = {
    activas: collabs.filter((c) => c.status === 'pendiente' || c.status === 'activa').length,
    cobro: collabs.filter((c) => c.status === 'completada' && hasPending(c)).length,
    historial: collabs.filter((c) => c.status === 'completada' && !hasPending(c)).length,
  }

  const porCobrar = collabs
    .flatMap((c) => c.installments.filter((i) => !i.paid_at))
    .reduce((acc, i) => acc + Number(i.amount), 0)

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Colaboraciones
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Una ficha por marca con todo lo importante.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" />
          Nueva
        </button>
      </div>

      {porCobrar > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-5 py-4 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-orange-500/5">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Por cobrar</p>
          <p className="mt-1 text-3xl font-bold text-amber-900 dark:text-amber-300">
            {money(porCobrar)}
          </p>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar por marca…"
          className={cn(INPUT, 'pl-10')}
        />
      </div>

      <div className="flex w-fit gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {([
          ['activas', 'Activas', counts.activas],
          ['cobro', 'En cobro', counts.cobro],
          ['historial', 'Historial', counts.historial],
        ] as const).map(([id, label, n]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              tab === id
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            {label} <span className="text-zinc-400">({n})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-zinc-400">Cargando…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/15">
            <Briefcase className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Aquí vas a gestionar todos tus deals con marcas
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Cuando crees una colaboración va a aparecer aquí.
          </p>
          <button
            onClick={openNew}
            className="mt-5 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            Nueva colaboración
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const status = STATUSES.find((s) => s.id === c.status)!
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {c.brand_name}
                      </h3>
                      <span
                        className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', status.pill)}
                      >
                        {status.label}
                      </span>
                      {c.is_barter && (
                        <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          <Repeat className="h-3 w-3" /> Canje
                        </span>
                      )}
                      {c.has_exclusivity && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                          <Lock className="h-3 w-3" /> Exclusividad
                        </span>
                      )}
                    </div>

                    {c.deliverables.length > 0 && (
                      <p className="mt-2 text-sm text-zinc-500">
                        {c.deliverables
                          .map((d) => `${d.quantity} ${DELIVERABLE_LABELS[d.format]}`)
                          .join(' · ')}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-zinc-400">
                      Cobro a {c.payment_terms_days} días hábiles
                      {c.close_month && ` · cierra en ${c.close_month}`}
                    </p>

                    {c.installments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {c.installments.map((i) => (
                          <button
                            key={i.id}
                            onClick={() => togglePaid(i)}
                            title={i.paid_at ? 'Marcar como no cobrada' : 'Marcar como cobrada'}
                            className={cn(
                              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors',
                              i.paid_at
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                            )}
                          >
                            {i.paid_at && <Check className="h-3 w-3" />}
                            Cuota {i.sequence}: {money(Number(i.amount), c.currency)}
                            {i.due_date && !i.paid_at && (
                              <span className="text-zinc-400">· {i.due_date}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {c.notes && (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-500">{c.notes}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {money(Number(c.total_amount), c.currency)}
                    </span>
                    <button
                      onClick={() => setDeletingId(c.id)}
                      className="text-zinc-400 transition-colors hover:text-red-500"
                      aria-label="Eliminar colaboración"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={deletingId !== null} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta colaboración?</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-zinc-500">
              Se borran también sus cuotas y entregables. No se puede deshacer.
            </p>
          </DialogBody>
          <DialogFooter>
            <button
              onClick={() => setDeletingId(null)}
              className="rounded-lg px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
