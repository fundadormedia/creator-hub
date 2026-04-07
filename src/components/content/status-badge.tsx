import { cn } from '@/lib/utils'
import type { Status } from '@/lib/supabase'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; style: string }> = {
  borrador: {
    label: 'Borrador',
    style: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30',
  },
  en_produccion: {
    label: 'En Producción',
    style: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  },
  programado: {
    label: 'Programado',
    style: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  },
  publicado: {
    label: 'Publicado',
    style: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        config.style,
        className
      )}
    >
      {config.label}
    </span>
  )
}
