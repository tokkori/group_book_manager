import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { loanService } from '@/services/loanService'
import toast from 'react-hot-toast'
import { RotateCcw, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

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
    if (sortKey !== column) return <ArrowUpDown size={14} className="text-gray-300" />
    return sortDir === 'asc'
      ? <ArrowUp size={14} className="text-blue-600" />
      : <ArrowDown size={14} className="text-blue-600" />
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">貸出管理</h1>
        {/* 借り手フィルター */}
        <select
          value={filterBorrower}
          onChange={(e) => setFilterBorrower(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          data-testid="loan-filter-borrower"
        >
          <option value="">すべての借り手</option>
          {borrowers.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : !sortedLoans.length ? (
        <p className="text-center py-12 text-gray-400">
          {filterBorrower ? '該当する貸出がありません' : '現在貸出中の書籍はありません'}
        </p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm" data-testid="active-loans-table">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="text-left px-4 py-3 text-gray-500 font-medium cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => handleSort('book_title')}
                >
                  <span className="flex items-center gap-1">
                    書籍名 <SortIcon column="book_title" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-gray-500 font-medium cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => handleSort('borrower_name')}
                >
                  <span className="flex items-center gap-1">
                    借り手 <SortIcon column="borrower_name" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-gray-500 font-medium cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => handleSort('loan_date')}
                >
                  <span className="flex items-center gap-1">
                    貸出日 <SortIcon column="loan_date" />
                  </span>
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sortedLoans.map((loan) => (
                <tr key={loan.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{loan.book_title}</td>
                  <td className="px-4 py-3 text-gray-600">{loan.borrower_name}</td>
                  <td className="px-4 py-3 text-gray-600">{loan.loan_date}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleReturn(loan.id)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm ml-auto"
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
        <p className="text-xs text-gray-400 text-right">
          {filterBorrower ? `${sortedLoans.length} / ${loans.length} 件表示` : `全 ${loans.length} 件`}
        </p>
      )}
    </div>
  )
}
