import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/shared/components/page-header'

/**
 * Página de Perfil.
 * Por ahora redirige a Configuración, donde reside el formulario de datos personales.
 * En una fase futura tendrá su propia pantalla dedicada.
 */
export function ProfilePage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/dashboard/settings', { replace: true })
  }, [navigate])

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" description="Cargando…" />
    </div>
  )
}
