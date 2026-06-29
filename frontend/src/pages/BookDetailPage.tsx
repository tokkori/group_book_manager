import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { bookService } from '@/services/bookService'
import { loanService } from '@/services/loanService'
import ConfirmDialog from '@/components/ConfirmDialog'
import toast from 'react-hot-toast'
import { Edit, Trash2, BookOpen, RotateCcw, MapPin, Tag, Calendar, Building2, Barcode } from 'lucide-react'

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const bookId = Number(id)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showDelete, setShowDelete] = useState(false)

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => bookService.getBook(bookId),
  })

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['book', bookId] })
    // 一覧画面（書籍リスト）の貸出状態も更新されるようにキャッシュを無効化する
    qc.invalidateQueries({ queryKey: ['books'] })
  }

  const handleBorrow = async () => {
    try {
      await loanService.borrowBook(bookId)
      toast.success('貸出しました')
      refresh()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '貸出に失敗しました')
    }
  }

  const handleReturn = async () => {
    if (!book?.current_loan) return
    try {
      await loanService.returnBook(book.current_loan.id)
      toast.success('返却しました')
      refresh()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '返却に失敗しました')
    }
  }

  const handleDelete = async () => {
    try {
      await bookService.deleteBook(bookId)
      toast.success('書籍を削除しました')
      navigate('/')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '削除に失敗しました')
    }
  }

  if (isLoading) return <div className="py-16 text-center text-ink-faint">読み込み中...</div>
  if (!book) return <div className="py-16 text-center text-ink-faint">書籍が見つかりません</div>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-snug text-ink">{book.title}</h1>
          {book.author && <p className="mt-1.5 text-ink-soft">{book.author}</p>}
        </div>
        <span
          className={book.is_borrowed ? 'badge-borrowed' : 'badge-available'}
          data-testid="book-detail-status"
        >
          {book.is_borrowed ? '貸出中' : '在架'}
        </span>
      </div>

      {/* 書籍情報 */}
      <dl className="card divide-y divide-line/70 p-0 text-sm">
        {book.isbn && (
          <Row icon={<Barcode size={15} />} label="ISBN">{book.isbn}</Row>
        )}
        {book.publisher && (
          <Row icon={<Building2 size={15} />} label="出版社">{book.publisher}</Row>
        )}
        {book.published_year && (
          <Row icon={<Calendar size={15} />} label="出版年">{book.published_year}年</Row>
        )}
        {book.category && (
          <Row icon={<Tag size={15} />} label="カテゴリ">{book.category.name}</Row>
        )}
        {book.location && (
          <Row icon={<MapPin size={15} />} label="保管場所">{book.location.name}</Row>
        )}
        {book.is_borrowed && book.current_loan && (
          <Row icon={<BookOpen size={15} />} label="貸出中">
            <span className="text-clay-700">
              {book.current_loan.borrower_name}（{book.current_loan.loan_date}〜）
            </span>
          </Row>
        )}
      </dl>

      {/* アクションボタン */}
      <div className="flex flex-wrap gap-3">
        {!book.is_borrowed && (
          <button onClick={handleBorrow} className="btn-primary" data-testid="book-borrow-button">
            <BookOpen size={16} /> 借りる
          </button>
        )}
        {book.is_borrowed && (
          <button onClick={handleReturn} className="btn-primary" data-testid="book-return-button">
            <RotateCcw size={16} /> 返却
          </button>
        )}
        <Link to={`/books/${bookId}/edit`} className="btn-secondary" data-testid="book-edit-button">
          <Edit size={16} /> 編集
        </Link>
        <button onClick={() => setShowDelete(true)} className="btn-danger-outline" data-testid="book-delete-button">
          <Trash2 size={16} /> 削除
        </button>
      </div>

      {/* 貸出履歴 */}
      {book.loan_history.length > 0 && (
        <div>
          <h2 className="section-title mb-3">貸出履歴</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm" data-testid="loan-history-table">
              <thead className="bg-paper-dark">
                <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-2.5 font-semibold">借り手</th>
                  <th className="px-4 py-2.5 font-semibold">貸出日</th>
                  <th className="px-4 py-2.5 font-semibold">返却日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {book.loan_history.map((loan) => (
                  <tr key={loan.id}>
                    <td className="px-4 py-2.5 text-ink">{loan.borrower_name}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{loan.loan_date}</td>
                    <td className="px-4 py-2.5">
                      {loan.return_date ?? <span className="font-medium text-clay-600">貸出中</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title="書籍の削除"
        message={`「${book.title}」を削除しますか？この操作は元に戻せません。`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="flex w-28 shrink-0 items-center gap-1.5 text-ink-faint">
        <span className="text-brand-400">{icon}</span>
        {label}
      </span>
      <span className="text-ink">{children}</span>
    </div>
  )
}
