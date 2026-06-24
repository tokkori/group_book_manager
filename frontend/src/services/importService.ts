import apiClient from './apiClient'
import type { ImportResult } from '@/types'

export const importService = {
  async importBooks(file: File): Promise<ImportResult> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post<ImportResult>('/import/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
