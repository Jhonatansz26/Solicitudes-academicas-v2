import {
  FileText,
  Send,
  FileSearch,
  CheckCircle,
  XCircle,
  X,
  Upload,
  Trash2,
  FilePlus,
} from 'lucide-react'
import type { RequestStatus } from '@/shared/types'
import type { ReactNode } from 'react'

interface HistoryEntry {
  id: string
  newStatus: RequestStatus | 'DOCUMENT_UPLOADED' | 'DOCUMENT_DELETED'
  previousStatus?: RequestStatus | null
  comment?: string | null
  createdAt: string
  actorName?: string
  actorRole?: string
}

const STATUS_ICONS: Record<string, { icon: ReactNode; color: string; label: string }> = {
  DRAFT: { icon: <FileText className="h-4 w-4" />, color: 'text-muted-foreground', label: 'Borrador creado' },
  SUBMITTED: { icon: <Send className="h-4 w-4" />, color: 'text-info', label: 'Solicitud enviada' },
  IN_REVIEW: { icon: <FileSearch className="h-4 w-4" />, color: 'text-warning', label: 'En revisión' },
  PENDING_DOCUMENTS: { icon: <Upload className="h-4 w-4" />, color: 'text-warning', label: 'Documentos pendientes' },
  APPROVED: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-success', label: 'Aprobada' },
  REJECTED: { icon: <XCircle className="h-4 w-4" />, color: 'text-danger', label: 'Rechazada' },
  CANCELLED: { icon: <X className="h-4 w-4" />, color: 'text-muted-foreground', label: 'Cancelada' },
  DOCUMENT_UPLOADED: { icon: <FilePlus className="h-4 w-4" />, color: 'text-info', label: 'Documento subido' },
  DOCUMENT_DELETED: { icon: <Trash2 className="h-4 w-4" />, color: 'text-muted-foreground', label: 'Documento eliminado' },
}

export function getHistoryIcon(status: string): ReactNode {
  return STATUS_ICONS[status]?.icon || <FileText className="h-4 w-4" />
}

export function getHistoryColor(status: string): string {
  return STATUS_ICONS[status]?.color || 'text-muted-foreground'
}

export function getHistoryLabel(status: string): string {
  return STATUS_ICONS[status]?.label || status
}

export function getDotColor(status: string): string {
  const colorMap: Record<string, string> = {
    DRAFT: 'bg-muted-foreground',
    SUBMITTED: 'bg-info',
    IN_REVIEW: 'bg-warning',
    PENDING_DOCUMENTS: 'bg-warning',
    APPROVED: 'bg-success',
    REJECTED: 'bg-danger',
    CANCELLED: 'bg-muted-foreground',
    DOCUMENT_UPLOADED: 'bg-info',
    DOCUMENT_DELETED: 'bg-muted-foreground',
  }
  return colorMap[status] || 'bg-muted-foreground'
}

export type { HistoryEntry }
