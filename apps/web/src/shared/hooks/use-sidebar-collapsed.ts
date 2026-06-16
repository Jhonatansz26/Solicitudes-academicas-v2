import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sidebar-collapsed'

/**
 * Hook para gestionar el estado colapsado de la sidebar.
 * Persiste en localStorage para mantener la preferencia del usuario.
 */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return stored === 'true'
    } catch {
      return false
    }
  })

  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // localStorage no disponible
    }
  }, [collapsed])

  const toggle = useCallback(() => {
    setCollapsedState((prev) => !prev)
  }, [])

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value)
  }, [])

  const openMobile = useCallback(() => setMobileOpen(true), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return {
    collapsed,
    toggle,
    setCollapsed,
    mobileOpen,
    openMobile,
    closeMobile,
  }
}
