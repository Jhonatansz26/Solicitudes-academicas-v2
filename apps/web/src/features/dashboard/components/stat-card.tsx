import type { LucideIcon } from 'lucide-react'
import { KpiCard } from '@/shared/components/kpi-card'
import { cn } from '@/shared/lib/utils'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  variant: 'primary' | 'warning' | 'success' | 'danger' | 'info'
  stagger?: 1 | 2 | 3 | 4
}

export function StatCard({ label, value, icon, variant, stagger }: StatCardProps) {
  return (
    <KpiCard
      label={label}
      value={value}
      icon={icon}
      variant={variant}
      className={cn('animate-fade-in-up hover-elevate', stagger ? `stagger-${stagger}` : '')}
    />
  )
}
