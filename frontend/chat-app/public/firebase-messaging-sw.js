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

firebase.initializeApp({
  apiKey: 'AIzaSyDnoe6fsxFhrFSja6qNGQW7YUXhV_dooUw',
  authDomain: 'chat-app-f28a3.firebaseapp.com',
  projectId: 'chat-app-f28a3',
  messagingSenderId: '251641369364',
  appId: '1:251641369364:web:e63a68a89d9e14eb1ee801',
})

firebase.messaging()