'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Content, Platform, Status } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'

const PLATFORMS: Platform[] = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'LinkedIn']
const FORMATS = ['Video', 'Reel', 'Post', 'Newsletter', 'Podcast']
const CATEGORIES = ['Tecnología', 'Lifestyle', 'Educación', 'Entretenimiento', 'Negocios']
const STATUSES: { value: Status; label: string }[] = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'en_produccion', label: 'En Producción' },
  { value: 'programado', label: 'Programado' },
  { value: 'publicado', label: 'Publicado' },
]

type ContentForm = Omit<Content, 'id'>

const defaultForm = (): ContentForm => ({
  title: '',
  platform: 'YouTube',
  format: 'Video',
  category: 'Tecnología',
  status: 'borrador',
  date: new Date().toISOString().split('T')[0],
  views: 0,
  likes: 0,
  is_sponsor: false,
})

const INPUT = 'w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors'

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

interface ContentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: Content | null
  initialDate?: string
  onSaved: (item: Content) => void
}

export function ContentModal({ open, onOpenChange, item, initialDate, onSaved }: ContentModalProps) {
  const [form, setForm] = useState<ContentForm>(defaultForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        item
          ? {
              title: item.title,
              platform: item.platform,
              format: item.format,
              category: item.category,
              status: item.status,
              date: item.date,
              views: item.views,
              likes: item.likes,
              is_sponsor: item.is_sponsor,
            }
          : { ...defaultForm(), ...(initialDate ? { date: initialDate } : {}) }
      )
    }
  }, [open, item, initialDate])

  const set = <K extends keyof ContentForm>(k: K, v: ContentForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    if (item) {
      const { data, error } = await supabase
        .from('content')
        .update(form)
        .eq('id', item.id)
        .select()
        .single()
      if (!error && data) onSaved(data as Content)
    } else {
      const { data, error } = await supabase
        .from('content')
        .insert(form)
        .select()
        .single()
      if (!error && data) onSaved(data as Content)
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Editar contenido' : 'Nuevo contenido'}</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <DialogBody>
          <Field label="Título">
            <input
              className={INPUT}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Título del contenido"
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
            <Field label="Formato">
              <select
                className={INPUT}
                value={form.format}
                onChange={(e) => set('format', e.target.value)}
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría">
              <select
                className={INPUT}
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estado">
              <select
                className={INPUT}
                value={form.status}
                onChange={(e) => set('status', e.target.value as Status)}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha">
              <input
                type="date"
                className={INPUT}
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </Field>
            <Field label="Vistas">
              <input
                type="number"
                className={INPUT}
                value={form.views}
                onChange={(e) => set('views', Number(e.target.value))}
                min={0}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Likes">
              <input
                type="number"
                className={INPUT}
                value={form.likes}
                onChange={(e) => set('likes', Number(e.target.value))}
                min={0}
              />
            </Field>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.is_sponsor}
                  onClick={() => set('is_sponsor', !form.is_sponsor)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    form.is_sponsor
                      ? 'bg-indigo-500'
                      : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                >
                  <span
                    className={`inline-block h-[14px] w-[14px] rounded-full bg-white shadow transition-transform ${
                      form.is_sponsor ? 'translate-x-[18px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Patrocinado</span>
              </label>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="px-4 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {saving ? 'Guardando...' : item ? 'Guardar cambios' : 'Crear'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
