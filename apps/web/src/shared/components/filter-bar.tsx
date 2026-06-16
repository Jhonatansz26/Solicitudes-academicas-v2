import { type ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface FilterBarProps {
  /** Valor controlado del search. */
  search?: string
  /** Placeholder del search. */
  searchPlaceholder?: string
  /** Callback al cambiar el search (onChange). */
  onSearchChange?: (value: string) => void
  /** Callback al ejecutar búsqueda (Enter o blur). Si se omite, se usa onSearchChange. */
  onSearchSubmit?: (value: string) => void
  /** Filtros adicionales a la derecha del search (selects, etc.). */
  filters?: ReactNode
  /** Acciones a la derecha (ej. "Crear nuevo", "Exportar"). */
  actions?: ReactNode
  /** Chips removibles debajo (filtros activos). */
  activeFilters?: ReactNode
  /** className adicional. */
  className?: string
}

export function FilterBar({
  search,
  searchPlaceholder = 'Buscar...',
  onSearchChange,
  onSearchSubmit,
  filters,
  actions,
  activeFilters,
  className,
}: FilterBarProps) {
  const handleChange = (value: string) => {
    onSearchChange?.(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const target = e.currentTarget
      onSearchSubmit?.(target.value)
    }
  }

  const handleClear = () => {
    handleChange('')
    onSearchSubmit?.('')
  }

  const hasSearch = (search ?? '').length > 0
  const showClear = onSearchChange !== undefined || onSearchSubmit !== undefined

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-3 sm:p-4',
        'space-y-3',
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        {onSearchChange !== undefined && (
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={search ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-9 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"
              aria-label="Buscar"
            />
            {hasSearch && showClear && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filters + Actions */}
        {(filters || actions) && (
          <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
            {filters}
            {actions}
          </div>
        )}
      </div>

      {/* Active filters chips */}
      {activeFilters && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
          {activeFilters}
        </div>
      )}
    </div>
  )
}
