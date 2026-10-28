// Runs when a notification is clicked: open the chat it belongs to.
// It is registered first so it runs before Firebase's own click handling.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const chatId = event.notification.data?.FCM_MSG?.data?.chatId
  const url = chatId ? `/chats/${chatId}` : '/'

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const existing = windows.find((w) => new URL(w.url).origin === self.location.origin)

      if (existing) {
        await existing.focus()
        if ('navigate' in existing) await existing.navigate(url)
      } else {
        await self.clients.openWindow(url)
      }
    })(),
  )
})

importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js')

// The config comes from the URL this file was registered with (see src/firebase.ts),
// so no keys are written in this file.
const params = new URL(self.location.href).searchParams

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
})

firebase.messaging()