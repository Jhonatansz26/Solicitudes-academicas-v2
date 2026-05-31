import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  useAllRequestTypes,
  useCreateRequestType,
  useUpdateRequestType,
  useDeleteRequestType,
} from '@/features/admin/hooks/use-request-types'
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
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import { Label } from '@/shared/components/ui/label'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react'
import type { RequestType } from '@/shared/types'

const typeSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  description: z.string().optional(),
  estimatedDays: z.number({ message: 'Debe ser un número' }).min(1, 'Mínimo 1 día'),
})

type TypeForm = z.infer<typeof typeSchema>

export function AdminRequestTypesPage() {
  const { data: types, isLoading, isError } = useAllRequestTypes()
  const { mutate: create, isPending: creating } = useCreateRequestType()
  const { mutate: update, isPending: updating } = useUpdateRequestType()
  const { mutate: remove, isPending: deleting } = useDeleteRequestType()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RequestType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RequestType | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Tipos de Solicitud</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los tipos de solicitud disponibles en el sistema
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo tipo
        </Button>
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
          <h3 className="text-base font-medium text-foreground">Error al cargar tipos</h3>
          <p className="mt-1 text-sm text-muted-foreground">Intenta recargar la página</p>
        </div>
      ) : !types?.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface py-16 text-center">
          <Tag className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-medium text-foreground">No hay tipos de solicitud</h3>
          <p className="mt-1 text-sm text-muted-foreground">Crea el primer tipo de solicitud</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">Nombre</div>
            <div className="col-span-4">Descripción</div>
            <div className="col-span-2">Días est.</div>
            <div className="col-span-1">Estado</div>
            <div className="col-span-2"></div>
          </div>

          {types.map((type) => (
            <div
              key={type.id}
              className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3.5 border-b border-border last:border-0 items-center transition-colors hover:bg-surface-hover"
            >
              <div className="sm:col-span-3">
                <p className="text-sm font-medium text-foreground">{type.name}</p>
              </div>

              <div className="sm:col-span-4">
                <p className="text-sm text-muted-foreground truncate">{type.description || '—'}</p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-sm text-muted-foreground">
                  {type.estimatedDays} {type.estimatedDays === 1 ? 'día' : 'días'}
                </span>
              </div>

              <div className="sm:col-span-1">
                <Badge
                  variant="outline"
                  className={
                    type.isActive
                      ? 'border-success/20 bg-success-soft text-success'
                      : 'border-muted-foreground/20 bg-surface-hover text-muted-foreground'
                  }
                >
                  {type.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="sm:col-span-2 flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setEditTarget(type)}
                  aria-label="Editar tipo"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-danger"
                  onClick={() => setDeleteTarget(type)}
                  disabled={deleting}
                  aria-label="Eliminar tipo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Desactivar tipo</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas desactivar "{deleteTarget.name}"?
                El tipo dejará de estar disponible para nuevas solicitudes, pero las existentes no se verán afectadas.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleting}
                onClick={() => {
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
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Desactivar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
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
            {errors.estimatedDays && <p className="text-xs text-danger">{errors.estimatedDays.message}</p>}
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
