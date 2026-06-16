import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface DashboardHeroProps {
  /** Eyebrow/eyebrow text (ej: "Estudiante · Ing. Sistemas · Sem. 5"). */
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  /** Contenido extra opcional (ej: badge de rol, stats inline). */
  meta?: ReactNode
  className?: string
}

/**
 * DashboardHero — Bloque superior del dashboard.
 * Saludo + identidad + acción primaria destacada.
 * Mobile-first: en móvil, action pasa a fila inferior y ocupa todo el ancho.
 */
export function DashboardHero({
  eyebrow,
  title,
  description,
  action,
  meta,
  className,
}: DashboardHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6 md:p-8',
        'flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6',
        className,
      )}
      aria-labelledby="dashboard-hero-title"
    >
      <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
        {eyebrow && (
          <p className="text-eyebrow font-bold uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 id="dashboard-hero-title" className="font-display text-2xl sm:text-[1.7rem] md:text-3xl font-bold tracking-tight text-foreground leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
        {meta && <div className="pt-2">{meta}</div>}
      </div>
      {action && (
        <div className="shrink-0 w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">
          {action}
        </div>
      )}
    </section>
  )
}
