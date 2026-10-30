import { useEffect, useState, useRef } from 'react'
import ChatListItem from '../components/ChatListItem'
import { getMyChats } from '../api/chats'
import { getErrorMessage } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import type { ChatSummary, PresenceUpdate } from '../types/chat'
import { useSocket } from '../hooks/useSocket'
import type { Message } from '../types/message'
import { useNavigate } from 'react-router-dom'

export default function ChatList() {
  const [chats, setChats] = useState<ChatSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { client, connected } = useSocket()
  const chatsRef = useRef<ChatSummary[]>([])
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    chatsRef.current = chats
  }, [chats])

  useEffect(() => {
    getMyChats()
      .then((data) => setChats(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!client || !connected) return

    const messageSub = client.subscribe('/user/queue/messages', (frame) => {
      const msg: Message = JSON.parse(frame.body)

      if (!chatsRef.current.some((c) => c.id === msg.chatId)) {
        getMyChats().then(setChats)
        return
      }

      setChats((prev) =>
        prev.map((c) =>
          c.id === msg.chatId
            ? {
              ...c,
              lastMessage: msg.content,
              lastMessageSender: msg.senderUsername,
              lastMessageAt: msg.createdAt,
              unreadCount: msg.senderId === user?.userId ? c.unreadCount : c.unreadCount + 1,
            }
            : c,
        ),
      )
    })

    const presenceSub = client.subscribe('/user/queue/presence', (frame) => {
      const p: PresenceUpdate = JSON.parse(frame.body)
      setChats((prev) =>
        prev.map((c) =>
          c.otherUserId === p.userId ? { ...c, online: p.online, lastSeen: p.lastSeen } : c,
        ),
      )
    })

    return () => {
      messageSub.unsubscribe()
      presenceSub.unsubscribe()
    }
  }, [client, connected, user?.userId])

  const sorted = [...chats].sort(
    (a, b) =>
      (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0) -
      (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0),
  )

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-blue-600 gradient-text">ChatApp</h1>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="max-w-40 truncate text-lg font-medium text-gray-700 cursor-pointer"
          >
            {user?.username} &#9662;
          </button>
          {userMenuOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full z-10 bg-white rounded-sm shadow-lg border-none overflow-hidden">
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    logout()
                  }}
                  className="block w-full whitespace-nowrap text-left px-2 py-1 text-red-600 hover:bg-gray-100 cursor-pointer"
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
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
      {menuOpen && <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2">
        {menuOpen && (
          <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
            <button
              onClick={() => navigate('/new-chat')}
              className="block w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              New chat
            </button>
            <button
              onClick={() => navigate('/new-group')}
              className="block w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              New group
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="New chat or group"
          className="w-14 h-14 rounded-full bg-blue-600 text-white text-3xl shadow-lg hover:bg-blue-700"
        >
          +
        </button>
      </div>
    </div>
  )
}