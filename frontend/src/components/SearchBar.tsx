import type { CategoryResponse } from '@/types'
import { Search } from 'lucide-react'

interface SearchBarProps {
  keyword: string
  categoryId: number | null
  categories: CategoryResponse[]
  onKeywordChange: (v: string) => void
  onCategoryChange: (v: number | null) => void
}

export default function SearchBar({ keyword, categoryId, categories, onKeywordChange, onCategoryChange }: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="タイトル・著者・ISBNで検索"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          data-testid="search-keyword-input"
        />
      </div>
      <select
        value={categoryId ?? ''}
        onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        data-testid="search-category-select"
      >
        <option value="">すべてのカテゴリ</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}
