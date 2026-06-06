import type { RequestStatus } from '@/shared/types'

export const REQUEST_STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  DRAFT: {
    label: 'Borrador',
    color: 'text-muted-foreground',
    bg: 'bg-surface-hover',
    border: 'border-border',
  },
  SUBMITTED: {
    label: 'Enviada',
    color: 'text-info',
    bg: 'bg-info-soft',
    border: 'border-info/20',
  },
  IN_REVIEW: {
    label: 'En revisión',
    color: 'text-warning',
    bg: 'bg-warning-soft',
    border: 'border-warning/20',
  },
  PENDING_DOCUMENTS: {
    label: 'Docs. pendientes',
    color: 'text-warning',
    bg: 'bg-warning-soft',
    border: 'border-warning/20',
  },
  APPROVED: {
    label: 'Aprobada',
    color: 'text-success',
    bg: 'bg-success-soft',
    border: 'border-success/20',
  },
  REJECTED: {
    label: 'Rechazada',
    color: 'text-danger',
    bg: 'bg-danger-soft',
    border: 'border-danger/20',
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'text-muted-foreground',
    bg: 'bg-surface-hover',
    border: 'border-border',
  },
}

export const STATUS_TRANSITIONS: Record<string, RequestStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['IN_REVIEW', 'PENDING_DOCUMENTS', 'REJECTED'],
  IN_REVIEW: ['APPROVED', 'REJECTED', 'PENDING_DOCUMENTS'],
  PENDING_DOCUMENTS: ['IN_REVIEW', 'REJECTED'],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
}
