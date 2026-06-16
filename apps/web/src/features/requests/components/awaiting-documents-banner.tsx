import { AlertCircle, Upload } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface AwaitingDocumentsBannerProps {
  comment?: string
  onUploadClick?: () => void
  isOwner: boolean
}

export function AwaitingDocumentsBanner({
  comment,
  onUploadClick,
  isOwner,
}: AwaitingDocumentsBannerProps) {
  return (
    <div
      className="rounded-2xl border border-warning/30 bg-warning-soft/50 p-4 space-y-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" aria-hidden="true" />
        <div className="space-y-1 min-w-0">
          <h4 className="text-sm font-semibold text-warning">
            Documentos pendientes
          </h4>
          <p className="text-sm text-muted-foreground">
            Se requieren documentos adicionales para continuar con la revisión de esta solicitud.
          </p>
          {comment && (
            <div className="mt-2 rounded-md bg-surface/80 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Nota del revisor:</span>{' '}
              {comment}
            </div>
          )}
        </div>
      </div>

      {isOwner && onUploadClick && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={onUploadClick}
            className="h-10 sm:h-9 w-full sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            Subir documentos
          </Button>
        </div>
      )}
    </div>
  )
}
