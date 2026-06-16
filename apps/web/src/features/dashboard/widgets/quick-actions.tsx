import { Link } from 'react-router-dom'
import { type LucideIcon, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Widget } from './widget'
import { cn } from '@/shared/lib/utils'

export interface QuickAction {
  label: string
  description?: string
  href?: string
  icon: LucideIcon
  onClick?: () => void
  variant?: 'default' | 'primary' | 'accent'
}

interface QuickActionsProps {
  title?: string
  description?: string
  actions: QuickAction[]
  columns?: 1 | 2 | 3
  className?: string
}

const columnClasses: Record<NonNullable<QuickActionsProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

const variantClasses: Record<NonNullable<QuickAction['variant']>, string> = {
  default: 'border-border hover:border-border-hover bg-surface',
  primary: 'border-primary/20 bg-primary/5 hover:border-primary/40',
  accent: 'border-gold-500/30 bg-gold-500/5 hover:border-gold-500/60',
}

export function QuickActions({
  title = 'Acciones rápidas',
  description,
  actions,
  columns = 2,
  className,
}: QuickActionsProps) {
  return (
    <Widget title={title} description={description} className={className}>
      <div className={cn('grid gap-2.5 sm:gap-3', columnClasses[columns])} role="list">
        {actions.map((action) => {
          const Icon = action.icon
          const variant = action.variant ?? 'default'
          const inner = (
            <>
              <div
                className={cn(
                  'flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0',
                  variant === 'accent'
                    ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400'
                    : variant === 'primary'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {action.label}
                </p>
                {action.description && (
                  <p className="text-eyebrow text-muted-foreground truncate mt-0.5">
                    {action.description}
                  </p>
                )}
              </div>
              <ArrowRight
                className="h-4 w-4 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
            </>
          )
          const className = cn(
            'flex items-center gap-3 rounded-xl border p-3 sm:p-3 min-h-[56px] transition-colors active:scale-[0.99]',
            'hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            variantClasses[variant],
          )
          if (action.href) {
            return (
              <Link
                key={action.label}
                to={action.href}
                className={className}
                role="listitem"
                aria-label={action.description ? `${action.label}: ${action.description}` : action.label}
              >
                {inner}
              </Link>
            )
          }
          if (action.onClick) {
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={cn('text-left', className)}
                role="listitem"
                aria-label={action.description ? `${action.label}: ${action.description}` : action.label}
              >
                {inner}
              </button>
            )
          }
          return (
            <Button
              key={action.label}
              variant="ghost"
              className="h-auto justify-start p-3"
            >
              {inner}
            </Button>
          )
        })}
      </div>
    </Widget>
  )
}
