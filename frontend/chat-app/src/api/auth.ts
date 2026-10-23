import axios from 'axios'
import { api } from './axios'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

export const login = (data: LoginRequest) =>
  api.post<AuthResponse>('/api/auth/login', data).then((res) => res.data)

export const register = (data: RegisterRequest) =>
  api.post<AuthResponse>('/api/auth/register', data).then((res) => res.data)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? 'Cannot reach the server'
  }
  return 'Something went wrong'
}