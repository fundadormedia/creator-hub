'use client'

import { useState, useEffect } from 'react'
import { Sidebar, type Section } from './sidebar'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { CollaborationsView } from '@/components/collaborations/collaborations-view'
import { PrsView } from '@/components/prs/prs-view'
import { CalendarView } from '@/components/calendar/calendar-view'
import { TasksView } from '@/components/tasks/tasks-view'
import { IdeasView } from '@/components/ideas/ideas-view'
import { IncomeView } from '@/components/income/income-view'
import { MetricsView } from '@/components/metrics/metrics-view'
import { ManagerWidget } from '@/components/coach/manager-widget'
import { cn } from '@/lib/utils'

function SectionContent({ section }: { section: Section }) {
  switch (section) {
    case 'dashboard':      return <DashboardView />
    case 'colaboraciones': return <CollaborationsView />
    case 'prs':            return <PrsView />
    case 'calendario':     return <CalendarView />
    case 'tareas':         return <TasksView />
    case 'ideas':          return <IdeasView />
    case 'ingresos':       return <IncomeView />
    case 'metricas':       return <MetricsView />
    default:           return <DashboardView />
  }
}

const VALID_SECTIONS: Section[] = [
  'dashboard','colaboraciones','prs','calendario','tareas','ideas','ingresos','metricas',
]

export function MainLayout() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const collapsed = localStorage.getItem('sidebar-collapsed')
    if (collapsed !== null) setIsCollapsed(collapsed === 'true')

    // Restore section requested by RoutingSidebar navigation
    const desired = localStorage.getItem('desired-section') as Section | null
    if (desired && VALID_SECTIONS.includes(desired)) {
      setActiveSection(desired)
      localStorage.removeItem('desired-section')
    }
  }, [])

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('sidebar-collapsed', String(next))
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0f] overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={mounted ? isCollapsed : false}
        onToggleCollapse={toggleCollapse}
      />
      <main
        className={cn(
          'flex-1 overflow-y-auto transition-all duration-300',
          mounted ? (isCollapsed ? 'ml-[60px]' : 'ml-[240px]') : 'ml-[240px]'
        )}
      >
        <SectionContent section={activeSection} />
      </main>
      <ManagerWidget />
    </div>
  )
}
