import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRequestDocuments,
  uploadDocument,
  deleteDocument,
} from '@/features/requests/api/documents-api'
import { notify, NOTIFY } from '@/shared/lib/notify'

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
      notify.success(NOTIFY.document.uploaded, variables.file?.name)
    },
    onError: (err) => {
      notify.error(NOTIFY.document.uploadedError, err)
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      requestId,
      name,
    }: {
      id: string
      requestId: string
      name?: string
    }) => deleteDocument(id, requestId).then(() => ({ id, requestId, name })),
    onSuccess: (data) => {
      if (data.requestId) {
        queryClient.invalidateQueries({ queryKey: documentsKeys.byRequest(data.requestId) })
      }
      notify.success(NOTIFY.document.deleted, data.name)
    },
    onError: (err) => {
      notify.error(NOTIFY.document.deletedError, err)
    },
  })
}
