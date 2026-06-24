import apiClient from './apiClient'
import type { LocationResponse } from '@/types'

export const locationService = {
  async getAll(): Promise<LocationResponse[]> {
    const { data } = await apiClient.get<LocationResponse[]>('/locations')
    return data
  },

  async create(name: string): Promise<LocationResponse> {
    const { data } = await apiClient.post<LocationResponse>('/locations', { name })
    return data
  },

  async update(id: number, name: string): Promise<LocationResponse> {
    const { data } = await apiClient.put<LocationResponse>(`/locations/${id}`, { name })
    return data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/locations/${id}`)
  },
}
