import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useCreateRequest, useRequestTypes } from '@/features/requests/hooks/use-requests'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ArrowLeft, Loader2 } from 'lucide-react'

const createSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200, 'El título es demasiado largo'),
  description: z.string().max(1000, 'La descripción es demasiado larga').optional().or(z.literal('')),
  requestTypeId: z.string().min(1, 'Selecciona un tipo de solicitud'),
})

type CreateForm = z.infer<typeof createSchema>

export function CreateRequest() {
  const navigate = useNavigate()
  const { data: types, isLoading: loadingTypes } = useRequestTypes()
  const { mutate: create, isPending } = useCreateRequest()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: '',
      description: '',
      requestTypeId: '',
    },
  })

  const onSubmit = (data: CreateForm) => {
    create(data, {
      onSuccess: (newRequest) => {
        navigate(`/dashboard/requests/${newRequest.id}`)
      },
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div>
        <h1>Nueva Solicitud</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Completa los datos para crear una nueva solicitud académica
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-border bg-surface p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tipo de solicitud <span className="text-danger">*</span>
            </label>
            {loadingTypes ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={undefined}
                onValueChange={(value) => setValue('requestTypeId', value, { shouldValidate: true })}
              >
                <SelectTrigger className={errors.requestTypeId ? 'border-danger' : ''}>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {types?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.requestTypeId && (
              <p className="text-sm text-danger">{errors.requestTypeId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Título <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="Ej: Solicitud de certificado de estudio"
              {...register('title')}
              className={errors.title ? 'border-danger' : ''}
              disabled={isPending}
            />
            {errors.title && (
              <p className="text-sm text-danger">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Descripción <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <Textarea
              placeholder="Agrega detalles adicionales sobre tu solicitud..."
              rows={4}
              {...register('description')}
              className={errors.description ? 'border-danger' : ''}
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-sm text-danger">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear solicitud
          </Button>
        </div>
      </form>
    </div>
  )
}
