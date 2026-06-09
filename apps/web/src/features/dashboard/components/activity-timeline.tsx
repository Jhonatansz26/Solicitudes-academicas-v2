import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { SectionCard } from '@/shared/components/section-card'
import { Timeline, type TimelineItemData } from '@/shared/components/timeline'
import { EmptyState } from '@/shared/components/empty-state'
import { StatusBadge } from '@/features/requests/components/status-badge'
import type { RequestStatus, DashboardStats } from '@/shared/types'

interface ActivityTimelineProps {
  items: DashboardStats['recentActivity']
  isLoading: boolean
  isError: boolean
  isReviewer: boolean
}

export function ActivityTimeline({
  items,
  isLoading,
  isError,
  isReviewer,
}: ActivityTimelineProps) {
  const navigate = useNavigate()

  const timelineItems: TimelineItemData[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: isReviewer ? item.user.fullName : `Tracking ${item.trackingNumber}`,
    meta: item.requestType.name,
    timestamp: formatRelativeTime(item.updatedAt),
    status: <StatusBadge status={item.status as RequestStatus} />,
    onClick: () => navigate(`/dashboard/requests/${item.id}`),
  }))

  return (
    <SectionCard
      title="Actividad reciente"
      description="Últimos movimientos del sistema con acceso directo al detalle de cada solicitud."
      className="animate-fade-in-up stagger-5"
    >
      {isLoading ? (
        <TimelineSkeleton />
      ) : isError ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Error al cargar actividad reciente
        </p>
      ) : (
        <Timeline
          items={timelineItems}
          emptyState={
            <EmptyState
              icon={<FileText className="h-5 w-5" />}
              title="Sin actividad reciente"
              description="Cuando existan nuevos movimientos, aparecerán aquí para facilitar el seguimiento operativo."
              className="border-0 bg-transparent py-8"
            />
          }
        />
      )}
    </SectionCard>
  )
}

function TimelineSkeleton() {
  return (
    <div className="relative space-y-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 pl-1">
          <div className="h-6 w-6 rounded-full shrink-0 bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  if (days < 30) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
  return new Date(dateStr).toLocaleDateString('es-CO')
}
