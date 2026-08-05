'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { RoutingSidebar } from '@/components/layout/routing-sidebar'
import { useSubscription } from '@/hooks/use-subscription'
import { TrialBanner, TrialLockGate } from '@/components/dashboard/trial-lock'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { locked } = useSubscription()
  const pathname = usePathname()

  // Perfil siempre accesible (ahí gestionan la suscripción).
  const onPerfil = pathname?.startsWith('/perfil') ?? false

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored !== null) setIsCollapsed(stored === 'true')
  }, [])

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('sidebar-collapsed', String(next))
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0f] overflow-hidden">
      <RoutingSidebar
        isCollapsed={mounted ? isCollapsed : false}
        onToggleCollapse={toggleCollapse}
        locked={locked}
      />
      <main
        className={cn(
          'flex-1 overflow-y-auto transition-all duration-300',
          mounted ? (isCollapsed ? 'ml-[60px]' : 'ml-[240px]') : 'ml-[240px]'
        )}
      >
        {locked && <TrialBanner />}
        {locked && !onPerfil ? <TrialLockGate /> : children}
      </main>
    </div>
  )
}
