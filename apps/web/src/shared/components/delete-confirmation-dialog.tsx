import { Loader2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  isPending: boolean
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title = 'Eliminar elemento',
  description,
  isPending,
  onConfirm,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
