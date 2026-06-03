import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { StatusBadge } from '@/features/requests/components/status-badge'
import { cn } from '@/shared/lib/utils'
import type { RequestStatus, DashboardStats } from '@/shared/types'

interface ActivityTimelineProps {
  items: DashboardStats['recentActivity']
  isLoading: boolean
  isError: boolean
  isReviewer: boolean
}

const statusDotColors: Record<RequestStatus, string> = {
  DRAFT: 'bg-muted-foreground',
  SUBMITTED: 'bg-info',
  IN_REVIEW: 'bg-warning',
  PENDING_DOCUMENTS: 'bg-warning',
  APPROVED: 'bg-success',
  REJECTED: 'bg-danger',
  CANCELLED: 'bg-muted-foreground',
}

export function ActivityTimeline({
  items,
  isLoading,
  isError,
  isReviewer,
}: ActivityTimelineProps) {
  const navigate = useNavigate()

  return (
    <Card className="animate-fade-in-up stagger-5">
      <CardHeader>
        <CardTitle className="font-display text-xl">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TimelineSkeleton />
        ) : isError ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Error al cargar actividad reciente
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sin actividad reciente
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-6">
              {items.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  isReviewer={isReviewer}
                  index={index}
                  onClick={() => navigate(`/dashboard/requests/${item.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TimelineItem({
  item,
  isReviewer,
  index,
  onClick,
}: {
  item: DashboardStats['recentActivity'][0]
  isReviewer: boolean
  index: number
  onClick: () => void
}) {
  const dotColor = statusDotColors[item.status as RequestStatus]

  return (
    <div
      className="relative flex gap-4 pl-1 cursor-pointer group"
      style={{ animationDelay: `${index * 75}ms` }}
      onClick={onClick}
    >
      <div
        className={cn(
          'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background transition-transform group-hover:scale-110',
          dotColor
        )}
      >
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>

      <div className="flex-1 pb-2 -mt-1 group-hover:bg-surface-hover -mx-3 px-3 py-2 rounded-lg transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </p>

            <p className="mt-1 text-xs font-mono text-muted-foreground">
              {item.trackingNumber}
            </p>

            {isReviewer && item.user?.fullName && (
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {item.user.fullName}
                </span>
              </p>
            )}
          </div>

          <StatusBadge status={item.status as RequestStatus} />
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{item.requestType.name}</span>
          <span className="text-border">·</span>
          <span>{formatRelativeTime(item.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}

function TimelineSkeleton() {
  return (
    <div className="relative space-y-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 pl-1">
          <Skeleton className="h-6 w-6 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
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
