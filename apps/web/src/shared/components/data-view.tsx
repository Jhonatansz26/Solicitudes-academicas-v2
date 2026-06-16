import { type ReactNode } from 'react'
import { TableView, type ColumnDef } from './table-view'
import { ListView, type ListViewItem } from './list-view'
import { CardView, type CardViewItem } from './card-view'
import { EmptyState } from './empty-state'
import { Skeleton } from './ui/skeleton'
import { PageHeader } from './page-header'
import { Pagination } from './pagination'
import { Inbox, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/**
 * DataView — Orquestador de vistas de datos.
 *
 * Patrón unificado para todos los listados del sistema.
 * Soporta tres modos: 'table' | 'list' | 'card'.
 * Unifica PageHeader, FilterBar, loading, empty, error y pagination.
 */

interface PaginationState {
  page: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  onPageChange: (page: number) => void
}

interface DataViewProps<T> {
  /** Modo de visualización. */
  mode: 'table' | 'list' | 'card'
  /** Datos. */
  data?: { data: T[]; total?: number; page?: number; totalPages?: number }
  /** Estado de carga. */
  isLoading?: boolean
  /** Estado de error. */
  isError?: boolean
  /** Callback de retry en error. */
  onRetry?: () => void

  // ─── Page Header ───
  title?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  headerActions?: ReactNode

  // ─── Filter Bar ───
  search?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: (value: string) => void
  filters?: ReactNode
  filterActions?: ReactNode
  activeFilters?: ReactNode

  // ─── Empty / Error ───
  emptyTitle?: ReactNode
  emptyDescription?: ReactNode
  emptyAction?: ReactNode
  emptyIcon?: ReactNode

  // ─── Pagination ───
  showPagination?: boolean
  pagination?: PaginationState

  // ─── Table-specific ───
  columns?: ColumnDef<T>[]
  rowKey?: (row: T) => string
  onRowClick?: (row: T) => void

  // ─── List-specific ───
  listItems?: (row: T) => (Omit<ListViewItem, 'id'> & { id?: string })[]
  listItemKey?: (row: T) => string

  // ─── Card-specific ───
  cardColumns?: 1 | 2 | 3 | 4
  cardItems?: (row: T) => (Omit<CardViewItem, 'id'> & { id?: string })[]
  onItemClick?: (row: T) => void

  // ─── Misc ───
  contentClassName?: string
  className?: string
}

function defaultEmptyIcon() {
  return <Inbox className="h-6 w-6" />
}

export function DataView<T extends { id: string } = { id: string }>(props: DataViewProps<T>) {
  const {
    mode,
    data,
    isLoading = false,
    isError = false,
    onRetry,

    title,
    description,
    eyebrow,
    headerActions,

    search,
    searchPlaceholder,
    onSearchChange,
    onSearchSubmit,
    filters,
    filterActions,
    activeFilters,

    emptyTitle = 'Sin resultados',
    emptyDescription,
    emptyAction,
    emptyIcon,

    showPagination = true,
    pagination,

    columns,
    rowKey,
    onRowClick,

    listItems,
    listItemKey,

    cardColumns,
    cardItems,

    contentClassName,
    className,
  } = props

  const rows = data?.data ?? []
  const hasFilters = Boolean(search) || Boolean(filters) || Boolean(activeFilters)
  const showFilterBar = onSearchChange !== undefined || filters !== undefined || filterActions !== undefined

  return (
    <div className={cn('space-y-6', className)}>
      {/* PageHeader */}
      {(title || description || headerActions) && (
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={headerActions}
        />
      )}

      {/* FilterBar */}
      {showFilterBar && (
        <div className="rounded-xl border border-border bg-surface p-3 sm:p-4 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {onSearchChange !== undefined && (
              <div className="relative flex-1 min-w-0">
                <input
                  type="search"
                  value={search ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      onSearchSubmit?.(e.currentTarget.value)
                    }
                  }}
                  placeholder={searchPlaceholder ?? 'Buscar...'}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"
                  aria-label="Buscar"
                />
              </div>
            )}
            {(filters || filterActions) && (
              <div className="flex flex-wrap items-center gap-2">
                {filters}
                {filterActions}
              </div>
            )}
          </div>
          {activeFilters && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
              {activeFilters}
            </div>
          )}
        </div>
      )}

      {/* Content: loading / error / empty / data */}
      {isError ? (
        <div className="rounded-xl border border-danger/30 bg-danger-soft p-10 text-center">
          <AlertCircle className="h-6 w-6 text-danger mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-foreground">Error al cargar</h3>
          <p className="mt-1 text-xs text-muted-foreground">No fue posible obtener la información.</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 h-8 text-sm font-medium rounded-lg border border-border bg-surface text-foreground hover:bg-muted transition-colors"
            >
              <Loader2 className="h-3.5 w-3.5" />
              Reintentar
            </button>
          )}
        </div>
      ) : isLoading ? (
        <div className={cn('space-y-3', contentClassName)}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={emptyIcon ?? defaultEmptyIcon()}
          title={emptyTitle}
          description={emptyDescription ?? (hasFilters ? 'Intenta ajustar los filtros' : 'No hay datos para mostrar')}
          action={emptyAction}
        />
      ) : (
        <>
          {mode === 'table' && columns && rowKey && (
            <TableView
              rows={rows as object[]}
              columns={columns as ColumnDef<object>[]}
              rowKey={rowKey as (row: object) => string}
              onRowClick={onRowClick as ((row: object) => void) | undefined}
              className={contentClassName}
            />
          )}

          {mode === 'list' && listItems && (
            <ListView
              items={rows.flatMap((row) => {
                const items = listItems(row)
                return items.map(
                  (it, i) =>
                    ({
                      id: it.id ?? `${(listItemKey?.(row) ?? 'row')}-${i}`,
                      primary: it.primary,
                      secondary: it.secondary,
                      meta: it.meta,
                      actions: it.actions,
                      leading: it.leading,
                      className: it.className,
                      disabled: it.disabled,
                    }) as ListViewItem,
                )
              })}
              className={contentClassName}
            />
          )}

          {mode === 'card' && cardItems && (
            <CardView
              items={rows.flatMap((row) => {
                const items = cardItems(row)
                return items.map(
                  (it, i) =>
                    ({
                      id: it.id ?? `${(rowKey?.(row as T & { id: string }) ?? 'row')}-${i}`,
                      content: it.content,
                      actions: it.actions,
                      footer: it.footer,
                      className: it.className,
                    }) as CardViewItem,
                )
              })}
              columns={cardColumns}
              className={contentClassName}
            />
          )}
        </>
      )}

      {/* Pagination */}
      {showPagination && pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
        />
      )}
    </div>
  )
}
