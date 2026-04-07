import { cn } from '@/lib/utils'
import type { Platform } from '@/lib/supabase'

interface PlatformBadgeProps {
  platform: Platform
  className?: string
}

const platformStyles: Record<Platform, string> = {
  YouTube: 'bg-red-500/15 text-red-400 border border-red-500/20',
  Instagram: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  TikTok: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
  Twitter: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  LinkedIn: 'bg-blue-700/15 text-blue-300 border border-blue-700/20',
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        platformStyles[platform],
        className
      )}
    >
      {platform}
    </span>
  )
}
