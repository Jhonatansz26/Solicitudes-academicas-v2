import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers/auth-provider'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { AxiosError } from 'axios'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('El correo es requerido')
      return
    }
    if (!password.trim()) {
      setError('La contraseña es requerida')
      return
    }

    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setError('Correo o contraseña inválidos')
      } else if (err instanceof AxiosError && err.response?.status === 403) {
        setError('Tu cuenta está inactiva o suspendida')
      } else {
        setError('Error de conexión. Intenta de nuevo más tarde')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Brand */}
      <div className="space-y-4 text-center">
        <img
          src="/logo-cul.png"
          alt="CUL"
          className="h-14 w-14 rounded-xl mx-auto object-cover border-2 border-gold-500/30"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-primary font-display">
            Bienvenido
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder al portal
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Correo institucional
          </label>
          <Input
            type="email"
            placeholder="usuario@universidad.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
            className="h-11 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Contraseña
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg pr-10"
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          ¿Problemas para acceder?{' '}
          <span className="text-primary font-semibold cursor-pointer hover:underline">
            Contacta soporte TI
          </span>
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground/60">
        Sistema de Solicitudes Académicas © {new Date().getFullYear()}
      </p>
    </div>
  )
}
