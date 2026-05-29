import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRequests,
  fetchRequest,
  fetchRequestTypes,
  createRequest,
  submitRequest,
  cancelRequest,
  changeRequestStatus,
  type RequestsQuery,
  type ChangeStatusInput,
} from '@/features/requests/api/requests-api'

export const requestsKeys = {
  all: ['requests'] as const,
  lists: () => [...requestsKeys.all, 'list'] as const,
  list: (filters: RequestsQuery) => [...requestsKeys.lists(), filters] as const,
  types: () => [...requestsKeys.all, 'types'] as const,
  details: () => [...requestsKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestsKeys.details(), id] as const,
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
      return newRequest
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
    },
  })
}

export function useChangeRequestStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ChangeStatusInput }) =>
      changeRequestStatus(id, input),
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(request.id) })
    },
  })
}
