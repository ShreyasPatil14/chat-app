import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { getFcmToken } from '../firebase'
import { registerDeviceToken } from '../api/devices'

export function usePushNotifications() {
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return
    let cancelled = false

    getFcmToken()
      .then(async (fcmToken) => {
        if (!fcmToken || cancelled) return
        await registerDeviceToken(fcmToken)
        localStorage.setItem('fcmToken', fcmToken)
      })
      .catch((err) => console.error('Push setup failed:', err))

    return () => {
      cancelled = true
    }
  }, [token])
}