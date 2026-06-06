import { useState } from 'react'
import { useAllOfficialDocuments, useDownloadOfficialDocumentById } from '@/features/requests/hooks/use-official-documents'
import { formatFileSize } from '@/shared/utils/file'
import { api } from '@/shared/api'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  FileBadge,
  Download,
  Eye,
  Calendar,
  User,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CERTIFICATE: 'Certificado',
  CONSTANCY: 'Constancia',
}

const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  CERTIFICATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CONSTANCY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

export function DocumentsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [type, setType] = useState<string>('ALL')

  const { data, isLoading } = useAllOfficialDocuments({
    page,
    limit,
    type: type === 'ALL' ? undefined : type,
    search: activeSearch || undefined,
  })

  const { download } = useDownloadOfficialDocumentById()

  const handleSearch = () => {
    setActiveSearch(search)
    setPage(1)
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      await download(documentId, fileName)
    } catch {
      // Error handled silently
    }
  }

  const handleView = async (documentId: string) => {
    try {
      const response = await api.get(
        `/api/official-documents/${documentId}/download`,
        { responseType: 'blob' }
      )
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Ver PDF failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Documentos Oficiales</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Centro de documentos oficiales generados por el sistema
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por solicitud, tracking o generador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button size="sm" onClick={handleSearch}>
              Buscar
            </Button>
          </div>

          <Select value={type} onValueChange={(v) => { setType(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="CERTIFICATE">Certificado</SelectItem>
              <SelectItem value="CONSTANCY">Constancia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border border-border bg-surface">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileBadge className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Documentos generados</h3>
            {data && (
              <span className="text-xs text-muted-foreground">({data.total} total)</span>
            )}
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">Sin documentos oficiales</p>
              <p className="text-xs text-muted-foreground mt-1">
                Los documentos oficiales se generan automáticamente cuando una solicitud es aprobada
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.data.map((doc) => {
                const typeLabel = DOCUMENT_TYPE_LABELS[doc.type] || doc.type
                const typeColor = DOCUMENT_TYPE_COLORS[doc.type] || 'bg-muted text-muted-foreground'
                const isAutoGenerated = doc.notes?.toLowerCase().includes('automáticamente') || doc.version === 1

                return (
                  <div
                    key={doc.id}
                    className="group rounded-lg border border-border bg-surface p-4 transition-all hover:border-primary/20 hover:shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5">
                          <FileBadge className="h-5 w-5 text-primary" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-sm font-semibold text-foreground">
                              {typeLabel}
                            </p>
                            <Badge variant="secondary" className={`text-[10px] font-bold ${typeColor}`}>
                              v{doc.version}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] font-semibold",
                                isAutoGenerated 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                                  : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                              )}
                            >
                              {isAutoGenerated ? 'Auto' : 'Manual'}
                            </Badge>
                          </div>

                          <Link
                            to={`/dashboard/requests/${doc.request?.id}`}
                            className="text-sm text-foreground hover:text-primary transition-colors font-medium line-clamp-1"
                          >
                            {doc.request?.title || '—'}
                          </Link>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                            <span className="font-mono text-[11px]">{doc.request?.trackingNumber}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(doc.createdAt)}
                            </span>
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {doc.generator?.fullName || '—'}
                            </span>
                          </div>

                          {doc.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">
                              {doc.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => handleView(doc.id)}
                          title="Ver PDF"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="text-xs">Ver</span>
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => handleDownload(doc.id, doc.fileName)}
                          title="Descargar PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="text-xs">Descargar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-6 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando {((data.page - 1) * data.limit) + 1}–{Math.min(data.page * data.limit, data.total)} de {data.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Página {data.page} de {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
