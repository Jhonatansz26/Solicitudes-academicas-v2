export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  requests: {
    list: '/api/requests',
    types: '/api/requests/types',
    detail: (id: string) => `/api/requests/${id}`,
    create: '/api/requests',
    update: (id: string) => `/api/requests/${id}`,
    submit: (id: string) => `/api/requests/${id}/submit`,
    cancel: (id: string) => `/api/requests/${id}/cancel`,
    changeStatus: (id: string) => `/api/requests/${id}/status`,
  },
  documents: {
    upload: '/api/documents/upload',
    byRequest: (requestId: string) => `/api/documents/request/${requestId}`,
    detail: (id: string) => `/api/documents/${id}`,
    download: (id: string) => `/api/documents/${id}/download`,
    delete: (id: string) => `/api/documents/${id}`,
  },
} as const

export const APP_ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  requests: '/dashboard/requests',
  documents: '/dashboard/documents',
  settings: '/dashboard/settings',
} as const
