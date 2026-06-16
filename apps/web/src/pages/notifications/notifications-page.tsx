import { Link } from 'react-router-dom'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { Button } from '@/shared/components/ui/button'
import { Inbox, Bell } from 'lucide-react'

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Centro de notificaciones del sistema. Aquí verás los cambios de estado, alertas operativas y mensajes de la plataforma."
      />

      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="Bandeja vacía"
        description="Aún no tienes notificaciones. Cuando recibas alertas sobre tus solicitudes, aparecerán aquí."
        action={
          <Button asChild variant="outline" size="sm" className="h-10 sm:h-9">
            <Link to="/dashboard/requests">
              <Bell className="mr-2 h-4 w-4" aria-hidden="true" />
              Ver mis solicitudes
            </Link>
          </Button>
        }
      />
    </div>
  )
}
