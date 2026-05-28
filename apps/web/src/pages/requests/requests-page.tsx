import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const mockRequests = [
  { id: 'REQ-2024-001', title: 'Certificado de estudio', type: 'Certificado', status: 'En revisiÃ³n', date: '2024-01-15' },
  { id: 'REQ-2024-002', title: 'HomologaciÃ³n de matemÃ¡ticas', type: 'HomologaciÃ³n', status: 'Aprobada', date: '2024-01-10' },
  { id: 'REQ-2024-003', title: 'Constancia de notas', type: 'Constancia', status: 'Pendiente', date: '2024-01-08' },
]

const statusColors: Record<string, string> = {
  'En revisiÃ³n': 'bg-warning-soft text-warning',
  'Aprobada': 'bg-success-soft text-success',
  'Pendiente': 'bg-info-soft text-info',
}

export function RequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Solicitudes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            GestiÃ³n y seguimiento de tus solicitudes acadÃ©micas
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nueva solicitud
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solicitudes recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-surface-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{req.title}</p>
                    <p className="text-xs text-muted-foreground">{req.id} Â· {req.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={cn('text-xs', statusColors[req.status] || '')}>
                    {req.status}
                  </Badge>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{req.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
