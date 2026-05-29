import { useAuth } from '@/app/providers/auth-provider'
import type { RequestStatus, RoleName } from '@/shared/types'

const REVIEWER_ROLES: RoleName[] = ['STAFF', 'COORDINATOR', 'ADMIN']

export function usePermissions() {
  const { user } = useAuth()
  const role = user?.role

  const isReviewer = role ? REVIEWER_ROLES.includes(role) : false

  return {
    role,
    isReviewer,
    isStudent: role === 'STUDENT',
    isStaff: role === 'STAFF',
    isCoordinator: role === 'COORDINATOR',
    isAdmin: role === 'ADMIN',

    canReview: () => isReviewer,

    canApprove: () => role === 'COORDINATOR' || role === 'ADMIN',

    canReject: () => isReviewer,

    canRequestDocuments: () => isReviewer,

    canChangeStatus: (status: RequestStatus) => {
      if (!role || !isReviewer) return false
      if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) return false

      if (role === 'STAFF') {
        return ['IN_REVIEW', 'PENDING_DOCUMENTS'].includes(status)
      }
      if (role === 'COORDINATOR') {
        return ['APPROVED', 'REJECTED'].includes(status)
      }
      if (role === 'ADMIN') {
        return true
      }
      return false
    },

    getAvailableActions: (currentStatus: RequestStatus): RequestStatus[] => {
      if (!role || !isReviewer) return []
      if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(currentStatus)) return []

      if (role === 'STAFF') {
        if (currentStatus === 'SUBMITTED') return ['IN_REVIEW', 'PENDING_DOCUMENTS']
        if (currentStatus === 'PENDING_DOCUMENTS') return ['IN_REVIEW']
        return []
      }
      if (role === 'COORDINATOR') {
        if (currentStatus === 'IN_REVIEW') return ['APPROVED', 'REJECTED', 'PENDING_DOCUMENTS']
        return []
      }
      if (role === 'ADMIN') {
        if (currentStatus === 'SUBMITTED') return ['IN_REVIEW', 'PENDING_DOCUMENTS']
        if (currentStatus === 'IN_REVIEW') return ['APPROVED', 'REJECTED', 'PENDING_DOCUMENTS']
        if (currentStatus === 'PENDING_DOCUMENTS') return ['IN_REVIEW']
        return []
      }
      return []
    },
  }
}
