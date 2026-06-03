import { useSearchParams } from 'react-router-dom'
import { useRequests } from '@/features/requests/hooks/use-requests'
import { StatusBadge } from '@/features/requests/components/status-badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  FileText,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Clock,
  X,
  AlertCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { REQUEST_STATUS_CONFIG } from '@/shared/constants'
import { FilterChip } from '@/shared/components/filter-chip'
import type { RequestStatus } from '@/shared/types'

const QUICK_FILTERS: { key: string; label: string; statuses: RequestStatus[] }[] = [
  { key: 'pending_review', label: 'Pendientes', statuses: ['SUBMITTED', 'IN_REVIEW'] },
  { key: 'all', label: 'Todas', statuses: [] },
]

export function RequestsList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isReviewer } = usePermissions()

  const page = Number(searchParams.get('page')) || 1
  const status = (searchParams.get('status') as RequestStatus) || undefined
  const search = searchParams.get('search') || undefined

  const { data, isLoading, isError, refetch } = useRequests({ page, status, search, limit: 20 })

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set('search', value)
    else params.delete('search')
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleStatusFilter = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') params.set('status', value)
    else params.delete('status')
    params.set('page', '1')
    setSearchParams(params)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(newPage))
    setSearchParams(params)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Solicitudes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión y seguimiento de solicitudes académicas
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/dashboard/requests/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva solicitud
        </Button>
      </div>

      {isReviewer && (
        <div className="flex gap-2">
          {QUICK_FILTERS.map((filter) => (
            <Button
              key={filter.key}
              variant={
                (!status && filter.key === 'all') ||
                (filter.key === 'pending_review' && ['SUBMITTED', 'IN_REVIEW'].includes(status || ''))
                  ? 'default'
                  : 'outline'
              }
              size="sm"
              onClick={() => {
                if (filter.key === 'pending_review') {
                  handleStatusFilter('SUBMITTED')
                } else {
                  handleStatusFilter('all')
                }
              }}
            >
              {filter.key === 'pending_review' && <Clock className="mr-1.5 h-3.5 w-3.5" />}
              {filter.label}
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título o número de seguimiento..."
              className="pl-9"
              defaultValue={search}
              onBlur={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch((e.target as HTMLInputElement).value)
              }}
            />
          </div>

          <Select value={status || ''} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REQUEST_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search || status) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchParams({})}
              className="text-muted-foreground"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {(search || status) && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <FilterChip label={`Búsqueda: "${search}"`} onRemove={() => handleSearch('')} />
            )}
            {status && (
              <FilterChip
                label={`Estado: ${REQUEST_STATUS_CONFIG[status]?.label}`}
                onRemove={() => handleStatusFilter('')}
              />
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-danger/20 bg-danger-soft py-16 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-danger/50" />
          <h3 className="text-base font-medium text-foreground">Error al cargar solicitudes</h3>
          <p className="mt-1 text-sm text-muted-foreground">Verifica tu conexión e intenta nuevamente</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-medium text-foreground">No se encontraron solicitudes</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || status
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Crea tu primera solicitud académica'}
          </p>
          {!search && !status && (
            <Button className="mt-4" size="sm" onClick={() => navigate('/dashboard/requests/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Crear solicitud
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-2">Tracking</div>
              <div className="col-span-4">Título</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-1">Fecha</div>
              <div className="col-span-1"></div>
            </div>

            {data?.data.map((req) => (
              <div
                key={req.id}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3.5 border-b border-border last:border-0 items-center transition-colors hover:bg-surface-hover cursor-pointer"
                onClick={() => navigate(`/dashboard/requests/${req.id}`)}
              >
                <div className="sm:col-span-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {req.trackingNumber}
                  </span>
                </div>

                <div className="sm:col-span-4">
                  <p className="text-sm font-medium text-foreground truncate">{req.title}</p>
                  {req.description && (
                    <p className="text-xs text-muted-foreground truncate sm:hidden">
                      {req.description}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <span className="text-sm text-muted-foreground">
                    {req.requestType?.name || '—'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <StatusBadge status={req.status} />
                </div>

                <div className="sm:col-span-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(req.createdAt)}
                  </span>
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {data.data.length} de {data.total} solicitudes
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ChevronLeft className="mr-1 h-3 w-3" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Página {page} de {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Siguiente
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}
