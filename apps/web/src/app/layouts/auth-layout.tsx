import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full border border-gold-500/10 pointer-events-none" />
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full border border-gold-500/8 pointer-events-none" />
        <div className="absolute bottom-[60px] left-[-60px] w-44 h-44 rounded-full bg-gold-500/4 pointer-events-none" />

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 70% 80% at 15% 50%, black 0%, transparent 70%)',
          }}
        />

        <div className="max-w-md space-y-8 text-center relative z-10">
          <div className="space-y-4">
            <img
              src="/logo-cul.png"
              alt="CUL"
              className="h-16 w-16 rounded-xl mx-auto object-cover border-2 border-gold-500/30"
            />
            <h2 className="text-2xl font-bold text-sidebar-foreground font-display">
              Solicitudes Académicas
            </h2>
            <p className="text-sm text-sidebar-muted leading-relaxed">
              Portal institucional para la gestión de solicitudes académicas.
              Certificados, homologaciones y trámites en un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4">
            {[
              { label: 'Trámites', value: '100%' },
              { label: 'Digital', value: '24/7' },
              { label: 'Seguro', value: 'SSL' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-lg font-bold text-gold-400 font-display">{stat.value}</p>
                <p className="text-xs text-sidebar-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
