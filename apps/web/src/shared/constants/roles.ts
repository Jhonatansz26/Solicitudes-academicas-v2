import type { RoleName } from '@/shared/types'

export const ROLES: Record<RoleName, { label: string; description: string }> = {
  STUDENT: {
    label: 'Estudiante',
    description: 'Puede crear y gestionar sus propias solicitudes',
  },
  STAFF: {
    label: 'Funcionario',
    description: 'Puede revisar y gestionar solicitudes de estudiantes',
  },
  COORDINATOR: {
    label: 'Coordinador',
    description: 'Puede aprobar o rechazar solicitudes',
  },
  ADMIN: {
    label: 'Administrador',
    description: 'Acceso completo al sistema',
  },
}

export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  STUDENT: ['create_request', 'view_own_requests', 'upload_documents'],
  STAFF: ['view_all_requests', 'review_requests', 'upload_documents'],
  COORDINATOR: ['view_all_requests', 'approve_requests', 'reject_requests'],
  ADMIN: ['view_all_requests', 'manage_users', 'manage_types', 'manage_requests'],
}
