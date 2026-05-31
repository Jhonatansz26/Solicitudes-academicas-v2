import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  GraduationCap,
  LogOut,
  X,
  Users,
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout, user } = useAuth()

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/requests', label: 'Solicitudes', icon: FileText },
    ...(user?.role === 'ADMIN'
      ? [{ to: '/dashboard/admin/users', label: 'Usuarios', icon: Users }]
      : []),
    { to: '/dashboard/documents', label: 'Documentos', icon: FolderOpen },
    { to: '/dashboard/settings', label: 'Configuración', icon: Settings },
  ]

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-surface border-r border-border transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-primary leading-tight">
                SOLICITUDES
              </span>
              <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                Portal Académico
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/5 text-primary'
                    : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto h-4 w-0.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3 space-y-1">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
