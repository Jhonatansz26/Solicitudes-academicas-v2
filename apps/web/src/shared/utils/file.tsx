import { FileText, FileImage, FileSpreadsheet, FileType } from 'lucide-react'
import type { ReactNode } from 'react'

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getFileTypeLabel(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.startsWith('image/')) return 'Imagen'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Documento'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Hoja de cÃ¡lculo'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PresentaciÃ³n'
  return 'Archivo'
}

export function getFileIcon(mimeType: string): ReactNode {
  if (mimeType === 'application/pdf') {
    return <FileText className="h-5 w-5 text-danger" />
  }
  if (mimeType.startsWith('image/')) {
    return <FileImage className="h-5 w-5 text-info" />
  }
  if (mimeType.includes('sheet') || mimeType.includes('excel')) {
    return <FileSpreadsheet className="h-5 w-5 text-success" />
  }
  return <FileType className="h-5 w-5 text-muted-foreground" />
}
