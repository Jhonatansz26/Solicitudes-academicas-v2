import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface FilterChipProps {
  label: string
  onRemove: () => void
  className?: string
}

export function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface pl-3 pr-1 py-0.5 text-xs font-medium text-foreground shadow-sm transition-colors',
        'hover:border-border-hover hover:bg-surface-hover',
        className,
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="rounded-full h-6 w-6 inline-flex items-center justify-center transition-colors hover:text-foreground text-muted-foreground hover:bg-muted"
        aria-label={`Remover filtro: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
