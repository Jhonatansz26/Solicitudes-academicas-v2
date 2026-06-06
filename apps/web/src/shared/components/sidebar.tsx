import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  X,
  Users,
  Tag,
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { useDashboardStats } from '@/features/requests/hooks/use-requests'

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getUserGradient(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const gradients = [
    'from-indigo-500 to-purple-500',
    'from-cyan-500 to-teal-500',
    'from-emerald-500 to-green-500',
    'from-amber-500 to-yellow-500',
    'from-red-500 to-rose-500',
    'from-navy-700 to-blue-500',
    'from-violet-500 to-purple-500',
    'from-gold-500 to-amber-500',
  ]
  return gradients[hash % gradients.length]
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout, user } = useAuth()
  const { isReviewer, isAdmin } = usePermissions()
  const { data: stats } = useDashboardStats()

  const initials = user?.fullName ? getInitials(user.fullName) : 'U'
  const gradient = user?.fullName ? getUserGradient(user.fullName) : 'from-navy-700 to-blue-500'

  const pendingCount = isReviewer ? (stats?.submitted ?? 0) + (stats?.inReview ?? 0) : 0

  const dashboardItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/requests', label: 'Solicitudes', icon: FileText },
  ]

  const managementItems = isAdmin
    ? [
        { to: '/dashboard/admin/users', label: 'Usuarios', icon: Users },
        { to: '/dashboard/admin/request-types', label: 'Tipos de solicitud', icon: Tag },
      ]
    : []

  const systemItems = [
    { to: '/dashboard/documents', label: 'Documentos', icon: FolderOpen },
    { to: '/dashboard/settings', label: 'Configuración', icon: Settings },
  ]

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          'bg-sidebar border-r border-sidebar-border',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <img
            src="/logo-cul.png"
            alt="CUL"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground leading-tight font-display">
              SOLICITUDES
            </span>
            <span className="text-[10px] font-medium text-sidebar-muted-foreground leading-tight">
              Portal Académico
            </span>
          </div>

          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1 text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Card - Compacto */}
        {user && (
          <div className="mx-3 mt-3 mb-2 rounded-lg bg-white/5 border border-sidebar-border px-3 py-2">
            <div className="flex items-center gap-2.5">
              <div className={cn('h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br', gradient)}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">
                  {user.fullName}
                </p>
                <span className="inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-400 mt-0.5">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {/* Dashboard Section */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-muted-foreground px-4 pt-3 pb-1">
            Dashboard
          </p>
          {dashboardItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground border-l-2 border-gold-500 ml-[-2px]'
                    : 'text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-gold-400' : 'text-sidebar-muted'
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Solicitudes' && pendingCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Gestión Section */}
          {managementItems.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-muted-foreground px-4 pt-4 pb-1">
                Gestión
              </p>
              {managementItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-foreground border-l-2 border-gold-500 ml-[-2px]'
                        : 'text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-gold-400' : 'text-sidebar-muted'
                        )}
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </>
          )}

          {/* Sistema Section */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-muted-foreground px-4 pt-4 pb-1">
            Sistema
          </p>
          {systemItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground border-l-2 border-gold-500 ml-[-2px]'
                    : 'text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-gold-400' : 'text-sidebar-muted'
                    )}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-sidebar-border p-3">
          <button
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted transition-colors hover:bg-red-500/10 hover:text-red-300"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  )
}
