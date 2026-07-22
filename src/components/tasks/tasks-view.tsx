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
import { Plus, ListChecks, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors'

type TaskType = 'grabar' | 'publicar' | 'revisar' | 'evento' | 'cobro' | 'otro'

const TYPES: { id: TaskType; label: string; emoji: string; dot: string }[] = [
  { id: 'grabar', label: 'Grabar', emoji: '🎬', dot: 'bg-blue-500' },
  { id: 'publicar', label: 'Publicar', emoji: '📤', dot: 'bg-emerald-500' },
  { id: 'revisar', label: 'Revisar', emoji: '📝', dot: 'bg-amber-500' },
  { id: 'evento', label: 'Evento', emoji: '🎤', dot: 'bg-purple-500' },
  { id: 'cobro', label: 'Cobro', emoji: '💰', dot: 'bg-emerald-500' },
  { id: 'otro', label: 'Otro', emoji: '📋', dot: 'bg-zinc-400' },
]

const typeInfo = (t: TaskType) => TYPES.find((x) => x.id === t) ?? TYPES[5]

interface Task {
  id: string
  title: string
  type: TaskType
  due_date: string | null
  notes: string | null
  done: boolean
  source: string
}

type Tab = 'todas' | 'grabar' | 'publicar' | 'manuales'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  )
}

const todayLabel = () => {
  const s = new Date().toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('todas')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    type: 'otro' as TaskType,
    due_date: '',
    notes: '',
  })

  useEffect(() => {
    supabase
      .from('tasks')
      .select('*')
      .order('done')
      .order('due_date', { nullsFirst: false })
      .then(({ data }) => {
        if (data) setTasks(data as Task[])
        setLoading(false)
      })
  }, [])

  function openNew() {
    setForm({ title: '', type: 'otro', due_date: '', notes: '' })
    setError(null)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('Ponle un título a la tarea.')
      return
    }
    setSaving(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('tasks')
      .insert({
        title: form.title.trim(),
        type: form.type,
        due_date: form.due_date || null,
        notes: form.notes.trim() || null,
      })
      .select()
      .single()

    setSaving(false)
    if (err || !data) {
      setError(err?.message ?? 'No se pudo crear la tarea.')
      return
    }
    setTasks((prev) => [data as Task, ...prev])
    setModalOpen(false)
  }

  async function toggleDone(t: Task) {
    const done = !t.done
    await supabase.from('tasks').update({ done }).eq('id', t.id)
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, done } : x)))
  }

  async function handleDelete() {
    if (!deletingId) return
    await supabase.from('tasks').delete().eq('id', deletingId)
    setTasks((prev) => prev.filter((t) => t.id !== deletingId))
    setDeletingId(null)
  }

  const filtered = tasks.filter((t) => {
    if (tab === 'todas') return true
    if (tab === 'manuales') return t.source === 'manual'
    return t.type === tab
  })

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Tareas</h1>
          <p className="mt-1 text-sm text-zinc-500">{todayLabel()}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" />
          Nueva tarea
        </button>
      </div>

      <div className="flex w-fit gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {([
          ['todas', 'Todas'],
          ['grabar', 'Grabar'],
          ['publicar', 'Publicar'],
          ['manuales', 'Manuales'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              tab === id
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-zinc-400">Cargando…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/15">
            <ListChecks className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Organiza tus entregas y deadlines
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Crea tareas con fecha y hora para no perderte ninguna.
          </p>
          <button
            onClick={openNew}
            className="mt-5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            Nueva tarea
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const info = typeInfo(t.type)
            return (
              <div
                key={t.id}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleDone(t)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded accent-indigo-500"
                  aria-label={t.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      t.done
                        ? 'text-zinc-400 line-through dark:text-zinc-600'
                        : 'text-zinc-900 dark:text-zinc-100'
                    )}
                  >
                    {t.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <span className={cn('h-1.5 w-1.5 rounded-full', info.dot)} />
                      {info.emoji} {info.label}
                    </span>
                    {t.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {t.due_date}
                      </span>
                    )}
                  </div>
                  {t.notes && <p className="mt-1.5 text-sm text-zinc-500">{t.notes}</p>}
                </div>
                <button
                  onClick={() => setDeletingId(t.id)}
                  className="shrink-0 text-zinc-400 transition-colors hover:text-red-500"
                  aria-label="Eliminar tarea"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <p className="mb-5 -mt-2 text-sm text-zinc-500">
              Agrega una tarea manual con su fecha, hora y notas.
            </p>
            <div className="space-y-5">
              <Field label="Título">
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ej: Revisar brief de Nike"
                  className={INPUT}
                />
              </Field>

              <Field label="Tipo">
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setForm((p) => ({ ...p, type: t.id }))}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                        form.type === t.id
                          ? 'border-zinc-900 bg-zinc-50 text-zinc-900 dark:border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100'
                          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                      )}
                    >
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', t.dot)} />
                      <span className="truncate">
                        {t.emoji} {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Fecha (opcional)">
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                  className={INPUT}
                />
              </Field>

              <Field label="Notas (opcional)">
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Brief, enlaces, contactos, detalles adicionales…"
                  className={cn(INPUT, 'resize-none')}
                />
              </Field>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
            >
              {saving ? 'Creando…' : 'Crear tarea'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deletingId !== null} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta tarea?</DialogTitle>
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
