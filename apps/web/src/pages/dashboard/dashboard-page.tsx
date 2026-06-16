import { usePermissions } from '@/shared/hooks/use-permissions'
import { StudentDashboard } from '@/features/dashboard/student-dashboard'
import { StaffDashboard } from '@/features/dashboard/staff-dashboard'
import { CoordinatorDashboard } from '@/features/dashboard/coordinator-dashboard'
import { AdminDashboard } from '@/features/dashboard/admin-dashboard'

/**
 * DashboardPage — Router de dashboards especializados por rol.
 * Cada rol tiene una experiencia dedicada, no contenido condicional.
 */
export function DashboardPage() {
  const { isAdmin, isCoordinator, isStaff } = usePermissions()

  if (isAdmin) {
    return <AdminDashboard />
  }

  if (isCoordinator) {
    return <CoordinatorDashboard />
  }

  if (isStaff) {
    return <StaffDashboard />
  }

  // STUDENT (default)
  return <StudentDashboard />
}
