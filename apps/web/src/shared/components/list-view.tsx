import { type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'


export interface ListViewItem {
  id: string
  /** Contenido principal. */
  primary: ReactNode
  /** Contenido secundario. */
  secondary?: ReactNode
  /** Metadata (status, badges, etc). */
  meta?: ReactNode
  /** Acciones del item (botones, dropdowns). */
  actions?: ReactNode
  /** Icono o avatar a la izquierda. */
  leading?: ReactNode
  /** className extra. */
  className?: string
  /** Si el item está deshabilitado. */
  disabled?: boolean
}

interface ListViewProps {
  items: ListViewItem[]
  /** Click handler por item. */
  onItemClick?: (item: ListViewItem) => void
  /** Estado de carga. */
  loading?: boolean
  /** Cantidad de skeleton items. */
  skeletonRows?: number
  /** Mensaje vacío. */
  emptyMessage?: ReactNode
  /** className adicional. */
  className?: string
}

export function ListView({
  items,
  onItemClick,
  loading = false,
  skeletonRows = 6,
  emptyMessage = 'Sin elementos',
  className,
}: ListViewProps) {
  if (loading) {
    return (
      <ul
        className={cn(
          'rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden',
          className,
        )}
        aria-busy="true"
      >
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <li key={`skel-${i}`} className="flex items-center gap-3 px-4 py-3">
            <div className="h-9 w-9 rounded-lg bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 rounded bg-muted animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
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
    <ul
      className={cn(
        'rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden',
        className,
      )}
    >
      {items.map((item) => {
        const interactive = Boolean(onItemClick) && !item.disabled
        return (
          <li
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
              'flex items-center gap-3 px-4 py-3 transition-colors',
              interactive &&
                'cursor-pointer hover:bg-muted/40 focus:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              item.disabled && 'opacity-50 cursor-not-allowed',
              item.className,
            )}
          >
            {item.leading && <div className="shrink-0">{item.leading}</div>}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {item.primary}
              </div>
              {item.secondary && (
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {item.secondary}
                </div>
              )}
            </div>
            {item.meta && <div className="shrink-0">{item.meta}</div>}
            {item.actions && <div className="shrink-0">{item.actions}</div>}
            {interactive && (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ul>
  )
}
