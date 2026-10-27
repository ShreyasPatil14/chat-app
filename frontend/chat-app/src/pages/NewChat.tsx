import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { useDebounce } from '../hooks/useDebounce'
import { searchUsers } from '../api/users'
import { createDirectChat, getMyChats } from '../api/chats'
import { getErrorMessage } from '../api/auth'
import type { UserResponse } from '../types/user'

export default function NewChat() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query.trim())
  const [results, setResults] = useState<UserResponse[]>([])
  const [searched, setSearched] = useState('')
  const [error, setError] = useState('')
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    if (!debounced) return
    let cancelled = false

    searchUsers(debounced)
      .then((data) => {
        if (cancelled) return
        setResults(data)
        setSearched(debounced)
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })

    return () => {
      cancelled = true
    }
  }, [debounced])

  const openChat = async (u: UserResponse) => {
    if (opening) return
    setOpening(true)
    try {
      const created = await createDirectChat(u.id)
      const chats = await getMyChats()
      const chat = chats.find((c) => c.id === created.id) ?? {
        id: created.id,
        type: created.type,
        name: created.name,
        lastMessage: null,
        lastMessageSender: null,
        lastMessageAt: null,
        otherUserId: u.id,
        online: false,
        lastSeen: null,
        unreadCount: 0,
      }
      navigate(`/chats/${created.id}`, { replace: true, state: { chat } })
    } catch (err) {
      setError(getErrorMessage(err))
      setOpening(false)
    }
  }

  const hasQuery = debounced !== ''
  const done = hasQuery && searched === debounced

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 border-b">
        <button onClick={() => navigate('/')} className="text-xl text-gray-600">
          &larr;
        </button>
        <h1 className="text-lg font-medium">New chat</h1>
      </header>

      <div className="p-3 border-b">
        <input
          type="text"
          autoFocus
          placeholder="Search by username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasQuery && <p className="p-4 text-center text-gray-500">Search for a username</p>}
        {error && <p className="p-4 text-center text-red-600">{error}</p>}
        {hasQuery && !done && !error && (
          <p className="p-4 text-center text-gray-500">Searching...</p>
        )}
        {done && results.length === 0 && (
          <p className="p-4 text-center text-gray-500">No user found</p>
        )}
        {hasQuery &&
          results.map((u) => (
            <button
              key={u.id}
              onClick={() => openChat(u)}
              disabled={opening}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 disabled:opacity-50"
            >
              <Avatar name={u.username} />
              <span className="font-medium">{u.username}</span>
            </button>
          ))}
      </div>
    </div>
  )
}