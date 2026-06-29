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
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          placeholder="タイトル・著者・ISBNで検索"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="input pl-10"
          data-testid="search-keyword-input"
        />
      </div>
      <select
        value={categoryId ?? ''}
        onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
        className="input sm:w-52"
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
