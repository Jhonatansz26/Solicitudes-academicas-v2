import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useRequests, useDashboardStats, useRequestTypes, useRequest } from '@/features/requests/hooks/use-requests'
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
import { KpiCard } from '@/shared/components/kpi-card'
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu'
import {
  FileText,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Pencil,
  Clock,
  X,
  AlertCircle,
  File,
  CheckCircle2,
  ArrowRight,
  Download,
  Sparkles,
} from 'lucide-react'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { REQUEST_STATUS_CONFIG } from '@/shared/constants'
import { FilterChip } from '@/shared/components/filter-chip'
import { cn } from '@/shared/lib/utils'
import type { RequestStatus } from '@/shared/types'

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

const TYPE_BADGE_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  'Certificado': { bg: 'bg-info-soft', text: 'text-info', border: 'border-info/20' },
  'Homologación': { bg: 'bg-warning-soft', text: 'text-warning', border: 'border-warning/20' },
  'Cancelación': { bg: 'bg-danger-soft', text: 'text-danger', border: 'border-danger/20' },
  'Paz y salvo': { bg: 'bg-success-soft', text: 'text-success', border: 'border-success/20' },
  'Recurso': { bg: 'bg-surface-hover', text: 'text-muted-foreground', border: 'border-border' },
}

function getTypeBadgeClasses(typeName: string): string {
  const config = TYPE_BADGE_CONFIG[typeName]
  if (!config) return 'bg-surface-hover text-muted-foreground border-border'
  return `${config.bg} ${config.text} border ${config.border}`
}

const FLOW_STEP_CONFIG: Record<string, { icon: React.ReactNode; bg: string }> = {
  DRAFT: { icon: <File className="h-2.5 w-2.5" />, bg: 'bg-surface border-border text-muted-foreground' },
  SUBMITTED: { icon: <ArrowRight className="h-2.5 w-2.5" />, bg: 'bg-info-soft border-info/40 text-info' },
  IN_REVIEW: { icon: <Clock className="h-2.5 w-2.5" />, bg: 'bg-warning-soft border-warning/40 text-warning' },
  PENDING_DOCUMENTS: { icon: <File className="h-2.5 w-2.5" />, bg: 'bg-warning-soft border-warning/40 text-warning' },
  APPROVED: { icon: <CheckCircle2 className="h-2.5 w-2.5" />, bg: 'bg-success-soft border-success/40 text-success' },
  REJECTED: { icon: <X className="h-2.5 w-2.5" />, bg: 'bg-danger-soft border-danger/40 text-danger' },
  CANCELLED: { icon: <X className="h-2.5 w-2.5" />, bg: 'bg-surface border-border text-muted-foreground' },
}

export function RequestsList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isReviewer } = usePermissions()

  const page = Number(searchParams.get('page')) || 1
  const status = (searchParams.get('status') as RequestStatus) || undefined
  const search = searchParams.get('search') || undefined
  const requestTypeId = searchParams.get('requestTypeId') || undefined

  const { data, isLoading, isError, refetch } = useRequests({ page, status, search, requestTypeId, limit: 20 })
  const { data: stats } = useDashboardStats()
  const { data: requestTypes } = useRequestTypes()

  const [drawerRequestId, setDrawerRequestId] = useState<string | null>(null)
  const { data: drawerRequest, isLoading: drawerLoading } = useRequest(drawerRequestId ?? '')

  const total = stats?.total ?? 0
  const pending = (stats?.submitted ?? 0) + (stats?.inReview ?? 0)
  const approved = stats?.approved ?? 0
  const inReview = stats?.inReview ?? 0

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

  const handleTypeFilter = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') params.set('requestTypeId', value)
    else params.delete('requestTypeId')
    params.set('page', '1')
    setSearchParams(params)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(newPage))
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasActiveFilters = search || status || requestTypeId

  const getStatusOrder = (s: RequestStatus): number => {
    const order: Record<RequestStatus, number> = {
      DRAFT: 0, SUBMITTED: 1, IN_REVIEW: 2, PENDING_DOCUMENTS: 3,
      APPROVED: 4, REJECTED: 5, CANCELLED: 6,
    }
    return order[s] ?? 0
  }

  const flowSteps = drawerRequest?.history
    ? [...drawerRequest.history]
        .sort((a, b) => getStatusOrder(a.newStatus) - getStatusOrder(b.newStatus))
    : []

  const activityItems = (drawerRequest?.history ?? [])
    .slice(0, 5)
    .map((step) => {
      const actorName = step.user?.fullName
      const statusLabel = REQUEST_STATUS_CONFIG[step.newStatus]?.label ?? step.newStatus
      const text = step.comment
        ? step.comment
        : actorName
          ? `Estado cambiado a ${statusLabel} por ${actorName}`
          : `Estado cambiado a ${statusLabel}`

      const dotColor =
        step.newStatus === 'APPROVED' ? 'bg-success' :
        step.newStatus === 'REJECTED' ? 'bg-danger' :
        step.newStatus === 'CANCELLED' ? 'bg-muted-foreground' :
        step.newStatus === 'SUBMITTED' ? 'bg-info' :
        'bg-warning'

      return {
        color: dotColor,
        text,
        time: formatRelativeTime(step.createdAt),
      }
    })

  return (
    <div className="space-y-5">
      {/* Compact Hero */}
      <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-gold-500 shadow-premium-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Gestión de Solicitudes
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground leading-tight">
              Solicitudes Académicas
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seguimiento y administración de todos los trámites académicos activos
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate(isReviewer ? '/dashboard/requests' : '/dashboard/requests/new')}
            >
              {isReviewer ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Ver solicitudes
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Nueva solicitud
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total"
          value={total}
          icon={FileText}
          variant="primary"
          trend={`${stats?.draft ?? 0} borradores`}
          loading={isLoading && !stats}
        />
        <KpiCard
          label="Pendientes"
          value={pending}
          icon={Clock}
          variant="warning"
          trend="Requieren acción"
          loading={isLoading && !stats}
        />
        <KpiCard
          label="Aprobadas"
          value={approved}
          icon={CheckCircle2}
          variant="success"
          trend={`${stats?.rejected ?? 0} rechazadas`}
          loading={isLoading && !stats}
        />
        <KpiCard
          label="En Revisión"
          value={inReview}
          icon={Search}
          variant="info"
          trend="Flujo operativo"
          loading={isLoading && !stats}
        />
      </div>

      {/* Toolbar */}
      <div className="glass-panel rounded-xl p-3.5 shadow-premium-sm">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título o número de seguimiento..."
              className="pl-9 h-8 text-sm"
              defaultValue={search}
              onBlur={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch((e.target as HTMLInputElement).value)
              }}
            />
          </div>

          <Select value={status || ''} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[170px] h-8 text-sm">
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

          <Select value={requestTypeId || ''} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-[170px] h-8 text-sm">
              <SelectValue placeholder="Tipo de solicitud" />
            </SelectTrigger>
            <SelectContent>
              {requestTypes?.map((rt) => (
                <SelectItem key={rt.id} value={rt.id}>
                  {rt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-muted-foreground">
              <X className="mr-1 h-3 w-3" />
              Limpiar
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-border">
            {search && (
              <FilterChip label={`Búsqueda: "${search}"`} onRemove={() => handleSearch('')} />
            )}
            {status && (
              <FilterChip
                label={`Estado: ${REQUEST_STATUS_CONFIG[status]?.label}`}
                onRemove={() => handleStatusFilter('')}
              />
            )}
            {requestTypeId && (
              <FilterChip
                label={`Tipo: ${requestTypes?.find((rt) => rt.id === requestTypeId)?.name ?? requestTypeId}`}
                onRemove={() => handleTypeFilter('')}
              />
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-danger/20 bg-danger-soft py-14 text-center glass-panel">
          <AlertCircle className="mb-3 h-9 w-9 text-danger/50" />
          <h3 className="text-sm font-medium text-foreground">Error al cargar solicitudes</h3>
          <p className="mt-1 text-xs text-muted-foreground">Verifica tu conexión e intenta nuevamente</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-14 text-center glass-panel">
          <FileText className="mb-3 h-9 w-9 text-muted-foreground/50" />
          <h3 className="text-sm font-medium text-foreground">No se encontraron solicitudes</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasActiveFilters ? 'Intenta cambiar los filtros de búsqueda' : 'Crea tu primera solicitud académica'}
          </p>
          {!hasActiveFilters && (
            <Button className="mt-3" size="sm" onClick={() => navigate('/dashboard/requests/new')}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              Crear solicitud
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-surface overflow-hidden glass-panel">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-surface-hover/50">
              <div className="col-span-3">Solicitud</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-2">Solicitante</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Rows */}
            {data?.data.map((req) => (
              <div
                key={req.id}
                className="group grid grid-cols-12 gap-3 px-4 py-3 border-b border-border border-l-2 border-l-transparent last:border-0 items-center transition-all duration-150 hover:bg-gold-50/30 hover:border-l-gold-500 dark:hover:bg-gold-500/[0.04] cursor-pointer"
                onClick={() => setDrawerRequestId(req.id)}
              >
                <div className="col-span-12 sm:col-span-3 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{req.title}</p>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {req.trackingNumber}
                  </span>
                </div>

                <div className="col-span-6 sm:col-span-2 hidden sm:block">
                  {req.requestType?.name ? (
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                      getTypeBadgeClasses(req.requestType.name)
                    )}>
                      {req.requestType.name}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-2 min-w-0">
                  {req.user ? (
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white bg-gradient-to-br',
                          getAvatarGradient(req.user.fullName)
                        )}
                      >
                        {getInitials(req.user.fullName)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-foreground truncate block">
                          {req.user.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate block">
                          {req.user.email}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <StatusBadge status={req.status} />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(req.createdAt)}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <div
                    className="sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" className="h-7 w-7">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => setDrawerRequestId(req.id)}>
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/requests/${req.id}`)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Abrir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Mostrando {data.data.length} de {data.total} solicitudes
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="h-7 text-xs"
                >
                  <ChevronLeft className="mr-1 h-3 w-3" />
                  Anterior
                </Button>
                <span className="text-xs text-muted-foreground px-2">
                  Página {page} de {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="h-7 text-xs"
                >
                  Siguiente
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Drawer */}
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
                <div className="pt-4 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <>
                <DrawerHeader
                  eyebrow="Detalle de Solicitud"
                  title={drawerRequest.title}
                  subtitle={drawerRequest.trackingNumber}
                  badges={
                    <>
                      <StatusBadge status={drawerRequest.status} />
                      {drawerRequest.requestType?.name && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-hover text-muted-foreground border border-border">
                          {drawerRequest.requestType.name}
                        </span>
                      )}
                    </>
                  }
                  onClose={() => setDrawerRequestId(null)}
                />
                <DrawerBody>
                  <DrawerSection title="Información General">
                    <DrawerDetailRow label="Solicitante" value={drawerRequest.user?.fullName ?? '—'} />
                    <DrawerDetailRow label="Correo" value={drawerRequest.user?.email ?? '—'} />
                    <DrawerDetailRow label="Documento" value={<span className="font-mono">{drawerRequest.user?.documentNumber ?? '—'}</span>} />
                    <DrawerDetailRow
                      label="Programa"
                      value={drawerRequest.user?.studentProfile?.program ?? '—'}
                    />
                    <DrawerDetailRow
                      label="Semestre"
                      value={drawerRequest.user?.studentProfile?.semester?.toString() ?? '—'}
                    />
                    <DrawerDetailRow label="Fecha radicación" value={formatDate(drawerRequest.createdAt)} />
                    <DrawerDetailRow label="Última actualización" value={formatRelativeTime(drawerRequest.updatedAt)} />
                  </DrawerSection>

                  {drawerRequest.description && (
                    <DrawerSection title="Descripción">
                      <p className="text-xs text-muted-foreground leading-relaxed">{drawerRequest.description}</p>
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
                        {flowSteps.map((step, i) => {
                          const config = FLOW_STEP_CONFIG[step.newStatus] ?? FLOW_STEP_CONFIG.DRAFT
                          const actorName = step.user?.fullName
                          const description = step.comment
                            ? step.comment
                            : actorName
                              ? `${actorName} · ${formatDate(step.createdAt)}`
                              : formatDate(step.createdAt)
                          return (
                            <DrawerFlowStep
                              key={step.id}
                              icon={config.icon}
                              iconBg={config.bg}
                              title={REQUEST_STATUS_CONFIG[step.newStatus]?.label ?? step.newStatus}
                              description={description}
                              isLast={i === flowSteps.length - 1}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <DrawerEmptyState text="Sin historial de cambios" />
                    )}
                  </DrawerSection>

                  <DrawerSection title="Actividad Reciente">
                    {activityItems.length > 0 ? (
                      activityItems.map((item, i) => (
                        <DrawerActivityItem
                          key={i}
                          color={item.color}
                          text={item.text}
                          time={item.time}
                        />
                      ))
                    ) : (
                      <DrawerEmptyState text="Sin actividad registrada" />
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

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  if (days < 30) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
  return new Date(dateStr).toLocaleDateString('es-CO')
}
