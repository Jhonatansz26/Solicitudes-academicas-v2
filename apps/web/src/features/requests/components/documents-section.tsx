import { useRef, useState } from 'react'
import { useRequestDocuments, useUploadDocument, useDeleteDocument } from '@/features/requests/hooks/use-documents'
import { downloadDocument } from '@/features/requests/api/documents-api'
import { formatFileSize, getFileIcon, getFileTypeLabel } from '@/shared/utils/file'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Upload,
  Download,
  Trash2,
  FileText,
  Loader2,
  AlertCircle,
  Paperclip,
} from 'lucide-react'
import type { RequestStatus } from '@/shared/types'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

interface DocumentsSectionProps {
  requestId: string
  requestStatus: RequestStatus
  requestUserId: string
}

export function DocumentsSection({
  requestId,
  requestStatus,
  requestUserId,
}: DocumentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: documents, isLoading } = useRequestDocuments(requestId)
  const { mutate: upload, isPending: uploading } = useUploadDocument()
  const { mutate: deleteDoc, isPending: deleting } = useDeleteDocument()
  const { canUploadToRequest, canDeleteAttachment } = usePermissions()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; uploadedBy: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canUpload = canUploadToRequest(requestUserId, requestStatus)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo PDF, PNG, JPG, DOC, DOCX, XLS, XLSX')
      e.target.value = ''
      return
    }

    if (file.size > MAX_SIZE) {
      setError('El archivo excede el tamaño máximo de 10MB')
      e.target.value = ''
      return
    }

    upload(
      { file, requestId },
      {
        onSuccess: () => {
          setError(null)
          if (fileInputRef.current) fileInputRef.current.value = ''
        },
        onError: () => {
          setError('Error al subir el archivo. Intenta de nuevo')
        },
      }
    )
  }

  const handleDownload = async (id: string, fileName: string) => {
    try {
      await downloadDocument(id, fileName)
    } catch {
      setError('Error al descargar el archivo')
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteDoc({ id: deleteTarget.id, requestId }, {
      onSuccess: () => setDeleteTarget(null),
      onError: () => setError('Error al eliminar el archivo'),
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
          <h3 className="text-sm font-medium text-foreground">Documentos adjuntos</h3>
          {documents && (
            <span className="text-xs text-muted-foreground">({documents.length})</span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="absolute w-0 h-0 opacity-0 pointer-events-none"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
          onChange={handleFileSelect}
          disabled={uploading || !canUpload}
        />
        {canUpload && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-10 sm:h-9 w-full sm:w-auto"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading ? 'Subiendo...' : 'Subir archivo'}
          </Button>
        )}
      </div>

      {error && (
        <div className="px-4 sm:px-6 pt-4">
          <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : documents?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">Sin documentos adjuntos</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sube archivos PDF, imágenes o documentos para esta solicitud
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents?.map((doc) => {
              const canDelete = canDeleteAttachment(
                doc.uploadedBy,
                requestUserId,
                requestStatus,
              )
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-surface-hover min-h-[60px] gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">
                      {getFileIcon(doc.mimeType)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.originalName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>·</span>
                        <span>{getFileTypeLabel(doc.mimeType)}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline">{formatDate(doc.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => handleDownload(doc.id, doc.originalName)}
                      aria-label="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-danger"
                        onClick={() =>
                          setDeleteTarget({
                            id: doc.id,
                            name: doc.originalName,
                            uploadedBy: doc.uploadedBy,
                          })
                        }
                        disabled={deleting}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar documento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{deleteTarget?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
