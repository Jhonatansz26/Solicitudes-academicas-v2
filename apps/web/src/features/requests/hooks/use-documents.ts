import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRequestDocuments,
  uploadDocument,
  deleteDocument,
} from '@/features/requests/api/documents-api'

export const documentsKeys = {
  all: ['documents'] as const,
  byRequest: (requestId: string) => [...documentsKeys.all, 'request', requestId] as const,
}

export function useRequestDocuments(requestId: string) {
  return useQuery({
    queryKey: documentsKeys.byRequest(requestId),
    queryFn: () => fetchRequestDocuments(requestId),
    enabled: !!requestId,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.byRequest(variables.requestId) })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, requestId }: { id: string; requestId: string }) => deleteDocument(id, requestId),
    onSuccess: (data) => {
      if (data.requestId) {
        queryClient.invalidateQueries({ queryKey: documentsKeys.byRequest(data.requestId) })
      }
    },
  })
}
