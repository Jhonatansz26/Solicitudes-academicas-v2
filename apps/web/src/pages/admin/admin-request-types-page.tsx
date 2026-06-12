import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  useAllRequestTypes,
  useRequestTypeStats,
  useCreateRequestType,
  useUpdateRequestType,
  useDeleteRequestType,
} from '@/features/admin/hooks/use-request-types'
import {
  DetailDrawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerSection,
  DrawerDetailRow,
  DrawerStatPill,
  DrawerEmptyState,
} from '@/shared/components/detail-drawer'
import { KpiCard } from '@/shared/components/kpi-card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import { Label } from '@/shared/components/ui/label'
import { DeleteConfirmationDialog } from '@/shared/components/delete-confirmation-dialog'
import { FilterChip } from '@/shared/components/filter-chip'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Tag,
  Search,
  X,
  MoreVertical,
  Eye,
  Copy,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import type { RequestType } from '@/shared/types'
import { cn } from '@/shared/lib/utils'

const typeSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  description: z.string().optional(),
  estimatedDays: z.number({ message: 'Debe ser un número' }).min(1, 'Mínimo 1 día'),
})

type TypeForm = z.infer<typeof typeSchema>

export function AdminRequestTypesPage() {
  const { data: types, isLoading, isError, refetch } = useAllRequestTypes()
  const { mutate: create, isPending: creating } = useCreateRequestType()
  const { mutate: update, isPending: updating } = useUpdateRequestType()
  const { mutate: remove, isPending: deleting } = useDeleteRequestType()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RequestType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RequestType | null>(null)
  const [drawerType, setDrawerType] = useState<RequestType | null>(null)
  const { data: typeStats } = useRequestTypeStats(drawerType?.id ?? '')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filteredTypes = useMemo(() => {
    if (!types) return []
    return types.filter((t) => {
      const matchesSearch = searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === '' || (statusFilter === 'active' && t.isActive) || (statusFilter === 'inactive' && !t.isActive)
      return matchesSearch && matchesStatus
    })
  }, [types, searchQuery, statusFilter])

  const kpis = useMemo(() => {
    if (!types) return { active: 0, inactive: 0, avgDays: 0 }
    const active = types.filter((t) => t.isActive).length
    const inactive = types.filter((t) => !t.isActive).length
    const avgDays = types.length > 0 ? Math.round((types.reduce((sum, t) => sum + t.estimatedDays, 0) / types.length) * 10) / 10 : 0
    return { active, inactive, avgDays }
  }, [types])

  const hasActiveFilters = searchQuery || statusFilter

  return (
    <div className="space-y-5">
      {/* Compact Hero */}
      <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-gold-500 shadow-premium-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Configuración de Trámites
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground leading-tight">
              Tipos de Solicitud
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Catálogo de trámites académicos disponibles y su configuración operativa
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="gold" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Nuevo tipo
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Tipos Activos"
          value={kpis.active}
          icon={CheckCircle2}
          variant="success"
          trend="En producción"
          loading={isLoading && !types}
        />
        <KpiCard
          label="Inactivos"
          value={kpis.inactive}
          icon={X}
          variant="danger"
          trend="Fuera de uso"
          loading={isLoading && !types}
        />
        <KpiCard
          label="Tiempo Promedio"
          value={`${kpis.avgDays} días`}
          icon={Clock}
          variant="info"
          trend="De atención"
          loading={isLoading && !types}
        />
      </div>

      {/* Toolbar */}
      <div className="glass-panel rounded-xl p-3.5 shadow-premium-sm">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tipo de solicitud..."
              className="pl-9 h-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5">
            <Button
              variant={statusFilter === '' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setStatusFilter('')}
            >
              Todos
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setStatusFilter('active')}
            >
              Activos
            </Button>
            <Button
              variant={statusFilter === 'inactive' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setStatusFilter('inactive')}
            >
              Inactivos
            </Button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearchQuery(''); setStatusFilter('') }}
              className="h-8 text-xs text-muted-foreground"
            >
              <X className="mr-1 h-3 w-3" />
              Limpiar
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-border">
            {searchQuery && (
              <FilterChip label={`Búsqueda: "${searchQuery}"`} onRemove={() => setSearchQuery('')} />
            )}
            {statusFilter && (
              <FilterChip
                label={`Estado: ${statusFilter === 'active' ? 'Activos' : 'Inactivos'}`}
                onRemove={() => setStatusFilter('')}
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
          <h3 className="text-sm font-medium text-foreground">Error al cargar tipos</h3>
          <p className="mt-1 text-xs text-muted-foreground">Verifica tu conexión e intenta nuevamente</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      ) : filteredTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-14 text-center glass-panel">
          <Tag className="mb-3 h-9 w-9 text-muted-foreground/50" />
          <h3 className="text-sm font-medium text-foreground">No hay tipos de solicitud</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasActiveFilters ? 'Intenta cambiar los filtros' : 'Crea el primer tipo de solicitud'}
          </p>
          {!hasActiveFilters && (
            <Button className="mt-3" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              Crear tipo
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden glass-panel">
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-surface-hover/50">
            <div className="col-span-3">Nombre</div>
            <div className="col-span-4">Descripción</div>
            <div className="col-span-2">Días Est.</div>
            <div className="col-span-1">Estado</div>
            <div className="col-span-2"></div>
          </div>

          {/* Table Rows */}
          {filteredTypes.map((type) => (
            <div
              key={type.id}
              className="group grid grid-cols-12 gap-3 px-4 py-3 border-b border-border border-l-2 border-l-transparent last:border-0 items-center transition-all duration-150 hover:bg-gold-50/30 hover:border-l-gold-500 dark:hover:bg-gold-500/[0.04] cursor-pointer"
              onClick={() => setDrawerType(type)}
            >
              <div className="col-span-12 sm:col-span-3 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{type.name}</p>
              </div>

              <div className="col-span-12 sm:col-span-4 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{type.description || '—'}</p>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {type.estimatedDays} {type.estimatedDays === 1 ? 'día' : 'días'}
                  </span>
                  <div className="flex-1 h-1 rounded-full bg-surface-hover overflow-hidden max-w-[60px]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        type.estimatedDays <= 5 ? 'bg-success' : type.estimatedDays <= 10 ? 'bg-warning' : 'bg-danger'
                      )}
                      style={{ width: `${Math.min(100, (type.estimatedDays / 15) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-4 sm:col-span-1">
                <Badge variant={type.isActive ? 'active' : 'inactive'} className="text-[10px]">
                  {type.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="col-span-2 sm:col-span-2 flex justify-end">
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
                      <DropdownMenuItem onClick={() => setDrawerType(type)}>
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditTarget(type)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(type)}
                        className="text-danger focus:text-danger"
                        disabled={deleting}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Desactivar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      <DetailDrawer open={!!drawerType} onClose={() => setDrawerType(null)}>
        {drawerType && (
          <>
            <DrawerHeader
              eyebrow="Tipo de Solicitud"
              title={drawerType.name}
              badges={
                <Badge variant={drawerType.isActive ? 'active' : 'inactive'} className="text-[10px]">
                  {drawerType.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              }
              onClose={() => setDrawerType(null)}
            />
            <DrawerBody>
              {drawerType.description && (
                <DrawerSection title="Descripción">
                  <p className="text-xs text-muted-foreground leading-relaxed">{drawerType.description}</p>
                </DrawerSection>
              )}

              <DrawerSection title="Configuración Operativa">
                <DrawerDetailRow
                  label="Tiempo estimado"
                  value={
                    <span className="font-semibold text-foreground">
                      {drawerType.estimatedDays} {drawerType.estimatedDays === 1 ? 'día' : 'días'} hábiles
                    </span>
                  }
                />
                <DrawerDetailRow label="Estado" value={drawerType.isActive ? 'Activo' : 'Inactivo'} />
              </DrawerSection>

              <DrawerSection title="Documentos Requeridos">
                <DrawerEmptyState text="Los documentos requeridos se configurarán próximamente" />
              </DrawerSection>

              <DrawerSection title="Flujo de Aprobación">
                <DrawerEmptyState text="El flujo de aprobación se configurará próximamente" />
              </DrawerSection>

              <DrawerSection title="Estadísticas de Uso">
                <div className="flex gap-2 flex-wrap">
                  <DrawerStatPill value={typeStats?.thisMonth ?? 0} label="Este mes" />
                  <DrawerStatPill value={typeStats?.total ?? 0} label="Total" />
                  <DrawerStatPill
                    value={`${typeStats?.approvalRate ?? 0}%`}
                    label="Aprobación"
                    valueColor="text-success"
                  />
                </div>
                {(typeStats?.total ?? 0) === 0 && (
                  <p className="text-[10px] text-muted-foreground mt-2">Sin solicitudes de este tipo aún</p>
                )}
              </DrawerSection>
            </DrawerBody>
            <DrawerFooter>
              <Button
                variant="gold"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setDrawerType(null)
                  setEditTarget(drawerType)
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar configuración
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDrawerType(null)
                  setCreateOpen(true)
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicar
              </Button>
            </DrawerFooter>
          </>
        )}
      </DetailDrawer>

      {/* Create/Edit Dialog */}
      <TypeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nuevo tipo de solicitud"
        description="Completa los datos para crear un nuevo tipo."
        isPending={creating}
        onSubmit={(input) => {
          create(input, {
            onSuccess: () => {
              setCreateOpen(false)
              toast.success('Tipo creado correctamente')
            },
            onError: () => {
              toast.error('Error al crear el tipo')
            },
          })
        }}
      />

      {editTarget && (
        <TypeDialog
          open
          onOpenChange={() => setEditTarget(null)}
          title="Editar tipo de solicitud"
          description={`Modifica los datos de ${editTarget.name}.`}
          isPending={updating}
          defaultValues={{
            name: editTarget.name,
            description: editTarget.description ?? '',
            estimatedDays: editTarget.estimatedDays,
          }}
          onSubmit={(input) => {
            update({ id: editTarget.id, input }, {
              onSuccess: () => {
                setEditTarget(null)
                toast.success('Tipo actualizado')
              },
              onError: () => {
                toast.error('Error al actualizar el tipo')
              },
            })
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmationDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title="Desactivar tipo"
          description={`¿Estás seguro de que deseas desactivar "${deleteTarget.name}"? El tipo dejará de estar disponible para nuevas solicitudes, pero las existentes no se verán afectadas.`}
          isPending={deleting}
          onConfirm={() => {
            remove(deleteTarget.id, {
              onSuccess: () => {
                setDeleteTarget(null)
                toast.success('Tipo desactivado')
              },
              onError: (err) => {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                toast.error(msg || 'Error al desactivar el tipo')
                setDeleteTarget(null)
              },
            })
          }}
          confirmLabel="Desactivar"
        />
      )}
    </div>
  )
}

function TypeDialog({
  open,
  onOpenChange,
  title,
  description,
  isPending,
  defaultValues,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  isPending: boolean
  defaultValues?: TypeForm
  onSubmit: (input: { name: string; description?: string; estimatedDays: number }) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TypeForm>({
    resolver: zodResolver(typeSchema),
    defaultValues: defaultValues ?? { name: '', description: '', estimatedDays: 3 },
  })

  const handleForm = (data: TypeForm) => {
    onSubmit({
      name: data.name,
      description: data.description || undefined,
      estimatedDays: data.estimatedDays,
    })
    if (!defaultValues) reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type-name">Nombre *</Label>
            <Input
              id="type-name"
              {...register('name')}
              className={errors.name ? 'border-danger' : ''}
              disabled={isPending}
              autoFocus
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type-desc">Descripción</Label>
            <Textarea
              id="type-desc"
              rows={3}
              {...register('description')}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type-days">Días estimados *</Label>
            <Input
              id="type-days"
              type="number"
              {...register('estimatedDays', { valueAsNumber: true })}
              className={errors.estimatedDays ? 'border-danger' : ''}
              disabled={isPending}
            />
            {errors.estimatedDays && <p className="text-xs text-danger mt-1">{errors.estimatedDays.message}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" type="button" onClick={() => { reset(); onOpenChange(false) }}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {defaultValues ? 'Guardar cambios' : 'Crear tipo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
