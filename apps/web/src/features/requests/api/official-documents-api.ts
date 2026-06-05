import { api } from '@/shared/api'
import type { OfficialDocument, OfficialDocumentsResponse } from '@/shared/types'

export interface GlobalDocumentsQuery {
  page?: number
  limit?: number
  type?: string
  search?: string
}

export async function fetchAllOfficialDocuments(
  query: GlobalDocumentsQuery = {}
): Promise<OfficialDocumentsResponse> {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.type) params.set('type', query.type)
  if (query.search) params.set('search', query.search)

  const { data } = await api.get<OfficialDocumentsResponse>(
    `/api/official-documents?${params}`
  )
  return data
}

export async function fetchOfficialDocuments(
  requestId: string
): Promise<OfficialDocumentsResponse> {
  const { data } = await api.get<OfficialDocumentsResponse>(
    `/api/requests/${requestId}/official-documents`
  )
  return data
}

export async function fetchLatestOfficialDocument(
  requestId: string
): Promise<OfficialDocument> {
  const { data } = await api.get<OfficialDocument>(
    `/api/requests/${requestId}/official-documents/latest`
  )
  return data
}

export async function downloadOfficialDocument(
  requestId: string,
  documentId: string,
  fileName: string
): Promise<void> {
  const response = await api.get(
    `/api/requests/${requestId}/official-documents/${documentId}/download`,
    {
      responseType: 'blob',
    }
  )

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function downloadOfficialDocumentById(
  documentId: string,
  fileName: string
): Promise<void> {
  const response = await api.get(
    `/api/official-documents/${documentId}/download`,
    {
      responseType: 'blob',
    }
  )

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
