import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

type KpiVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const variantClasses: Record<KpiVariant, { strip: string; iconBg: string; iconText: string; valueText: string; trendText: string }> = {
  primary: {
    strip: 'bg-primary',
    iconBg: 'bg-primary/10 dark:bg-navy-900/50',
    iconText: 'text-primary dark:text-navy-200',
    valueText: 'text-foreground',
    trendText: 'text-primary',
  },
  success: {
    strip: 'bg-success',
    iconBg: 'bg-success-soft',
    iconText: 'text-success',
    valueText: 'text-success',
    trendText: 'text-success',
  },
  warning: {
    strip: 'bg-warning',
    iconBg: 'bg-warning-soft',
    iconText: 'text-warning',
    valueText: 'text-warning',
    trendText: 'text-warning',
  },
  danger: {
    strip: 'bg-danger',
    iconBg: 'bg-danger-soft',
    iconText: 'text-danger',
    valueText: 'text-danger',
    trendText: 'text-danger',
  },
  info: {
    strip: 'bg-info',
    iconBg: 'bg-info-soft',
    iconText: 'text-info',
    valueText: 'text-info',
    trendText: 'text-info',
  },
  neutral: {
    strip: 'bg-accent-bar',
    iconBg: 'bg-surface-hover',
    iconText: 'text-muted-foreground',
    valueText: 'text-foreground',
    trendText: 'text-muted-foreground',
  },
}

interface KpiCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  variant?: KpiVariant
  trend?: string
  progress?: number
  loading?: boolean
  className?: string
  onClick?: () => void
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  variant = 'primary',
  trend,
  progress,
  loading = false,
  className,
  onClick,
}: KpiCardProps) {
  const styles = variantClasses[variant]

  if (loading) {
    return (
      <Card className={cn('overflow-hidden gap-0 py-0', className)}>
        <div className="h-1.5 w-full bg-muted animate-pulse" />
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 sm:h-10 w-20 sm:w-24 rounded bg-muted animate-pulse" />
            <div className="h-3 sm:h-4 w-24 sm:w-32 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn('overflow-hidden gap-0 py-0 transition-all shadow-md border-border/80', onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${label}: ${value}` : undefined}
      onKeyDown={(e) => {
        if (!onClick) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className={cn('h-[3px] w-full', styles.strip)} />
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
            <p className={cn('text-2xl sm:text-3xl font-bold tracking-tight leading-none', styles.valueText)}>
              {value}
            </p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {trend && (
              <p className={cn('text-xs font-semibold', styles.trendText)}>{trend}</p>
            )}
          </div>

          <div className={cn('flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl shrink-0', styles.iconBg)}>
            <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', styles.iconText)} />
          </div>
        </div>

        {typeof progress === 'number' && (
          <div className="space-y-1.5">
            <div className="h-1.5 rounded-full bg-border/70 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', styles.strip)}
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
