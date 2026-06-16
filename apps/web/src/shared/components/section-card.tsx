import type { ReactNode } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription, CardAction } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

type SectionTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

const toneClasses: Record<Exclude<SectionTone, 'default'>, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

interface SectionCardProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  footer?: ReactNode
  tone?: SectionTone
  compact?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
}

export function SectionCard({
  title,
  description,
  action,
  children,
  footer,
  tone = 'default',
  compact = false,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
}: SectionCardProps) {
  const hasHeader = Boolean(title || description || action)

  return (
    <Card className={cn('overflow-hidden gap-0 py-0', className)}>
      {tone !== 'default' && <div className={cn('h-1.5 w-full', toneClasses[tone])} />}

      {hasHeader && (
        <CardHeader className={cn('border-b border-border px-5 py-4 sm:px-6 sm:py-5', headerClassName)}>
          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <div className="space-y-1 min-w-0">
              {title && (
                <CardTitle className="text-sm font-semibold text-foreground">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
            {action && <CardAction>{action}</CardAction>}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(compact ? 'px-4 py-4 sm:px-5 sm:py-5' : 'px-5 py-5 sm:px-6 sm:py-6', contentClassName)}>
        {children}
      </CardContent>

      {footer && (
        <CardFooter className={cn('border-t border-border px-5 py-4 sm:px-6', footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
