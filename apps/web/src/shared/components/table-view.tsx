import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface ColumnDef<T> {
  /** Clave única de la columna. */
  key: string
  /** Header label. */
  header: ReactNode
  /** Cell renderer. */
  cell: (row: T, index: number) => ReactNode
  /** Alineación. */
  align?: 'left' | 'right' | 'center'
  /** Ancho preferido. Ej: '120px', '20%'. */
  width?: string
  /** Si la columna se oculta en mobile. */
  hideOnMobile?: boolean
  /** className extra para th/td. */
  className?: string
}

interface TableViewProps<T> {
  /** Filas. */
  rows: T[]
  /** Definición de columnas. */
  columns: ColumnDef<T>[]
  /** Row key extractor. */
  rowKey: (row: T) => string
  /** Click handler por fila. */
  onRowClick?: (row: T) => void
  /** Estado de carga (muestra skeleton rows). */
  loading?: boolean
  /** Cantidad de skeleton rows cuando loading. */
  skeletonRows?: number
  /** Mensaje cuando rows está vacío. */
  emptyMessage?: ReactNode
  /** Estado de error. */
  error?: boolean
  /** Si muestra la fila de acciones. */
  showActions?: boolean
  /** className adicional. */
  className?: string
}

function getAlignClass(align?: ColumnDef<unknown>['align']) {
  switch (align) {
    case 'right':
      return 'text-right'
    case 'center':
      return 'text-center'
    default:
      return 'text-left'
  }
}

export function TableView<T extends object>({
  rows,
  columns,
  rowKey,
  onRowClick,
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'Sin resultados',
  error = false,
  className,
}: TableViewProps<T>) {
  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn('rounded-xl border border-border bg-surface overflow-hidden', className)}>
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'h-10 px-4 text-eyebrow font-bold uppercase tracking-wider text-muted-foreground',
                    getAlignClass(col.align),
                    col.hideOnMobile && 'hidden md:table-cell',
                    col.className,
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`skeleton-${i}`} aria-busy="true">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'h-14 px-4',
                      col.hideOnMobile && 'hidden md:table-cell',
                    )}
                  >
                    <div className="h-4 w-full max-w-[200px] rounded bg-muted animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-surface overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'h-10 px-4 text-eyebrow font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap',
                    getAlignClass(col.align),
                    col.hideOnMobile && 'hidden md:table-cell',
                    col.className,
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => {
              const key = rowKey(row)
              const interactive = Boolean(onRowClick)
              return (
                <tr
                  key={key}
                  onClick={interactive ? () => onRowClick?.(row) : undefined}
                  onKeyDown={
                    interactive
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onRowClick?.(row)
                          }
                        }
                      : undefined
                  }
                  tabIndex={interactive ? 0 : undefined}
                  className={cn(
                    'transition-colors',
                    interactive &&
                      'cursor-pointer hover:bg-muted/40 focus:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'h-14 px-4 text-sm text-foreground align-middle',
                        getAlignClass(col.align),
                        col.hideOnMobile && 'hidden md:table-cell',
                      )}
                    >
                      {col.cell(row, index)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export type { ColumnDef }
