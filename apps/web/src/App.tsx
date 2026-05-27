import { Toaster } from './shared/components/ui/sonner'

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1>Solicitudes Académicas</h1>
          <p className="text-muted-foreground">
            Frontend V2 — Design System Verification
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Primary</h3>
            <div className="h-12 w-full rounded-md bg-primary" />
            <p className="font-mono text-xs text-muted-foreground">#1a2340</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Accent</h3>
            <div className="h-12 w-full rounded-md bg-accent" />
            <p className="font-mono text-xs text-muted-foreground">#E8A820</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Background</h3>
            <div className="h-12 w-full rounded-md border border-border bg-background" />
            <p className="font-mono text-xs text-muted-foreground">#f0f2f6</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <h3>Typography</h3>
          <div className="space-y-2">
            <h1>Heading 1 — 30px</h1>
            <h2>Heading 2 — 24px</h2>
            <h3>Heading 3 — 20px</h3>
            <p>Body text — Inter, 16px, line-height 1.5</p>
            <p className="font-mono text-sm">Mono text — JetBrains Mono, 14px</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <h3>Semantic Colors</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md bg-success-soft px-3 py-2 text-sm font-medium text-success">Success</div>
            <div className="rounded-md bg-warning-soft px-3 py-2 text-sm font-medium text-warning">Warning</div>
            <div className="rounded-md bg-danger-soft px-3 py-2 text-sm font-medium text-danger">Danger</div>
            <div className="rounded-md bg-info-soft px-3 py-2 text-sm font-medium text-info">Info</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <h3>Border Radius</h3>
          <div className="flex gap-4">
            <div className="h-16 w-16 bg-primary" style={{ borderRadius: 'var(--radius-sm)' }} />
            <div className="h-16 w-16 bg-primary" style={{ borderRadius: 'var(--radius-md)' }} />
            <div className="h-16 w-16 bg-primary" style={{ borderRadius: 'var(--radius-lg)' }} />
            <div className="h-16 w-16 bg-primary" style={{ borderRadius: 'var(--radius-xl)' }} />
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

export default App
