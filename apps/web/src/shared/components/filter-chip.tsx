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
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground shadow-sm transition-colors',
        'hover:border-border-hover hover:bg-surface-hover',
        className,
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="rounded-full p-0.5 transition-colors hover:text-foreground text-muted-foreground"
        aria-label={`Remover filtro: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
