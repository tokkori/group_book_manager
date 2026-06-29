import { useEffect } from 'react'
import type { BookResponse } from '@/types'
import { BookOpen, RotateCcw, ExternalLink } from 'lucide-react'

interface BookContextMenuProps {
  x: number
  y: number
  book: BookResponse
  busy: boolean
  onBorrow: () => void
  onReturn: () => void
  onOpen: () => void
  onClose: () => void
}

export default function BookContextMenu({
  x, y, book, busy, onBorrow, onReturn, onOpen, onClose,
}: BookContextMenuProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // 画面端でメニューが見切れないよう位置を補正する
  const left = Math.min(x, window.innerWidth - 200)
  const top = Math.min(y, window.innerHeight - 150)

  return (
    <>
      {/* メニュー外のクリック・右クリックで閉じるためのオーバーレイ */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose() }}
      />
      <div
        className="fixed z-50 w-48 overflow-hidden rounded-xl border border-line bg-paper py-1 shadow-raised"
        style={{ left, top }}
        role="menu"
        data-testid={`book-context-menu-${book.id}`}
      >
        <p className="truncate px-3 py-1.5 text-xs font-medium text-ink-faint">{book.title}</p>
        <div className="border-t border-line/70" />
        {book.is_borrowed ? (
          <button
            type="button"
            disabled={busy}
            onClick={onReturn}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-paper-dark disabled:cursor-not-allowed disabled:opacity-50"
            role="menuitem"
            data-testid={`book-context-return-${book.id}`}
          >
            <RotateCcw size={15} className="text-brand-500" /> 返却する
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={onBorrow}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-paper-dark disabled:cursor-not-allowed disabled:opacity-50"
            role="menuitem"
            data-testid={`book-context-borrow-${book.id}`}
          >
            <BookOpen size={15} className="text-brand-500" /> 貸出する
          </button>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-paper-dark"
          role="menuitem"
        >
          <ExternalLink size={15} className="text-brand-500" /> 詳細を開く
        </button>
      </div>
    </>
  )
}
