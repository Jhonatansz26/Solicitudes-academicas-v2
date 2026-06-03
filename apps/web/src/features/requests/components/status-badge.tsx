import { Badge } from '@/shared/components/ui/badge'
import { REQUEST_STATUS_CONFIG } from '@/shared/constants'
import type { RequestStatus } from '@/shared/types'

const STATUS_TO_VARIANT: Record<RequestStatus, string> = {
  DRAFT: 'status-draft',
  SUBMITTED: 'status-pending',
  IN_REVIEW: 'status-review',
  PENDING_DOCUMENTS: 'status-pending-docs',
  APPROVED: 'status-approved',
  REJECTED: 'status-rejected',
  CANCELLED: 'status-cancelled',
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
      {config.label}
    </Badge>
  )
}
