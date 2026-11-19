// Runs when a notification is clicked: open the chat it belongs to.
// It is registered first so it runs before Firebase's own click handling.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data;
  const chatId = data?.chatId ?? data?.FCM_MSG?.data?.chatId;
  const url = chatId ? `/chats/${chatId}` : "/";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existing = windows.find(
        (w) => new URL(w.url).origin === self.location.origin,
      );

      if (existing) {
        await existing.focus();
        existing.postMessage({ type: "OPEN_CHAT", url });
      } else {
        await self.clients.openWindow(url);
      }
    })(),
  );
});

importScripts(
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js",
);

// The config comes from the URL this file was registered with (see src/firebase.ts),
// so no keys are written in this file.
const params = new URL(self.location.href).searchParams;

firebase.initializeApp({
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
});

firebase.messaging();

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Old-style push: Firebase already draws it, so we must not draw a second one.
  if (payload.notification) return;

  const { title, body, chatId, messageId } = payload.data || {};

  return self.registration.showNotification(title || "ChatApp", {
    body: body || "",
    icon: "/pwa-192x192.png",
    badge: "/pwa-64x64.png",
    tag: `chat-${chatId}`,
    renotify: true,
    data: { chatId, messageId },
  });
});
