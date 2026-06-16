import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAllRequestTypes,
  createRequestType,
  updateRequestType,
  deleteRequestType,
  fetchRequestTypeStats,
} from '@/features/admin/api/request-types-api'
import { notify, NOTIFY } from '@/shared/lib/notify'

export const requestTypesKeys = {
  all: ['request-types'] as const,
  admin: () => [...requestTypesKeys.all, 'admin'] as const,
  stats: (id: string) => [...requestTypesKeys.all, 'stats', id] as const,
}

export function useAllRequestTypes() {
  return useQuery({
    queryKey: requestTypesKeys.admin(),
    queryFn: fetchAllRequestTypes,
  })
}

export function useRequestTypeStats(typeId: string) {
  return useQuery({
    queryKey: requestTypesKeys.stats(typeId),
    queryFn: () => fetchRequestTypeStats(typeId),
    enabled: !!typeId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateRequestType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRequestType,
    onSuccess: (type) => {
      queryClient.invalidateQueries({ queryKey: requestTypesKeys.admin() })
      queryClient.invalidateQueries({ queryKey: ['requests', 'types'] })
      notify.success(NOTIFY.requestType.created, type.name)
    },
    onError: (err) => notify.error(NOTIFY.requestType.createdError, err),
  })
}

export function useUpdateRequestType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateRequestType>[1] }) =>
      updateRequestType(id, input),
    onSuccess: (type) => {
      queryClient.invalidateQueries({ queryKey: requestTypesKeys.admin() })
      queryClient.invalidateQueries({ queryKey: ['requests', 'types'] })
      notify.success(NOTIFY.requestType.updated, type.name)
    },
    onError: (err) => notify.error(NOTIFY.requestType.updatedError, err),
  })
}

export function useDeleteRequestType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRequestType,
    onSuccess: (type) => {
      queryClient.invalidateQueries({ queryKey: requestTypesKeys.admin() })
      queryClient.invalidateQueries({ queryKey: ['requests', 'types'] })
      notify.info(NOTIFY.requestType.deactivated, type.name)
    },
    onError: (err) => notify.error(NOTIFY.requestType.deactivatedError, err),
  })
}
