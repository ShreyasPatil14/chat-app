import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { getErrorMessage } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import type { ChatSummary, PresenceUpdate } from '../types/chat'
import type { Message } from '../types/message'
import { useSocket } from '../hooks/useSocket'
import { deleteChat, getMembers, getMyChats } from '../api/chats'
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type SyntheticEvent } from 'react'
import { getMessages, PAGE_SIZE } from '../api/messages'
import { formatChatTime, formatDayLabel, formatMessageTime, getDayKey } from '../utils/chat'

export default function ChatWindow() {
    const { chatId } = useParams()
    const stateChat = useLocation().state?.chat as ChatSummary | undefined
    const [fetchedChat, setFetchedChat] = useState<ChatSummary | undefined>()
    const chat = stateChat ?? fetchedChat
    const navigate = useNavigate()
    const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { client, connected } = useSocket()
    const [text, setText] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)
    const lastReadSent = useRef(0)
    const [visible, setVisible] = useState(document.visibilityState === 'visible')
    const otherUserId = chat?.otherUserId
    const [online, setOnline] = useState(chat?.online ?? false)
    const [lastSeen, setLastSeen] = useState(chat?.lastSeen ?? null)
    const [memberCount, setMemberCount] = useState<number | null>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loadingOlder, setLoadingOlder] = useState(false)
    const prevScrollHeight = useRef<number | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        const onChange = () => setVisible(document.visibilityState === 'visible')
        document.addEventListener('visibilitychange', onChange)
        return () => document.removeEventListener('visibilitychange', onChange)
    }, [])

    useEffect(() => {
        if (!client || !connected || !visible || messages.length === 0) return

        const latestId = messages[messages.length - 1].id
        if (latestId <= lastReadSent.current) return

        lastReadSent.current = latestId
        client.publish({
            destination: '/app/chat.read',
            body: JSON.stringify({ chatId: Number(chatId), messageId: latestId }),
        })
    }, [client, connected, visible, messages, chatId])

    useEffect(() => {
        getMessages(Number(chatId))
            .then((data) => {
                setMessages([...data].sort((a, b) => a.id - b.id))
                setHasMore(data.length >= PAGE_SIZE)
            })
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false))
    }, [chatId])

    const loadOlder = () => {
        if (loadingOlder || !hasMore || messages.length === 0) return

        setLoadingOlder(true)
        getMessages(Number(chatId), messages[0].id)
            .then((data) => {
                prevScrollHeight.current = listRef.current?.scrollHeight ?? null
                setMessages((prev) => {
                    const known = new Set(prev.map((m) => m.id))
                    const older = data.filter((m) => !known.has(m.id))
                    return [...older, ...prev].sort((a, b) => a.id - b.id)
                })
                setHasMore(data.length >= PAGE_SIZE)
            })
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoadingOlder(false))
    }

    useLayoutEffect(() => {
        const list = listRef.current
        if (!list) return

        if (prevScrollHeight.current !== null) {
            list.scrollTop += list.scrollHeight - prevScrollHeight.current
            prevScrollHeight.current = null
        } else {
            bottomRef.current?.scrollIntoView()
        }
    }, [messages])

    useEffect(() => {
        if (!client || !connected) return

        const sub = client.subscribe('/user/queue/messages', (frame) => {
            const msg: Message = JSON.parse(frame.body)
            if (msg.chatId !== Number(chatId)) return
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        })

        return () => sub.unsubscribe()
    }, [client, connected, chatId])

    useEffect(() => {
        if (!client || !connected || !otherUserId) return

        const sub = client.subscribe('/user/queue/presence', (frame) => {
            const p: PresenceUpdate = JSON.parse(frame.body)
            if (p.userId !== otherUserId) return
            setOnline(p.online)
            setLastSeen(p.lastSeen)
        })

        return () => sub.unsubscribe()
    }, [client, connected, otherUserId])

    useEffect(() => {
        if (chat?.type !== 'GROUP') return
        getMembers(Number(chatId))
            .then((data) => setMemberCount(data.length))
            .catch(() => { })
    }, [chatId, chat?.type])

    useEffect(() => {
        if (stateChat) return

        getMyChats()
            .then((list) => {
                const found = list.find((c) => c.id === Number(chatId))
                setFetchedChat(found)
                if (found) {
                    setOnline(found.online)
                    setLastSeen(found.lastSeen)
                }
            })
            .catch(() => { })
    }, [stateChat, chatId])

    const handleSend = (e: SyntheticEvent) => {
        e.preventDefault()
        const content = text.trim()
        if (!content || !client || !connected) return

        client.publish({
            destination: '/app/chat.send',
            body: JSON.stringify({ chatId: Number(chatId), content }),
        })
        setText('')
    }

    const handleDelete = async () => {
        setMenuOpen(false)
        if (deleting) return
        if (!window.confirm('Delete this chat? Messages will be removed for you only.')) return

        setDeleting(true)
        try {
            await deleteChat(Number(chatId))
            navigate('/', { replace: true })
        } catch (err) {
            setError(getErrorMessage(err))
            setDeleting(false)
        }
    }

    const name = chat?.name ?? 'Chat'
    const isGroup = chat?.type === 'GROUP'

    let status = ''
    if (chat?.type === 'DIRECT') {
        if (online) status = 'online'
        else if (lastSeen) status = `last seen ${formatChatTime(lastSeen)}`
    }
    if (chat?.type === 'GROUP' && memberCount !== null) {
        status = `${memberCount} members`
    }

    return (
        <div className="h-screen flex flex-col">
            <header className="flex items-center gap-3 px-4 py-3 border-b">
                <button onClick={() => navigate('/')} className="text-xl text-gray-600">
                    &larr;
                </button>
                <button
                    onClick={() => navigate(`/chats/${chatId}/info`, { state: { chat } })}
                    disabled={!isGroup}
                    className={`flex items-center gap-3 min-w-0 text-left ${isGroup ? 'cursor-pointer' : 'cursor-default'}`}
                >
                    <Avatar name={name} />
                    <div className="min-w-0">
                        <p className="font-medium truncate">{name}</p>
                        {status && <p className="text-xs text-gray-500">{status}</p>}
                    </div>
                </button>
                {chat?.type === 'DIRECT' && (
                    <div className="relative ml-auto">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Menu"
                            className="px-2 text-xl text-gray-600 cursor-pointer"
                        >
                            &#8942;
                        </button>
                        {menuOpen && (
                            <>
                                <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                                <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-lg shadow-lg border overflow-hidden">
                                    <button
                                        onClick={handleDelete}
                                        className="block w-full whitespace-nowrap text-left px-4 py-3 text-red-600 hover:bg-gray-100 cursor-pointer"
                                    >
                                        Delete chat
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </header>

            <div
                ref={listRef}
                onScroll={(e) => {
                    if (e.currentTarget.scrollTop < 80) loadOlder()
                }}
                className="flex-1 overflow-y-auto bg-gray-100 p-4 space-y-2 [overflow-anchor:none]"
            >
                {loading && <p className="text-center text-gray-500">Loading...</p>}
                {error && <p className="text-center text-red-600">{error}</p>}
                {!loading && !error && messages.length === 0 && (
                    <p className="text-center text-gray-500">No messages yet. Say hi.</p>
                )}

                {messages.map((m, i) => {
                    const mine = m.senderId === user?.userId
                    const showDay = i === 0 || getDayKey(messages[i - 1].createdAt) !== getDayKey(m.createdAt)
                    return (
                        <Fragment key={m.id}>
                            {showDay && (
                                <div className="flex justify-center py-2">
                                    <span className="bg-white text-gray-500 text-xs rounded-full px-3 py-1 shadow-sm">
                                        {formatDayLabel(m.createdAt)}
                                    </span>
                                </div>
                            )}
                            <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] rounded-lg px-3 py-2 ${mine ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'
                                        }`}
                                >
                                    {isGroup && !mine && (
                                        <p className="text-xs font-semibold text-blue-600">{m.senderUsername}</p>
                                    )}
                                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                                    <p className={`mt-1 text-right text-[10px] ${mine ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {formatMessageTime(m.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </Fragment>
                    )
                })}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="flex items-end gap-2 border-t p-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            e.currentTarget.form?.requestSubmit()
                        }
                    }}
                    rows={1}
                    maxLength={2000}
                    placeholder="Type a message"
                    className="flex-1 resize-none field-sizing-content max-h-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={!text.trim() || !connected}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    )
}
