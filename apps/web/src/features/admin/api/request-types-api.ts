import { api } from '@/shared/api'
import type { RequestType } from '@/shared/types'

export async function fetchAllRequestTypes(): Promise<RequestType[]> {
  const { data } = await api.get<RequestType[]>('/api/requests/types/all')
  return data
}

export interface CreateRequestTypeInput {
  name: string
  description?: string
  estimatedDays: number
}

export interface UpdateRequestTypeInput {
  name?: string
  description?: string
  estimatedDays?: number
}

export async function createRequestType(input: CreateRequestTypeInput): Promise<RequestType> {
  const { data } = await api.post<RequestType>('/api/requests/types', input)
  return data
}

export async function updateRequestType(id: string, input: UpdateRequestTypeInput): Promise<RequestType> {
  const { data } = await api.patch<RequestType>(`/api/requests/types/${id}`, input)
  return data
}

export async function deleteRequestType(id: string): Promise<RequestType> {
  const { data } = await api.delete<RequestType>(`/api/requests/types/${id}`)
  return data
}
