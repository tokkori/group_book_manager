import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bookService } from '@/services/bookService'
import { categoryService } from '@/services/categoryService'
import BookCard from '@/components/BookCard'
import SearchBar from '@/components/SearchBar'
import Pagination from '@/components/Pagination'
import { Plus } from 'lucide-react'

const PAGE_SIZE = 20

export default function BookListPage() {
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const { data: categoryData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['books', keyword, categoryId, page],
    queryFn: () => bookService.getBooks({
      keyword: keyword || undefined,
      category_id: categoryId ?? undefined,
      page,
      size: PAGE_SIZE,
    }),
  })

  const handleKeywordChange = (v: string) => { setKeyword(v); setPage(1) }
  const handleCategoryChange = (v: number | null) => { setCategoryId(v); setPage(1) }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">書籍一覧</h1>
        <Link
          to="/books/new"
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          data-testid="add-book-button"
        >
          <Plus size={16} /> 書籍を登録
        </Link>
      </div>

      <SearchBar
        keyword={keyword}
        categoryId={categoryId}
        categories={categoryData ?? []}
        onKeywordChange={handleKeywordChange}
        onCategoryChange={handleCategoryChange}
      />

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : !data || data.items.length === 0 ? (
        <p className="text-center py-12 text-gray-400" data-testid="book-list-empty">
          書籍が見つかりませんでした
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-500">全 {data.total} 件</p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-testid="book-list"
          >
            {data.items.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          <Pagination
            page={page}
            total={data.total}
            size={PAGE_SIZE}
            onChange={setPage}
          />
        </>
      )}
    </div>
  )
}
