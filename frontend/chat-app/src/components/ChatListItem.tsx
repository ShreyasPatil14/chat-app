import Avatar from './Avatar'
import { formatChatTime } from '../utils/chat'
import type { ChatSummary } from '../types/chat'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ChatListItem({ chat }: { chat: ChatSummary }) {
  const showOnline = chat.type === 'DIRECT' && chat.online
  const { user } = useAuth()

  let preview = chat.lastMessage ?? 'No messages yet'
  if (chat.type === 'GROUP' && chat.lastMessage && chat.lastMessageSender) {
    const who = chat.lastMessageSender === user?.username ? 'You' : chat.lastMessageSender
    preview = `${who}: ${chat.lastMessage}`
  }

  const unread = chat.unreadCount > 0
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/chats/${chat.id}`, { state: { chat } })}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100"
    >
      <Avatar name={chat.name} online={showOnline} />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`truncate ${unread ? 'font-bold' : 'font-medium'}`}>{chat.name}</p>
          <span className={`text-xs shrink-0 ${unread ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            {formatChatTime(chat.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm truncate ${unread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
            {preview}
          </p>
          {unread && (
            <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}