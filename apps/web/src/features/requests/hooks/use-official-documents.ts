import { useQuery } from '@tanstack/react-query'
import {
  fetchOfficialDocuments,
  fetchLatestOfficialDocument,
  fetchAllOfficialDocuments,
  downloadOfficialDocument,
  downloadOfficialDocumentById,
  type GlobalDocumentsQuery,
} from '@/features/requests/api/official-documents-api'

export const officialDocumentsKeys = {
  all: ['official-documents'] as const,
  global: () => [...officialDocumentsKeys.all, 'global'] as const,
  globalList: (filters: GlobalDocumentsQuery) => [...officialDocumentsKeys.global(), 'list', filters] as const,
  lists: () => [...officialDocumentsKeys.all, 'list'] as const,
  list: (requestId: string) => [...officialDocumentsKeys.lists(), requestId] as const,
  latest: (requestId: string) => [...officialDocumentsKeys.all, 'latest', requestId] as const,
}

export function useAllOfficialDocuments(query: GlobalDocumentsQuery = {}) {
  return useQuery({
    queryKey: officialDocumentsKeys.globalList(query),
    queryFn: () => fetchAllOfficialDocuments(query),
  })
}

export function useOfficialDocuments(requestId: string) {
  return useQuery({
    queryKey: officialDocumentsKeys.list(requestId),
    queryFn: () => fetchOfficialDocuments(requestId),
    enabled: !!requestId,
  })
}

export function useLatestOfficialDocument(requestId: string) {
  return useQuery({
    queryKey: officialDocumentsKeys.latest(requestId),
    queryFn: () => fetchLatestOfficialDocument(requestId),
    enabled: !!requestId,
  })
}

export function useDownloadOfficialDocument() {
  return {
    download: async (requestId: string, documentId: string, fileName: string) => {
      await downloadOfficialDocument(requestId, documentId, fileName)
    },
  }
}

export function useDownloadOfficialDocumentById() {
  return {
    download: async (documentId: string, fileName: string) => {
      await downloadOfficialDocumentById(documentId, fileName)
    },
  }
}
