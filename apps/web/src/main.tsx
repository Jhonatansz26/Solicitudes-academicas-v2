import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/shared/components/ui/sonner'
import { router } from './app/router'
import { queryClient } from './providers/query-provider'
import { AuthProvider } from './app/providers/auth-provider'
import { ThemeProvider } from './providers/theme-provider'
import './index.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
