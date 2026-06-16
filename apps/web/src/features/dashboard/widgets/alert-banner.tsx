import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

type AlertTone = 'warning' | 'danger' | 'info' | 'success'

interface AlertBannerProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  tone?: AlertTone
  className?: string
}

const toneClasses: Record<AlertTone, { wrap: string; iconColor: string }> = {
  warning: {
    wrap: 'bg-warning-soft border-warning-border',
    iconColor: 'text-warning',
  },
  danger: {
    wrap: 'bg-danger-soft border-danger-border',
    iconColor: 'text-danger',
  },
  info: {
    wrap: 'bg-info-soft border-info-border',
    iconColor: 'text-info',
  },
  success: {
    wrap: 'bg-success-soft border-success-border',
    iconColor: 'text-success',
  },
}

export function AlertBanner({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  tone = 'warning',
  className,
}: AlertBannerProps) {
  const styles = toneClasses[tone]
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border p-3.5 sm:p-4 sm:p-5',
        styles.wrap,
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <div
          className={cn(
            'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl shrink-0 bg-surface',
            styles.iconColor,
          )}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
          {description && (
            <p className="text-eyebrow text-muted-foreground mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {actionLabel && (actionHref || onAction) && (
        <div className="shrink-0 sm:shrink-0">
          {actionHref ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full sm:w-auto h-10 sm:h-8 bg-surface"
            >
              <Link to={actionHref}>
                {actionLabel}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onAction}
              className="w-full sm:w-auto h-10 sm:h-8 bg-surface"
            >
              {actionLabel}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
