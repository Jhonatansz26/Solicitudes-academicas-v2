import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAllOfficialDocuments, useDownloadOfficialDocumentById } from '@/features/requests/hooks/use-official-documents'
import { formatFileSize } from '@/shared/utils/file'
import { api } from '@/shared/api'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Download,
  Eye,
  Calendar,
  X,
  FileText,
} from 'lucide-react'
import { DataView } from '@/shared/components/data-view'
import { FilterChip } from '@/shared/components/filter-chip'
import type { OfficialDocument } from '@/shared/types'

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CERTIFICATE: 'Certificado',
  CONSTANCY: 'Constancia',
}

const DOCUMENT_TYPE_VARIANT: Record<string, 'status-pending' | 'status-approved'> = {
  CERTIFICATE: 'status-pending',
  CONSTANCY: 'status-approved',
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
    type: type === 'ALL' ? undefined : (type as 'CERTIFICATE' | 'CONSTANCY' | undefined),
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
        { responseType: 'blob' },
      )
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Ver PDF failed:', err)
    }
  }

  const hasActiveFilters = activeSearch.length > 0 || type !== 'ALL'
  const documents = data?.data ?? []

  return (
    <DataView<OfficialDocument>
      mode="table"
      data={
        data
          ? {
              data: documents,
              total: data.total,
              page: data.page,
              totalPages: data.totalPages,
            }
          : undefined
      }
      isLoading={isLoading}
      search={search}
      searchPlaceholder="Buscar por solicitud, tracking o generador..."
      onSearchChange={(v) => setSearch(v)}
      onSearchSubmit={() => handleSearch()}
      filters={
        <>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              <SelectItem value="CERTIFICATE">Certificado</SelectItem>
              <SelectItem value="CONSTANCY">Constancia</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setActiveSearch('')
                setType('ALL')
                setPage(1)
              }}
              className="h-9"
            >
              <X className="mr-1 h-3 w-3" />
              Limpiar
            </Button>
          )}
        </>
      }
      activeFilters={
        <>
          {activeSearch && (
            <FilterChip
              label={`Búsqueda: "${activeSearch}"`}
              onRemove={() => {
                setSearch('')
                setActiveSearch('')
                setPage(1)
              }}
            />
          )}
          {type !== 'ALL' && (
            <FilterChip
              label={`Tipo: ${DOCUMENT_TYPE_LABELS[type] ?? type}`}
              onRemove={() => {
                setType('ALL')
                setPage(1)
              }}
            />
          )}
        </>
      }
      title="Documentos Oficiales"
      description="Centro de documentos oficiales generados por el sistema"
      emptyTitle="Sin documentos oficiales"
      emptyDescription="Los documentos se generan automáticamente cuando una solicitud es aprobada"
      emptyIcon={<FileText className="h-6 w-6" />}
      columns={[
        {
          key: 'type',
          header: 'Tipo',
          width: '160px',
          cell: (doc) => (
            <Badge
              variant={DOCUMENT_TYPE_VARIANT[doc.type] ?? 'neutral'}
              className="text-eyebrow"
            >
              {DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}
            </Badge>
          ),
        },
        {
          key: 'version',
          header: 'Versión',
          width: '90px',
          cell: (doc) => (
            <span className="text-eyebrow text-muted-foreground">v{doc.version}</span>
          ),
        },
        {
          key: 'origin',
          header: 'Origen',
          width: '110px',
          cell: (doc) => {
            const isAuto = doc.notes?.toLowerCase().includes('automáticamente') || doc.version === 1
            return (
              <Badge
                variant={isAuto ? 'status-approved' : 'status-pending'}
                className="text-eyebrow"
              >
                {isAuto ? 'Auto' : 'Manual'}
              </Badge>
            )
          },
        },
        {
          key: 'request',
          header: 'Solicitud',
          hideOnMobile: true,
          cell: (doc) => (
            <div className="min-w-0">
              <Link
                to={`/dashboard/requests/${doc.request?.id ?? ''}`}
                className="text-sm font-medium text-foreground hover:text-gold-500 transition-colors line-clamp-1"
              >
                {doc.request?.title ?? '—'}
              </Link>
              <p className="text-eyebrow font-mono text-muted-foreground">
                {doc.request?.trackingNumber}
              </p>
            </div>
          ),
        },
        {
          key: 'generator',
          header: 'Generado por',
          hideOnMobile: true,
          cell: (doc) => (
            <span className="text-sm text-muted-foreground truncate">
              {doc.generator?.fullName ?? '—'}
            </span>
          ),
        },
        {
          key: 'createdAt',
          header: 'Fecha',
          width: '150px',
          hideOnMobile: true,
          cell: (doc) => (
            <span className="text-eyebrow text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(doc.createdAt)}
            </span>
          ),
        },
        {
          key: 'size',
          header: 'Tamaño',
          width: '100px',
          cell: (doc) => (
            <span className="text-eyebrow text-muted-foreground">
              {formatFileSize(doc.fileSize)}
            </span>
          ),
        },
        {
          key: 'actions',
          header: '',
          align: 'right',
          width: '170px',
          cell: (doc) => (
            <div
              className="flex items-center gap-1 justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => handleView(doc.id)}
                aria-label="Ver PDF"
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs">Ver</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => handleDownload(doc.id, doc.fileName)}
                aria-label="Descargar PDF"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="text-xs">Descargar</span>
              </Button>
            </div>
          ),
        },
      ]}
      rowKey={(doc) => doc.id}
      pagination={
        data
          ? {
              page: data.page,
              totalPages: data.totalPages,
              totalItems: data.total,
              pageSize: data.limit,
              onPageChange: setPage,
            }
          : undefined
      }
    />
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
