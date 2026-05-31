import { useState } from 'react'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { useChangeRequestStatus } from '@/features/requests/hooks/use-requests'
import { StatusBadge } from '@/features/requests/components/status-badge'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  CheckCircle,
  XCircle,
  FileSearch,
  Loader2,
  AlertCircle,
  ClipboardCheck,
} from 'lucide-react'
import type { RequestStatus } from '@/shared/types'

interface ReviewPanelProps {
  requestId: string
  currentStatus: RequestStatus
}

const ACTION_CONFIG: Record<RequestStatus, { icon: React.ReactNode; label: string; variant: 'default' | 'destructive' | 'outline' }[]> = {
  DRAFT: [],
  SUBMITTED: [
    { icon: <FileSearch className="h-4 w-4" />, label: 'Iniciar revisión', variant: 'default' as const },
  ],
  IN_REVIEW: [
    { icon: <CheckCircle className="h-4 w-4" />, label: 'Aprobar', variant: 'default' as const },
    { icon: <XCircle className="h-4 w-4" />, label: 'Rechazar', variant: 'destructive' as const },
    { icon: <FileSearch className="h-4 w-4" />, label: 'Solicitar documentos', variant: 'outline' as const },
  ],
  PENDING_DOCUMENTS: [
    { icon: <FileSearch className="h-4 w-4" />, label: 'Continuar revisión', variant: 'default' as const },
  ],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
}

export function ReviewPanel({ requestId, currentStatus }: ReviewPanelProps) {
  const { getAvailableActions, canApprove, canReject, canRequestDocuments } = usePermissions()
  const { mutate: changeStatus, isPending } = useChangeRequestStatus()
  const [rejectionOpen, setRejectionOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<RequestStatus | null>(null)

  const availableActions = getAvailableActions(currentStatus)
  if (availableActions.length === 0) return null

  const handleAction = (newStatus: RequestStatus) => {
    if (newStatus === 'REJECTED') {
      setRejectionOpen(true)
      return
    }

    setPendingAction(newStatus)
    changeStatus(
      { id: requestId, input: { newStatus } },
      {
        onSuccess: () => setPendingAction(null),
        onError: () => setPendingAction(null),
      }
    )
  }

  const handleReject = () => {
    if (comment.trim().length < 10) {
      setCommentError('El comentario debe tener al menos 10 caracteres')
      return
    }

    changeStatus(
      { id: requestId, input: { newStatus: 'REJECTED', comment: comment.trim() } },
      {
        onSuccess: () => {
          setRejectionOpen(false)
          setComment('')
          setCommentError(null)
        },
      }
    )
  }

  const actionButtons = availableActions.map((status) => {
    const config = ACTION_CONFIG[currentStatus]?.find((c) => {
      if (status === 'IN_REVIEW') return c.label.includes('Iniciar') || c.label.includes('Continuar')
      if (status === 'APPROVED') return c.label === 'Aprobar'
      if (status === 'REJECTED') return c.label === 'Rechazar'
      if (status === 'PENDING_DOCUMENTS') return c.label.includes('Solicitar')
      return false
    })

    if (!config) return null

    const isDisabled =
      (status === 'APPROVED' && !canApprove()) ||
      (status === 'REJECTED' && !canReject()) ||
      (status === 'PENDING_DOCUMENTS' && !canRequestDocuments()) ||
      isPending ||
      pendingAction !== null

    return (
      <Button
        key={status}
        size="sm"
        variant={config.variant}
        onClick={() => handleAction(status)}
        disabled={isDisabled}
      >
        {isPending && pendingAction === status && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {config.icon}
        <span className="ml-2">{config.label}</span>
      </Button>
    )
  }).filter(Boolean)

  return (
    <>
      <div className="rounded-lg border border-border bg-surface">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-medium text-foreground">Panel de revisión</h3>
                <p className="text-xs text-muted-foreground">
                  Estado actual de la solicitud
                </p>
              </div>
            </div>
            <StatusBadge status={currentStatus} />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">{actionButtons}</div>
        </div>
      </div>

      <Dialog open={rejectionOpen} onOpenChange={setRejectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-danger" />
              Rechazar solicitud
            </DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo. Este comentario será visible para el solicitante.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Textarea
              placeholder="Describe el motivo del rechazo..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value)
                if (commentError) setCommentError(null)
              }}
              rows={4}
              className={commentError ? 'border-danger' : ''}
              disabled={isPending}
            />
            {commentError && (
              <p className="text-sm text-danger flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {commentError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 10 caracteres. ({comment.length}/10)
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRejectionOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={isPending || comment.trim().length < 10}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
