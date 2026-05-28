import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('mock-auth', 'true')
    navigate(from, { replace: true })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <GraduationCap className="h-6 w-6 text-accent" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Bienvenido
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tus credenciales para acceder al portal
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Correo institucional</label>
          <Input
            type="email"
            placeholder="usuario@universidad.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">ContraseÃ±a</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="â¢â¢â¢â¢â¢â¢â¢â¢"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Iniciar sesiÃ³n
        </Button>
      </form>

      <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Mock Auth (dev only)</p>
        <p className="text-xs text-muted-foreground">
          Cualquier credencial funciona. Se guarda en localStorage para simular sesiÃ³n.
        </p>
      </div>
    </div>
  )
}
