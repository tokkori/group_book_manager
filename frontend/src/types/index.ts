export interface UserResponse {
  id: number
  username: string
  display_name: string
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface CategoryResponse {
  id: number
  name: string
  description: string | null
}

export interface LocationResponse {
  id: number
  name: string
}

export interface BookResponse {
  id: number
  title: string
  author: string | null
  isbn: string | null
  publisher: string | null
  published_year: number | null
  category: CategoryResponse | null
  location: LocationResponse | null
  is_borrowed: boolean
  created_at: string
  updated_at: string
}

export interface BookCreateResponse extends BookResponse {
  isbn_duplicate: boolean
}

export interface LoanSummary {
  id: number
  borrower_name: string
  loan_date: string
}

export interface LoanHistoryItem {
  id: number
  borrower_name: string
  loan_date: string
  return_date: string | null
}

export interface BookDetailResponse extends BookResponse {
  current_loan: LoanSummary | null
  loan_history: LoanHistoryItem[]
}

export interface BookListResponse {
  items: BookResponse[]
  total: number
  page: number
  size: number
}

export interface LoanResponse {
  id: number
  book_id: number
  book_title: string
  user_id: number
  borrower_name: string
  loan_date: string
  return_date: string | null
}

export interface ImportResult {
  success: number
  skipped: number
  errors: string[]
}

export interface BookCreate {
  title: string
  author?: string
  isbn?: string
  publisher?: string
  published_year?: number
  category_id?: number
  location_id?: number
}
