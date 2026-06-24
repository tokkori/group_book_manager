import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { bookService } from '@/services/bookService'
import { loanService } from '@/services/loanService'
import ConfirmDialog from '@/components/ConfirmDialog'
import toast from 'react-hot-toast'
import { Edit, Trash2, BookOpen, RotateCcw, MapPin, Tag, Calendar } from 'lucide-react'

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

  const refresh = () => qc.invalidateQueries({ queryKey: ['book', bookId] })

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

  if (isLoading) return <div className="text-center py-12 text-gray-400">読み込み中...</div>
  if (!book) return <div className="text-center py-12 text-gray-400">書籍が見つかりません</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{book.title}</h1>
          {book.author && <p className="text-gray-500 mt-1">{book.author}</p>}
        </div>
        <span
          className={`shrink-0 text-sm px-3 py-1 rounded-full font-medium ${
            book.is_borrowed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
          data-testid="book-detail-status"
        >
          {book.is_borrowed ? '貸出中' : '在架'}
        </span>
      </div>

      {/* 書籍情報 */}
      <div className="bg-white rounded-lg border p-5 space-y-3 text-sm">
        {book.isbn && <p><span className="text-gray-400 w-24 inline-block">ISBN</span>{book.isbn}</p>}
        {book.publisher && <p><span className="text-gray-400 w-24 inline-block">出版社</span>{book.publisher}</p>}
        {book.published_year && <p><span className="text-gray-400 w-24 inline-block flex items-center gap-1"><Calendar size={12}/>出版年</span>{book.published_year}年</p>}
        {book.category && (
          <p className="flex items-center gap-1">
            <Tag size={14} className="text-gray-400" />
            <span className="text-gray-400 w-20">カテゴリ</span>{book.category.name}
          </p>
        )}
        {book.location && (
          <p className="flex items-center gap-1">
            <MapPin size={14} className="text-gray-400" />
            <span className="text-gray-400 w-20">保管場所</span>{book.location.name}
          </p>
        )}
        {book.is_borrowed && book.current_loan && (
          <p className="text-red-600">
            <span className="text-gray-400 w-24 inline-block">貸出中</span>
            {book.current_loan.borrower_name}（{book.current_loan.loan_date}〜）
          </p>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex flex-wrap gap-3">
        {!book.is_borrowed && (
          <button
            onClick={handleBorrow}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            data-testid="book-borrow-button"
          >
            <BookOpen size={16} /> 借りる
          </button>
        )}
        {book.is_borrowed && (
          <button
            onClick={handleReturn}
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            data-testid="book-return-button"
          >
            <RotateCcw size={16} /> 返却
          </button>
        )}
        <Link
          to={`/books/${bookId}/edit`}
          className="flex items-center gap-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm"
          data-testid="book-edit-button"
        >
          <Edit size={16} /> 編集
        </Link>
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-1 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm"
          data-testid="book-delete-button"
        >
          <Trash2 size={16} /> 削除
        </button>
      </div>

      {/* 貸出履歴 */}
      {book.loan_history.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">貸出履歴</h2>
          <table className="w-full text-sm border rounded-lg overflow-hidden" data-testid="loan-history-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">借り手</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">貸出日</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">返却日</th>
              </tr>
            </thead>
            <tbody>
              {book.loan_history.map((loan) => (
                <tr key={loan.id} className="border-t">
                  <td className="px-4 py-2">{loan.borrower_name}</td>
                  <td className="px-4 py-2">{loan.loan_date}</td>
                  <td className="px-4 py-2">{loan.return_date ?? <span className="text-red-500">貸出中</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
