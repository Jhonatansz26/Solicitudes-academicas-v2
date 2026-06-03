import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/shared/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { User, Shield, Bell, Loader2, AlertCircle, Mail, Hash, GraduationCap, KeyRound, Calendar } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Requerida'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Requerida'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

interface MyProfile {
  id: string
  email: string
  fullName: string
  documentNumber: string
  role: { name: string }
  studentProfile?: { program: string; semester: number; studentCode: string } | null
  createdAt: string
}

const ROLE_CONFIG: Record<string, { label: string; variant: string }> = {
  ADMIN: { label: 'Administrador', variant: 'role-admin' },
  COORDINATOR: { label: 'Coordinador', variant: 'role-coordinator' },
  STAFF: { label: 'Funcionario', variant: 'role-staff' },
  STUDENT: { label: 'Estudiante', variant: 'role-student' },
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return fullName.slice(0, 2).toUpperCase()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function SettingsPage() {
  const queryClient = useQueryClient()

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const { data } = await api.get<MyProfile>('/api/users/me')
      return data
    },
  })

  const { mutate: updateProfile, isPending: updatingProfile } = useMutation({
    mutationFn: async (input: { fullName?: string; email?: string }) => {
      const { data } = await api.patch<MyProfile>('/api/users/me', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      toast.success('Perfil actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar el perfil')
    },
  })

  const { mutate: changePassword, isPending: changingPassword } = useMutation({
    mutationFn: async (input: { currentPassword: string; newPassword: string }) => {
      const { data } = await api.patch('/api/users/me/password', input)
      return data
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente')
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Error al cambiar la contraseña'
      toast.error(message)
    },
  })

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? { fullName: profile.fullName, email: profile.email } : undefined,
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfile({ fullName: data.fullName, email: data.email })
  }

  const onPasswordSubmit = (data: PasswordForm) => {
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => resetPassword() },
    )
  }

  const roleConfig = profile?.role.name ? ROLE_CONFIG[profile.role.name] : null
  const initials = profile ? getInitials(profile.fullName) : 'U'

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu perfil, seguridad y preferencias
        </p>
      </div>

      {isLoading ? (
        <div className="animate-fade-in-up">
          <Card className="overflow-hidden">
            <div className="h-1.5 w-full bg-accent-bar/30" />
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : isError ? (
        <div className="animate-fade-in-up flex flex-col items-center justify-center rounded-xl border border-danger/20 bg-danger-soft py-12 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-danger/50" />
          <h3 className="text-base font-medium text-foreground">Error al cargar el perfil</h3>
          <p className="mt-1 text-sm text-muted-foreground">Verifica tu conexión e intenta nuevamente</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      ) : profile ? (
        <>
          <div className="animate-fade-in-up stagger-1">
            <Card className="overflow-hidden hover-elevate">
              <div className="h-1.5 w-full bg-accent-bar" />
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-16 w-16 text-lg bg-primary/10 text-primary dark:bg-navy-900/60 dark:text-navy-200">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-foreground">{profile.fullName}</h2>
                      {roleConfig && (
                        <Badge variant={roleConfig.variant as never}>
                          {roleConfig.label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {profile.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />
                        <span className="font-mono">{profile.documentNumber}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Miembro desde {formatDate(profile.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="animate-fade-in-up stagger-2 overflow-hidden hover-elevate">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-navy-900/50">
                    <User className="h-4 w-4 text-primary dark:text-navy-200" />
                  </div>
                  Información personal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="profile-fullName">Nombre completo</Label>
                    <Input
                      id="profile-fullName"
                      {...registerProfile('fullName')}
                      className={profileErrors.fullName ? 'border-danger' : ''}
                      disabled={updatingProfile}
                      autoFocus
                    />
                    {profileErrors.fullName && (
                      <p className="text-xs text-danger mt-1">{profileErrors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Correo institucional</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      {...registerProfile('email')}
                      className={profileErrors.email ? 'border-danger' : ''}
                      disabled={updatingProfile}
                    />
                    {profileErrors.email && (
                      <p className="text-xs text-danger mt-1">{profileErrors.email.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Documento</span>
                      <span className="text-sm font-mono text-foreground">{profile.documentNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rol</span>
                      <span className="text-sm text-foreground">{roleConfig?.label ?? profile.role.name}</span>
                    </div>
                  </div>

                  {profile.studentProfile && (
                    <div className="rounded-lg border border-border bg-surface p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{profile.studentProfile.program}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Semestre {profile.studentProfile.semester}</span>
                        {profile.studentProfile.studentCode && (
                          <span className="font-mono">Código: {profile.studentProfile.studentCode}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <Button size="sm" type="submit" disabled={updatingProfile || !profileDirty}>
                    {updatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar cambios
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up stagger-3 overflow-hidden hover-elevate">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-navy-900/50">
                    <Shield className="h-4 w-4 text-primary dark:text-navy-200" />
                  </div>
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
                  <div className="rounded-lg border border-border bg-surface p-3.5 mb-2">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Cambiar contraseña</p>
                        <p className="text-xs text-muted-foreground">Ingresa tu contraseña actual y la nueva contraseña</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-current">Contraseña actual</Label>
                    <Input
                      id="password-current"
                      type="password"
                      {...registerPassword('currentPassword')}
                      className={passwordErrors.currentPassword ? 'border-danger' : ''}
                      disabled={changingPassword}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-danger mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-new">Nueva contraseña</Label>
                    <Input
                      id="password-new"
                      type="password"
                      {...registerPassword('newPassword')}
                      className={passwordErrors.newPassword ? 'border-danger' : ''}
                      disabled={changingPassword}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-danger mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-confirm">Confirmar contraseña</Label>
                    <Input
                      id="password-confirm"
                      type="password"
                      {...registerPassword('confirmPassword')}
                      className={passwordErrors.confirmPassword ? 'border-danger' : ''}
                      disabled={changingPassword}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-danger mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button size="sm" type="submit" disabled={changingPassword}>
                    {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Actualizar contraseña
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up stagger-4 md:col-span-2 overflow-hidden hover-elevate">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-navy-900/50">
                    <Bell className="h-4 w-4 text-primary dark:text-navy-200" />
                  </div>
                  Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 dark:bg-navy-900/50 mb-4">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">Preferencias de notificación</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    Este módulo estará disponible próximamente. Recibirás alertas sobre el estado de tus solicitudes académicas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}
