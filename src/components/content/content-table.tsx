'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Content, Status } from '@/lib/supabase'
import { PlatformBadge } from './platform-badge'
import { StatusBadge } from './status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Eye, Heart } from 'lucide-react'

const tabs: { id: Status | 'todos'; label: string }[] = [
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

  const filtered =
    activeTab === 'todos'
      ? content
      : content.filter((c) => c.status === activeTab)

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Filter tabs */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
              <TableCell className="text-zinc-800 dark:text-zinc-200 font-medium max-w-[240px]">
                <div className="flex items-center gap-2">
                  {item.title}
                  {item.is_sponsor && (
                    <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                      Sponsor
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <PlatformBadge platform={item.platform} />
              </TableCell>
              <TableCell className="text-zinc-500 dark:text-zinc-400 text-sm">{item.format}</TableCell>
              <TableCell className="text-zinc-500 dark:text-zinc-400 text-sm">{item.category}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-zinc-500 dark:text-zinc-400 text-sm">{item.date}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
