import { api } from '@/shared/api'
import type { AuthUser, LoginResponse, RefreshResponse } from '@/shared/types'

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password })
  return data
}

export async function refreshApi(): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>('/api/auth/refresh')
  return data
}

export async function logoutApi(): Promise<void> {
  await api.post('/api/auth/logout')
}

export async function meApi(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/api/auth/me')
  return data
}
