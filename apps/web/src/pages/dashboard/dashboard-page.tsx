import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { StatusBadge } from '@/features/requests/components/status-badge'
import { useDashboardStats } from '@/features/requests/hooks/use-requests'
import { useAuth } from '@/app/providers/auth-provider'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { RequestStatus } from '@/shared/types'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isReviewer } = usePermissions()
  const { data: stats, isLoading, isError } = useDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenido, {user?.fullName}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))
        ) : isError ? (
          <Card className="sm:col-span-2 lg:col-span-4 border-danger/20 bg-danger-soft">
            <CardContent className="py-4">
              <p className="text-sm text-danger">Error al cargar estadísticas</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <StatCard
              label="Total"
              value={stats?.total ?? 0}
              icon={FileText}
              color="text-primary"
            />
            <StatCard
              label="En revisión"
              value={stats?.inReview ?? 0}
              icon={Clock}
              color="text-warning"
            />
            <StatCard
              label="Aprobadas"
              value={stats?.approved ?? 0}
              icon={CheckCircle}
              color="text-success"
            />
            <StatCard
              label="Pendientes"
              value={stats?.submitted ?? 0}
              icon={AlertCircle}
              color="text-danger"
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Error al cargar actividad reciente
            </p>
          ) : !stats?.recentActivity.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sin actividad reciente
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0 cursor-pointer transition-colors hover:bg-surface-hover -mx-2 px-2 rounded"
                  onClick={() => navigate(`/dashboard/requests/${item.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                      {isReviewer && (
                        <span className="text-xs text-muted-foreground ml-1.5">
                          — {item.user.fullName}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.trackingNumber} · {formatRelativeTime(item.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={item.status as RequestStatus} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={cn('h-4 w-4', color)} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  if (days < 30) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
  return new Date(dateStr).toLocaleDateString('es-CO')
}
