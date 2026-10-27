import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { useDebounce } from '../hooks/useDebounce'
import { searchUsers } from '../api/users'
import { addMember, getMembers } from '../api/chats'
import { getErrorMessage } from '../api/auth'
import type { UserResponse } from '../types/user'

export default function AddMember() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query.trim())
  const [results, setResults] = useState<UserResponse[]>([])
  const [searched, setSearched] = useState('')
  const [memberIds, setMemberIds] = useState<number[]>([])
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    getMembers(Number(chatId))
      .then((data) => setMemberIds(data.map((m) => m.id)))
      .catch((err) => setError(getErrorMessage(err)))
  }, [chatId])

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

  const handleAdd = async (u: UserResponse) => {
    if (adding) return
    setAdding(true)
    setError('')
    try {
      await addMember(Number(chatId), u.id)
      navigate(-1)
    } catch (err) {
      setError(getErrorMessage(err))
      setAdding(false)
    }
  }

  const hasQuery = debounced !== ''
  const done = hasQuery && searched === debounced

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 border-b">
        <button onClick={() => navigate(-1)} className="text-xl text-gray-600 cursor-pointer">
          &larr;
        </button>
        <h1 className="text-lg font-medium">Add member</h1>
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
          results.map((u) => {
            const inGroup = memberIds.includes(u.id)
            return (
              <button
                key={u.id}
                onClick={() => handleAdd(u)}
                disabled={inGroup || adding}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-default"
              >
                <Avatar name={u.username} />
                <span className="flex-1 font-medium">{u.username}</span>
                {inGroup && <span className="text-sm text-gray-500">In group</span>}
              </button>
            )
          })}
      </div>
    </div>
  )
}