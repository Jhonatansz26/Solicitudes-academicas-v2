import { useEffect, type ReactNode } from 'react'
import { X, Inbox } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface DetailDrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function DetailDrawer({ open, onClose, children, className }: DetailDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-[410px] max-w-[90vw] glass-panel border-l border-border flex flex-col transition-transform duration-250 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

export function DrawerHeader({
  eyebrow,
  title,
  subtitle,
  badges,
  onClose,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  badges?: ReactNode
  onClose: () => void
}) {
  return (
    <div className="px-5 pt-5 pb-4 border-b border-border shrink-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              {eyebrow}
            </p>
          )}
          <h2 className="text-base font-bold text-foreground leading-tight truncate">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate font-mono">{subtitle}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-lg border border-border bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {badges && <div className="flex gap-1.5 mt-3 flex-wrap">{badges}</div>}
    </div>
  )
}

export function DrawerBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex-1 overflow-y-auto px-5 py-4 space-y-5', className)}>
      {children}
    </div>
  )
}

export function DrawerFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 py-3 border-t border-border shrink-0 flex gap-2', className)}>
      {children}
    </div>
  )
}

export function DrawerSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2.5', className)}>
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-1.5 border-b border-border">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function DrawerDetailRow({
  label,
  value,
  className,
}: {
  label: string
  value: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between py-1', className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}

export function DrawerDocItem({ icon, label, className }: { icon: ReactNode; label: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 py-2 border-b border-border last:border-0', className)}>
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-xs text-foreground truncate">{label}</span>
    </div>
  )
}

export function DrawerFlowStep({
  icon,
  iconBg,
  title,
  description,
  isLast = false,
}: {
  icon: ReactNode
  iconBg: string
  title: string
  description: string
  isLast?: boolean
}) {
  return (
    <div className="flex gap-3 relative">
      {!isLast && <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />}
      <div className={cn('h-[22px] w-[22px] rounded-full flex items-center justify-center shrink-0 text-[10px] border-2 mt-0.5', iconBg)}>
        {icon}
      </div>
      <div className="pb-3.5 min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{description}</p>
      </div>
    </div>
  )
}

export function DrawerActivityItem({
  color,
  text,
  time,
}: {
  color: string
  text: string
  time: string
}) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
      <div className={cn('h-2 w-2 rounded-full shrink-0 mt-1.5', color)} />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-foreground leading-tight">{text}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
      </div>
    </div>
  )
}

export function DrawerEmptyState({
  icon,
  text,
}: {
  icon?: ReactNode
  text: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover mb-2.5">
        {icon ?? <Inbox className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px]">
        {text}
      </p>
    </div>
  )
}

export function DrawerStatPill({
  value,
  label,
  valueColor,
}: {
  value: string | number
  label: string
  valueColor?: string
}) {
  return (
    <div className="flex flex-col items-center px-3 py-2.5 rounded-lg bg-surface-hover border border-border min-w-[72px]">
      <span className={cn('text-lg font-bold leading-none', valueColor ?? 'text-foreground')}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground mt-1 font-medium">{label}</span>
    </div>
  )
}
