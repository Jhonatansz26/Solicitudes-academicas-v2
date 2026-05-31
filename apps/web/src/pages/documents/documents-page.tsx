import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { FileText, Upload, Download, Trash2 } from 'lucide-react'

const mockDocuments = [
  { id: 'DOC-001', name: 'certificado_notas.pdf', size: '2.4 MB', date: '2024-01-15', type: 'PDF' },
  { id: 'DOC-002', name: 'record_academico.pdf', size: '1.8 MB', date: '2024-01-10', type: 'PDF' },
  { id: 'DOC-003', name: 'carta_motivacion.docx', size: '340 KB', date: '2024-01-08', type: 'DOC' },
]

export function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Documentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestión de archivos adjuntos a tus solicitudes
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Archivos adjuntos</CardTitle>
          <Button size="sm" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Subir archivo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-surface-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} Â· {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
