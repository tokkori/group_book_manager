import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  total: number
  size: number
  onChange: (page: number) => void
}

export default function Pagination({ page, total, size, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / size)
  if (totalPages <= 1) return null

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-soft'

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={btn}
        aria-label="前のページ"
        data-testid="pagination-prev-button"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm text-ink-soft" data-testid="pagination-current-page">
        <span className="font-serif text-base font-semibold text-ink">{page}</span>
        <span className="text-ink-faint"> / {totalPages}</span> ページ（全{total}件）
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className={btn}
        aria-label="次のページ"
        data-testid="pagination-next-button"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
