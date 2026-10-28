import { api } from './axios'

export const registerDeviceToken = (fcmToken: string) =>
  api.post('/api/devices/token', { fcmToken })

export const unregisterDeviceToken = (fcmToken: string) =>
  api.delete('/api/devices/token', { data: { fcmToken } })