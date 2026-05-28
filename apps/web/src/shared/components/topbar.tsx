import { useLocation } from 'react-router-dom'
import { Menu, Bell, ChevronRight } from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'

interface TopbarProps {
  onMenuClick: () => void
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/requests': 'Solicitudes',
  '/dashboard/documents': 'Documentos',
  '/dashboard/settings': 'ConfiguraciÃ³n',
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const { user } = useAuth()
  const currentPath = location.pathname
  const label = routeLabels[currentPath] || 'Dashboard'

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">Portal</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          <span className="font-medium text-foreground">{label}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>

        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-accent">
          {initials}
        </div>
      </div>
    </header>
  )
}
