import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/shared/components/sidebar'
import { Topbar } from '@/shared/components/topbar'
import { useSidebarCollapsed } from '@/shared/hooks/use-sidebar-collapsed'
import { cn } from '@/shared/lib/utils'

/**
 * DashboardLayout — Layout maestro de la aplicación autenticada.
 *
 * Estructura:
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │ Sidebar (240px expandida / 64px colapsada / drawer en mobile) │
 *  ├─────────────────────────────────────────────────────────────────┤
 *  │ Topbar                                                          │
 *  ├─────────────────────────────────────────────────────────────────┤
 *  │ Content area (max-width 1440px, padding consistente)          │
 *  │  └─ <Outlet /> (cada página renderiza su PageHeader + body)   │
 *  └─────────────────────────────────────────────────────────────────┘
 *
 * Mobile-first: padding reducido en pantallas pequeñas, gutter consistente.
 */
export function DashboardLayout() {
  const { collapsed, toggle, mobileOpen, openMobile, closeMobile } = useSidebarCollapsed()

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div
      className={cn(
        'flex min-h-screen bg-background',
        'p-1.5 sm:p-2 lg:p-4',
        'gap-1.5 sm:gap-2 lg:gap-4',
        'relative overflow-x-hidden',
      )}
    >
      <a
        href="#main-content"
        className="skip-link"
      >
        Saltar al contenido principal
      </a>
      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        open={mobileOpen}
        onClose={closeMobile}
      />

      <div className="flex flex-1 flex-col gap-1.5 sm:gap-2 lg:gap-4 min-w-0">
        <Topbar
          onMenuClick={openMobile}
          onToggleSidebar={toggle}
          sidebarCollapsed={collapsed}
        />

        <main
          id="main-content"
          aria-label="Contenido principal"
          className="flex-1 w-full min-w-0"
          tabIndex={-1}
        >
          <div className="w-full mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
