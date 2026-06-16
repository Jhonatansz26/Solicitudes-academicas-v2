import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface WidgetProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  variant?: 'default' | 'accent'
}

/**
 * Widget — Contenedor base para tarjetas de dashboard.
 * Provee título, descripción, acción opcional y cuerpo.
 */
export function Widget({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  variant = 'default',
}: WidgetProps) {
  const hasHeader = Boolean(title || description || action)

  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-surface overflow-hidden',
        variant === 'accent' && 'border-l-4 border-l-gold-500',
        className,
      )}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="text-base font-semibold text-foreground truncate">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-eyebrow text-muted-foreground mt-0.5 truncate">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn('p-5', contentClassName)}>{children}</div>
    </section>
  )
}
