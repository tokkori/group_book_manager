import apiClient from './apiClient'
import type { LoanResponse } from '@/types'

export const loanService = {
  async getActiveLoans(): Promise<LoanResponse[]> {
    const { data } = await apiClient.get<LoanResponse[]>('/loans')
    return data
  },

  async borrowBook(bookId: number): Promise<LoanResponse> {
    const { data } = await apiClient.post<LoanResponse>('/loans', { book_id: bookId })
    return data
  },

  async returnBook(loanId: number): Promise<LoanResponse> {
    const { data } = await apiClient.put<LoanResponse>(`/loans/${loanId}/return`)
    return data
  },

  async getLoanHistory(bookId: number): Promise<LoanResponse[]> {
    const { data } = await apiClient.get<LoanResponse[]>(`/loans/history/${bookId}`)
    return data
  },
}
