'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Brand, Platform } from '@/lib/supabase'
import { PlatformBadge } from '@/components/content/platform-badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Briefcase, DollarSign, Calendar, Plus, Pencil, Trash2 } from 'lucide-react'

const PLATFORMS: Platform[] = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'LinkedIn']
const STATUSES: { value: Brand['status']; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'completado', label: 'Completado' },
]

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

const dealStatusConfig: Record<Brand['status'], { label: string; style: string; dot: string }> = {
  activo: {
    label: 'Activo',
    style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  pendiente: {
    label: 'Pendiente',
    style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  completado: {
    label: 'Completado',
    style: 'bg-zinc-200/80 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 border border-zinc-300/60 dark:border-zinc-600/30',
    dot: 'bg-zinc-400',
  },
}

type BrandForm = Omit<Brand, 'id'>

const defaultForm = (): BrandForm => ({
  name: '',
  platform: 'YouTube',
  amount: 0,
  status: 'pendiente',
  delivery_date: new Date().toISOString().split('T')[0],
})

export function BrandsView() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Brand | null>(null)
  const [form, setForm] = useState<BrandForm>(defaultForm())
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase
      .from('brands')
      .select('*')
      .order('delivery_date', { ascending: true })
      .then(({ data }) => {
        if (data) setBrands(data as Brand[])
        setLoading(false)
      })
  }, [])

  function openCreate() {
    setEditingItem(null)
    setForm(defaultForm())
    setModalOpen(true)
  }

  function openEdit(brand: Brand) {
    setEditingItem(brand)
    setForm({
      name: brand.name,
      platform: brand.platform,
      amount: brand.amount,
      status: brand.status,
      delivery_date: brand.delivery_date,
    })
    setModalOpen(true)
  }

  const set = <K extends keyof BrandForm>(k: K, v: BrandForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editingItem) {
      const { data, error } = await supabase
        .from('brands')
        .update(form)
        .eq('id', editingItem.id)
        .select()
        .single()
      if (!error && data) {
        setBrands((prev) => prev.map((b) => (b.id === data.id ? (data as Brand) : b)))
      }
    } else {
      const { data, error } = await supabase.from('brands').insert(form).select().single()
      if (!error && data) {
        setBrands((prev) => [...prev, data as Brand])
      }
    }
    setSaving(false)
    setModalOpen(false)
    setEditingItem(null)
  }

  async function handleDelete() {
    if (!deletingId) return
    setDeleting(true)
    await supabase.from('brands').delete().eq('id', deletingId)
    setBrands((prev) => prev.filter((b) => b.id !== deletingId))
    setDeletingId(null)
    setDeleting(false)
  }

  const totalActivo = brands.filter((d) => d.status === 'activo').reduce((acc, d) => acc + d.amount, 0)
  const totalCompletado = brands.filter((d) => d.status === 'completado').reduce((acc, d) => acc + d.amount, 0)

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Marcas</h1>
          <p className="text-sm text-zinc-500 mt-1">Gestiona tus acuerdos con marcas y sponsors</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Marca
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Acuerdos activos</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {brands.filter((d) => d.status === 'activo').length}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalActivo.toLocaleString()} pendiente
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Completados</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {brands.filter((d) => d.status === 'completado').length}
          </p>
          <p className="text-xs text-zinc-500 mt-1">${totalCompletado.toLocaleString()} cobrado</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Total acuerdos</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{brands.length}</p>
          <p className="text-xs text-zinc-500 mt-1">
            ${brands.reduce((acc, d) => acc + d.amount, 0).toLocaleString()} total
          </p>
        </div>
      </div>

      {/* Brand deal cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-zinc-500 text-sm">Cargando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {brands.map((deal) => {
            const statusConfig = dealStatusConfig[deal.status]
            return (
              <div
                key={deal.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{deal.name}</h3>
                      <PlatformBadge platform={deal.platform} className="mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1', statusConfig.style)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dot)} />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-zinc-500 dark:text-zinc-400">Monto:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ${deal.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-zinc-500 dark:text-zinc-400">Entrega:</span>
                    <span className="text-zinc-700 dark:text-zinc-300">{deal.delivery_date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => openEdit(deal)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(deal.id)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
          {brands.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center py-16 text-zinc-400">
              <Briefcase className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">Sin acuerdos todavía. ¡Agrega el primero!</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar marca' : 'Nueva marca'}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <Field label="Nombre de la marca">
              <input
                className={INPUT}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="TechCorp Pro"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Plataforma">
                <select
                  className={INPUT}
                  value={form.platform}
                  onChange={(e) => set('platform', e.target.value as Platform)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Estado">
                <select
                  className={INPUT}
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as Brand['status'])}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Monto ($)">
                <input
                  type="number"
                  className={INPUT}
                  value={form.amount}
                  onChange={(e) => set('amount', Number(e.target.value))}
                  min={0}
                />
              </Field>
              <Field label="Fecha de entrega">
                <input
                  type="date"
                  className={INPUT}
                  value={form.delivery_date}
                  onChange={(e) => set('delivery_date', e.target.value)}
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
              disabled={saving || !form.name.trim()}
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
              ¿Eliminar esta marca? Esta acción no se puede deshacer.
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
