'use client'

import { contenido } from '@/lib/mock-data'
import { PlatformBadge } from '@/components/content/platform-badge'
import { StatusBadge } from '@/components/content/status-badge'
import { Calendar } from 'lucide-react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function CalendarView() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const scheduledContent = contenido.filter(
    (c) => c.estado === 'programado' || c.estado === 'publicado'
  )

  const contentByDay: Record<number, typeof contenido> = {}
  scheduledContent.forEach((item) => {
    const date = new Date(item.fecha)
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate()
      if (!contentByDay[day]) contentByDay[day] = []
      contentByDay[day].push(item)
    }
  })

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Calendario</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Vista mensual de contenido programado
        </p>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {MESES[month]} {year}
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 mb-2">
            {DIAS.map((dia) => (
              <div key={dia} className="text-center text-xs text-zinc-500 font-medium py-2">
                {dia}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayContent = day ? contentByDay[day] : []
              const isToday = day === now.getDate()
              return (
                <div
                  key={index}
                  className={`min-h-[60px] p-1.5 rounded-lg text-xs ${
                    day
                      ? 'bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors'
                      : ''
                  }`}
                >
                  {day && (
                    <>
                      <span
                        className={`inline-flex w-6 h-6 items-center justify-center rounded-full font-medium mb-1 ${
                          isToday
                            ? 'bg-indigo-500 text-white'
                            : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {day}
                      </span>
                      {dayContent && dayContent.map((item) => (
                        <div
                          key={item.id}
                          className="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 rounded px-1 py-0.5 truncate text-[10px] mb-0.5"
                        >
                          {item.titulo}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* List of scheduled content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Contenido programado este mes
          </h2>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {scheduledContent.length === 0 ? (
            <p className="px-6 py-8 text-zinc-500 text-sm text-center">
              No hay contenido programado para este mes
            </p>
          ) : (
            scheduledContent.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      {new Date(item.fecha).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.titulo}</p>
                    <p className="text-xs text-zinc-500">{item.fecha}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={item.plataforma} />
                  <StatusBadge status={item.estado} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
