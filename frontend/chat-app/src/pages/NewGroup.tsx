import { useEffect, useState, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { useDebounce } from '../hooks/useDebounce'
import { searchUsers } from '../api/users'
import { createGroupChat } from '../api/chats'
import { getErrorMessage } from '../api/auth'
import type { ChatSummary } from '../types/chat'
import type { UserResponse } from '../types/user'

export default function NewGroup() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'members' | 'name'>('members')
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query.trim())
  const [results, setResults] = useState<UserResponse[]>([])
  const [searched, setSearched] = useState('')
  const [selected, setSelected] = useState<UserResponse[]>([])
  const [groupName, setGroupName] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

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

  const isSelected = (id: number) => selected.some((s) => s.id === id)

  const toggle = (u: UserResponse) =>
    setSelected((prev) => (isSelected(u.id) ? prev.filter((s) => s.id !== u.id) : [...prev, u]))

  const handleBack = () => {
    setError('')
    if (step === 'name') setStep('members')
    else navigate('/')
  }

  const handleCreate = async (e: SyntheticEvent) => {
    e.preventDefault()
    const name = groupName.trim()
    if (!name || creating) return

    setCreating(true)
    setError('')
    try {
      const created = await createGroupChat(name, selected.map((u) => u.id))
      const chat: ChatSummary = {
        id: created.id,
        type: created.type,
        name: created.name,
        lastMessage: null,
        lastMessageSender: null,
        lastMessageAt: null,
        otherUserId: null,
        online: false,
        lastSeen: null,
        unreadCount: 0,
      }
      navigate(`/chats/${created.id}`, { replace: true, state: { chat } })
    } catch (err) {
      setError(getErrorMessage(err))
      setCreating(false)
    }
  }

  const hasQuery = debounced !== ''
  const done = hasQuery && searched === debounced

  if (step === 'name') {
    return (
      <form onSubmit={handleCreate} className="h-screen flex flex-col">
        <header className="flex items-center gap-3 px-4 py-3 border-b">
          <button type="button" onClick={handleBack} className="text-xl text-gray-600">
            &larr;
          </button>
          <h1 className="flex-1 text-lg font-medium">Group name</h1>
          <button
            type="submit"
            disabled={!groupName.trim() || creating}
            className="text-blue-600 font-medium disabled:opacity-40"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </header>

        <div className="p-3 border-b">
          <input
            type="text"
            autoFocus
            maxLength={50}
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="px-4 py-2 text-sm text-gray-500">{selected.length} members</p>
          {selected.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={u.username} />
              <span className="font-medium">{u.username}</span>
            </div>
          ))}
        </div>
      </form>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 border-b">
        <button onClick={handleBack} className="text-xl text-gray-600">
          &larr;
        </button>
        <h1 className="flex-1 text-lg font-medium">New group</h1>
        <button
          onClick={() => setStep('name')}
          disabled={selected.length === 0}
          className="text-blue-600 font-medium disabled:opacity-40"
        >
          Next
        </button>
      </header>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border-b">
          {selected.map((u) => (
            <span
              key={u.id}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full pl-3 pr-2 py-1 text-sm"
            >
              {u.username}
              <button onClick={() => toggle(u)} aria-label={`Remove ${u.username}`} className="text-blue-600">
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

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
            <label
              key={u.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={isSelected(u.id)}
                onChange={() => toggle(u)}
                className="w-4 h-4"
              />
              <Avatar name={u.username} />
              <span className="font-medium">{u.username}</span>
            </label>
          ))}
      </div>
    </div>
  )
}