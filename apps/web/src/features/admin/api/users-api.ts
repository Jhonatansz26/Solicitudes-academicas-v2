import { api } from '@/shared/api'
import type { AdminUser, PaginatedResponse, CreateUserInput, UpdateUserInput, Role } from '@/shared/types'

export interface UsersQuery {
  page?: number
  limit?: number
  search?: string
  role?: string
  isActive?: boolean
}

export async function fetchUsers(query: UsersQuery): Promise<PaginatedResponse<AdminUser>> {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.search) params.set('search', query.search)
  if (query.role) params.set('role', query.role)
  if (query.isActive !== undefined) params.set('isActive', String(query.isActive))

  const { data } = await api.get<PaginatedResponse<AdminUser>>(`/api/users?${params}`)
  return data
}

export async function fetchUser(id: string): Promise<AdminUser> {
  const { data } = await api.get<AdminUser>(`/api/users/${id}`)
  return data
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>('/api/users', input)
  return data
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/api/users/${id}`, input)
  return data
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/api/users/${id}/status`, { isActive })
  return data
}

export async function deleteUser(id: string): Promise<{ message: string; id: string }> {
  const { data } = await api.delete<{ message: string; id: string }>(`/api/users/${id}`)
  return data
}

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await api.get<Role[]>('/api/users/roles')
  return data
}
