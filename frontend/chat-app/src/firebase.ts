import { initializeApp } from 'firebase/app'
import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

function registerServiceWorker() {
  const params = new URLSearchParams(firebaseConfig)
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params}`, {
    scope: '/firebase-cloud-messaging-push-scope',
  })
}

export async function getFcmToken(): Promise<string | null> {
  if (!(await isSupported())) return null

  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
  if (Notification.permission !== 'granted') return null

  const registration = await registerServiceWorker()
  return getToken(getMessaging(app), {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  })
}

export async function removeFcmToken() {
  try {
    if (await isSupported()) await deleteToken(getMessaging(app))
  } catch (err) {
    console.error('Could not delete FCM token:', err)
  }
}