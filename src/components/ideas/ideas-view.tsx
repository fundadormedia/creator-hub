'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Idea, Platform, Priority } from '@/lib/supabase'
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
import { Plus, Lightbulb, Pencil, Trash2 } from 'lucide-react'

const PLATFORMS: Platform[] = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'LinkedIn']
const PRIORITIES: Priority[] = ['Alta', 'Media', 'Baja']

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

const prioridadStyles: Record<Priority, string> = {
  Alta: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  Media: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  Baja: 'bg-zinc-200/80 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 border border-zinc-300/60 dark:border-zinc-600/30',
}

type IdeaForm = { title: string; description: string; platform: Platform; priority: Priority }

const defaultForm = (): IdeaForm => ({
  title: '',
  description: '',
  platform: 'YouTube',
  priority: 'Media',
})

export function IdeasView() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Idea | null>(null)
  const [form, setForm] = useState<IdeaForm>(defaultForm())
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setIdeas(data as Idea[])
        setLoading(false)
      })
  }, [])

  function openCreate() {
    setEditingItem(null)
    setForm(defaultForm())
    setModalOpen(true)
  }

  function openEdit(idea: Idea) {
    setEditingItem(idea)
    setForm({ title: idea.title, description: idea.description, platform: idea.platform, priority: idea.priority })
    setModalOpen(true)
  }

  const set = <K extends keyof IdeaForm>(k: K, v: IdeaForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    if (editingItem) {
      const { data, error } = await supabase
        .from('ideas')
        .update(form)
        .eq('id', editingItem.id)
        .select()
        .single()
      if (!error && data) {
        setIdeas((prev) => prev.map((i) => (i.id === data.id ? (data as Idea) : i)))
      }
    } else {
      const { data, error } = await supabase.from('ideas').insert(form).select().single()
      if (!error && data) {
        setIdeas((prev) => [data as Idea, ...prev])
      }
    }
    setSaving(false)
    setModalOpen(false)
    setEditingItem(null)
  }

  async function handleDelete() {
    if (!deletingId) return
    setDeleting(true)
    await supabase.from('ideas').delete().eq('id', deletingId)
    setIdeas((prev) => prev.filter((i) => i.id !== deletingId))
    setDeletingId(null)
    setDeleting(false)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Ideas</h1>
          <p className="text-sm text-zinc-500 mt-1">Tu banco de ideas de contenido</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Idea
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-zinc-500 text-sm">Cargando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug flex-1">
                  {idea.title}
                </h3>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                {idea.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={idea.platform} />
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      prioridadStyles[idea.priority]
                    )}
                  >
                    {idea.priority}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(idea)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(idea.id)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {ideas.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center py-16 text-zinc-400">
              <Lightbulb className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">Sin ideas todavía. ¡Agrega la primera!</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar idea' : 'Nueva idea'}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <Field label="Título">
              <input
                className={INPUT}
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Título de la idea"
              />
            </Field>
            <Field label="Descripción">
              <textarea
                className={cn(INPUT, 'resize-none h-24')}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe la idea..."
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
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Prioridad">
                <select
                  className={INPUT}
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value as Priority)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
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
              disabled={saving || !form.title.trim()}
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
              ¿Eliminar esta idea? Esta acción no se puede deshacer.
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
