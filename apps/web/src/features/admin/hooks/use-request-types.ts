import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAllRequestTypes,
  createRequestType,
  updateRequestType,
  deleteRequestType,
  fetchRequestTypeStats,
} from '@/features/admin/api/request-types-api'

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestTypesKeys.admin() })
      queryClient.invalidateQueries({ queryKey: ['requests', 'types'] })
    },
  })
}

export function useUpdateRequestType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateRequestType>[1] }) =>
      updateRequestType(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestTypesKeys.admin() })
      queryClient.invalidateQueries({ queryKey: ['requests', 'types'] })
    },
  })
}

export function useDeleteRequestType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRequestType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestTypesKeys.admin() })
      queryClient.invalidateQueries({ queryKey: ['requests', 'types'] })
    },
  })
}
