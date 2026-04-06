'use client'

import { useState } from 'react'
import { ContentTable } from './content-table'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { cn } from '@/lib/utils'
import { LayoutList, Kanban } from 'lucide-react'

type TabId = 'tabla' | 'kanban'

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'tabla', label: 'Tabla', icon: LayoutList },
  { id: 'kanban', label: 'Pipeline (Kanban)', icon: Kanban },
]

export function ContentView() {
  const [activeTab, setActiveTab] = useState<TabId>('tabla')

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Contenido</h1>
          <p className="text-sm text-zinc-500 mt-1">Gestiona todo tu contenido</p>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'tabla' ? <ContentTable /> : <KanbanBoard />}
    </div>
  )
}
