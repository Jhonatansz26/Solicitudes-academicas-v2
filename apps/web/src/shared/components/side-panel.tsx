import type { ReactNode } from 'react'
import { SectionCard } from '@/shared/components/section-card'
import { cn } from '@/shared/lib/utils'

interface SidePanelProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  sticky?: boolean
  topOffsetClassName?: string
}

export function SidePanel({
  title,
  description,
  action,
  footer,
  children,
  className,
  sticky = false,
  topOffsetClassName = 'lg:top-6',
}: SidePanelProps) {
  return (
    <div className={cn(sticky && topOffsetClassName, sticky && 'lg:sticky', className)}>
      <SectionCard title={title} description={description} action={action} footer={footer}>
        {children}
      </SectionCard>
    </div>
  )
}
