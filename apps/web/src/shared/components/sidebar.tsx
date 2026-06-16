import { useEffect, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  X,
  Users,
  Tag,
  ChevronsLeft,
  ChevronsRight,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useAuth } from '@/app/providers/auth-provider'
import { usePermissions } from '@/shared/hooks/use-permissions'
import { useDashboardStats } from '@/features/requests/hooks/use-requests'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
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

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: number
}

function SidebarSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-2">
      <p className="text-eyebrow font-bold uppercase tracking-widest text-sidebar-muted-foreground px-4 pt-3 pb-1.5">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function NavItemLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200',
          collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 h-10',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-muted hover:bg-sidebar-border/40 hover:text-sidebar-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn(
              'h-[18px] w-[18px] shrink-0',
              isActive ? 'text-gold-400' : 'text-sidebar-muted group-hover:text-sidebar-foreground',
            )}
            aria-hidden="true"
          />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-eyebrow font-bold text-white">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ collapsed = false, onToggle, open = false, onClose }: SidebarProps) {
  const { logout, user } = useAuth()
  const { isReviewer, isAdmin } = usePermissions()
  const { data: stats } = useDashboardStats()

  const initials = user?.fullName ? getInitials(user.fullName) : 'U'
  const gradient = user?.fullName ? getUserGradient(user.fullName) : 'from-navy-700 to-blue-500'

  const pendingCount = isReviewer ? (stats?.submitted ?? 0) + (stats?.inReview ?? 0) : 0

  const dashboardItems: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/requests', label: 'Solicitudes', icon: FileText, badge: pendingCount },
  ]

  const managementItems: NavItem[] = isAdmin
    ? [
        { to: '/dashboard/admin/users', label: 'Usuarios', icon: Users },
        { to: '/dashboard/admin/request-types', label: 'Tipos de solicitud', icon: Tag },
      ]
    : []

  const systemItems: NavItem[] = [
    { to: '/dashboard/documents', label: 'Documentos', icon: FolderOpen },
    { to: '/dashboard/notifications', label: 'Notificaciones', icon: Bell },
    { to: '/dashboard/settings', label: 'Configuración', icon: Settings },
  ]

  // ESC cierra el drawer mobile
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  const sidebarContent = (
    <aside
      className={cn(
        'flex h-full flex-col bg-sidebar border-r border-sidebar-border',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-16' : 'w-60',
      )}
      aria-label="Navegación principal"
    >
      {/* Brand */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-sidebar-border shrink-0',
          collapsed ? 'justify-center px-2' : 'gap-3 px-5',
        )}
      >
        <img
          src="/logo-cul.png"
          alt="CUL"
          className="h-9 w-9 rounded-lg object-cover shrink-0"
        />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-sidebar-foreground leading-tight font-display truncate">
              SOLICITUDES
            </span>
            <span className="text-eyebrow font-medium text-sidebar-muted-foreground leading-tight truncate">
              Portal Académico
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <SidebarSection label="Principal">
          {dashboardItems.map((item) => (
            <NavItemLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavigate={onClose}
            />
          ))}
        </SidebarSection>

        {managementItems.length > 0 && (
          <SidebarSection label="Gestión">
            {managementItems.map((item) => (
              <NavItemLink
                key={item.to}
                item={item}
                collapsed={collapsed}
                onNavigate={onClose}
              />
            ))}
          </SidebarSection>
        )}

        <SidebarSection label="Sistema">
          {systemItems.map((item) => (
            <NavItemLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavigate={onClose}
            />
          ))}
        </SidebarSection>
      </nav>

      {/* Footer: collapse toggle (desktop) + user */}
      <div className="border-t border-sidebar-border shrink-0">
        {/* Toggle collapse — solo desktop (lg+) */}
        {onToggle && (
          <div className="hidden lg:flex items-center justify-end px-2 py-2 border-b border-sidebar-border">
            <button
              type="button"
              onClick={onToggle}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sidebar-muted hover:bg-sidebar-border hover:text-sidebar-foreground transition-colors"
              title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
              aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
        )}

        {user && (
          <div className={cn('flex items-center gap-3', collapsed ? 'justify-center p-2' : 'px-3 py-3')}>
            <div className="relative shrink-0">
              <div
                className={cn(
                  'rounded-xl flex items-center justify-center text-white font-bold font-display text-xs bg-gradient-to-br',
                  collapsed ? 'h-9 w-9' : 'h-10 w-10',
                  gradient,
                )}
              >
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-sidebar rounded-full" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-sidebar-foreground truncate">
                  {user.fullName}
                </h4>
                <p className="text-eyebrow text-sidebar-muted-foreground truncate">
                  {user.role === 'ADMIN'
                    ? 'Administrador'
                    : user.role === 'STUDENT'
                      ? 'Estudiante'
                      : user.role}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={() => logout()}
                className="p-1.5 text-sidebar-muted hover:bg-sidebar-border hover:text-sidebar-foreground transition-colors rounded-md shrink-0"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: sidebar fija en flow */}
      <div
        className={cn(
          'hidden lg:flex shrink-0',
          collapsed ? 'w-16' : 'w-60',
          'transition-[width] duration-200 ease-out',
        )}
      >
        {sidebarContent}
      </div>

      {/* Mobile: drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-md text-sidebar-muted hover:bg-sidebar-border hover:text-sidebar-foreground"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  )
}

// Re-export para que el toggle del Topbar pueda usar el mismo icono
export { ChevronsLeft, ChevronsRight }
