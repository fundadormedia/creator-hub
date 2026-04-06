import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subtitle?: string
  trend?: number
  className?: string
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  className,
}: MetricCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0

  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              isPositiveTrend
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            )}
          >
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
