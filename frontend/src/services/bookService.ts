import apiClient from './apiClient'
import type { BookResponse, BookListResponse, BookDetailResponse, BookCreateResponse, BookCreate } from '@/types'

interface GetBooksParams {
  keyword?: string
  category_id?: number
  page?: number
  size?: number
}

export const bookService = {
  async getBooks(params: GetBooksParams = {}): Promise<BookListResponse> {
    const { data } = await apiClient.get<BookListResponse>('/books', { params })
    return data
  },

  async getBook(id: number): Promise<BookDetailResponse> {
    const { data } = await apiClient.get<BookDetailResponse>(`/books/${id}`)
    return data
  },

  async createBook(payload: BookCreate): Promise<BookCreateResponse> {
    const { data } = await apiClient.post<BookCreateResponse>('/books', payload)
    return data
  },

  async updateBook(id: number, payload: Partial<BookCreate>): Promise<BookResponse> {
    const { data } = await apiClient.put<BookResponse>(`/books/${id}`, payload)
    return data
  },

  async deleteBook(id: number): Promise<void> {
    await apiClient.delete(`/books/${id}`)
  },
}
