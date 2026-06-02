import { useLocation, useNavigate } from 'react-router-dom'
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
  const label = routeLabels[currentPath] || 'Dashboard'

  const initials = user?.fullName ? getInitials(user.fullName) : 'U'
  const gradient = user?.fullName ? getUserGradient(user.fullName) : 'from-navy-700 to-blue-500'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/95 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Portal</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          <span className="font-display font-bold text-primary text-base">
            {label}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'ml-1 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white bg-gradient-to-br transition-all hover:ring-2 hover:ring-primary/30',
                gradient
              )}
            >
              {initials}
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
