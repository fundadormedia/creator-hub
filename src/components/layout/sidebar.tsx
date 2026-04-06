'use client'

import {
  LayoutDashboard,
  FileVideo,
  Calendar,
  Lightbulb,
  DollarSign,
  Briefcase,
  Link2,
  FileUser,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export type Section =
  | 'dashboard'
  | 'contenido'
  | 'calendario'
  | 'ideas'
  | 'ingresos'
  | 'marcas'
  | 'afiliados'

interface NavItem {
  id: Section
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'contenido',  label: 'Contenido',  icon: FileVideo },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'ideas',      label: 'Ideas',      icon: Lightbulb },
  { id: 'ingresos',   label: 'Ingresos',   icon: DollarSign },
  { id: 'marcas',     label: 'Marcas',     icon: Briefcase },
  { id: 'afiliados',  label: 'Afiliados',  icon: Link2 },
]

interface SidebarProps {
  activeSection: Section
  onSectionChange: (section: Section) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = theme === 'dark'

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50 transition-all duration-300 overflow-hidden',
        isCollapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn('border-b border-zinc-200 dark:border-zinc-800 shrink-0', isCollapsed ? 'p-4' : 'p-6')}>
        <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight whitespace-nowrap">
              Creator Hub
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-500'
                )}
              />
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          )
        })}

        {/* Media Kit — navigates to /mediakit route */}
        <button
          onClick={() => router.push('/mediakit')}
          title={isCollapsed ? 'Media Kit' : undefined}
          className={cn(
            'w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150',
            isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          )}
        >
          <FileUser className="w-4 h-4 shrink-0 text-zinc-500 dark:text-zinc-500" />
          {!isCollapsed && <span className="whitespace-nowrap">Media Kit</span>}
        </button>
      </nav>

      {/* Bottom actions */}
      <div className="p-2 space-y-1 shrink-0">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={mounted ? (isDark ? 'Modo claro' : 'Modo oscuro') : 'Tema'}
          suppressHydrationWarning
          className={cn(
            'w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60',
            isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
          )}
        >
          {mounted && (isDark
            ? <Sun className="w-4 h-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
            : <Moon className="w-4 h-4 shrink-0 text-zinc-500" />
          )}
          {!isCollapsed && mounted && (
            <span className="whitespace-nowrap">{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
          )}
        </button>

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expandir panel' : 'Colapsar panel'}
          className={cn(
            'w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60',
            isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
          )}
        >
          {isCollapsed
            ? <ChevronRight className="w-4 h-4 shrink-0" />
            : <><ChevronLeft className="w-4 h-4 shrink-0" /><span className="whitespace-nowrap">Cerrar panel</span></>
          }
        </button>
      </div>

      {/* User profile */}
      <div className={cn('border-t border-zinc-200 dark:border-zinc-800 shrink-0', isCollapsed ? 'p-2' : 'p-4')}>
        {isCollapsed ? (
          <div className="flex justify-center py-1">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-indigo-500 text-white text-xs font-bold">CR</AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-indigo-500 text-white text-xs font-bold">CR</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">Creator Pro</p>
              <p className="text-xs text-zinc-500 truncate">creator@hub.com</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
