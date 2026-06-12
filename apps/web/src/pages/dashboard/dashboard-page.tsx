import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Layers3,
  ListChecks,
  Users,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Search,
  Inbox,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useAuth } from '@/app/providers/auth-provider'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { useDashboardStats, useAcademicStats } from '@/features/requests/hooks/use-requests'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { EmptyState } from '@/shared/components/empty-state'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function DashboardPage() {
  const { user } = useAuth()
  const { isReviewer } = usePermissions()
  const navigate = useNavigate()
  const { data: stats, isError, refetch } = useDashboardStats()
  const { data: academicStats, isLoading: academicLoading } = useAcademicStats()

  const [searchQuery, setSearchQuery] = useState('')
  const [feedFilter, setFeedFilter] = useState<'all' | 'pending' | 'approved'>('all')

  const roleLabels: Record<string, string> = {
    STUDENT: 'Estudiante',
    STAFF: 'Funcionario',
    COORDINATOR: 'Coordinador',
    ADMIN: 'Administrador',
  }

  const roleLabel = user?.role ? roleLabels[user.role] || user.role : ''
  const roleVariant: Record<string, 'role-admin' | 'role-coordinator' | 'role-staff' | 'role-student'> = {
    ADMIN: 'role-admin',
    COORDINATOR: 'role-coordinator',
    STAFF: 'role-staff',
    STUDENT: 'role-student',
  }

  const total = stats?.total ?? 0
  const draft = stats?.draft ?? 0
  const submitted = stats?.submitted ?? 0
  const inReview = stats?.inReview ?? 0
  const approved = stats?.approved ?? 0
  const rejected = stats?.rejected ?? 0
  const cancelled = stats?.cancelled ?? 0
  const attentionTotal = submitted + inReview

  // Percentages for process monitor
  const totalVal = stats?.total ?? 0
  const approvedPct = totalVal > 0 ? ((stats?.approved ?? 0) / totalVal) * 100 : 0
  const draftPct = totalVal > 0 ? ((stats?.draft ?? 0) / totalVal) * 100 : 0
  const inReviewPct = totalVal > 0 ? ((stats?.inReview ?? 0) / totalVal) * 100 : 0
  const submittedPct = totalVal > 0 ? ((stats?.submitted ?? 0) / totalVal) * 100 : 0
  const rejectedPct = totalVal > 0 ? ((stats?.rejected ?? 0) / totalVal) * 100 : 0
  const cancelledPct = totalVal > 0 ? ((stats?.cancelled ?? 0) / totalVal) * 100 : 0

  const actions = (
    <>
      <Button asChild variant="gold" className="px-5 py-3 h-auto rounded-xl bg-[#e8a820] hover:bg-gold-600 dark:bg-gold-500 dark:hover:bg-gold-600 text-[#1a2340] font-semibold text-sm transition-all shadow-md shadow-gold-500/10 hover:shadow-lg hover:shadow-gold-500/20 flex items-center justify-center gap-2 group shrink-0">
        <Link to={isReviewer ? '/dashboard/requests' : '/dashboard/requests/new'}>
          {isReviewer ? (
            <>
              Ver solicitudes
              <ArrowRight className="h-4.5 w-4.5" />
            </>
          ) : (
            <>
              Nueva solicitud
              <Sparkles className="h-4.5 w-4.5 transition-transform group-hover:rotate-12" />
            </>
          )}
        </Link>
      </Button>
      <Button asChild variant="outline" className="px-5 py-3 h-auto rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0">
        <Link to={isReviewer ? '/dashboard/documents' : '/dashboard/requests'}>
          {isReviewer ? 'Documentos oficiales' : 'Mis solicitudes'}
        </Link>
      </Button>
    </>
  )

  const quickLinks = [
    { label: 'Nueva solicitud', to: '/dashboard/requests/new', icon: Sparkles },
    { label: 'Ver solicitudes', to: '/dashboard/requests', icon: ListChecks },
    { label: 'Documentos oficiales', to: '/dashboard/documents', icon: FileText },
    { label: 'Configuración', to: '/dashboard/settings', icon: Layers3 },
    ...(user?.role === 'ADMIN' ? [{ label: 'Usuarios', to: '/dashboard/admin/users', icon: Users }] : []),
  ]

  // Interactive filtering logic for activity feed
  const filteredActivity = (stats?.recentActivity ?? []).filter((item) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = query === '' ||
      item.title.toLowerCase().includes(query) ||
      item.trackingNumber.toLowerCase().includes(query) ||
      item.requestType.name.toLowerCase().includes(query) ||
      (item.user?.fullName && item.user.fullName.toLowerCase().includes(query))

    let matchesStatus = true
    if (feedFilter === 'pending') {
      matchesStatus = item.status === 'SUBMITTED' || item.status === 'IN_REVIEW'
    } else if (feedFilter === 'approved') {
      matchesStatus = item.status === 'APPROVED'
    }
    return matchesSearch && matchesStatus
  })
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* DIAGNOSTIC: bg-mesh elements removed, relative/overflow-hidden removed */}

      {/* PORTAL COMMAND CENTER HERO */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-premium-sm border-l-4 border-l-[#e8a820] z-10">
        {/* Subtle SVG Institutional Crest background watermark */}
        <div className="absolute right-0 top-0 opacity-[0.03] dark:opacity-[0.02] transform translate-x-12 -translate-y-8 pointer-events-none">
          <svg className="w-96 h-96 text-[#0d1b3e] dark:text-white" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" fill="none"/>
            <path d="M50 15 L20 40 L50 65 L80 40 Z"/>
            <path d="M20 40 L50 90 L80 40"/>
          </svg>
        </div>

        <div className="space-y-3 max-w-4xl flex-1 z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 dark:bg-gold-500/10 dark:border-gold-500/20 dark:text-gold-400 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#e8a820]" />
            <span>Universidad Cooperativa de Colombia</span>
          </div>
          
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-[#0f172a] dark:text-white tracking-tight leading-tight">
            Centro de Control Académico
          </h2>
          
          <p className="text-sm text-[#475569] dark:text-slate-300 font-medium leading-relaxed">
            Bienvenido de nuevo, <span className="text-[#0d1b3e] dark:text-white font-semibold">{user?.fullName}</span>{' '}
            {roleLabel && (
              <Badge variant={roleVariant[user?.role ?? 'STUDENT']} className="ml-1 align-middle">
                {roleLabel}
              </Badge>
            )}
            <span className="block mt-1.5 text-xs text-[#475569] dark:text-slate-300">
              {attentionTotal > 0 ? (
                <>
                  Tienes{' '}
                  <span className="text-[#b45309] dark:text-gold-400 font-bold">
                    {attentionTotal} {attentionTotal === 1 ? 'solicitud' : 'solicitudes'}
                  </span>{' '}
                  en revisión que requiere tu atención prioritaria.
                </>
              ) : (
                'Gestiona tus trámites escolares con una vista consolidada en tiempo real.'
              )}
            </span>
          </p>

          {/* Interactive Search Bar matching the HTML proposal */}
          <div className="pt-4 flex max-w-xl w-full">
            <div className="relative flex-1">
              <div className="absolute top-1/2 -translate-y-1/2 left-0 pl-3.5 pointer-events-none text-slate-600 dark:text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código, estudiante o trámite..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e8a820]/45 focus:border-[#e8a820] transition-all placeholder-slate-500 dark:placeholder-slate-400 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 z-10 shrink-0">
          {actions}
        </div>
      </div>

      {
    isError ? (
      <EmptyState
        icon={<AlertCircle className="h-6 w-6" />}
        title="No fue posible cargar el dashboard"
        description="Revisa tu conexión e intenta nuevamente para recuperar las métricas operativas."
        action={
          <Button onClick={() => refetch()} size="sm">
            Reintentar
          </Button>
        }
      />
    ) : (
      <>
        {/* KPI Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 z-10 relative">

          {/* KPI Card 1: Total */}
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Total de solicitudes
                </span>
                <h3 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {total}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-50 border border-navy-200 text-navy-700 dark:bg-slate-800 dark:border-transparent dark:text-slate-350">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{draft} borradores activos</span>
              </div>
              {/* SVG Sparkline */}
              <svg className="w-20 h-7 text-emerald-600 dark:text-emerald-500" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 25 Q15 15, 30 20 T60 5 T90 15 T100 2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* KPI Card 2: Enviadas */}
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Enviadas
                </span>
                <h3 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {submitted}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[#b45309] dark:bg-warning-soft dark:border-transparent dark:text-warning">
                <Clock3 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{attentionTotal} en seguimiento</span>
              </div>
              <svg className="w-20 h-7 text-amber-600 dark:text-amber-500" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 20 Q20 20, 40 28 T70 28 T100 25" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* KPI Card 3: En revisión */}
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  En revisión
                </span>
                <h3 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {inReview}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 dark:bg-info-soft dark:border-transparent dark:text-info">
                <ListChecks className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-info animate-pulse shrink-0" />
                <span>Flujo operativo en curso</span>
              </div>
              <svg className="w-20 h-7 text-blue-600 dark:text-blue-500" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 10 Q20 5, 40 18 T70 12 T100 15" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* KPI Card 4: Aprobadas */}
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Aprobadas
                </span>
                <h3 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {approved}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-success-soft dark:border-transparent dark:text-success">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span>{rejected} rechazadas · {cancelled} canceladas</span>
              </div>
              <svg className="w-20 h-7 text-emerald-600 dark:text-emerald-500" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 25 Q20 20, 40 15 T70 5 T100 1" strokeLinecap="round" />
              </svg>
            </div>
          </div>

        </div>

        <div className="grid gap-6 xl:grid-cols-12 xl:items-start z-10 relative">
          {/* COLUMNA IZQUIERDA (xl:col-span-8) */}
          <div className="space-y-6 xl:col-span-8">

            {/* 1. Actividad Reciente */}
            <section className="glass-panel rounded-2xl shadow-premium-sm p-5 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Historial de Movimientos Recientes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                    Últimas actualizaciones en la cola de procesamiento escolar.
                  </p>
                </div>
                
                {/* Inbox Feed Filters matching HTML design exactly */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/20 shrink-0">
                  <button
                    onClick={() => setFeedFilter('all')}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all",
                      feedFilter === 'all'
                        ? "bg-white dark:bg-slate-700 text-[#0d1b3e] dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFeedFilter('pending')}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all",
                      feedFilter === 'pending'
                        ? "bg-white dark:bg-slate-700 text-[#0d1b3e] dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    Pendientes
                  </button>
                  <button
                    onClick={() => setFeedFilter('approved')}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all",
                      feedFilter === 'approved'
                        ? "bg-white dark:bg-slate-700 text-[#0d1b3e] dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    Aprobadas
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 -mx-3">
                {filteredActivity.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No se encontraron solicitudes</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px] mt-1">Prueba a buscar con otra palabra o cambia el filtro.</p>
                  </div>
                ) : (
                  filteredActivity.map((item) => {
                    const isApproved = item.status === 'APPROVED'
                    const isSubmitted = item.status === 'SUBMITTED'
                    const isInReview = item.status === 'IN_REVIEW'
                    const isRejected = item.status === 'REJECTED'
                    const isCancelled = item.status === 'CANCELLED'

                    return (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/dashboard/requests/${item.id}`)}
                        className="py-3.5 flex items-center justify-between gap-4 transition-all hover:bg-slate-100/80 dark:hover:bg-slate-900/10 rounded-xl px-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm border",
                            isApproved && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-success-soft dark:text-success dark:border-success/20",
                            isSubmitted && "bg-amber-50 text-[#b45309] border-amber-200 dark:bg-warning-soft dark:text-warning dark:border-warning/20",
                            isInReview && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-info-soft dark:text-info dark:border-info/20",
                            isRejected && "bg-red-50 text-red-700 border-red-200 dark:bg-danger-soft dark:text-danger dark:border-danger/20",
                            isCancelled && "bg-slate-100 text-slate-800 border-slate-250 dark:bg-muted dark:text-muted-foreground dark:border-border",
                          )}>
                            {isApproved && <CheckCircle2 className="w-5 h-5" />}
                            {isSubmitted && <Clock3 className="w-5 h-5" />}
                            {isInReview && <ListChecks className="w-5 h-5" />}
                            {isRejected && <AlertCircle className="w-5 h-5" />}
                            {isCancelled && <AlertTriangle className="w-5 h-5" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#e8a820] dark:group-hover:text-gold-400 transition-colors truncate">
                                {item.title}
                              </h4>
                              <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 border border-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-md uppercase tracking-wider shrink-0 dark:border-slate-700/50">
                                {item.requestType.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {isReviewer ? item.user.fullName : `Seguimiento: ${item.trackingNumber}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-[11px] font-medium text-slate-400">
                            {formatRelativeTime(item.updatedAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/dashboard/requests/${item.id}`)
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                          >
                            Detalle
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

                {/* 2. Indicadores Académicos */}
            <section className="glass-panel rounded-2xl shadow-premium-sm p-5 space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Indicadores Académicos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                  Resumen de trámites finales gestionados en el portal.
                </p>
              </div>

              {academicLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-slate-200/80 dark:border-slate-800/40 bg-white dark:bg-slate-900/35 p-4">
                      <Skeleton className="h-3 w-24 mb-3" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Certificados emitidos', value: academicStats?.certificatesIssued ?? 0 },
                    { label: 'Homologaciones aprobadas', value: academicStats?.homologationsApproved ?? 0 },
                    { label: 'Solicitudes finalizadas', value: academicStats?.requestsFinalized ?? 0 },
                    { label: 'Cancelaciones', value: academicStats?.cancellations ?? 0 },
                  ].map((metric, index) => (
                    <div key={index} className="rounded-xl border border-slate-200/80 dark:border-slate-800/40 bg-white dark:bg-slate-900/35 p-4 transition-all hover:bg-slate-100/30 dark:hover:bg-slate-800/60 hover:shadow-sm">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider block truncate">
                        {metric.label}
                      </span>
                      <p className="mt-2 text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Distribución Operativa por Estado (Segmented stack bar) */}
            <section className="glass-panel rounded-2xl shadow-premium-sm p-5 space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Distribución Operativa por Estado
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                  Lectura agregada sobre la división porcentual del ciclo de vida de los trámites.
                </p>
              </div>

              {/* Single dynamic visual trackbar (Segmented Stack Bar - Modern and clean) */}
              <div className="space-y-4">
                <div className="h-5 rounded-2xl bg-slate-200/50 dark:bg-slate-800 flex overflow-hidden border border-slate-200 dark:border-slate-700/20">
                  {/* Aprobadas */}
                  {approvedPct > 0 && (
                    <div
                      className="h-full bg-emerald-500 transition-all cursor-pointer relative group"
                      style={{ width: `${approvedPct}%` }}
                      title={`Aprobadas: ${approved} (${Math.round(approvedPct)}%)`}
                    >
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </div>
                  )}
                  {/* Borrador */}
                  {draftPct > 0 && (
                    <div
                      className="h-full bg-[#e8a820] transition-all cursor-pointer relative group"
                      style={{ width: `${draftPct}%` }}
                      title={`Borradores: ${draft} (${Math.round(draftPct)}%)`}
                    >
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </div>
                  )}
                  {/* En revisión */}
                  {inReviewPct > 0 && (
                    <div
                      className="h-full bg-blue-500 transition-all cursor-pointer relative group"
                      style={{ width: `${inReviewPct}%` }}
                      title={`En revisión: ${inReview} (${Math.round(inReviewPct)}%)`}
                    >
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </div>
                  )}
                  {/* Enviadas */}
                  {submittedPct > 0 && (
                    <div
                      className="h-full bg-amber-500 transition-all cursor-pointer relative group"
                      style={{ width: `${submittedPct}%` }}
                      title={`Enviadas: ${submitted} (${Math.round(submittedPct)}%)`}
                    >
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </div>
                  )}
                  {/* Rechazadas */}
                  {rejectedPct > 0 && (
                    <div
                      className="h-full bg-red-500 transition-all cursor-pointer relative group"
                      style={{ width: `${rejectedPct}%` }}
                      title={`Rechazadas: ${rejected} (${Math.round(rejectedPct)}%)`}
                    >
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </div>
                  )}
                  {/* Canceladas */}
                  {cancelledPct > 0 && (
                    <div
                      className="h-full bg-slate-400 transition-all cursor-pointer relative group"
                      style={{ width: `${cancelledPct}%` }}
                      title={`Canceladas: ${cancelled} (${Math.round(cancelledPct)}%)`}
                    >
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </div>
                  )}
                </div>

                {/* Legend showing counts & percentages - Responsive 6 Columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-500 mt-0.75 shrink-0"></span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Aprobadas</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-300">{approved} {approved === 1 ? 'solicitud' : 'solicitudes'} ({Math.round(approvedPct)}%)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-md bg-[#e8a820] mt-0.75 shrink-0"></span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Borradores</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-300">{draft} {draft === 1 ? 'solicitud' : 'solicitudes'} ({Math.round(draftPct)}%)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-md bg-blue-500 mt-0.75 shrink-0"></span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">En revisión</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-300">{inReview} {inReview === 1 ? 'solicitud' : 'solicitudes'} ({Math.round(inReviewPct)}%)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-md bg-amber-500 mt-0.75 shrink-0"></span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Enviadas</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-300">{submitted} {submitted === 1 ? 'solicitud' : 'solicitudes'} ({Math.round(submittedPct)}%)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-md bg-red-500 mt-0.75 shrink-0"></span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Rechazadas</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-300">{rejected} {rejected === 1 ? 'solicitud' : 'solicitudes'} ({Math.round(rejectedPct)}%)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-md bg-slate-400 mt-0.75 shrink-0"></span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Canceladas</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-300">{cancelled} {cancelled === 1 ? 'solicitud' : 'solicitudes'} ({Math.round(cancelledPct)}%)</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        {/* COLUMNA DERECHA (xl:col-span-4) */}
          <div className="space-y-6 xl:col-span-4 xl:sticky xl:top-6 xl:self-start">

            {/* 1. Requieren atención */}
            <section className="glass-panel rounded-2xl shadow-premium-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Requieren Atención
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                    Trámites en cola esperando tu acción hoy.
                  </p>
                </div>
                <span className={cn(
                  "px-2 py-0.5 text-xs font-extrabold rounded-full shrink-0",
                  attentionTotal > 0 ? "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-transparent" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400 border border-slate-200 dark:border-transparent"
                )}>
                  {attentionTotal} {attentionTotal === 1 ? 'Activa' : 'Activas'}
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Item 1: En revisión */}
                <div className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all hover-elevate",
                  inReview > 0
                    ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-sm text-blue-950 dark:text-blue-100"
                    : "bg-slate-50/40 dark:bg-slate-900/15 border-slate-200 dark:border-slate-800/40 text-slate-600 dark:text-slate-450"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full shadow-sm",
                      inReview > 0 ? "bg-blue-600 shadow-blue-500/50 animate-pulse" : "bg-slate-400"
                    )}></div>
                    <div>
                      <h4 className={cn("text-xs font-bold", inReview > 0 ? "text-blue-800 dark:text-blue-250" : "text-slate-600 dark:text-slate-450")}>En revisión</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-300">Trámites siendo evaluados</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-bold", inReview > 0 ? "text-blue-700 dark:text-blue-200" : "text-slate-500 dark:text-slate-400")}>{inReview}</span>
                    {inReview > 0 && (
                      <Link to="/dashboard/requests?status=IN_REVIEW" className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Item 2: Enviadas / En cola */}
                <div className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all hover-elevate",
                  submitted > 0
                    ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 shadow-sm text-amber-950 dark:text-amber-100"
                    : "bg-slate-50/40 dark:bg-slate-900/15 border-slate-200 dark:border-slate-800/40 text-slate-600 dark:text-slate-450"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full shadow-sm",
                      submitted > 0 ? "bg-amber-500 shadow-amber-500/50 animate-pulse" : "bg-slate-400"
                    )}></div>
                    <div>
                      <h4 className={cn("text-xs font-bold", submitted > 0 ? "text-amber-800 dark:text-amber-250" : "text-slate-600 dark:text-slate-450")}>Enviada / En cola</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-300">Nuevas solicitudes por asignar</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-bold", submitted > 0 ? "text-amber-700 dark:text-amber-200" : "text-slate-500 dark:text-slate-400")}>{submitted}</span>
                    {submitted > 0 && (
                      <Link to="/dashboard/requests?status=SUBMITTED" className="p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Item 3: Borradores */}
                <div className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all hover-elevate",
                  draft > 0
                    ? "bg-slate-100/80 dark:bg-slate-800 border-slate-300 dark:border-slate-800 shadow-sm text-slate-950 dark:text-slate-100"
                    : "bg-slate-50/40 dark:bg-slate-900/15 border-slate-200 dark:border-slate-800/40 text-slate-600 dark:text-slate-450"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full shadow-sm",
                      draft > 0 ? "bg-slate-500 shadow-slate-500/30" : "bg-slate-400"
                    )}></div>
                    <div>
                      <h4 className={cn("text-xs font-bold", draft > 0 ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-450")}>Borradores</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-300">Guardadas sin enviar por el alumno</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-bold", draft > 0 ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400")}>{draft}</span>
                    {draft > 0 && (
                      <Link to="/dashboard/requests?status=DRAFT" className="p-1 text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Accesos rápidos */}
            <section className="glass-panel rounded-2xl shadow-premium-sm p-5 space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Accesos Directos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                  Rutas frecuentes para agilizar tu flujo diario.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {quickLinks.map((link) => {
                  const IconComponent = link.icon
                  let iconBg = "bg-amber-100/70 border border-amber-200 text-amber-800 dark:bg-gold-500/10 dark:border-transparent dark:text-gold-400"
                  if (link.to.includes('requests') && !link.to.includes('new')) {
                    iconBg = "bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-transparent dark:text-blue-400"
                  } else if (link.to.includes('documents')) {
                    iconBg = "bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-transparent dark:text-emerald-400"
                  } else if (link.to.includes('settings')) {
                    iconBg = "bg-purple-50 border border-purple-200 text-purple-750 dark:bg-purple-500/10 dark:border-transparent dark:text-purple-400"
                  } else if (link.to.includes('users')) {
                    iconBg = "bg-pink-50 border border-pink-200 text-pink-750 dark:bg-pink-500/10 dark:border-transparent dark:text-pink-400"
                  }

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-sm hover:border-[#e8a820] text-slate-700 dark:text-slate-400 hover:text-[#0d1b3e] dark:hover:text-white transition-all group hover-elevate"
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-0", iconBg)}>
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:translate-x-1 transition-transform">{link.label}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-300 truncate mt-0.5">
                          {link.to.includes('new') && 'Radicar nuevo trámite escolar'}
                          {link.to.includes('requests') && !link.to.includes('new') && 'Listado completo filtrable'}
                          {link.to.includes('documents') && 'Firmados y expedidos'}
                          {link.to.includes('settings') && 'Ajustes del portal'}
                          {link.to.includes('users') && 'Directorio de usuarios'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* 3. Rendimiento Operativo */}
            <section className="glass-panel rounded-2xl shadow-premium-sm p-5 space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Rendimiento Operativo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                  Métricas de eficiencia y cumplimiento de SLA.
                </p>
              </div>

              {academicLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-slate-200/80 dark:border-slate-800/40 bg-white dark:bg-slate-900/35 p-3">
                      <Skeleton className="h-2.5 w-20 mb-2" />
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-2.5 w-16 mt-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Tiempo prom. respuesta', value: `${academicStats?.averageResponseTime ?? 0} días` },
                    { label: 'Procesadas esta semana', value: academicStats?.processedThisWeek ?? 0 },
                    { label: 'Casos vencidos', value: academicStats?.overdueCases ?? 0 },
                    { label: 'SLA', value: `${academicStats?.sla ?? 0}%` },
                  ].map((metric, index) => (
                    <div key={index} className="rounded-xl border border-slate-200/80 dark:border-slate-800/40 bg-white dark:bg-slate-900/35 p-3 hover:bg-slate-100/30 dark:hover:bg-slate-800/60 transition-colors">
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider block leading-tight">
                        {metric.label}
                      </span>
                      <p className="mt-1.5 text-lg font-bold font-display text-slate-900 dark:text-white leading-none">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Alertas Académicas */}
            <section className="glass-panel rounded-2xl shadow-premium-sm p-5 space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Alertas Académicas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                  Atención prioritaria para la gestión de solicitudes.
                </p>
              </div>

              {academicLoading ? (
                <div className="space-y-2.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/40 bg-white dark:bg-slate-900/35">
                      <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[
                    ...(academicStats && academicStats.expiringSoon > 0 ? [{
                      message: `${academicStats.expiringSoon} solicitud${academicStats.expiringSoon === 1 ? '' : 'es'} próxima${academicStats.expiringSoon === 1 ? '' : 's'} a vencer`,
                      detail: 'Vencimiento en menos de 24 horas',
                      severity: 'danger' as const,
                    }] : []),
                    ...(academicStats && academicStats.pendingOver5Days > 0 ? [{
                      message: `${academicStats.pendingOver5Days} homologación${academicStats.pendingOver5Days === 1 ? '' : 'es'} pendiente${academicStats.pendingOver5Days === 1 ? '' : 's'} > 5 días`,
                      detail: 'Supera el tiempo estimado de atención',
                      severity: 'warning' as const,
                    }] : []),
                    ...(academicStats && academicStats.pendingSignature > 0 ? [{
                      message: `${academicStats.pendingSignature} certificado${academicStats.pendingSignature === 1 ? '' : 's'} requiere${academicStats.pendingSignature === 1 ? '' : 'n'} firma`,
                      detail: 'Documento oficial generado pendiente de firma',
                      severity: 'info' as const,
                    }] : []),
                    ...(academicStats && academicStats.pendingDocuments > 0 ? [{
                      message: `${academicStats.pendingDocuments} documento${academicStats.pendingDocuments === 1 ? '' : 's'} faltante${academicStats.pendingDocuments === 1 ? '' : 's'}`,
                      detail: 'Solicitudes en espera de subsanación por alumno',
                      severity: 'warning' as const,
                    }] : []),
                  ].length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Inbox className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Sin alertas activas</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">No hay solicitudes que requieran atención prioritaria</p>
                    </div>
                  ) : (
                    [
                      ...(academicStats && academicStats.expiringSoon > 0 ? [{
                        message: `${academicStats.expiringSoon} solicitud${academicStats.expiringSoon === 1 ? '' : 'es'} próxima${academicStats.expiringSoon === 1 ? '' : 's'} a vencer`,
                        detail: 'Vencimiento en menos de 24 horas',
                        severity: 'danger' as const,
                      }] : []),
                      ...(academicStats && academicStats.pendingOver5Days > 0 ? [{
                        message: `${academicStats.pendingOver5Days} homologación${academicStats.pendingOver5Days === 1 ? '' : 'es'} pendiente${academicStats.pendingOver5Days === 1 ? '' : 's'} > 5 días`,
                        detail: 'Supera el tiempo estimado de atención',
                        severity: 'warning' as const,
                      }] : []),
                      ...(academicStats && academicStats.pendingSignature > 0 ? [{
                        message: `${academicStats.pendingSignature} certificado${academicStats.pendingSignature === 1 ? '' : 's'} requiere${academicStats.pendingSignature === 1 ? '' : 'n'} firma`,
                        detail: 'Documento oficial generado pendiente de firma',
                        severity: 'info' as const,
                      }] : []),
                      ...(academicStats && academicStats.pendingDocuments > 0 ? [{
                        message: `${academicStats.pendingDocuments} documento${academicStats.pendingDocuments === 1 ? '' : 's'} faltante${academicStats.pendingDocuments === 1 ? '' : 's'}`,
                        detail: 'Solicitudes en espera de subsanación por alumno',
                        severity: 'warning' as const,
                      }] : []),
                    ].map((alert, index) => (
                      <div key={index} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/40 bg-white dark:bg-slate-900/35 hover:bg-slate-100/30 dark:hover:bg-slate-800/60 transition-colors">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm border",
                          alert.severity === 'danger' && "bg-red-50 text-red-700 border-red-200 dark:bg-danger-soft dark:text-danger dark:border-danger/20",
                          alert.severity === 'warning' && "bg-amber-50 text-[#b45309] border-amber-200 dark:bg-warning-soft dark:text-warning dark:border-warning/20",
                          alert.severity === 'info' && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-info-soft dark:text-info dark:border-info/20",
                        )}>
                          {alert.severity === 'danger' && <AlertCircle className="w-3.5 h-3.5" />}
                          {alert.severity === 'warning' && <Clock3 className="w-3.5 h-3.5" />}
                          {alert.severity === 'info' && <AlertTriangle className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-tight truncate">{alert.message}</h4>
                          <p className="text-[9px] text-slate-500 dark:text-slate-300 truncate mt-0.5">{alert.detail}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>

        </div>
        </>
      )}
    </div>
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
