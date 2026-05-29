import { api } from '@/shared/api'
import type { Request, RequestType, PaginatedResponse, RequestStatus } from '@/shared/types'

export interface RequestsQuery {
  page?: number
  limit?: number
  status?: RequestStatus
  requestTypeId?: string
  search?: string
}

export interface CreateRequestInput {
  title: string
  description?: string
  requestTypeId: string
}

export async function fetchRequests(query: RequestsQuery): Promise<PaginatedResponse<Request>> {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.status) params.set('status', query.status)
  if (query.requestTypeId) params.set('requestTypeId', query.requestTypeId)
  if (query.search) params.set('search', query.search)

  const { data } = await api.get<PaginatedResponse<Request>>(`/api/requests?${params}`)
  return data
}

export async function fetchRequestTypes(): Promise<RequestType[]> {
  const { data } = await api.get<RequestType[]>('/api/requests/types')
  return data
}

export async function fetchRequest(id: string): Promise<Request> {
  const { data } = await api.get<Request>(`/api/requests/${id}`)
  return data
}

export async function createRequest(input: CreateRequestInput): Promise<Request> {
  const { data } = await api.post<Request>('/api/requests', input)
  return data
}

export async function submitRequest(id: string): Promise<Request> {
  const { data } = await api.post<Request>(`/api/requests/${id}/submit`)
  return data
}

export async function cancelRequest(id: string): Promise<Request> {
  const { data } = await api.post<Request>(`/api/requests/${id}/cancel`)
  return data
}

export interface ChangeStatusInput {
  newStatus: RequestStatus
  comment?: string
}

export async function changeRequestStatus(
  id: string,
  input: ChangeStatusInput
): Promise<Request> {
  const { data } = await api.patch<Request>(`/api/requests/${id}/status`, input)
  return data
}
