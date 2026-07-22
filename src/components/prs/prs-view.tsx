'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Plus, Gift, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors'

interface PrPackage {
  id: string
  brand_name: string
  received_date: string
  product_description: string | null
  notes: string | null
  posted: boolean
  posted_url: string | null
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
      {children}
    </div>
  )
}

const today = () => new Date().toISOString().slice(0, 10)

export function PrsView() {
  const [items, setItems] = useState<PrPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    brand_name: '',
    received_date: today(),
    product_description: '',
    notes: '',
  })

  useEffect(() => {
    supabase
      .from('pr_packages')
      .select('*')
      .order('received_date', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data as PrPackage[])
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    if (!form.brand_name.trim()) {
      setError('Ponle el nombre de la marca.')
      return
    }
    setSaving(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('pr_packages')
      .insert({
        brand_name: form.brand_name.trim(),
        received_date: form.received_date,
        product_description: form.product_description.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select()
      .single()

    setSaving(false)
    if (err || !data) {
      setError(err?.message ?? 'No se pudo registrar el PR.')
      return
    }
    setItems((prev) => [data as PrPackage, ...prev])
    setModalOpen(false)
    setForm({ brand_name: '', received_date: today(), product_description: '', notes: '' })
  }

  async function togglePosted(pr: PrPackage) {
    const posted = !pr.posted
    await supabase.from('pr_packages').update({ posted }).eq('id', pr.id)
    setItems((prev) => prev.map((p) => (p.id === pr.id ? { ...p, posted } : p)))
  }

  async function handleDelete() {
    if (!deletingId) return
    await supabase.from('pr_packages').delete().eq('id', deletingId)
    setItems((prev) => prev.filter((p) => p.id !== deletingId))
    setDeletingId(null)
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">PRs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Productos que las marcas te mandaron y dónde los publicaste.
          </p>
        </div>
        <button
          onClick={() => {
            setError(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" />
          Registrar PR
        </button>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-zinc-400">Cargando…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <Gift className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            Aquí vas a trackear los PRs que te manden las marcas
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Registra cada paquete y marca si publicaste algo orgánico.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((pr) => (
            <div
              key={pr.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{pr.brand_name}</h3>
                  <span className="text-xs text-zinc-400">{pr.received_date}</span>
                </div>
                {pr.product_description && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {pr.product_description}
                  </p>
                )}
                {pr.notes && <p className="mt-1 text-sm text-zinc-500">{pr.notes}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => togglePosted(pr)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors',
                    pr.posted
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                  )}
                >
                  {pr.posted && <Check className="h-3 w-3" />}
                  {pr.posted ? 'Publicado' : 'Sin publicar'}
                </button>
                <button
                  onClick={() => setDeletingId(pr.id)}
                  className="text-zinc-400 transition-colors hover:text-red-500"
                  aria-label="Eliminar PR"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo PR</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <Field label="Marca">
                <input
                  value={form.brand_name}
                  onChange={(e) => setForm((p) => ({ ...p, brand_name: e.target.value }))}
                  placeholder="Ej: Nike, Sephora, Coca-Cola…"
                  className={INPUT}
                />
              </Field>
              <Field label="Fecha de recepción">
                <input
                  type="date"
                  value={form.received_date}
                  onChange={(e) => setForm((p) => ({ ...p, received_date: e.target.value }))}
                  className={INPUT}
                />
              </Field>
              <Field label="Descripción del producto (opcional)">
                <textarea
                  rows={2}
                  value={form.product_description}
                  onChange={(e) => setForm((p) => ({ ...p, product_description: e.target.value }))}
                  placeholder="Ej: Kit de skincare, 3 productos…"
                  className={cn(INPUT, 'resize-none')}
                />
              </Field>
              <Field label="Notas (opcional)">
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Detalles adicionales, contacto de la marca, etc."
                  className={cn(INPUT, 'resize-none')}
                />
              </Field>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Registrar PR'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deletingId !== null} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este PR?</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-zinc-500">No se puede deshacer.</p>
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
