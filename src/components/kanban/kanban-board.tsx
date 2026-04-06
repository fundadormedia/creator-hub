'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { contenido as initialContenido } from '@/lib/mock-data'
import type { ContentItem, Estado } from '@/lib/mock-data'
import { PlatformBadge } from '@/components/content/platform-badge'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

const columns: { id: Estado; label: string; color: string }[] = [
  { id: 'borrador', label: 'Borrador', color: 'text-zinc-500 dark:text-zinc-400' },
  { id: 'en_produccion', label: 'En Producción', color: 'text-amber-600 dark:text-amber-400' },
  { id: 'programado', label: 'Programado', color: 'text-blue-600 dark:text-blue-400' },
  { id: 'publicado', label: 'Publicado', color: 'text-emerald-600 dark:text-emerald-400' },
]

function KanbanCard({
  item,
  isDragging,
}: {
  item: ContentItem
  isDragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing',
        isDragging ? 'opacity-50' : 'hover:border-zinc-300 dark:hover:border-zinc-600'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug flex-1 pr-2">
          {item.titulo}
        </p>
        <div
          {...attributes}
          {...listeners}
          className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 cursor-grab"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <PlatformBadge platform={item.plataforma} />
        <span className="text-xs text-zinc-500">{item.formato}</span>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">{item.fecha}</p>
    </div>
  )
}

function KanbanColumn({
  columnId,
  label,
  color,
  items,
  activeId,
}: {
  columnId: Estado
  label: string
  color: string
  items: ContentItem[]
  activeId: string | null
}) {
  const { isOver, setNodeRef } = useDroppable({ id: columnId })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 min-h-[200px] transition-colors',
        isOver && 'border-indigo-500/50 bg-indigo-500/5'
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className={cn('text-sm font-semibold', color)}>{label}</h3>
        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
          {items.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-3 flex-1">
        {items.map((item) => (
          <KanbanCard key={item.id} item={item} isDragging={activeId === item.id} />
        ))}
      </div>
    </div>
  )
}

export function KanbanBoard() {
  const [items, setItems] = useState<ContentItem[]>(initialContenido)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeItemId = active.id as string
    const overId = over.id as Estado

    if (columns.some((c) => c.id === overId)) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === activeItemId ? { ...item, estado: overId } : item
        )
      )
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            columnId={col.id}
            label={col.label}
            color={col.color}
            items={items.filter((i) => i.estado === col.id)}
            activeId={activeId}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="bg-zinc-50 dark:bg-zinc-800 border border-indigo-500/50 rounded-lg p-3 shadow-xl rotate-1 opacity-90">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{activeItem.titulo}</p>
            <PlatformBadge platform={activeItem.plataforma} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
