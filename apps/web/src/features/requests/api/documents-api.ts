import { api } from '@/shared/api'
import type { Attachment } from '@/shared/types'

export interface UploadDocumentInput {
  file: File
  requestId: string
}

export async function fetchRequestDocuments(requestId: string): Promise<Attachment[]> {
  const { data } = await api.get<Attachment[]>(`/api/documents/request/${requestId}`)
  return data
}

export async function uploadDocument(input: UploadDocumentInput): Promise<Attachment> {
  const formData = new FormData()
  formData.append('file', input.file)
  formData.append('requestId', input.requestId)

  const { data } = await api.post<Attachment>('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function downloadDocument(id: string, fileName: string): Promise<void> {
  const response = await api.get(`/api/documents/${id}/download`, {
    responseType: 'blob',
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function deleteDocument(id: string, requestId?: string): Promise<{ id: string; requestId?: string }> {
  const { data } = await api.delete<{ id: string }>(`/api/documents/${id}`)
  return { ...data, requestId }
}
