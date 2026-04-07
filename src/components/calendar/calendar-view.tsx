'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Content, Platform } from '@/lib/supabase'
import { ContentModal } from '@/components/content/content-modal'
import { PlatformBadge } from '@/components/content/platform-badge'
import { StatusBadge } from '@/components/content/status-badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Plus, Eye, Heart, Star } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const PLATFORM_DOT: Record<Platform, string> = {
  YouTube:   'bg-red-500',
  Instagram: 'bg-purple-500',
  TikTok:    'bg-zinc-800 dark:bg-zinc-300',
  Twitter:   'bg-sky-500',
  LinkedIn:  'bg-blue-700',
}

const PLATFORM_EVENT: Record<Platform, string> = {
  YouTube:   'bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20',
  Instagram: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 hover:bg-purple-500/20',
  TikTok:    'bg-zinc-200/80 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300/80 dark:hover:bg-zinc-700',
  Twitter:   'bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-500/20',
  LinkedIn:  'bg-blue-700/10 text-blue-800 dark:text-blue-300 hover:bg-blue-700/20',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a YYYY-MM-DD string into { year, month (0-indexed), day } without timezone issues */
function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CalendarView() {
  const today = new Date()

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Content | null>(null)
  const [initialDate, setInitialDate] = useState<string | undefined>()

  // Detail popup state
  const [detailItem, setDetailItem] = useState<Content | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    supabase
      .from('content')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data }) => {
        if (data) setContent(data as Content[])
        setLoading(false)
      })
  }, [])

  // ── Derived data ────────────────────────────────────────────────────────────

  const monthContent = content.filter((c) => {
    const d = parseDate(c.date)
    return d.year === year && d.month === month
  })

  const contentByDay: Record<number, Content[]> = {}
  monthContent.forEach((item) => {
    const { day } = parseDate(item.date)
    if (!contentByDay[day]) contentByDay[day] = []
    contentByDay[day].push(item)
  })

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarCells: (number | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const monthList = [...monthContent].sort((a, b) => a.date.localeCompare(b.date))

  // ── Navigation ──────────────────────────────────────────────────────────────

  function prevMonth() {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function nextMonth() {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }
  function goToday() {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function openCreate(date?: string) {
    setEditingItem(null)
    setInitialDate(date)
    setModalOpen(true)
  }

  function openEdit(item: Content) {
    setDetailItem(null)
    setEditingItem(item)
    setInitialDate(undefined)
    setModalOpen(true)
  }

  function handleSaved(saved: Content) {
    setContent((prev) => {
      const exists = prev.find((c) => c.id === saved.id)
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved]
    })
    setModalOpen(false)
    setEditingItem(null)
  }

  function isToday(day: number) {
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Calendario</h1>
          <p className="text-sm text-zinc-500 mt-1">Vista mensual de contenido</p>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      {/* Calendar card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">

        {/* Navigation bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToday}
              className="px-3 py-1 rounded-md text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium"
            >
              Hoy
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {MESES[month]} {year}
          </h2>
          <div className="w-[96px]" /> {/* spacer to balance the nav buttons */}
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
          {DIAS.map((dia) => (
            <div
              key={dia}
              className="py-2 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800 last:border-r-0"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-zinc-500 text-sm">Cargando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarCells.map((day, idx) => {
              const dayItems = day ? (contentByDay[day] ?? []) : []
              const today_ = day !== null && isToday(day)
              const dateStr = day !== null ? toDateString(year, month, day) : ''

              return (
                <div
                  key={idx}
                  onClick={() => day !== null && openCreate(dateStr)}
                  className={[
                    'border-b border-r border-zinc-100 dark:border-zinc-800/70',
                    'min-h-[90px] p-1.5',
                    day !== null
                      ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors'
                      : 'bg-zinc-50/40 dark:bg-zinc-900/20',
                  ].join(' ')}
                >
                  {day !== null && (
                    <>
                      <span
                        className={[
                          'inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-1',
                          today_
                            ? 'bg-indigo-500 text-white'
                            : 'text-zinc-600 dark:text-zinc-400',
                        ].join(' ')}
                      >
                        {day}
                      </span>
                      <div className="space-y-0.5">
                        {dayItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setDetailItem(item)
                            }}
                            className={[
                              'w-full text-left flex items-center gap-1 rounded px-1 py-0.5 text-[10px] truncate transition-colors',
                              PLATFORM_EVENT[item.platform],
                            ].join(' ')}
                          >
                            <span
                              className={[
                                'shrink-0 w-1.5 h-1.5 rounded-full',
                                PLATFORM_DOT[item.platform],
                              ].join(' ')}
                            />
                            <span className="truncate">{item.title}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Monthly list */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {MESES[month]} — {monthList.length} contenido{monthList.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-zinc-500 text-sm">Cargando...</p>
          </div>
        ) : monthList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-600">
            <p className="text-sm">Sin contenido en {MESES[month]}.</p>
            <button
              onClick={() => openCreate()}
              className="mt-2 text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 underline underline-offset-2"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {monthList.map((item) => {
              const { day } = parseDate(item.date)
              return (
                <div
                  key={item.id}
                  onClick={() => setDetailItem(item)}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{day}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={['w-2 h-2 rounded-full shrink-0', PLATFORM_DOT[item.platform]].join(' ')}
                        />
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                          {item.title}
                        </p>
                        {item.is_sponsor && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                            Sponsor
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">{item.format}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PlatformBadge platform={item.platform} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <ContentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={editingItem}
        initialDate={initialDate}
        onSaved={handleSaved}
      />

      {/* Detail popup */}
      <Dialog open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="pr-6 leading-snug">{detailItem?.title}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {detailItem && (
            <DialogBody className="space-y-3">
              {/* Badges row */}
              <div className="flex items-center flex-wrap gap-2">
                <PlatformBadge platform={detailItem.platform} />
                <StatusBadge status={detailItem.status} />
                {detailItem.is_sponsor && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3" />
                    Sponsor
                  </span>
                )}
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Formato</p>
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium">{detailItem.format}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Categoría</p>
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium">{detailItem.category}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Fecha</p>
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium">{detailItem.date}</p>
                </div>
                {detailItem.views > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Métricas</p>
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <span className="flex items-center gap-1 text-xs">
                        <Eye className="w-3 h-3" />
                        {detailItem.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <Heart className="w-3 h-3" />
                        {detailItem.likes.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit button */}
              <div className="pt-1">
                <button
                  onClick={() => openEdit(detailItem)}
                  className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors"
                >
                  Editar contenido
                </button>
              </div>
            </DialogBody>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
