import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
              <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.962 8.962 0 016 3.75c-1.05 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 20.25c1.05 0 2.062-.18 3-.512m12-3.75a8.962 8.962 0 01-6 2.292v-14.25a8.987 8.987 0 016-2.292m-6 14.25v-14.25" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-primary-foreground">
              Solicitudes Académicas
            </h2>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Portal institucional para la gestión de solicitudes académicas.
              Certificados, homologaciones y trámites en un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8">
            {[
              { label: 'Trámites', value: '100%' },
              { label: 'Digital', value: '24/7' },
              { label: 'Seguro', value: 'SSL' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-lg font-semibold text-accent">{stat.value}</p>
                <p className="text-xs text-primary-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
