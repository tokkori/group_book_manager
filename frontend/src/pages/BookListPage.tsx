import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { bookService } from '@/services/bookService'
import { categoryService } from '@/services/categoryService'
import { loanService } from '@/services/loanService'
import { getApiErrorMessage } from '@/services/apiError'
import BookCard from '@/components/BookCard'
import BookContextMenu from '@/components/BookContextMenu'
import SearchBar from '@/components/SearchBar'
import Pagination from '@/components/Pagination'
import toast from 'react-hot-toast'
import { Plus, Library } from 'lucide-react'
import type { BookResponse } from '@/types'

const PAGE_SIZE = 20

export default function BookListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [menu, setMenu] = useState<{ x: number; y: number; book: BookResponse } | null>(null)
  const [busy, setBusy] = useState(false)

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

  const openMenu = (e: React.MouseEvent, book: BookResponse) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, book })
  }
  const closeMenu = () => setMenu(null)

  const refreshBook = (bookId: number) => {
    qc.invalidateQueries({ queryKey: ['books'] })
    qc.invalidateQueries({ queryKey: ['book', bookId] })
  }

  const handleBorrow = async (book: BookResponse) => {
    setBusy(true)
    try {
      await loanService.borrowBook(book.id)
      toast.success('貸出しました')
      refreshBook(book.id)
      closeMenu()
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, '貸出に失敗しました'))
    } finally {
      setBusy(false)
    }
  }

  const handleReturn = async (book: BookResponse) => {
    setBusy(true)
    try {
      // 一覧のデータには貸出記録IDが無いため、詳細から現在の貸出を取得する
      const detail = await bookService.getBook(book.id)
      if (!detail.current_loan) {
        toast.error('貸出記録が見つかりません')
        return
      }
      await loanService.returnBook(detail.current_loan.id)
      toast.success('返却しました')
      refreshBook(book.id)
      closeMenu()
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, '返却に失敗しました'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">書籍一覧</h1>
          <p className="mt-1 text-sm text-ink-faint">蔵書を検索・管理します</p>
        </div>
        <Link to="/books/new" className="btn-primary" data-testid="add-book-button">
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
        <div className="py-16 text-center text-ink-faint">読み込み中...</div>
      ) : !data || data.items.length === 0 ? (
        <div
          className="card flex flex-col items-center gap-3 px-6 py-16 text-center"
          data-testid="book-list-empty"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-dark text-brand-400">
            <Library size={28} />
          </span>
          <p className="text-ink-soft">書籍が見つかりませんでした</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-faint">
            全 <span className="font-serif text-base font-semibold text-ink">{data.total}</span> 件
          </p>
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="book-list"
          >
            {data.items.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onContextMenu={(e) => openMenu(e, book)}
              />
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

      {menu && (
        <BookContextMenu
          x={menu.x}
          y={menu.y}
          book={menu.book}
          busy={busy}
          onBorrow={() => handleBorrow(menu.book)}
          onReturn={() => handleReturn(menu.book)}
          onOpen={() => navigate(`/books/${menu.book.id}`)}
          onClose={closeMenu}
        />
      )}
    </div>
  )
}
