import { createContext } from 'react'
import type { AuthResponse } from '../types/auth'

export interface AuthUser {
  userId: number
  username: string
}

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loginUser: (data: AuthResponse) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)