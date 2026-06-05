import { useParams, useNavigate } from 'react-router-dom'
import { useRequest, useSubmitRequest, useCancelRequest } from '@/features/requests/hooks/use-requests'
import { useOfficialDocuments } from '@/features/requests/hooks/use-official-documents'
import { DocumentsSection } from '@/features/requests/components/documents-section'
import { OfficialDocumentsSection } from '@/features/requests/components/official-documents-section'
import { ReviewPanel } from '@/features/requests/components/review-panel'
import { AwaitingDocumentsBanner } from '@/features/requests/components/awaiting-documents-banner'
import { StatusBadge } from '@/features/requests/components/status-badge'
import {
  getHistoryIcon,
  getHistoryColor,
  getHistoryLabel,
} from '@/features/requests/components/history-utils'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  ArrowLeft,
  Calendar,
  FileText,
  User,
  Clock,
  Send,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { useState } from 'react'

export function RequestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isReviewer } = usePermissions()
  const { data: request, isLoading } = useRequest(id || '')
  const { mutate: submit, isPending: submitting } = useSubmitRequest()
  const { mutate: cancel, isPending: cancelling } = useCancelRequest()
  const { data: officialDocs } = useOfficialDocuments(id || '')
  const [confirmAction, setConfirmAction] = useState<'submit' | 'cancel' | null>(null)

  const isOwner = request?.userId === user?.id
  const canSubmit = isOwner && request?.status === 'DRAFT'
  const canCancel = isOwner && !['APPROVED', 'REJECTED', 'CANCELLED'].includes(request?.status || '')

  const handleAction = () => {
    if (!id) return
    if (confirmAction === 'submit') {
      submit(id, { onSuccess: () => setConfirmAction(null) })
    } else if (confirmAction === 'cancel') {
      cancel(id, { onSuccess: () => setConfirmAction(null) })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-60 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <h3 className="text-base font-medium text-foreground">Solicitud no encontrada</h3>
        <Button className="mt-4" variant="outline" size="sm" onClick={() => navigate('/dashboard/requests')}>
          Volver al listado
        </Button>
      </div>
    )
  }

  const lastComment = request.history?.find((h) => h.comment)?.comment ?? undefined

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/requests')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {canSubmit && confirmAction !== 'submit' && (
            <Button size="sm" onClick={() => setConfirmAction('submit')}>
              <Send className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          )}
          {canCancel && confirmAction !== 'cancel' && (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction('cancel')}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {confirmAction && (
        <div className="rounded-lg border border-warning/20 bg-warning-soft p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {confirmAction === 'submit'
                  ? '¿Enviar solicitud a revisión?'
                  : '¿Cancelar esta solicitud?'}
              </p>
              <p className="text-xs text-muted-foreground">
                {confirmAction === 'submit'
                  ? 'Esta acción no se puede deshacer. La solicitud pasará a estado "Enviada".'
                  : 'La solicitud será marcada como cancelada y no podrá ser recuperada.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAction} disabled={submitting || cancelling}>
              {(submitting || cancelling) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmAction === 'submit' ? 'Confirmar envío' : 'Confirmar cancelación'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>
              Volver
            </Button>
          </div>
        </div>
      )}

      {request.status === 'PENDING_DOCUMENTS' && (
        <AwaitingDocumentsBanner
          comment={lastComment}
          isOwner={isOwner}
          onUploadClick={() => {
            const el = document.querySelector('[data-documents-section]')
            el?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      )}

      <div className="rounded-lg border border-border bg-surface">
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {request.trackingNumber}
                </span>
                <StatusBadge status={request.status} />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{request.title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                Tipo
              </div>
              <p className="text-sm font-medium text-foreground">
                {request.requestType?.name || '—'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Creada
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatDate(request.createdAt)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                Solicitante
              </div>
              <p className="text-sm font-medium text-foreground">
                {request.user?.fullName || '—'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Actualizada
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatDate(request.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {request.description && (
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-medium text-foreground mb-2">Descripción</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {request.description}
            </p>
          </div>
        )}
      </div>

      {id && isReviewer && <ReviewPanel requestId={id} currentStatus={request.status} />}

      {id && (officialDocs?.data?.length ?? 0) > 0 && (
        <OfficialDocumentsSection requestId={id} />
      )}

      <div data-documents-section>
        {id && <DocumentsSection requestId={id} />}
      </div>

      <div className="rounded-lg border border-border bg-surface">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Historial de cambios</h3>
        </div>

        <div className="p-6">
          {request.history && request.history.length > 0 ? (
            <div className="space-y-0">
              {request.history.map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${getHistoryColor(entry.newStatus)} bg-surface border border-border`}>
                      {getHistoryIcon(entry.newStatus)}
                    </div>
                    {index < (request.history?.length ?? 0) - 1 && (
                      <div className="w-px flex-1 bg-border my-1" />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {getHistoryLabel(entry.newStatus)}
                      </span>
                      {entry.previousStatus && entry.previousStatus !== entry.newStatus && (
                        <span className="text-xs text-muted-foreground">
                          (de {entry.previousStatus})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(entry.createdAt)}
                    </p>
                    {entry.comment && (
                      <div className="mt-2 rounded-md bg-surface-hover px-3 py-2 text-xs text-muted-foreground">
                        {entry.comment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay historial disponible
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
