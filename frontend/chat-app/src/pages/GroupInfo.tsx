import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { getMembers, removeMember } from '../api/chats'
import { getErrorMessage } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import { formatChatTime, getAvatarColor, getInitials } from '../utils/chat'
import type { ChatMember, ChatSummary, PresenceUpdate } from '../types/chat'

export default function GroupInfo() {
  const { chatId } = useParams()
  const chat = useLocation().state?.chat as ChatSummary | undefined
  const navigate = useNavigate()
  const { user } = useAuth()
  const { client, connected } = useSocket()
  const [members, setMembers] = useState<ChatMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [leaving, setLeaving] = useState(false)

  const groupName = chat?.name ?? 'Group'

  useEffect(() => {
    getMembers(Number(chatId))
      .then((data) => setMembers(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [chatId])

  useEffect(() => {
    if (!client || !connected) return

    const sub = client.subscribe('/user/queue/presence', (frame) => {
      const p: PresenceUpdate = JSON.parse(frame.body)
      setMembers((prev) =>
        prev.map((m) => (m.id === p.userId ? { ...m, online: p.online, lastSeen: p.lastSeen } : m)),
      )
    })

    return () => sub.unsubscribe()
  }, [client, connected])

  const handleLeave = async () => {
    if (!user || leaving) return
    if (!window.confirm('Leave this group?')) return

    setLeaving(true)
    setError('')
    try {
      await removeMember(Number(chatId), user.userId)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setLeaving(false)
    }
  }

  const statusOf = (m: ChatMember) => {
    if (m.id === user?.userId) return 'You'
    if (m.online) return 'online'
    if (m.lastSeen) return `last seen ${formatChatTime(m.lastSeen)}`
    return ''
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 border-b">
        <button onClick={() => navigate(-1)} className="text-xl text-gray-600">
          &larr;
        </button>
        <h1 className="text-lg font-medium">Group info</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center py-6 border-b">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-semibold ${getAvatarColor(groupName)}`}
          >
            {getInitials(groupName)}
          </div>
          <h2 className="mt-3 text-xl font-bold">{groupName}</h2>
          <p className="text-sm text-gray-500">{members.length} members</p>
        </div>

        {loading && <p className="p-4 text-center text-gray-500">Loading...</p>}
        {error && <p className="p-4 text-center text-red-600">{error}</p>}

        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={m.username} online={m.online} />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{m.username}</p>
              <p className="text-sm text-gray-500">{statusOf(m)}</p>
            </div>
            {m.role === 'ADMIN' && (
              <span className="text-xs text-blue-600 border border-blue-600 rounded px-1.5 py-0.5">
                Admin
              </span>
            )}
          </div>
        ))}

        <div className="p-4">
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="w-full border border-red-600 text-red-600 rounded-lg py-2 font-medium hover:bg-red-50 disabled:opacity-50"
          >
            {leaving ? 'Leaving...' : 'Leave group'}
          </button>
        </div>
      </div>
    </div>
  )
}