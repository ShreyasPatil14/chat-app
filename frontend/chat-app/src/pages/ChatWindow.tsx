import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { getMessages } from '../api/messages'
import { getErrorMessage } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { formatChatTime, formatMessageTime } from '../utils/chat'
import type { ChatSummary } from '../types/chat'
import type { Message } from '../types/message'
import { useSocket } from '../hooks/useSocket'

export default function ChatWindow() {
    const { chatId } = useParams()
    const chat = useLocation().state?.chat as ChatSummary | undefined
    const navigate = useNavigate()
    const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { client, connected } = useSocket()
    const [text, setText] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        getMessages(Number(chatId))
            .then((data) => setMessages([...data].sort((a, b) => a.id - b.id)))
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false))
    }, [chatId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView()
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

    const name = chat?.name ?? 'Chat'
    const isGroup = chat?.type === 'GROUP'

    let status = ''
    if (chat?.type === 'DIRECT') {
        if (chat.online) status = 'online'
        else if (chat.lastSeen) status = `last seen ${formatChatTime(chat.lastSeen)}`
    }

    return (
        <div className="h-screen flex flex-col">
            <header className="flex items-center gap-3 px-4 py-3 border-b">
                <button onClick={() => navigate('/')} className="text-xl text-gray-600">
                    &larr;
                </button>
                <Avatar name={name} />
                <div className="min-w-0">
                    <p className="font-medium truncate">{name}</p>
                    {status && <p className="text-xs text-gray-500">{status}</p>}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 space-y-2">
                {loading && <p className="text-center text-gray-500">Loading...</p>}
                {error && <p className="text-center text-red-600">{error}</p>}
                {!loading && !error && messages.length === 0 && (
                    <p className="text-center text-gray-500">No messages yet. Say hi.</p>
                )}

                {messages.map((m) => {
                    const mine = m.senderId === user?.userId
                    return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
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