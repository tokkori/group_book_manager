import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-sm p-6 shadow-raised" data-testid="confirm-dialog">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay-50 text-clay-600">
            <AlertTriangle size={20} />
          </span>
          <h2 className="font-serif text-lg font-semibold text-ink">{title}</h2>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-ink-soft" data-testid="confirm-dialog-message">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary"
            data-testid="confirm-dialog-cancel-button"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="btn bg-clay-600 text-white hover:bg-clay-700"
            data-testid="confirm-dialog-ok-button"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  )
}
