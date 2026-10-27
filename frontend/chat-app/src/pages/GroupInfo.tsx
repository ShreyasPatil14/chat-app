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
  const [removingId, setRemovingId] = useState<number | null>(null)

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

  const isAdmin = members.some((m) => m.id === user?.userId && m.role === 'ADMIN')

  const handleRemove = async (m: ChatMember) => {
    if (removingId !== null) return
    if (!window.confirm(`Remove ${m.username} from the group?`)) return

    setRemovingId(m.id)
    setError('')
    try {
      await removeMember(Number(chatId), m.id)
      setMembers((prev) => prev.filter((x) => x.id !== m.id))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setRemovingId(null)
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

        {isAdmin && (
          <button
            onClick={() => navigate(`/chats/${chatId}/add-member`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 cursor-pointer"
          >
            <span className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 text-2xl flex items-center justify-center">
              +
            </span>
            <span className="font-medium text-blue-600">Add member</span>
          </button>
        )}

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
            {isAdmin && m.id !== user?.userId && (
              <button
                onClick={() => handleRemove(m)}
                disabled={removingId === m.id}
                className="text-sm text-red-600 cursor-pointer disabled:opacity-50"
              >
                {removingId === m.id ? 'Removing...' : 'Remove'}
              </button>
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