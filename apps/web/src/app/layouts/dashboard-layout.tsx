import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/shared/components/sidebar'
import { Topbar } from '@/shared/components/topbar'
import { useState } from 'react'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background p-3 md:p-4 lg:p-6 gap-6 relative overflow-x-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col gap-6 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 w-full min-w-0">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
