import { ExternalLink, Download, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { EmptyState } from '@/shared/components/empty-state'
import { cn } from '@/shared/lib/utils'

interface DocumentPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  url?: string
  fileName?: string
  onDownload?: () => void
  className?: string
}

export function DocumentPreview({
  open,
  onOpenChange,
  title,
  description,
  url,
  fileName,
  onDownload,
  className,
}: DocumentPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-6xl p-0 overflow-hidden', className)}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <DialogHeader className="space-y-0">
            <DialogTitle className="text-base font-semibold text-foreground">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="flex items-center gap-2">
            {url && (
              <Button variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                  Abrir en nueva pestaña
                </a>
              </Button>
            )}
            {onDownload && (
              <Button size="sm" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Descargar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar vista previa"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="bg-surface-hover/40">
          {url ? (
            <iframe
              title={fileName ? `Vista previa de ${fileName}` : title}
              src={url}
              className="h-[78vh] w-full bg-background"
            />
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<Download className="h-5 w-5" />}
                title="Vista previa no disponible"
                description="No se ha proporcionado una URL para mostrar el documento."
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
