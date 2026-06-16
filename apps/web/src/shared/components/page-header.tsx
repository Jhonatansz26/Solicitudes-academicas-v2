import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface PageHeaderProps {
  title?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * PageHeader — Encabezado de página.
 * Mobile-first: en móvil, las acciones bajan a fila inferior y pueden ser full-width.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4', className)}>
      <div className="space-y-1 sm:space-y-1.5 min-w-0">
        {eyebrow && (
          <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        {title && (
          <h1 className="font-display text-2xl sm:text-h1 font-bold tracking-tight text-foreground leading-tight">
            {title}
          </h1>
        )}
        {description && (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2 [&>button]:h-10 sm:[&>button]:h-9 [&>a]:h-10 sm:[&>a]:h-9">
          {actions}
        </div>
      )}
    </div>
  )
}
