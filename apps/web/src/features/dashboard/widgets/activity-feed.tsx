import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Widget } from './widget'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { EmptyState } from '@/shared/components/empty-state'
import { Button } from '@/shared/components/ui/button'
import { Inbox } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

export interface ActivityItem {
  id: string
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  href?: string
  timestamp: string
}

interface ActivityFeedProps {
  title?: string
  description?: string
  items: ActivityItem[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  viewAllHref?: string
  viewAllLabel?: string
  className?: string
  skeletonRows?: number
  /** Render personalizado de cada item (opcional). */
  renderItem?: (item: ActivityItem) => ReactNode
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  if (days < 30) return `hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

export function ActivityFeed({
  title = 'Actividad reciente',
  description,
  items,
  loading = false,
  emptyTitle = 'Sin actividad',
  emptyDescription = 'No hay actividad reciente',
  viewAllHref,
  viewAllLabel = 'Ver todo',
  className,
  skeletonRows = 5,
  renderItem,
}: ActivityFeedProps) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <Widget
        title={title}
        description={description}
        className={className}
        contentClassName="p-3 space-y-2"
      >
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </Widget>
    )
  }

  if (items.length === 0) {
    return (
      <Widget title={title} description={description} className={className}>
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      </Widget>
    )
  }

  return (
    <Widget
      title={title}
      description={description}
      className={className}
      action={
        viewAllHref ? (
          <Button asChild size="sm" variant="ghost">
            <a href={viewAllHref}>{viewAllLabel}</a>
          </Button>
        ) : null
      }
    >
      <ul className="divide-y divide-border -mx-5">
        {items.map((item) => {
          if (renderItem) {
            return (
              <li key={item.id} className="px-5 py-3">
                {renderItem(item)}
              </li>
            )
          }
          return (
            <li
              key={item.id}
              className={cn(
                'px-5 py-3 flex items-center gap-3 transition-colors',
                item.href && 'cursor-pointer hover:bg-muted/40',
              )}
              onClick={item.href ? () => navigate(item.href!) : undefined}
              role={item.href ? 'button' : undefined}
              tabIndex={item.href ? 0 : undefined}
              onKeyDown={
                item.href
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(item.href!)
                      }
                    }
                  : undefined
              }
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                {item.description && (
                  <p className="text-eyebrow text-muted-foreground truncate mt-0.5">
                    {item.description}
                  </p>
                )}
                {item.meta && (
                  <p className="text-eyebrow text-muted-foreground truncate mt-0.5">
                    {item.meta}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-eyebrow text-muted-foreground">
                  {formatRelative(item.timestamp)}
                </span>
                {item.href && (
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </Widget>
  )
}
