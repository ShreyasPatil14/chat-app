import { useEffect, useState } from 'react'
import ChatListItem from '../components/ChatListItem'
import { getMyChats } from '../api/chats'
import { getErrorMessage } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import type { ChatSummary } from '../types/chat'

export default function ChatList() {
  const [chats, setChats] = useState<ChatSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { logout } = useAuth()

  useEffect(() => {
    getMyChats()
      .then((data) => setChats(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...chats].sort(
    (a, b) =>
      (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0) -
      (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0),
  )

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-blue-600">ChatApp</h1>
        <button onClick={logout} className="text-sm text-gray-600">
          Log out
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading && <p className="p-4 text-center text-gray-500">Loading...</p>}
        {error && <p className="p-4 text-center text-red-600">{error}</p>}
        {!loading && !error && sorted.length === 0 && (
          <p className="p-4 text-center text-gray-500">No chats yet. Start a new one.</p>
        )}
        {sorted.map((chat) => (
          <ChatListItem key={chat.id} chat={chat} />
        ))}
      </div>
    </div>
  )
}