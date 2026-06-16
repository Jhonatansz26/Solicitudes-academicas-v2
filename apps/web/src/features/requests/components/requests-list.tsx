import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  useRequests,
  useRequestTypes,
  useRequest,
} from '@/features/requests/hooks/use-requests'
import { StatusBadge } from '@/features/requests/components/status-badge'
import {
  DetailDrawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerSection,
  DrawerDetailRow,
  DrawerDocItem,
  DrawerFlowStep,
  DrawerActivityItem,
  DrawerEmptyState,
} from '@/shared/components/detail-drawer'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu'
import {
  Plus,
  MoreVertical,
  Eye,
  Clock,
  X,
  File,
  ArrowRight,
  Download,
  Inbox,
} from 'lucide-react'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { REQUEST_STATUS_CONFIG } from '@/shared/constants'
import { FilterChip } from '@/shared/components/filter-chip'
import type { ColumnDef } from '@/shared/components/table-view'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { DataView } from '@/shared/components/data-view'
import { cn } from '@/shared/lib/utils'
import type { RequestStatus, RequestType } from '@/shared/types'

interface RequestRow {
  id: string
  trackingNumber: string
  title: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
  user: { id: string; fullName: string; email: string }
  requestType: { id: string; name: string }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarGradient(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const gradients = [
    'from-indigo-500 to-purple-500',
    'from-cyan-500 to-teal-500',
    'from-emerald-500 to-green-500',
    'from-amber-500 to-yellow-500',
    'from-red-500 to-rose-500',
    'from-navy-700 to-blue-500',
    'from-violet-500 to-purple-500',
    'from-gold-500 to-amber-500',
  ]
  return gradients[hash % gradients.length]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 30) return `${days}d`
  return formatDate(dateStr)
}

function getStatusOrder(s: RequestStatus): number {
  const order: Record<RequestStatus, number> = {
    DRAFT: 0,
    SUBMITTED: 1,
    IN_REVIEW: 2,
    PENDING_DOCUMENTS: 3,
    APPROVED: 4,
    REJECTED: 5,
    CANCELLED: 6,
  }
  return order[s] ?? 0
}

export function RequestsList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isReviewer, isStudent } = usePermissions()

  const page = Number(searchParams.get('page')) || 1
  const status = (searchParams.get('status') as RequestStatus) || undefined
  const search = searchParams.get('search') || ''
  const requestTypeId = searchParams.get('requestTypeId') || undefined

  const { data, isLoading, isError, refetch } = useRequests({
    page,
    status,
    search: search || undefined,
    requestTypeId,
    limit: 20,
  })
  const { data: requestTypes } = useRequestTypes()

  const [drawerRequestId, setDrawerRequestId] = useState<string | null>(null)
  const { data: drawerRequest, isLoading: drawerLoading } = useRequest(drawerRequestId ?? '')

  const rows: RequestRow[] = (data?.data ?? []) as unknown as RequestRow[]

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleSearch = (value: string) => {
    setParam('search', value || null)
  }

  const handleStatusFilter = (value: string) => {
    setParam('status', value && value !== 'all' ? value : null)
  }

  const handleTypeFilter = (value: string) => {
    setParam('requestTypeId', value && value !== 'all' ? value : null)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(newPage))
    setSearchParams(params)
  }

  const clearFilters = () => setSearchParams({})

  const hasActiveFilters = Boolean(search) || Boolean(status) || Boolean(requestTypeId)

  const flowSteps = drawerRequest?.history
    ? [...drawerRequest.history].sort(
        (a, b) => getStatusOrder(a.newStatus) - getStatusOrder(b.newStatus),
      )
    : []

  const columns: ColumnDef<RequestRow>[] = [
    {
      key: 'tracking',
      header: 'Tracking',
      width: '160px',
      cell: (row) => (
        <span className="font-mono text-eyebrow text-muted-foreground">
          {row.trackingNumber}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Solicitud',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{row.title}</p>
          <p className="text-eyebrow text-muted-foreground truncate mt-0.5">
            {row.requestType?.name ?? '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'solicitante',
      header: 'Solicitante',
      hideOnMobile: true,
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              'h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-eyebrow font-bold text-white bg-gradient-to-br',
              getAvatarGradient(row.user?.fullName ?? 'U'),
            )}
          >
            {getInitials(row.user?.fullName ?? 'U')}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-foreground truncate">{row.user?.fullName}</p>
            <p className="text-eyebrow text-muted-foreground truncate">{row.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      width: '160px',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      width: '120px',
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-eyebrow text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Acciones de la solicitud"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setDrawerRequestId(row.id)}>
              <Eye className="mr-2 h-3.5 w-3.5" />
              Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/dashboard/requests/${row.id}`)}>
              <ArrowRight className="mr-2 h-3.5 w-3.5" />
              Abrir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      {/* Drawer de detalle (sin cambios funcionales) */}
      <DetailDrawer open={!!drawerRequestId} onClose={() => setDrawerRequestId(null)}>
        {drawerRequestId && (
          <>
            {drawerLoading || !drawerRequest ? (
              <div className="px-5 py-8 space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-40" />
                <div className="pt-4 space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ) : (
              <>
                <DrawerHeader
                  eyebrow="Detalle de Solicitud"
                  title={drawerRequest.title}
                  subtitle={drawerRequest.trackingNumber}
                  badges={<StatusBadge status={drawerRequest.status} />}
                  onClose={() => setDrawerRequestId(null)}
                />
                <DrawerBody>
                  <DrawerSection title="Información General">
                    <DrawerDetailRow
                      label="Solicitante"
                      value={drawerRequest.user?.fullName ?? '—'}
                    />
                    <DrawerDetailRow
                      label="Correo"
                      value={drawerRequest.user?.email ?? '—'}
                    />
                    <DrawerDetailRow
                      label="Documento"
                      value={
                        <span className="font-mono">
                          {drawerRequest.user?.documentNumber ?? '—'}
                        </span>
                      }
                    />
                    <DrawerDetailRow
                      label="Programa"
                      value={drawerRequest.user?.studentProfile?.program ?? '—'}
                    />
                    <DrawerDetailRow
                      label="Fecha"
                      value={formatDate(drawerRequest.createdAt)}
                    />
                    <DrawerDetailRow
                      label="Última actualización"
                      value={formatRelativeTime(drawerRequest.updatedAt)}
                    />
                  </DrawerSection>

                  {drawerRequest.description && (
                    <DrawerSection title="Descripción">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {drawerRequest.description}
                      </p>
                    </DrawerSection>
                  )}

                  <DrawerSection title="Documentos Adjuntos">
                    {drawerRequest.attachments && drawerRequest.attachments.length > 0 ? (
                      drawerRequest.attachments.map((att) => (
                        <DrawerDocItem
                          key={att.id}
                          icon={<File className="h-3.5 w-3.5" />}
                          label={att.originalName}
                        />
                      ))
                    ) : (
                      <DrawerEmptyState text="Sin documentos adjuntos" />
                    )}
                  </DrawerSection>

                  <DrawerSection title="Flujo de Aprobación">
                    {flowSteps.length > 0 ? (
                      <div className="space-y-0">
                        {flowSteps.map((step, i) => (
                          <DrawerFlowStep
                            key={step.id}
                            icon={<Clock className="h-2.5 w-2.5" />}
                            iconBg={
                              step.newStatus === 'APPROVED'
                                ? 'bg-success-soft border-success-border text-success'
                                : step.newStatus === 'REJECTED'
                                  ? 'bg-danger-soft border-danger-border text-danger'
                                  : step.newStatus === 'PENDING_DOCUMENTS'
                                    ? 'bg-warning-soft border-warning-border text-warning'
                                    : 'bg-muted border-border text-muted-foreground'
                            }
                            title={REQUEST_STATUS_CONFIG[step.newStatus]?.label ?? step.newStatus}
                            description={
                              step.comment ??
                              `${step.user?.fullName ?? 'Sistema'} · ${formatDate(step.createdAt)}`
                            }
                            isLast={i === flowSteps.length - 1}
                          />
                        ))}
                      </div>
                    ) : (
                      <DrawerEmptyState text="Sin historial" />
                    )}
                  </DrawerSection>

                  <DrawerSection title="Actividad Reciente">
                    {drawerRequest.history && drawerRequest.history.length > 0 ? (
                      drawerRequest.history.slice(0, 5).map((step) => (
                        <DrawerActivityItem
                          key={step.id}
                          color={
                            step.newStatus === 'APPROVED'
                              ? 'bg-success'
                              : step.newStatus === 'REJECTED'
                                ? 'bg-danger'
                                : step.newStatus === 'CANCELLED'
                                  ? 'bg-muted-foreground'
                                  : step.newStatus === 'SUBMITTED'
                                    ? 'bg-info'
                                    : 'bg-warning'
                          }
                          text={
                            step.comment ??
                            `Estado cambiado a ${REQUEST_STATUS_CONFIG[step.newStatus]?.label ?? step.newStatus}`
                          }
                          time={formatRelativeTime(step.createdAt)}
                        />
                      ))
                    ) : (
                      <DrawerEmptyState text="Sin actividad" />
                    )}
                  </DrawerSection>
                </DrawerBody>
                <DrawerFooter>
                  <Button
                    variant="gold"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setDrawerRequestId(null)
                      navigate(`/dashboard/requests/${drawerRequest.id}`)
                    }}
                  >
                    Gestionar
                  </Button>
                  {drawerRequest.status === 'APPROVED' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  )}
                </DrawerFooter>
              </>
            )}
          </>
        )}
      </DetailDrawer>

      {/* DataView principal */}
      <DataView<RequestRow>
        mode="table"
        data={data ? { data: rows, total: data.total, page: data.page, totalPages: data.totalPages } : undefined}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        title="Solicitudes Académicas"
        description={
          isReviewer
            ? 'Seguimiento y administración de todos los trámites académicos activos'
            : 'Gestiona tus trámites académicos'
        }
        headerActions={
          !isReviewer && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate('/dashboard/requests/new')}
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva solicitud
            </Button>
          )
        }
        search={search}
        searchPlaceholder="Buscar por título o número de seguimiento..."
        onSearchChange={handleSearch}
        filters={
          <>
            <Select value={status ?? 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="h-9 w-[170px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(REQUEST_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={requestTypeId ?? 'all'} onValueChange={handleTypeFilter}>
              <SelectTrigger className="h-9 w-[170px]">
                <SelectValue placeholder="Tipo de solicitud" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {requestTypes?.map((rt: RequestType) => (
                  <SelectItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                <X className="mr-1 h-3 w-3" />
                Limpiar
              </Button>
            )}
          </>
        }
        activeFilters={
          <>
            {search && (
              <FilterChip
                label={`Búsqueda: "${search}"`}
                onRemove={() => handleSearch('')}
              />
            )}
            {status && (
              <FilterChip
                label={`Estado: ${REQUEST_STATUS_CONFIG[status]?.label}`}
                onRemove={() => handleStatusFilter('all')}
              />
            )}
            {requestTypeId && (
              <FilterChip
                label={`Tipo: ${requestTypes?.find((rt) => rt.id === requestTypeId)?.name ?? requestTypeId}`}
                onRemove={() => handleTypeFilter('all')}
              />
            )}
          </>
        }
        emptyTitle={isStudent ? 'Aún no tienes solicitudes' : 'No se encontraron solicitudes'}
        emptyDescription={
          hasActiveFilters
            ? 'Intenta cambiar los filtros de búsqueda'
            : isStudent
              ? 'Crea tu primera solicitud académica'
              : 'Cuando existan solicitudes, aparecerán aquí'
        }
        emptyAction={
          !isReviewer && !hasActiveFilters && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate('/dashboard/requests/new')}
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              Crear solicitud
            </Button>
          )
        }
        emptyIcon={<Inbox className="h-6 w-6" />}
        columns={columns}
        rowKey={(row) => row.id}
        onRowClick={(row) => setDrawerRequestId(row.id)}
        pagination={
          data
            ? {
                page: data.page,
                totalPages: data.totalPages,
                totalItems: data.total,
                pageSize: data.limit,
                onPageChange: handlePageChange,
              }
            : undefined
        }
      />
    </>
  )
}
