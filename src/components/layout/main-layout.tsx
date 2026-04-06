'use client'

import { useState, useEffect } from 'react'
import { Sidebar, type Section } from './sidebar'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { ContentView } from '@/components/content/content-view'
import { CalendarView } from '@/components/calendar/calendar-view'
import { IdeasView } from '@/components/ideas/ideas-view'
import { IncomeView } from '@/components/income/income-view'
import { BrandsView } from '@/components/brands/brands-view'
import { AffiliatesView } from '@/components/affiliates/affiliates-view'
import { cn } from '@/lib/utils'

function SectionContent({ section }: { section: Section }) {
  switch (section) {
    case 'dashboard':  return <DashboardView />
    case 'contenido':  return <ContentView />
    case 'calendario': return <CalendarView />
    case 'ideas':      return <IdeasView />
    case 'ingresos':   return <IncomeView />
    case 'marcas':     return <BrandsView />
    case 'afiliados':  return <AffiliatesView />
    default:           return <DashboardView />
  }
}

const VALID_SECTIONS: Section[] = [
  'dashboard','contenido','calendario','ideas','ingresos','marcas','afiliados',
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
    </div>
  )
}
