import { useAuth } from '@/app/providers/auth-provider'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { useDashboardStats } from '@/features/requests/hooks/use-requests'
import { StatCard } from '@/features/dashboard/components/stat-card'
import { ActivityTimeline } from '@/features/dashboard/components/activity-timeline'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuth()
  const { isReviewer } = usePermissions()
  const { data: stats, isLoading, isError } = useDashboardStats()

  const roleLabels: Record<string, string> = {
    STUDENT: 'Estudiante',
    STAFF: 'Funcionario',
    COORDINATOR: 'Coordinador',
    ADMIN: 'Administrador',
  }

  const roleLabel = user?.role ? roleLabels[user.role] || user.role : ''

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Centro de Control
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Bienvenido,{' '}
          <span className="font-semibold text-foreground">{user?.fullName}</span>
          {roleLabel && (
            <span className="ml-2 inline-flex items-center rounded-full bg-gold-500/15 px-2.5 py-0.5 text-xs font-medium text-gold-700 dark:text-gold-400 border border-gold-500/25">
              {roleLabel}
            </span>
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isReviewer
            ? 'Gestiona y supervisa las solicitudes académicas del sistema.'
            : 'Administra tus solicitudes académicas y realiza seguimiento en tiempo real.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))
        ) : isError ? (
          <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-danger/20 bg-danger-soft p-6">
            <p className="text-sm text-danger">
              Error al cargar estadísticas. Por favor, intenta nuevamente.
            </p>
          </div>
        ) : (
          <>
            <StatCard
              label="Total de Solicitudes"
              value={stats?.total ?? 0}
              icon={FileText}
              variant="primary"
              stagger={1}
            />
            <StatCard
              label="En Revisión"
              value={stats?.inReview ?? 0}
              icon={Clock}
              variant="warning"
              stagger={2}
            />
            <StatCard
              label="Aprobadas"
              value={stats?.approved ?? 0}
              icon={CheckCircle}
              variant="success"
              stagger={3}
            />
            <StatCard
              label="Pendientes"
              value={stats?.submitted ?? 0}
              icon={AlertCircle}
              variant="danger"
              stagger={4}
            />
          </>
        )}
      </div>

      <ActivityTimeline
        items={stats?.recentActivity ?? []}
        isLoading={isLoading}
        isError={isError}
        isReviewer={isReviewer}
      />
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="h-1.5 w-full bg-primary/20 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
        <div className="h-10 w-20 rounded bg-muted animate-pulse" />
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}
