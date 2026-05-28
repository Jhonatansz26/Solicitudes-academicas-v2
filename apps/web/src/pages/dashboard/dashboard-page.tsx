import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useAuth } from '@/app/providers/auth-provider'

const stats = [
  { label: 'Solicitudes activas', value: '12', icon: FileText, color: 'text-primary' },
  { label: 'En revisiÃ³n', value: '3', icon: Clock, color: 'text-warning' },
  { label: 'Aprobadas', value: '8', icon: CheckCircle, color: 'text-success' },
  { label: 'Pendientes', value: '1', icon: AlertCircle, color: 'text-danger' },
]

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenido, {user?.fullName}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Solicitud de certificado enviada', date: 'Hace 2 horas', status: 'En revisiÃ³n' },
              { action: 'HomologaciÃ³n aprobada', date: 'Hace 1 dÃ­a', status: 'Aprobada' },
              { action: 'Documento adjuntado', date: 'Hace 3 dÃ­as', status: 'Pendiente' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{item.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
