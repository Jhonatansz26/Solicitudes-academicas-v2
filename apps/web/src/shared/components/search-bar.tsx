import type { InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string
  onValueChange: (value: string) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  buttonLabel?: string
  className?: string
  inputClassName?: string
}

export function SearchBar({
  value,
  onValueChange,
  onSearch,
  onClear,
  buttonLabel = 'Buscar',
  className,
  inputClassName,
  disabled,
  placeholder = 'Buscar...',
  ...props
}: SearchBarProps) {
  const handleSearch = () => {
    onSearch?.(value)
  }

  const showAction = Boolean(onSearch)
  const showClear = Boolean(value) && !disabled

  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          {...props}
          disabled={disabled}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={cn('pl-9 pr-10', inputClassName)}
          onKeyDown={(e) => {
            props.onKeyDown?.(e)
            if (e.key === 'Enter') {
              onSearch?.(value)
            }
          }}
        />
        {showClear && (
          <button
            type="button"
            onClick={() => {
              onValueChange('')
              onClear?.()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showAction && (
        <Button type="button" size="sm" onClick={handleSearch} disabled={disabled}>
          {buttonLabel}
        </Button>
      )}
    </div>
  )
}
