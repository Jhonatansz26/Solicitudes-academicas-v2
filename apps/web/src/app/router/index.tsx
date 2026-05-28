import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '../layouts/auth-layout'
import { DashboardLayout } from '../layouts/dashboard-layout'
import { ProtectedRoute } from './protected-route'
import { LoginPage } from '@/pages/login/login-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { RequestsPage } from '@/pages/requests/requests-page'
import { DocumentsPage } from '@/pages/documents/documents-page'
import { SettingsPage } from '@/pages/settings/settings-page'
import { useAuth } from '@/app/providers/auth-provider'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/dashboard/requests',
        element: <RequestsPage />,
      },
      {
        path: '/dashboard/documents',
        element: <DocumentsPage />,
      },
      {
        path: '/dashboard/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <CatchAllRedirect />,
  },
])

function CatchAllRedirect() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}
