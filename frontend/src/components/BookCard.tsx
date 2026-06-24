import type { BookResponse } from '@/types'
import { useNavigate } from 'react-router-dom'
import { MapPin, Tag } from 'lucide-react'

export default function BookCard({ book }: { book: BookResponse }) {
  const navigate = useNavigate()
  return (
    <div
      className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-2"
      onClick={() => navigate(`/books/${book.id}`)}
      data-testid={`book-card-${book.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-800 line-clamp-2" data-testid={`book-title-${book.id}`}>
          {book.title}
        </h3>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
            book.is_borrowed
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
          data-testid={`book-status-badge-${book.id}`}
        >
          {book.is_borrowed ? '貸出中' : '在架'}
        </span>
      </div>
      {book.author && <p className="text-sm text-gray-500">{book.author}</p>}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-auto">
        {book.category && (
          <span className="flex items-center gap-1"><Tag size={12} />{book.category.name}</span>
        )}
        {book.location && (
          <span className="flex items-center gap-1"><MapPin size={12} />{book.location.name}</span>
        )}
      </div>
    </div>
  )
}
