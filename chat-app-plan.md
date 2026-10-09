# Chat App Plan

Stack: Spring Boot (Maven, Java 17) backend, React TS (Vite) frontend, MySQL (Workbench)
Scope (v1): text messaging only, no file sharing
Project folder: ~/Desktop/chat-app (backend in chat-app/backend)

## 1. Features

- Register and login with username and password, secured with JWT
- One-to-one chats and group chats (create group, add/remove members)
- Text messages only
- Every message is saved in the database
- Online users get messages instantly over WebSocket
- Offline users get a push notification (FCM) and receive missed messages when they reconnect
- Online/offline status for each user

## 2. Database

**users**: id, username (unique), password (BCrypt hash), last_seen, created_at

**device_tokens**: id, user_id, fcm_token (unique), created_at

**chats**: id, type (DIRECT / GROUP), name (null for direct), created_by, created_at

**chat_members** (one row per member): id, chat_id, user_id, role (ADMIN / MEMBER), joined_at, last_delivered_message_id, last_read_message_id. Unique (chat_id, user_id)

**messages**: id (auto-increment, unique across the table), chat_id, sender_id, content, created_at. Index on (chat_id, id)

Rules:
- Messages are stored once, inside a chat. Not per user.
- A direct chat is a chat with 2 members. A group is a chat with many.
- Client sends only chat_id and content. Sender comes from the JWT, created_at is set by the server.
- Save the message first, then deliver it.
- Offline sync: messages in the chat with id > last_delivered_message_id.
- Read status is tracked with last_read_message_id (no per-message status table).
- History is loaded in pages (latest 30, older ones when scrolling up).

## 3. REST API

Auth (public)
- POST /api/auth/register
- POST /api/auth/login (returns JWT)

Chats (JWT)
- GET /api/chats (my chat list with last message)
- POST /api/chats/direct (start or get a one-to-one chat)
- POST /api/chats/group (create a group)
- POST /api/chats/{id}/members (add member, admin only)
- DELETE /api/chats/{id}/members/{userId} (remove or leave)

Messages (JWT)
- GET /api/chats/{id}/messages?before={messageId}&limit=30
- GET /api/messages/sync (missed messages since last_delivered_message_id)

Users and devices (JWT)
- GET /api/users?search=
- POST /api/devices (save FCM token)

## 4. WebSocket (STOMP)

- Endpoint: /ws, client sends JWT on connect, invalid token is rejected

Client sends:
- /app/chat.send {chatId, content}
- /app/chat.delivered {chatId, messageId}
- /app/chat.read {chatId, messageId}

Client receives (per-user queues):
- /user/queue/messages
- /user/queue/receipts
- /user/queue/presence

On chat.send:
1. Get sender from JWT
2. Check sender is a member of the chat
3. Save message with server timestamp
4. Send to every online member
5. Send FCM push to members with no active session

Presence:
- Connect: mark user online
- Last session disconnects: save last_seen, mark offline

## 5. Authentication and security

- Passwords hashed with BCrypt
- Login returns a signed JWT (userId, username, ~24h expiry), no refresh token for now
- Spring Security stateless, JWT filter reads Authorization: Bearer <token>
- /api/auth/** and /ws are public, everything else needs a valid token
- WebSocket: JWT validated by a channel interceptor on STOMP CONNECT
- JWT secret in application.properties, never in code
- CORS allows http://localhost:5173

## 6. Push notifications (FCM)

- Firebase project, service account JSON kept outside the code (path in application.properties)
- Firebase Admin SDK for Java on the backend
- React app gets the FCM token after login and sends it to POST /api/devices
- Push goes to all device tokens of members with no active WebSocket session
- Payload: sender name, chat name, short preview, chatId
- No push for your own messages, none for connected users
- Invalid tokens are deleted when FCM reports them
- Web: firebase-messaging-sw.js service worker and a VAPID key

## 7. Backend structure (com.chatapp.chat_app)

- model: User, Chat, ChatMember, Message, DeviceToken
- repository: one Spring Data JPA interface per entity
- dto: request and response objects
- service: AuthService, ChatService, MessageService, PresenceService, PushService
- controller: REST controllers
- websocket: STOMP controller, session and presence listeners, JWT channel interceptor
- security: JWT util, JWT filter, security config
- config: WebSocket, CORS, Firebase
- exception: global error handler

Rule: controllers call services, services call repositories.

## 8. Build order

Status: [x] done, [ ] to do

- [x] Environment: Java 17, Maven, MySQL, Workbench, Spring Boot project connected to chatdb
- [ ] 1. Entities and repositories, check tables in Workbench
- [ ] 2. Auth: register and login (BCrypt + JWT), test in Postman
- [ ] 3. Security: JWT filter and config
- [ ] 4. Chat REST APIs
- [ ] 5. Message history and sync APIs
- [ ] 6. WebSocket: connect with JWT, send message, delivered and read receipts
- [ ] 7. Presence: online/offline and last_seen
- [ ] 8. FCM push
- [ ] 9. React frontend
