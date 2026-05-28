import { cn } from '@/shared/lib/utils'
import { REQUEST_STATUS_CONFIG } from '@/shared/constants'
import type { RequestStatus } from '@/shared/types'

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = REQUEST_STATUS_CONFIG[status]
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.bg,
        config.color,
        config.border,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.color.replace('text-', 'bg-'))} />
      {config.label}
    </span>
  )
}
