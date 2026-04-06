'use client'

import { brandDeals } from '@/lib/mock-data'
import { PlatformBadge } from '@/components/content/platform-badge'
import { cn } from '@/lib/utils'
import { Briefcase, DollarSign, Calendar } from 'lucide-react'

const dealStatusConfig: Record<
  string,
  { label: string; style: string; dot: string }
> = {
  activo: {
    label: 'Activo',
    style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  pendiente: {
    label: 'Pendiente',
    style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  completado: {
    label: 'Completado',
    style: 'bg-zinc-200/80 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 border border-zinc-300/60 dark:border-zinc-600/30',
    dot: 'bg-zinc-400',
  },
}

export function BrandsView() {
  const totalActivo = brandDeals
    .filter((d) => d.estado === 'activo')
    .reduce((acc, d) => acc + d.monto, 0)
  const totalCompletado = brandDeals
    .filter((d) => d.estado === 'completado')
    .reduce((acc, d) => acc + d.monto, 0)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Marcas</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Gestiona tus acuerdos con marcas y sponsors
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Acuerdos activos</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {brandDeals.filter((d) => d.estado === 'activo').length}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">${totalActivo.toLocaleString()} pendiente</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Completados</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {brandDeals.filter((d) => d.estado === 'completado').length}
          </p>
          <p className="text-xs text-zinc-500 mt-1">${totalCompletado.toLocaleString()} cobrado</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Total acuerdos</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{brandDeals.length}</p>
          <p className="text-xs text-zinc-500 mt-1">
            ${brandDeals.reduce((acc, d) => acc + d.monto, 0).toLocaleString()} total
          </p>
        </div>
      </div>

      {/* Brand deal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {brandDeals.map((deal) => {
          const statusConfig = dealStatusConfig[deal.estado]
          return (
            <div
              key={deal.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{deal.marca}</h3>
                    <PlatformBadge platform={deal.plataforma} className="mt-1" />
                  </div>
                </div>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1', statusConfig.style)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dot)} />
                  {statusConfig.label}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-zinc-500 dark:text-zinc-400">Monto:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ${deal.monto.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-zinc-500 dark:text-zinc-400">Entrega:</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{deal.fechaEntrega}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
