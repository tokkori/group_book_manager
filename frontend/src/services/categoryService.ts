import apiClient from './apiClient'
import type { CategoryResponse } from '@/types'

export const categoryService = {
  async getAll(): Promise<CategoryResponse[]> {
    const { data } = await apiClient.get<CategoryResponse[]>('/categories')
    return data
  },

  async create(name: string, description?: string): Promise<CategoryResponse> {
    const { data } = await apiClient.post<CategoryResponse>('/categories', { name, description })
    return data
  },

  async update(id: number, name: string, description?: string): Promise<CategoryResponse> {
    const { data } = await apiClient.put<CategoryResponse>(`/categories/${id}`, { name, description })
    return data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`)
  },
}
