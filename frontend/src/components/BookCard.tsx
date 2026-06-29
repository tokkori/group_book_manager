import type { BookResponse } from '@/types'
import { useNavigate } from 'react-router-dom'
import { MapPin, Tag } from 'lucide-react'

export default function BookCard({
  book,
  onContextMenu,
}: {
  book: BookResponse
  onContextMenu?: (e: React.MouseEvent) => void
}) {
  const navigate = useNavigate()
  return (
    <div
      className="card group relative flex cursor-pointer flex-col gap-3 overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-raised"
      onClick={() => navigate(`/books/${book.id}`)}
      onContextMenu={onContextMenu}
      data-testid={`book-card-${book.id}`}
    >
      {/* 背表紙を思わせる左端のアクセント */}
      <span className="absolute inset-y-0 left-0 w-1.5 bg-line transition-colors group-hover:bg-brass-400" />

      <div className="flex items-start justify-between gap-3 pl-1.5">
        <h3
          className="font-serif text-base font-semibold leading-snug text-ink line-clamp-2 transition-colors group-hover:text-brand-700"
          data-testid={`book-title-${book.id}`}
        >
          {book.title}
        </h3>
        <span
          className={book.is_borrowed ? 'badge-borrowed' : 'badge-available'}
          data-testid={`book-status-badge-${book.id}`}
        >
          {book.is_borrowed ? '貸出中' : '在架'}
        </span>
      </div>

      {book.author && <p className="pl-1.5 text-sm text-ink-soft">{book.author}</p>}

      <div className="mt-auto flex flex-wrap gap-2 pl-1.5">
        {book.category && (
          <span className="inline-flex items-center gap-1 rounded-md bg-paper-dark px-2 py-0.5 text-xs text-ink-soft">
            <Tag size={12} className="text-brand-500" />
            {book.category.name}
          </span>
        )}
        {book.location && (
          <span className="inline-flex items-center gap-1 rounded-md bg-paper-dark px-2 py-0.5 text-xs text-ink-soft">
            <MapPin size={12} className="text-brand-500" />
            {book.location.name}
          </span>
        )}
      </div>
    </div>
  )
}
