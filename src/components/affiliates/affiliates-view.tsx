'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Affiliate } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Link2, TrendingUp, Plus, Pencil, Trash2 } from 'lucide-react'

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

type AffiliateForm = Omit<Affiliate, 'id'>

const defaultForm = (): AffiliateForm => ({
  name: '',
  status: 'activo',
  clicks: 0,
  conversions: 0,
  commission: '',
  total_earned: 0,
})

export function AffiliatesView() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Affiliate | null>(null)
  const [form, setForm] = useState<AffiliateForm>(defaultForm())
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase
      .from('affiliates')
      .select('*')
      .order('total_earned', { ascending: false })
      .then(({ data }) => {
        if (data) setAffiliates(data as Affiliate[])
        setLoading(false)
      })
  }, [])

  function openCreate() {
    setEditingItem(null)
    setForm(defaultForm())
    setModalOpen(true)
  }

  function openEdit(affiliate: Affiliate) {
    setEditingItem(affiliate)
    setForm({
      name: affiliate.name,
      status: affiliate.status,
      clicks: affiliate.clicks,
      conversions: affiliate.conversions,
      commission: affiliate.commission,
      total_earned: affiliate.total_earned,
    })
    setModalOpen(true)
  }

  const set = <K extends keyof AffiliateForm>(k: K, v: AffiliateForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editingItem) {
      const { data, error } = await supabase
        .from('affiliates')
        .update(form)
        .eq('id', editingItem.id)
        .select()
        .single()
      if (!error && data) {
        setAffiliates((prev) => prev.map((a) => (a.id === data.id ? (data as Affiliate) : a)))
      }
    } else {
      const { data, error } = await supabase.from('affiliates').insert(form).select().single()
      if (!error && data) {
        setAffiliates((prev) => [data as Affiliate, ...prev])
      }
    }
    setSaving(false)
    setModalOpen(false)
    setEditingItem(null)
  }

  async function handleDelete() {
    if (!deletingId) return
    setDeleting(true)
    await supabase.from('affiliates').delete().eq('id', deletingId)
    setAffiliates((prev) => prev.filter((a) => a.id !== deletingId))
    setDeletingId(null)
    setDeleting(false)
  }

  const totalEarned = affiliates.reduce((acc, p) => acc + p.total_earned, 0)
  const totalConversions = affiliates.reduce((acc, p) => acc + p.conversions, 0)

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Afiliados</h1>
          <p className="text-sm text-zinc-500 mt-1">Seguimiento de programas de afiliados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Afiliado
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Programas activos</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {affiliates.filter((p) => p.status === 'activo').length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Total conversiones</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalConversions.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-600 dark:text-violet-400">$</span>
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Total ganado</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${totalEarned.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Affiliates table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Programas de afiliados</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-zinc-500 text-sm">Cargando...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Programa</th>
                  <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Estado</th>
                  <th className="text-right px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Clics</th>
                  <th className="text-right px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Conversiones</th>
                  <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Comisión</th>
                  <th className="text-right px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Total ganado</th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {affiliates.map((program) => (
                  <tr
                    key={program.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Link2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{program.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          program.status === 'activo'
                            ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-200/80 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 border border-zinc-300/60 dark:border-zinc-600/30'
                        }
                      >
                        {program.status === 'activo' ? 'Activo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-700 dark:text-zinc-300">
                      {program.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-700 dark:text-zinc-300">
                      {program.conversions}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{program.commission}</td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      ${program.total_earned.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(program)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(program.id)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {affiliates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-600 text-sm">
                      Sin programas de afiliados. ¡Agrega el primero!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar afiliado' : 'Nuevo afiliado'}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <Field label="Nombre del programa">
              <input
                className={INPUT}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Amazon Associates"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Estado">
                <select
                  className={INPUT}
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as Affiliate['status'])}
                >
                  <option value="activo">Activo</option>
                  <option value="pausado">Pausado</option>
                </select>
              </Field>
              <Field label="Comisión">
                <input
                  className={INPUT}
                  value={form.commission}
                  onChange={(e) => set('commission', e.target.value)}
                  placeholder="60%"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Clics">
                <input
                  type="number"
                  className={INPUT}
                  value={form.clicks}
                  onChange={(e) => set('clicks', Number(e.target.value))}
                  min={0}
                />
              </Field>
              <Field label="Conversiones">
                <input
                  type="number"
                  className={INPUT}
                  value={form.conversions}
                  onChange={(e) => set('conversions', Number(e.target.value))}
                  min={0}
                />
              </Field>
            </div>
            <Field label="Total ganado ($)">
              <input
                type="number"
                className={INPUT}
                value={form.total_earned}
                onChange={(e) => set('total_earned', Number(e.target.value))}
                min={0}
              />
            </Field>
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
              ¿Eliminar este programa de afiliado? Esta acción no se puede deshacer.
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
