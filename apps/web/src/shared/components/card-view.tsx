import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export interface CardViewItem {
  id: string
  /** Contenido principal del card. */
  content: ReactNode
  /** Acciones del card (botones, dropdowns). */
  actions?: ReactNode
  /** Footer del card. */
  footer?: ReactNode
  /** className extra. */
  className?: string
}

interface CardViewProps {
  items: CardViewItem[]
  /** Columnas en desktop. Default 1. */
  columns?: 1 | 2 | 3 | 4
  /** Click handler por card. */
  onItemClick?: (item: CardViewItem) => void
  /** Estado de carga. */
  loading?: boolean
  /** Cantidad de skeleton cards. */
  skeletonRows?: number
  /** Mensaje vacío. */
  emptyMessage?: ReactNode
  /** className adicional. */
  className?: string
}

const gridCols: Record<NonNullable<CardViewProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

export function CardView({
  items,
  columns = 1,
  onItemClick,
  loading = false,
  skeletonRows = 6,
  emptyMessage = 'Sin elementos',
  className,
}: CardViewProps) {
  if (loading) {
    return (
      <div className={cn('grid gap-4', gridCols[columns], className)} aria-busy="true">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <div
            key={`skel-${i}`}
            className="rounded-xl border border-border bg-surface p-4 space-y-3"
          >
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map((item) => {
        const interactive = Boolean(onItemClick)
        return (
          <div
            key={item.id}
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
            className={cn(
              'rounded-xl border border-border bg-surface p-4 transition-colors',
              interactive &&
                'cursor-pointer hover:border-border-hover hover:bg-surface-hover focus:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              item.className,
            )}
          >
            {item.actions && (
              <div className="flex items-start justify-end mb-2">{item.actions}</div>
            )}
            <div>{item.content}</div>
            {item.footer && (
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                {item.footer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
