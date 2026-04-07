'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '@/lib/supabase'
import type { Content, Status } from '@/lib/supabase'
import { PlatformBadge } from '@/components/content/platform-badge'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'borrador', label: 'Borrador', color: 'text-zinc-500 dark:text-zinc-400' },
  { id: 'en_produccion', label: 'En Producción', color: 'text-amber-600 dark:text-amber-400' },
  { id: 'programado', label: 'Programado', color: 'text-blue-600 dark:text-blue-400' },
  { id: 'publicado', label: 'Publicado', color: 'text-emerald-600 dark:text-emerald-400' },
]

const COLUMN_IDS = new Set<string>(COLUMNS.map((c) => c.id))

function SortableCard({ item }: { item: Content }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3',
        isDragging
          ? 'opacity-40 border-dashed'
          : 'hover:border-zinc-300 dark:hover:border-zinc-600'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug flex-1 pr-2">
          {item.title}
        </p>
        <button
          {...attributes}
          {...listeners}
          className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <PlatformBadge platform={item.platform} />
        <span className="text-xs text-zinc-500">{item.format}</span>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">{item.date}</p>
    </div>
  )
}

function CardOverlay({ item }: { item: Content }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 border border-indigo-500/60 rounded-lg p-3 shadow-2xl rotate-1 opacity-95">
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug mb-2">
        {item.title}
      </p>
      <div className="flex items-center justify-between">
        <PlatformBadge platform={item.platform} />
        <span className="text-xs text-zinc-500">{item.format}</span>
      </div>
    </div>
  )
}

function KanbanColumn({
  column,
  items,
}: {
  column: { id: Status; label: string; color: string }
  items: Content[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 min-h-[200px] transition-colors',
        isOver && 'border-indigo-500/50 bg-indigo-500/5'
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className={cn('text-sm font-semibold', column.color)}>{column.label}</h3>
        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
          {items.length}
        </span>
      </div>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-2 p-3 flex-1">
          {items.map((item) => (
            <SortableCard key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard() {
  const [items, setItems] = useState<Content[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('content')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data as Content[])
        setLoading(false)
      })
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const activeItem = activeId ? items.find((i) => i.id === activeId) ?? null : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const draggedId = active.id as string
    const overId = over.id as string

    // Resolve target column: over could be a column id or a card id
    let targetStatus: Status | null = null
    if (COLUMN_IDS.has(overId)) {
      targetStatus = overId as Status
    } else {
      const overCard = items.find((i) => i.id === overId)
      if (overCard) targetStatus = overCard.status
    }

    if (!targetStatus) return

    const draggedItem = items.find((i) => i.id === draggedId)
    if (!draggedItem || draggedItem.status === targetStatus) return

    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === draggedId ? { ...item, status: targetStatus! } : item
      )
    )

    await supabase
      .from('content')
      .update({ status: targetStatus })
      .eq('id', draggedId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-zinc-500 text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            items={items.filter((i) => i.status === col.id)}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeItem ? <CardOverlay item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
