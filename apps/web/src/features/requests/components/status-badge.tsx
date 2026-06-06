import { Badge } from '@/shared/components/ui/badge'
import { REQUEST_STATUS_CONFIG } from '@/shared/constants'
import type { RequestStatus } from '@/shared/types'
import { cn } from '@/shared/lib/utils'

const STATUS_TO_VARIANT: Record<RequestStatus, string> = {
  DRAFT: 'status-draft',
  SUBMITTED: 'status-pending',
  IN_REVIEW: 'status-review',
  PENDING_DOCUMENTS: 'status-pending-docs',
  APPROVED: 'status-approved',
  REJECTED: 'status-rejected',
  CANCELLED: 'status-cancelled',
}

const STATUS_DOT_COLOR: Record<RequestStatus, string> = {
  DRAFT: 'bg-muted-foreground',
  SUBMITTED: 'bg-info',
  IN_REVIEW: 'bg-warning',
  PENDING_DOCUMENTS: 'bg-warning',
  APPROVED: 'bg-success',
  REJECTED: 'bg-danger',
  CANCELLED: 'bg-muted-foreground',
}

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = REQUEST_STATUS_CONFIG[status]
  if (!config) return null

  return (
    <Badge variant={STATUS_TO_VARIANT[status] as never} className={className}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', STATUS_DOT_COLOR[status])} />
      {config.label}
    </Badge>
  )
}
