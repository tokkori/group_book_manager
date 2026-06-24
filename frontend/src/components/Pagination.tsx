interface PaginationProps {
  page: number
  total: number
  size: number
  onChange: (page: number) => void
}

export default function Pagination({ page, total, size, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / size)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
        data-testid="pagination-prev-button"
      >
        ←
      </button>
      <span className="text-sm text-gray-600" data-testid="pagination-current-page">
        {page} / {totalPages}ページ（全{total}件）
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
        data-testid="pagination-next-button"
      >
        →
      </button>
    </div>
  )
}
