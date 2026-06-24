import apiClient from './apiClient'
import type { TokenResponse, UserResponse } from '@/types'

export const authService = {
  async login(username: string, password: string): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>('/auth/login', { username, password })
    return data
  },

  async register(username: string, display_name: string, password: string): Promise<UserResponse> {
    const { data } = await apiClient.post<UserResponse>('/auth/register', {
      username,
      display_name,
      password,
    })
    return data
  },

  async getMe(): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>('/auth/me')
    return data
  },

  logout(): void {
    localStorage.removeItem('access_token')
  },
}
