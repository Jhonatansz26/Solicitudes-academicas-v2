import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface EmptyStateProps {
  icon: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  /** Tono visual del icono. */
  tone?: 'primary' | 'muted' | 'warning'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  tone = 'primary',
}: EmptyStateProps) {
  const iconTone = {
    primary: 'bg-primary/10 text-primary',
    muted: 'bg-muted text-muted-foreground',
    warning: 'bg-warning-soft text-warning',
  }[tone]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-14 text-center',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'mb-4 flex h-14 w-14 items-center justify-center rounded-full',
          iconTone,
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
