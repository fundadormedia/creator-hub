'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Content, Status } from '@/lib/supabase'
import { PlatformBadge } from './platform-badge'
import { StatusBadge } from './status-badge'
import { ContentModal } from './content-modal'
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Eye, Heart, Pencil, Trash2, Plus } from 'lucide-react'

const TABS: { id: Status | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'borrador', label: 'Borrador' },
  { id: 'en_produccion', label: 'En Producción' },
  { id: 'programado', label: 'Programado' },
  { id: 'publicado', label: 'Publicado' },
]

export function ContentTable() {
  const [activeTab, setActiveTab] = useState<Status | 'todos'>('todos')
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Content | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase
      .from('content')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data) setContent(data as Content[])
        setLoading(false)
      })
  }, [])

  function openCreate() {
    setEditingItem(null)
    setModalOpen(true)
  }

  function openEdit(item: Content) {
    setEditingItem(item)
    setModalOpen(true)
  }

  function handleSaved(saved: Content) {
    setContent((prev) =>
      editingItem
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [saved, ...prev]
    )
    setModalOpen(false)
    setEditingItem(null)
  }

  async function handleDelete() {
    if (!deletingId) return
    setDeleting(true)
    await supabase.from('content').delete().eq('id', deletingId)
    setContent((prev) => prev.filter((c) => c.id !== deletingId))
    setDeletingId(null)
    setDeleting(false)
  }

  const filtered =
    activeTab === 'todos' ? content : content.filter((c) => c.status === activeTab)

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map((tab) => {
            const count =
              tab.id === 'todos'
                ? content.length
                : content.filter((c) => c.status === tab.id).length
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-60">({count})</span>
              </button>
            )
          })}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo contenido
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Título</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Plataforma</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Formato</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Categoría</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Estado</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Fecha</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Métricas</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow
                key={item.id}
                className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 group"
              >
                <TableCell className="text-zinc-800 dark:text-zinc-200 font-medium max-w-[220px]">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.title}</span>
                    {item.is_sponsor && (
                      <span className="shrink-0 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        Sponsor
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <PlatformBadge platform={item.platform} />
                </TableCell>
                <TableCell className="text-zinc-500 dark:text-zinc-400 text-sm">
                  {item.format}
                </TableCell>
                <TableCell className="text-zinc-500 dark:text-zinc-400 text-sm">
                  {item.category}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-zinc-500 dark:text-zinc-400 text-sm">
                  {item.date}
                </TableCell>
                <TableCell>
                  {item.views > 0 ? (
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {item.likes.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-zinc-400 dark:text-zinc-600 text-sm">
                  Sin contenido en esta categoría
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ContentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={editingItem}
        onSaved={handleSaved}
      />

      {/* Confirm delete */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              ¿Eliminar este contenido? Esta acción no se puede deshacer.
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
    </>
  )
}
