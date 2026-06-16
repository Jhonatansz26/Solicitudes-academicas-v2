import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRequests,
  fetchRequest,
  fetchRequestTypes,
  fetchDashboardStats,
  fetchAcademicStats,
  createRequest,
  submitRequest,
  cancelRequest,
  changeRequestStatus,
  type RequestsQuery,
  type ChangeStatusInput,
  type AcademicStats,
} from '@/features/requests/api/requests-api'
import { notify, NOTIFY } from '@/shared/lib/notify'

export const requestsKeys = {
  all: ['requests'] as const,
  lists: () => [...requestsKeys.all, 'list'] as const,
  list: (filters: RequestsQuery) => [...requestsKeys.lists(), filters] as const,
  types: () => [...requestsKeys.all, 'types'] as const,
  details: () => [...requestsKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestsKeys.details(), id] as const,
  academicStats: () => [...requestsKeys.all, 'academic-stats'] as const,
}

export function useRequests(query: RequestsQuery) {
  return useQuery({
    queryKey: requestsKeys.list(query),
    queryFn: () => fetchRequests(query),
  })
}

export function useRequestTypes() {
  return useQuery({
    queryKey: requestsKeys.types(),
    queryFn: fetchRequestTypes,
    staleTime: 10 * 60 * 1000,
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAcademicStats() {
  return useQuery<AcademicStats>({
    queryKey: requestsKeys.academicStats(),
    queryFn: fetchAcademicStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: requestsKeys.detail(id),
    queryFn: () => fetchRequest(id),
    enabled: !!id,
  })
}

export function useCreateRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRequest,
    onSuccess: (newRequest) => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      notify.success(NOTIFY.request.created, `Folio ${newRequest.trackingNumber}`)
      return newRequest
    },
    onError: (err) => {
      notify.error(NOTIFY.request.createdError, err)
    },
  })
}

export function useSubmitRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitRequest,
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(request.id) })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      notify.success(NOTIFY.request.submitted, `Folio ${request.trackingNumber}`)
    },
    onError: (err) => {
      notify.error(NOTIFY.request.submittedError, err)
    },
  })
}

export function useCancelRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelRequest,
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(request.id) })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      notify.success(NOTIFY.request.cancelled, `Folio ${request.trackingNumber}`)
    },
    onError: (err) => {
      notify.error(NOTIFY.request.cancelledError, err)
    },
  })
}

export function useChangeRequestStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ChangeStatusInput }) =>
      changeRequestStatus(id, input),
    onSuccess: (request, variables) => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(request.id) })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      // Mensaje según el nuevo estado
      const newStatus = variables?.input?.newStatus
      switch (newStatus) {
        case 'APPROVED':
          notify.success(NOTIFY.request.approved)
          break
        case 'REJECTED':
          notify.info(NOTIFY.request.rejected)
          break
        case 'PENDING_DOCUMENTS':
          notify.info(NOTIFY.request.docsRequested)
          break
        case 'IN_REVIEW':
          notify.info(NOTIFY.request.reviewStarted)
          break
        default:
          notify.success('Estado actualizado')
      }
    },
    onError: (err, variables) => {
      const status = variables?.input?.newStatus
      const map: Record<string, { success: string; error: string }> = {
        APPROVED: { success: NOTIFY.request.approved, error: NOTIFY.request.approvedError },
        REJECTED: { success: NOTIFY.request.rejected, error: NOTIFY.request.rejectedError },
        PENDING_DOCUMENTS: {
          success: NOTIFY.request.docsRequested,
          error: NOTIFY.request.docsRequestedError,
        },
        IN_REVIEW: { success: NOTIFY.request.reviewStarted, error: NOTIFY.request.reviewStartedError },
      }
      const messages = map[status as string] ?? {
        success: 'Estado actualizado',
        error: NOTIFY.generic.updateError,
      }
      notify.error(messages.error, err)
    },
  })
}
