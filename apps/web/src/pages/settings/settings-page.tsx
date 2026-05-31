import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { User, Shield, Bell } from 'lucide-react'

export function SettingsPage() {
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input placeholder="Juan Pérez" defaultValue="Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label>Correo institucional</Label>
              <Input placeholder="juan@universidad.edu.co" defaultValue="juan@universidad.edu.co" />
            </div>
            <Button size="sm">Guardar cambios</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contraseña actual</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Nueva contraseña</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button size="sm" variant="outline">Actualizar contraseña</Button>
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
