import type { ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type KpiTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface KpiTileProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  trend?: ReactNode
  tone?: KpiTone
  className?: string
}

const toneClasses: Record<KpiTone, { iconWrap: string; iconColor: string; value: string }> = {
  default: {
    iconWrap: 'bg-muted',
    iconColor: 'text-muted-foreground',
    value: 'text-foreground',
  },
  primary: {
    iconWrap: 'bg-primary/10',
    iconColor: 'text-primary',
    value: 'text-foreground',
  },
  success: {
    iconWrap: 'bg-success-soft',
    iconColor: 'text-success',
    value: 'text-success',
  },
  warning: {
    iconWrap: 'bg-warning-soft',
    iconColor: 'text-warning',
    value: 'text-warning',
  },
  danger: {
    iconWrap: 'bg-danger-soft',
    iconColor: 'text-danger',
    value: 'text-danger',
  },
  info: {
    iconWrap: 'bg-info-soft',
    iconColor: 'text-info',
    value: 'text-info',
  },
}

/**
 * KpiTile — Tile individual de métrica para dashboards.
 * Mobile-first: padding compacto y valor en tamaño manejable.
 * Variantes: default, primary, success, warning, danger, info.
 */
export function KpiTile({
  label,
  value,
  icon: Icon,
  trend,
  tone = 'default',
  className,
}: KpiTileProps) {
  const styles = toneClasses[tone]

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface p-3.5 sm:p-4 sm:p-5',
        'flex flex-col gap-1.5 sm:gap-2 sm:gap-3',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <p className="text-eyebrow font-medium text-muted-foreground uppercase tracking-wider leading-tight">
          {label}
        </p>
        {Icon && (
          <div
            className={cn(
              'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl shrink-0',
              styles.iconWrap,
            )}
          >
            <Icon className={cn('h-4 w-4 sm:h-4 sm:w-4', styles.iconColor)} />
          </div>
        )}
      </div>
      <p className={cn('text-2xl sm:text-3xl font-bold tracking-tight leading-none', styles.value)}>{value}</p>
      {trend && <p className="text-eyebrow text-muted-foreground leading-tight">{trend}</p>}
    </div>
  )
}

interface KpiGridProps {
  children: ReactNode
  className?: string
  /** Columnas en desktop. Default 4. */
  columns?: 2 | 3 | 4 | 5
}

const gridClasses: Record<NonNullable<KpiGridProps['columns']>, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
}

export function KpiGrid({ children, columns = 4, className }: KpiGridProps) {
  return <div className={cn('grid gap-3 sm:gap-4', gridClasses[columns], className)}>{children}</div>
}
