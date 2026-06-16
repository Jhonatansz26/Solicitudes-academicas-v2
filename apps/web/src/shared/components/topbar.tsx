import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, PanelLeftClose, PanelLeftOpen, User, LogOut, Bell, Sun } from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { ThemeToggle } from '@/shared/components/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface TopbarProps {
  onMenuClick: () => void
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/requests': 'Solicitudes',
  '/dashboard/admin/users': 'Usuarios',
  '/dashboard/admin/request-types': 'Tipos de Solicitud',
  '/dashboard/documents': 'Documentos',
  '/dashboard/notifications': 'Notificaciones',
  '/dashboard/settings': 'Configuración',
  '/dashboard/profile': 'Perfil',
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

export function Topbar({ onMenuClick, onToggleSidebar, sidebarCollapsed = false }: TopbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const currentPath = location.pathname

  const initials = user?.fullName ? getInitials(user.fullName) : 'U'
  const gradient = user?.fullName ? getUserGradient(user.fullName) : 'from-navy-700 to-blue-500'

  const getPageLabel = (): string => {
    if (currentPath === '/dashboard') return 'Dashboard'
    if (currentPath.startsWith('/dashboard/requests/') && currentPath !== '/dashboard/requests') {
      return 'Detalle de solicitud'
    }
    return routeLabels[currentPath] || 'Dashboard'
  }

  return (
    <header
      className="w-full flex items-center justify-between bg-surface border border-border rounded-2xl px-3 sm:px-4 py-2.5 shrink-0"
      role="banner"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Burger mobile */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Toggle sidebar desktop */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden lg:inline-flex p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
            aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Page label (breadcrumb mejorado en PageHeader) */}
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <Link
            to="/dashboard"
            className="text-eyebrow font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Portal Académico
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-sm font-semibold text-foreground truncate">
            {getPageLabel()}
          </span>
        </div>

        {/* Mobile: solo label */}
        <span className="sm:hidden text-sm font-semibold text-foreground truncate">
          {getPageLabel()}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Notificaciones (placeholder, funcional in-box en fase futura) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
          aria-label="Notificaciones"
          onClick={() => navigate('/dashboard/notifications')}
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
              aria-label="Menú de usuario"
            >
              <div className="hidden text-right md:block min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight truncate max-w-[160px]">
                  {user?.fullName}
                </p>
                <p className="text-eyebrow text-muted-foreground leading-tight truncate max-w-[160px]">
                  {user?.email}
                </p>
              </div>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white bg-gradient-to-br transition-all hover:ring-2 hover:ring-primary/30',
                  gradient,
                )}
              >
                {initials}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">{user?.fullName}</p>
              <p className="text-eyebrow text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-1.5 text-eyebrow font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/25">
                {user?.role}
              </span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <Sun className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-danger focus:text-danger"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
