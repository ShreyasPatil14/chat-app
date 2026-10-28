import { useState, type ReactNode } from 'react'
import { AuthContext, type AuthUser } from './AuthContext'
import type { AuthResponse } from '../types/auth'
import { unregisterDeviceToken } from '../api/devices'
import { removeFcmToken } from '../firebase'

function loadUser(): AuthUser | null {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(loadUser)

  const loginUser = (data: AuthResponse) => {
    const authUser = { userId: data.userId, username: data.username }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(authUser))
    setToken(data.token)
    setUser(authUser)
  }

  const logout = async () => {
    const fcmToken = localStorage.getItem('fcmToken')
    if (fcmToken) {
      try {
        await unregisterDeviceToken(fcmToken)
      } catch (err) {
        console.error('Could not unregister device token:', err)
      }
      localStorage.removeItem('fcmToken')
    }
    await removeFcmToken()

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}