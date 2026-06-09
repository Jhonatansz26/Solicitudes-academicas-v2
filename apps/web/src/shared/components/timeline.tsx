import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export interface TimelineItemData {
  id: string
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  timestamp?: ReactNode
  icon?: ReactNode
  status?: ReactNode
  onClick?: () => void
  className?: string
}

interface TimelineProps {
  items: TimelineItemData[]
  className?: string
  emptyState?: ReactNode
}

export function Timeline({ items, className, emptyState }: TimelineProps) {
  if (!items.length) return <>{emptyState ?? null}</>

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-6">
        {items.map((item, index) => (
          <TimelineItem key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  )
}

function TimelineItem({
  item,
  index,
}: {
  item: TimelineItemData
  index: number
}) {
  const content = (
    <>
      <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary text-white transition-transform group-hover:scale-110">
        {item.icon ?? <div className="h-2 w-2 rounded-full bg-white" />}
      </div>

      <div className="flex-1 rounded-lg px-3 py-2 transition-colors group-hover:bg-surface-hover">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </p>

            {item.description && (
              <p className="mt-1 text-sm text-muted-foreground leading-6">{item.description}</p>
            )}

            {(item.meta || item.timestamp) && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {item.meta}
                {item.meta && item.timestamp && <span className="text-border">·</span>}
                {item.timestamp}
              </div>
            )}
          </div>

          {item.status && <div className="shrink-0">{item.status}</div>}
        </div>
      </div>
    </>
  )

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={cn(
          'relative flex w-full gap-4 pl-1 text-left group cursor-pointer',
          item.className,
        )}
        style={{ animationDelay: `${index * 75}ms` }}
      >
        {content}
      </button>
    )
  }

  return (
    <div
      className={cn('relative flex w-full gap-4 pl-1 text-left group', item.className)}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {content}
    </div>
  )
}
