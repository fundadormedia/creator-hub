'use client'

import { ideas } from '@/lib/mock-data'
import { PlatformBadge } from '@/components/content/platform-badge'
import { cn } from '@/lib/utils'
import { Plus, Lightbulb } from 'lucide-react'

const prioridadStyles: Record<'Alta' | 'Media' | 'Baja', string> = {
  Alta: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  Media: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  Baja: 'bg-zinc-200/80 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 border border-zinc-300/60 dark:border-zinc-600/30',
}

export function IdeasView() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Ideas</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Tu banco de ideas de contenido
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nueva Idea
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                {idea.titulo}
              </h3>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
              {idea.descripcion}
            </p>

            <div className="flex items-center justify-between">
              <PlatformBadge platform={idea.plataforma} />
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  prioridadStyles[idea.prioridad]
                )}
              >
                {idea.prioridad}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
