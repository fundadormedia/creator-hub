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
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/use-user'

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  /** If true, link goes to SPA root and stores desired section */
  spaSection?: string
}

const navItems: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard, href: '/', spaSection: 'dashboard' },
  { id: 'contenido',  label: 'Contenido',   icon: FileVideo,       href: '/', spaSection: 'contenido' },
  { id: 'calendario', label: 'Calendario',  icon: Calendar,        href: '/', spaSection: 'calendario' },
  { id: 'ideas',      label: 'Ideas',       icon: Lightbulb,       href: '/', spaSection: 'ideas' },
  { id: 'ingresos',   label: 'Ingresos',    icon: DollarSign,      href: '/', spaSection: 'ingresos' },
  { id: 'marcas',     label: 'Marcas',      icon: Briefcase,       href: '/', spaSection: 'marcas' },
  { id: 'mediakit',   label: 'Media Kit',   icon: FileUser,        href: '/mediakit' },
  { id: 'afiliados',  label: 'Afiliados',   icon: Link2,           href: '/', spaSection: 'afiliados' },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface RoutingSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RoutingSidebar({ isCollapsed, onToggleCollapse }: RoutingSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { displayName, initials, email } = useUser()
  useEffect(() => setMounted(true), [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isDark = theme === 'dark'

  function isActive(item: NavItem): boolean {
    if (item.href === '/mediakit') return pathname.startsWith('/mediakit')
    return false
  }

  function handleClick(item: NavItem) {
    if (item.spaSection) {
      localStorage.setItem('desired-section', item.spaSection)
      router.push('/')
    }
  }

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
          const active = isActive(item)

          const cls = cn(
            'w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150',
            isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            active
              ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          )

          const iconCls = cn(
            'w-4 h-4 shrink-0',
            active ? 'text-indigo-500 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-500'
          )

          if (item.spaSection) {
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                title={isCollapsed ? item.label : undefined}
                className={cls}
              >
                <Icon className={iconCls} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cls}
            >
              <Icon className={iconCls} />
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          )
        })}
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
          <div className="flex flex-col items-center gap-1 py-1">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-indigo-500 text-white text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-indigo-500 text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{displayName}</p>
                <p className="text-xs text-zinc-500 truncate">{email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
