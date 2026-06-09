import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/page-header'
import { SectionCard } from '@/shared/components/section-card'
import { EmptyState } from '@/shared/components/empty-state'
import { cn } from '@/shared/lib/utils'

interface DataTableShellProps {
  title?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  toolbar?: ReactNode
  filters?: ReactNode
  footer?: ReactNode
  children: ReactNode
  isLoading?: boolean
  isError?: boolean
  loadingState?: ReactNode
  errorState?: ReactNode
  emptyState?: ReactNode
  className?: string
  bodyClassName?: string
  toolbarClassName?: string
}

export function DataTableShell({
  title,
  description,
  eyebrow,
  actions,
  toolbar,
  filters,
  footer,
  children,
  isLoading = false,
  isError = false,
  loadingState,
  errorState,
  emptyState,
  className,
  bodyClassName,
  toolbarClassName,
}: DataTableShellProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {(title || description || actions || eyebrow) && (
          <PageHeader title={title ?? ''} description={description} eyebrow={eyebrow} actions={actions} />
        )}
        {loadingState ?? (
          <SectionCard className="overflow-hidden">
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando...
            </div>
          </SectionCard>
        )}
      </div>
    )
  }

  if (isError) {
    return (
      <div className={cn('space-y-4', className)}>
        {(title || description || actions || eyebrow) && (
          <PageHeader title={title ?? ''} description={description} eyebrow={eyebrow} actions={actions} />
        )}
        {errorState ?? (
          <EmptyState
            icon={<Loader2 className="h-5 w-5 animate-spin" />}
            title="Ocurrió un error"
            description="No fue posible cargar la información. Intenta nuevamente."
          />
        )}
      </div>
    )
  }

  if (!children) {
    return (
      <div className={cn('space-y-4', className)}>
        {(title || description || actions || eyebrow) && (
          <PageHeader title={title ?? ''} description={description} eyebrow={eyebrow} actions={actions} />
        )}
        {emptyState ?? (
          <EmptyState
            icon={<Loader2 className="h-5 w-5" />}
            title="Sin resultados"
            description="No hay datos para mostrar en este momento."
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {(title || description || actions || eyebrow) && (
        <PageHeader title={title ?? ''} description={description} eyebrow={eyebrow} actions={actions} />
      )}

      {toolbar || filters ? (
        <SectionCard className={cn('overflow-hidden', toolbarClassName)} contentClassName="px-4 py-4 sm:px-6 sm:py-5">
          <div className="space-y-4">
            {toolbar}
            {filters}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard className={cn('overflow-hidden', bodyClassName)} contentClassName="p-0">
        {children}
      </SectionCard>

      {footer}
    </div>
  )
}
