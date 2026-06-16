import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/features/requests/components/status-badge'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { EmptyState } from '@/shared/components/empty-state'
import { Inbox } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { RequestStatus } from '@/shared/types'
import type { ReactNode } from 'react'

export interface RequestPreviewItem {
  id: string
  trackingNumber: string
  title: string
  status: RequestStatus
  createdAt: string
  /** Contenido principal (ej: nombre del solicitante). */
  primary?: ReactNode
  /** Contenido secundario (ej: tipo, fecha relativa). */
  secondary?: ReactNode
}

interface RequestListPreviewProps {
  title?: string
  description?: string
  items: RequestPreviewItem[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  /** Path para "ver todas". */
  viewAllHref?: string
  viewAllLabel?: string
  onItemClick?: (item: RequestPreviewItem) => void
  className?: string
  /** Si es true, muestra skeleton. */
  skeletonRows?: number
  /** Path para crear nuevo (botón opcional en header). */
  createHref?: string
  createLabel?: string
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  if (days < 30) return `hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  })
}

export function RequestListPreview({
  title = 'Solicitudes recientes',
  description,
  items,
  loading = false,
  emptyTitle = 'Sin solicitudes',
  emptyDescription = 'No hay solicitudes para mostrar',
  emptyAction,
  viewAllHref,
  viewAllLabel = 'Ver todas',
  onItemClick,
  className,
  skeletonRows = 4,
  createHref,
  createLabel,
}: RequestListPreviewProps) {
  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-border bg-surface overflow-hidden', className)}>
        {(title || viewAllHref || createHref) && (
          <header className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
              {description && (
                <p className="text-eyebrow text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </header>
        )}
        <div className="p-3 space-y-2">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <Skeleton key={i} className="h-16 sm:h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-border bg-surface overflow-hidden', className)}>
        {(title || viewAllHref || createHref) && (
          <header className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
              {description && (
                <p className="text-eyebrow text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
            {createHref && createLabel && (
              <Button asChild size="sm" variant="gold">
                <Link to={createHref}>{createLabel}</Link>
              </Button>
            )}
          </header>
        )}
        <div className="p-6">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-surface overflow-hidden', className)}>
      {(title || viewAllHref || createHref) && (
        <header className="flex items-center justify-between gap-2 sm:gap-3 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground truncate">{title}</h2>
            {description && (
              <p className="text-eyebrow text-muted-foreground mt-0.5 truncate">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {createHref && createLabel && (
              <Button asChild size="sm" variant="gold" className="h-8 px-2.5 text-xs sm:h-8 sm:px-3">
                <Link to={createHref}>
                  <span className="sm:hidden">+</span>
                  <span className="hidden sm:inline">{createLabel}</span>
                </Link>
              </Button>
            )}
            {viewAllHref && (
              <Button asChild size="sm" variant="ghost" className="h-8 px-2.5 text-xs sm:h-8 sm:px-3">
                <Link to={viewAllHref}>{viewAllLabel}</Link>
              </Button>
            )}
          </div>
        </header>
      )}
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const interactive = Boolean(onItemClick)
          return (
            <li
              key={item.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-3 transition-colors min-h-[60px]',
                interactive && 'cursor-pointer hover:bg-muted/40 active:bg-muted/60 focus:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              )}
              onClick={interactive ? () => onItemClick?.(item) : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onItemClick?.(item)
                      }
                    }
                  : undefined
              }
              tabIndex={interactive ? 0 : undefined}
              role={interactive ? 'button' : undefined}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-eyebrow text-muted-foreground">
                    {item.trackingNumber}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm font-medium text-foreground truncate mt-1">{item.title}</p>
                {item.primary && (
                  <p className="text-eyebrow text-muted-foreground truncate mt-0.5">
                    {item.primary}
                  </p>
                )}
                {item.secondary && (
                  <p className="text-eyebrow text-muted-foreground truncate mt-0.5">
                    {item.secondary}
                  </p>
                )}
              </div>
              <span className="text-eyebrow text-muted-foreground shrink-0 hidden xs:inline">
                {formatRelativeTime(item.createdAt)}
              </span>
              {interactive && (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
