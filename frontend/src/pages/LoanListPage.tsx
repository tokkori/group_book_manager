import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { loanService } from '@/services/loanService'
import toast from 'react-hot-toast'
import { RotateCcw, ArrowUp, ArrowDown, ArrowUpDown, Inbox } from 'lucide-react'

type SortKey = 'book_title' | 'borrower_name' | 'loan_date'
type SortDir = 'asc' | 'desc'

export default function LoanListPage() {
  const qc = useQueryClient()
  const { data: loans, isLoading } = useQuery({
    queryKey: ['active-loans'],
    queryFn: () => loanService.getActiveLoans(),
  })

  const [sortKey, setSortKey] = useState<SortKey>('loan_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterBorrower, setFilterBorrower] = useState('')

  // 借り手の一覧を取得（ユニーク）
  const borrowers = useMemo(() => {
    if (!loans) return []
    const names = [...new Set(loans.map((l) => l.borrower_name))]
    return names.sort()
  }, [loans])

  // フィルタリング + ソート
  const sortedLoans = useMemo(() => {
    if (!loans) return []
    let filtered = loans
    if (filterBorrower) {
      filtered = filtered.filter((l) => l.borrower_name === filterBorrower)
    }
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [loans, sortKey, sortDir, filterBorrower])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown size={14} className="text-line-strong" />
    return sortDir === 'asc'
      ? <ArrowUp size={14} className="text-brand-600" />
      : <ArrowDown size={14} className="text-brand-600" />
  }

  const handleReturn = async (loanId: number) => {
    try {
      await loanService.returnBook(loanId)
      toast.success('返却しました')
      qc.invalidateQueries({ queryKey: ['active-loans'] })
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '返却に失敗しました')
    }
  }

  const th =
    'cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint transition-colors hover:text-brand-700'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">貸出管理</h1>
          <p className="mt-1 text-sm text-ink-faint">現在貸出中の書籍</p>
        </div>
        {/* 借り手フィルター */}
        <select
          value={filterBorrower}
          onChange={(e) => setFilterBorrower(e.target.value)}
          className="input sm:w-52"
          data-testid="loan-filter-borrower"
        >
          <option value="">すべての借り手</option>
          {borrowers.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-ink-faint">読み込み中...</div>
      ) : !sortedLoans.length ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-dark text-brand-400">
            <Inbox size={28} />
          </span>
          <p className="text-ink-soft">
            {filterBorrower ? '該当する貸出がありません' : '現在貸出中の書籍はありません'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm" data-testid="active-loans-table">
            <thead className="bg-paper-dark">
              <tr>
                <th className={th} onClick={() => handleSort('book_title')}>
                  <span className="flex items-center gap-1">書籍名 <SortIcon column="book_title" /></span>
                </th>
                <th className={th} onClick={() => handleSort('borrower_name')}>
                  <span className="flex items-center gap-1">借り手 <SortIcon column="borrower_name" /></span>
                </th>
                <th className={th} onClick={() => handleSort('loan_date')}>
                  <span className="flex items-center gap-1">貸出日 <SortIcon column="loan_date" /></span>
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {sortedLoans.map((loan) => (
                <tr key={loan.id} className="transition-colors hover:bg-paper-dark/50">
                  <td className="px-4 py-3 font-medium text-ink">{loan.book_title}</td>
                  <td className="px-4 py-3 text-ink-soft">{loan.borrower_name}</td>
                  <td className="px-4 py-3 text-ink-soft">{loan.loan_date}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleReturn(loan.id)}
                      className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
                      data-testid={`return-button-${loan.id}`}
                    >
                      <RotateCcw size={14} /> 返却
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loans && loans.length > 0 && (
        <p className="text-right text-xs text-ink-faint">
          {filterBorrower ? `${sortedLoans.length} / ${loans.length} 件表示` : `全 ${loans.length} 件`}
        </p>
      )}
    </div>
  )
}
