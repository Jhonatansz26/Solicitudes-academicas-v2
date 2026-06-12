import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, ChevronRight, User, LogOut } from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { ThemeToggle } from '@/shared/components/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

interface TopbarProps {
  onMenuClick: () => void
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/requests': 'Solicitudes',
  '/dashboard/admin/users': 'Usuarios',
  '/dashboard/admin/request-types': 'Tipos de Solicitud',
  '/dashboard/documents': 'Documentos',
  '/dashboard/settings': 'Configuración',
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

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const currentPath = location.pathname

  const initials = user?.fullName ? getInitials(user.fullName) : 'U'
  const gradient = user?.fullName ? getUserGradient(user.fullName) : 'from-navy-700 to-blue-500'

  const getBreadcrumb = () => {
    if (currentPath === '/dashboard') {
      return <><span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Portal Académico</span><ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" /><span className="font-display font-semibold text-[#0d1b3e] dark:text-white text-sm">Dashboard</span></>
    }

    if (currentPath.startsWith('/dashboard/requests/')) {
      const requestId = currentPath.split('/dashboard/requests/')[1]
      return <><Link to="/dashboard/requests" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-foreground transition-colors">Solicitudes</Link><ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" /><span className="font-display font-semibold text-[#0d1b3e] dark:text-white text-sm max-w-[200px] truncate" title={requestId}>{requestId}</span></>
    }

    const label = routeLabels[currentPath] || 'Dashboard'
    return <><Link to="/dashboard" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-foreground transition-colors">Portal Académico</Link><ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" /><span className="font-display font-semibold text-[#0d1b3e] dark:text-white text-sm">{label}</span></>
  }

  return (
    <header className="w-full flex items-center justify-between glass-panel rounded-2xl p-4 shadow-premium-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden sm:flex items-center gap-2 text-xs font-medium">
          {getBreadcrumb()}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-[#0d1b3e] dark:text-white leading-tight">{user?.fullName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{user?.email}</p>
              </div>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white bg-gradient-to-br transition-all hover:ring-2 hover:ring-primary/30',
                  gradient
                )}
              >
                {initials}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/25">
                {user?.role}
              </span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
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
