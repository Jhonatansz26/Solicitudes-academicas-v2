import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { Inbox } from 'lucide-react'

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
        description="Aún no tienes notificaciones. Los cambios de estado y alertas aparecerán aquí en tiempo real."
      />
    </div>
  )
}
