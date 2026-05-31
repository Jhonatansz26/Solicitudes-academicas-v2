import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  useUsers,
  useRoles,
  useUsersStats,
  useCreateUser,
  useUpdateUser,
  useUpdateUserStatus,
  useDeleteUser,
} from '@/features/admin/hooks/use-users'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Label } from '@/shared/components/ui/label'
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { AdminUser, RoleName, CreateUserInput } from '@/shared/types'

const ROLE_CONFIG: Record<RoleName, { color: string; label: string }> = {
  ADMIN: { color: 'border-danger/20 bg-danger-soft text-danger', label: 'Admin' },
  COORDINATOR: { color: 'border-primary/20 bg-primary/5 text-primary', label: 'Coordinador' },
  STAFF: { color: 'border-warning/20 bg-warning-soft text-warning', label: 'Staff' },
  STUDENT: { color: 'border-info/20 bg-info-soft text-info', label: 'Estudiante' },
}

const createUserSchema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
  documentNumber: z.string().min(5, 'Mínimo 5 caracteres'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  roleId: z.string().min(1, 'Selecciona un rol'),
  program: z.string().optional(),
  semester: z.number().min(1).max(12).optional(),
  studentCode: z.string().optional(),
})

const editUserSchema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
  documentNumber: z.string().min(5, 'Mínimo 5 caracteres'),
  roleId: z.string().min(1, 'Selecciona un rol'),
  program: z.string().optional(),
  semester: z.number().min(1).max(12).optional(),
  studentCode: z.string().optional(),
})

type CreateUserForm = z.infer<typeof createUserSchema>
type EditUserForm = z.infer<typeof editUserSchema>

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page')) || 1
  const search = searchParams.get('search') || undefined
  const roleFilter = searchParams.get('role') || undefined
  const isActiveFilter = searchParams.get('isActive')
  const parsedIsActive = isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined

  const { data, isLoading, isError } = useUsers({ page, search, role: roleFilter, isActive: parsedIsActive, limit: 20 })
  const { data: roles } = useRoles()
  const { data: statsData } = useUsersStats()
  const { mutate: create, isPending: creating } = useCreateUser()
  const { mutate: update, isPending: updating } = useUpdateUser()
  const { mutate: toggleStatus, isPending: toggling } = useUpdateUserStatus()
  const { mutate: remove, isPending: deleting } = useDeleteUser()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [toggleTarget, setToggleTarget] = useState<AdminUser | null>(null)

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    setSearchParams(params)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(newPage))
    setSearchParams(params)
  }

  const users = data?.data ?? []

  const kpis = {
    total: statsData?.total ?? 0,
    active: statsData?.active ?? 0,
    inactive: statsData?.inactive ?? 0,
    students: statsData?.students ?? 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Total usuarios" value={kpis.total} color="text-primary" loading={isLoading} />
        <KpiCard icon={UserCheck} label="Activos" value={kpis.active} color="text-success" loading={isLoading} />
        <KpiCard icon={UserX} label="Inactivos" value={kpis.inactive} color="text-muted-foreground" loading={isLoading} />
        <KpiCard icon={GraduationCap} label="Estudiantes" value={kpis.students} color="text-info" loading={isLoading} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o documento..."
            className="pl-9"
            defaultValue={search}
            onBlur={(e) => setParam('search', e.target.value || null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value || null)
            }}
          />
        </div>

        <Select value={roleFilter ?? ''} onValueChange={(v) => setParam('role', v || null)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todos los roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {roles?.map((r) => (
              <SelectItem key={r.id} value={r.name}>{ROLE_CONFIG[r.name]?.label ?? r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={isActiveFilter ?? ''} onValueChange={(v) => setParam('isActive', v || null)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
          </SelectContent>
        </Select>
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
          <h3 className="text-base font-medium text-foreground">Error al cargar usuarios</h3>
          <p className="mt-1 text-sm text-muted-foreground">Intenta recargar la página</p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-medium text-foreground">No se encontraron usuarios</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || roleFilter || isActiveFilter
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Crea el primer usuario del sistema'}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-3">Nombre</div>
              <div className="col-span-3">Correo</div>
              <div className="col-span-2">Documento</div>
              <div className="col-span-1">Rol</div>
              <div className="col-span-1">Estado</div>
              <div className="col-span-1">Fecha</div>
              <div className="col-span-1"></div>
            </div>

            {users.map((user) => (
              <div
                key={user.id}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3.5 border-b border-border last:border-0 items-center transition-colors hover:bg-surface-hover"
              >
                <div className="sm:col-span-3">
                  <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                  {user.studentProfile && (
                    <p className="text-xs text-muted-foreground truncate">
                      {user.studentProfile.program} — Semestre {user.studentProfile.semester}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-sm font-mono text-muted-foreground">{user.documentNumber}</span>
                </div>

                <div className="sm:col-span-1">
                  <Badge variant="outline" className={ROLE_CONFIG[user.role.name]?.color}>
                    {ROLE_CONFIG[user.role.name]?.label}
                  </Badge>
                </div>

                <div className="sm:col-span-1">
                  <button
                    onClick={() => setToggleTarget(user)}
                    disabled={toggling}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                      user.isActive
                        ? 'bg-success-soft text-success hover:bg-success-soft/80'
                        : 'bg-surface-hover text-muted-foreground hover:bg-surface-hover/80'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-success' : 'bg-muted-foreground/50'}`} />
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </div>

                <div className="sm:col-span-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="sm:col-span-1 flex items-center gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditTarget(user)}
                    aria-label="Editar usuario"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-danger"
                    onClick={() => setDeleteTarget(user)}
                    disabled={deleting}
                    aria-label="Eliminar usuario"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {users.length} de {data.total} usuarios
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

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        roles={roles ?? []}
        isPending={creating}
        onSubmit={(input) => {
          create(input, {
            onSuccess: () => {
              setCreateOpen(false)
              toast.success('Usuario creado correctamente')
            },
            onError: () => {
              toast.error('Error al crear el usuario')
            },
          })
        }}
      />

      {editTarget && (
        <EditUserDialog
          user={editTarget}
          roles={roles ?? []}
          isPending={updating}
          onClose={() => setEditTarget(null)}
          onSubmit={(input) => {
            update({ id: editTarget.id, input }, {
              onSuccess: () => {
                setEditTarget(null)
                toast.success('Usuario actualizado correctamente')
              },
              onError: () => {
                toast.error('Error al actualizar el usuario')
              },
            })
          }}
        />
      )}

      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar usuario</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar a "{deleteTarget.fullName}"?
                Esta acción no puede deshacerse.
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
                      toast.success('Usuario eliminado')
                    },
                    onError: (err) => {
                      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                      toast.error(msg || 'Error al eliminar el usuario')
                      setDeleteTarget(null)
                    },
                  })
                }}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {toggleTarget && (
        <Dialog open={!!toggleTarget} onOpenChange={() => setToggleTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {toggleTarget.isActive ? 'Desactivar' : 'Activar'} usuario
              </DialogTitle>
              <DialogDescription>
                ¿Deseas {toggleTarget.isActive ? 'desactivar' : 'activar'} a "{toggleTarget.fullName}"?
                {toggleTarget.isActive && ' No podrá iniciar sesión hasta que sea reactivado.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setToggleTarget(null)}>
                Cancelar
              </Button>
              <Button
                variant={toggleTarget.isActive ? 'destructive' : 'default'}
                size="sm"
                disabled={toggling}
                onClick={() => {
                  toggleStatus(
                    { id: toggleTarget.id, isActive: !toggleTarget.isActive },
                    {
                      onSuccess: () => {
                        setToggleTarget(null)
                        toast.success(
                          toggleTarget.isActive ? 'Usuario desactivado' : 'Usuario activado',
                        )
                      },
                      onError: () => {
                        toast.error('Error al cambiar el estado')
                      },
                    },
                  )
                }}
              >
                {toggling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {toggleTarget.isActive ? 'Desactivar' : 'Activar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

function CreateUserDialog({
  open,
  onOpenChange,
  roles,
  isPending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: { id: string; name: RoleName }[]
  isPending: boolean
  onSubmit: (input: CreateUserInput) => void
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      documentNumber: '',
      password: '',
      roleId: '',
      program: '',
      semester: undefined,
      studentCode: '',
    },
  })

  const selectedRoleId = watch('roleId')
  const selectedRole = roles.find((r) => r.id === selectedRoleId)
  const isStudent = selectedRole?.name === 'STUDENT'

  const handleCreate = (data: CreateUserForm) => {
    const input: CreateUserInput = {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      documentNumber: data.documentNumber,
      roleId: data.roleId,
      program: isStudent ? data.program : undefined,
      semester: isStudent ? data.semester : undefined,
      studentCode: isStudent ? data.studentCode : undefined,
    }
    onSubmit(input)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            Completa los datos para crear una cuenta de usuario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input id="fullName" {...register('fullName')} className={errors.fullName ? 'border-danger' : ''} disabled={isPending} />
              {errors.fullName && <p className="text-xs text-danger">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo *</Label>
              <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-danger' : ''} disabled={isPending} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Documento *</Label>
              <Input id="documentNumber" {...register('documentNumber')} className={errors.documentNumber ? 'border-danger' : ''} disabled={isPending} />
              {errors.documentNumber && <p className="text-xs text-danger">{errors.documentNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input id="password" type="password" {...register('password')} className={errors.password ? 'border-danger' : ''} disabled={isPending} />
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Rol *</Label>
              <Select
                value={selectedRoleId}
                onValueChange={(v) => setValue('roleId', v, { shouldValidate: true })}
                disabled={isPending}
              >
                <SelectTrigger className={errors.roleId ? 'border-danger' : ''}>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {ROLE_CONFIG[role.name]?.label ?? role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && <p className="text-xs text-danger">{errors.roleId.message}</p>}
            </div>
          </div>

          {isStudent && (
            <div className="grid gap-4 sm:grid-cols-3 border-t border-border pt-4">
              <div className="space-y-2">
                <Label htmlFor="program">Programa *</Label>
                <Input id="program" {...register('program')} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semestre *</Label>
                <Input id="semester" type="number" {...register('semester', { valueAsNumber: true })} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentCode">Código *</Label>
                <Input id="studentCode" {...register('studentCode')} disabled={isPending} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" type="button" onClick={() => { reset(); onOpenChange(false) }}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditUserDialog({
  user,
  roles,
  isPending,
  onClose,
  onSubmit,
}: {
  user: AdminUser
  roles: { id: string; name: RoleName }[]
  isPending: boolean
  onClose: () => void
  onSubmit: (input: {
    email?: string
    fullName?: string
    documentNumber?: string
    roleId?: string
    program?: string
    semester?: number
    studentCode?: string
  }) => void
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      documentNumber: user.documentNumber,
      roleId: user.roleId,
      program: user.studentProfile?.program ?? '',
      semester: user.studentProfile?.semester ?? undefined,
      studentCode: user.studentProfile?.studentCode ?? '',
    },
  })

  const selectedRoleId = watch('roleId')
  const selectedRole = roles.find((r) => r.id === selectedRoleId)
  const isStudent = selectedRole?.name === 'STUDENT'

  const handleEdit = (data: EditUserForm) => {
    onSubmit({
      email: data.email,
      fullName: data.fullName,
      documentNumber: data.documentNumber,
      roleId: data.roleId,
      program: isStudent ? data.program : undefined,
      semester: isStudent ? data.semester : undefined,
      studentCode: isStudent ? data.studentCode : undefined,
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos de {user.fullName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Nombre completo *</Label>
              <Input id="edit-fullName" {...register('fullName')} className={errors.fullName ? 'border-danger' : ''} disabled={isPending} />
              {errors.fullName && <p className="text-xs text-danger">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo *</Label>
              <Input id="edit-email" type="email" {...register('email')} className={errors.email ? 'border-danger' : ''} disabled={isPending} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-documentNumber">Documento *</Label>
              <Input id="edit-documentNumber" {...register('documentNumber')} className={errors.documentNumber ? 'border-danger' : ''} disabled={isPending} />
              {errors.documentNumber && <p className="text-xs text-danger">{errors.documentNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-roleId">Rol *</Label>
              <Select
                value={selectedRoleId}
                onValueChange={(v) => setValue('roleId', v, { shouldValidate: true })}
                disabled={isPending}
              >
                <SelectTrigger className={errors.roleId ? 'border-danger' : ''}>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {ROLE_CONFIG[role.name]?.label ?? role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && <p className="text-xs text-danger">{errors.roleId.message}</p>}
            </div>
          </div>

          {isStudent && (
            <div className="grid gap-4 sm:grid-cols-3 border-t border-border pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-program">Programa</Label>
                <Input id="edit-program" {...register('program')} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-semester">Semestre</Label>
                <Input id="edit-semester" type="number" {...register('semester', { valueAsNumber: true })} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-studentCode">Código</Label>
                <Input id="edit-studentCode" {...register('studentCode')} disabled={isPending} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
