import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  variant: 'primary' | 'warning' | 'success' | 'danger' | 'info'
  stagger?: 1 | 2 | 3 | 4
}

const variantStyles = {
  primary: {
    bar: 'bg-primary',
    iconBg: 'bg-primary/10 dark:bg-navy-900/50',
    iconColor: 'text-primary dark:text-navy-200',
  },
  warning: {
    bar: 'bg-warning',
    iconBg: 'bg-warning-soft',
    iconColor: 'text-warning',
  },
  success: {
    bar: 'bg-success',
    iconBg: 'bg-success-soft',
    iconColor: 'text-success',
  },
  danger: {
    bar: 'bg-danger',
    iconBg: 'bg-danger-soft',
    iconColor: 'text-danger',
  },
  info: {
    bar: 'bg-info',
    iconBg: 'bg-info-soft',
    iconColor: 'text-info',
  },
}

export function StatCard({ label, value, icon: Icon, variant, stagger }: StatCardProps) {
  const styles = variantStyles[variant]
  const staggerClass = stagger ? `stagger-${stagger}` : ''

  return (
    <Card
      className={cn(
        'overflow-hidden animate-fade-in-up hover-elevate',
        staggerClass
      )}
    >
      <div className={cn('h-1.5 w-full', styles.bar)} />

      <CardContent className="pt-6 pb-6">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              styles.iconBg
            )}
          >
            <Icon className={cn('h-6 w-6', styles.iconColor)} />
          </div>
        </div>

        <p className="mt-5 text-4xl font-display font-bold tracking-tight text-foreground">
          {value}
        </p>

        <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
