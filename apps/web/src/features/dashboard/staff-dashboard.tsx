import { useNavigate } from 'react-router-dom'
import { ClipboardList, FileText, Sparkles, Inbox, AlertCircle, Clock, ArrowRight } from 'lucide-react'
import {
  useRequests,
  useDashboardStats,
} from '@/features/requests/hooks/use-requests'
import { DashboardHero } from '@/features/dashboard/widgets/dashboard-hero'
import { KpiGrid, KpiTile } from '@/features/dashboard/widgets/kpi-tile'
import { RequestListPreview, type RequestPreviewItem } from '@/features/dashboard/widgets/request-list-preview'
import { QuickActions, type QuickAction } from '@/features/dashboard/widgets/quick-actions'
import { AlertBanner } from '@/features/dashboard/widgets/alert-banner'
import { Widget } from '@/features/dashboard/widgets/widget'
import { ActivityFeed, type ActivityItem } from '@/features/dashboard/widgets/activity-feed'
import { useAuth } from '@/app/providers/auth-provider'

export function StaffDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()

  // Cola operativa: SUBMITTED + IN_REVIEW
  const { data: queueData, isLoading: queueLoading } = useRequests({
    page: 1,
    limit: 8,
    status: 'SUBMITTED',
  })
  const { data: reviewData, isLoading: reviewLoading } = useRequests({
    page: 1,
    limit: 8,
    status: 'IN_REVIEW',
  })

  const queueItems: RequestPreviewItem[] = [
    ...(queueData?.data?.map((req) => ({
      id: req.id,
      trackingNumber: req.trackingNumber,
      title: req.title,
      status: req.status,
      createdAt: req.createdAt,
      primary: req.user?.fullName,
      secondary: req.requestType?.name,
    })) ?? []),
    ...(reviewData?.data?.map((req) => ({
      id: req.id,
      trackingNumber: req.trackingNumber,
      title: req.title,
      status: req.status,
      createdAt: req.updatedAt,
      primary: req.user?.fullName,
      secondary: req.requestType?.name,
    })) ?? []),
  ]

  // SLA: items > 3 días en cola
  const slaItems = queueItems
    .filter((r) => Date.now() - new Date(r.createdAt).getTime() > 3 * 24 * 60 * 60 * 1000)
    .slice(0, 3)

  // Actividad reciente: combinar los más recientes de queue
  const activityItems: ActivityItem[] = queueItems.slice(0, 5).map((req) => ({
    id: req.id,
    title: req.title,
    description: req.primary,
    meta: req.trackingNumber,
    timestamp: req.createdAt,
    href: `/dashboard/requests/${req.id}`,
  }))

  const firstName = user?.fullName?.split(' ')[0] ?? 'funcionario'

  const quickActions: QuickAction[] = [
    {
      label: 'Ver todas las solicitudes',
      description: 'Listado completo con filtros',
      href: '/dashboard/requests',
      icon: FileText,
    },
    {
      label: 'Documentos generados',
      description: 'Certificados y constancias',
      href: '/dashboard/documents',
      icon: Sparkles,
    },
  ]

  const totalQueue = (stats?.submitted ?? 0) + (stats?.inReview ?? 0)

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Funcionario de registro"
        title={`Hola, ${firstName}`}
        description={
          totalQueue > 0
            ? `Tienes ${totalQueue} solicitud${totalQueue === 1 ? '' : 'es'} en tu cola de trabajo.`
            : 'No hay solicitudes pendientes en tu cola.'
        }
      />

      {slaItems.length > 0 && (
        <AlertBanner
          icon={AlertCircle}
          tone="warning"
          title={`${slaItems.length} solicitud${slaItems.length === 1 ? '' : 'es'} con SLA cercano`}
          description="Llevan más de 3 días en cola. Revisa las más urgentes."
          actionLabel="Revisar"
          actionHref="/dashboard/requests?status=SUBMITTED"
        />
      )}

      <KpiGrid columns={4}>
        <KpiTile
          label="En cola"
          value={statsLoading ? '—' : (stats?.submitted ?? 0)}
          icon={Inbox}
          tone="warning"
        />
        <KpiTile
          label="En revisión"
          value={statsLoading ? '—' : (stats?.inReview ?? 0)}
          icon={ClipboardList}
          tone="info"
        />
        <KpiTile
          label="Esperando docs"
          value={statsLoading ? '—' : (stats?.submitted ?? 0) + (stats?.inReview ?? 0)}
          icon={Clock}
          tone="warning"
        />
        <KpiTile
          label="Procesadas hoy"
          value={statsLoading ? '—' : '—'}
          tone="success"
        />
      </KpiGrid>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RequestListPreview
            title="Bandeja operativa"
            description="Solicitudes nuevas y en revisión"
            items={queueItems.slice(0, 8)}
            loading={queueLoading || reviewLoading}
            emptyTitle="Bandeja vacía"
            emptyDescription="No hay solicitudes en cola."
            viewAllHref="/dashboard/requests?status=SUBMITTED"
            viewAllLabel="Ver todas"
            onItemClick={(item) => navigate(`/dashboard/requests/${item.id}`)}
          />
        </div>

        <div className="space-y-6">
          <QuickActions title="Acciones rápidas" actions={quickActions} columns={1} />

          {activityItems.length > 0 && (
            <ActivityFeed
              title="Últimas en cola"
              items={activityItems}
              emptyTitle="Sin actividad"
            />
          )}
        </div>
      </div>

      {slaItems.length > 0 && (
        <Widget title="Solicitudes con SLA cercano" description="Más de 3 días en cola">
          <ul className="space-y-2">
            {slaItems.map((item) => {
              const days = Math.floor(
                (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24),
              )
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/requests/${item.id}`)}
                    className="w-full flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-soft text-warning shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.trackingNumber} · {item.title}
                      </p>
                      <p className="text-eyebrow text-muted-foreground truncate">
                        {item.primary} · {item.secondary}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-eyebrow font-semibold text-warning">{days}d</p>
                      <p className="text-eyebrow text-muted-foreground">en cola</p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground shrink-0"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </Widget>
      )}
    </div>
  )
}
