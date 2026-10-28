import { initializeApp } from 'firebase/app'
import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

export async function getFcmToken(): Promise<string | null> {
  if (!(await isSupported())) return null

  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
  if (Notification.permission !== 'granted') return null

  return getToken(getMessaging(app), {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  })
}

export async function removeFcmToken() {
  try {
    if (await isSupported()) await deleteToken(getMessaging(app))
  } catch (err) {
    console.error('Could not delete FCM token:', err)
  }
}