# ChatApp

A real-time chat application with direct and group chats, online status, read receipts and push notifications. Installable as a PWA.

**Live demo:** https://the-chat-app.netlify.app

> The backend runs on a free instance, so the first request after a period of inactivity can take up to a minute while it wakes up.

## Features

- Register and login with JWT authentication (BCrypt password hashing)
- Direct (one-to-one) and group chats
- Real-time messaging over WebSocket (STOMP)
- Online status and last seen
- Unread message count on the chat list
- Push notifications (Firebase Cloud Messaging) when the receiver is offline
- Group management: create group, add member, remove member, leave group (admin only actions in the UI)
- Delete chat for yourself (the other user keeps their copy)
- Older messages load on scroll, with date separators
- User search to start a new chat or add group members
- Installable PWA with a splash screen
- Mobile-first layout: one screen at a time on phones, chat list and chat window side by side on desktop

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Spring Boot (Java 17), Spring Security, Spring Data JPA, WebSocket (STOMP) |
| Database | MySQL |
| Auth | JWT |
| Push | Firebase Cloud Messaging (firebase-admin) |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, @stomp/stompjs |
| PWA | vite-plugin-pwa |
| Hosting | Render (backend, Docker), Netlify (frontend), Aiven (MySQL) |

## Project Structure

```
chat-app/
├── backend/chat-app     # Spring Boot API and WebSocket server (Maven)
└── frontend/chat-app    # React + TypeScript + Vite app
```

## How It Works

- REST API for auth, chats, message history and device tokens
- STOMP over WebSocket for sending messages, delivered/read receipts and presence
- The sender is taken from the JWT, and the server assigns the message timestamp
- If the receiver has no open socket, the backend sends a push notification through FCM

## Running Locally

### Prerequisites

- Java 17
- Node.js and npm
- A MySQL database
- A Firebase project (Cloud Messaging enabled) with a service account key and a web app

### Backend

1. Go to `backend/chat-app`.
2. Add the Firebase service account key as `src/main/resources/firebase-service-account.json`. Do not commit it.
3. Set these properties in `src/main/resources/application.properties` (or as environment variables):

   | Property | Purpose |
   | --- | --- |
   | `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password` | MySQL connection |
   | `jwt.secret` | Secret used to sign JWTs |
   | `jwt.expiration-ms` | Token lifetime in milliseconds |
   | `app.allowed-origins` | Frontend origin(s) allowed by CORS and WebSocket |
   | `firebase.credentials-path` | Path to the service account key (default: `classpath:firebase-service-account.json`) |

4. Run:

   ```
   ./mvnw spring-boot:run
   ```

The server starts on port 8080 (or the `PORT` environment variable).

### Frontend

1. Go to `frontend/chat-app`.
2. Copy `example.env` to `.env` and fill in the values:

   ```
   VITE_API_URL=http://localhost:8080
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   VITE_FIREBASE_VAPID_KEY=
   ```

3. Install and run:

   ```
   npm install
   npm run dev
   ```

The app runs on http://localhost:5173. To test the PWA install, use `npm run build` and `npm run preview`.

## Deployment

- **Backend:** Docker image built on Render from `backend/chat-app` (two-stage Dockerfile), configured with environment variables and a secret file for the Firebase key
- **Frontend:** Netlify, base directory `frontend/chat-app`, publish directory `dist`, with the `VITE_*` variables set in the site settings
- **Database:** managed MySQL on Aiven

## Roadmap

- Message ticks (sent, delivered, read) on each message
- Edit and delete messages
- File sharing
