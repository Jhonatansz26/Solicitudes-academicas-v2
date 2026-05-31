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
import { User, Shield, Bell, Loader2, AlertCircle } from 'lucide-react'
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

export function SettingsPage() {
  const queryClient = useQueryClient()

  const { data: profile, isLoading, isError } = useQuery({
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

  return (
    <div className="space-y-6">
      <div>
        <h1>Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestión de tu perfil y preferencias
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-9 w-32" />
              </div>
            ) : isError ? (
              <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2.5 text-sm text-danger">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                Error al cargar el perfil
              </div>
            ) : profile ? (
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-fullName">Nombre completo</Label>
                  <Input
                    id="profile-fullName"
                    {...registerProfile('fullName')}
                    className={profileErrors.fullName ? 'border-danger' : ''}
                    disabled={updatingProfile}
                  />
                  {profileErrors.fullName && (
                    <p className="text-xs text-danger">{profileErrors.fullName.message}</p>
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
                    <p className="text-xs text-danger">{profileErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Documento</Label>
                  <Input value={profile.documentNumber} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">No editable</p>
                </div>

                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Input value={profile.role.name} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">No editable</p>
                </div>

                {profile.studentProfile && (
                  <div className="rounded-md bg-surface-hover px-3 py-2 text-sm text-muted-foreground">
                    {profile.studentProfile.program} — Semestre {profile.studentProfile.semester}
                    {profile.studentProfile.studentCode && (
                      <> — Código: {profile.studentProfile.studentCode}</>
                    )}
                  </div>
                )}

                <Button size="sm" type="submit" disabled={updatingProfile || !profileDirty}>
                  {updatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar cambios
                </Button>
              </form>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
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
                  <p className="text-xs text-danger">{passwordErrors.currentPassword.message}</p>
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
                  <p className="text-xs text-danger">{passwordErrors.newPassword.message}</p>
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
                  <p className="text-xs text-danger">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <Button size="sm" variant="outline" type="submit" disabled={changingPassword}>
                {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar contraseña
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Las preferencias de notificación se configurarán cuando se implemente el módulo de notificaciones.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
