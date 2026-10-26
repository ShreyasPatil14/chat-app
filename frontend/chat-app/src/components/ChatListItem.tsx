import Avatar from './Avatar'
import { formatChatTime } from '../utils/chat'
import type { ChatSummary } from '../types/chat'
import { useNavigate } from 'react-router-dom'

export default function ChatListItem({ chat }: { chat: ChatSummary }) {
  const showOnline = chat.type === 'DIRECT' && chat.online
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/chats/${chat.id}`, { state: { chat } })}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100"
    >
      <Avatar name={chat.name} online={showOnline} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-medium truncate">{chat.name}</p>
          <span className="text-xs text-gray-500 shrink-0">{formatChatTime(chat.lastMessageAt)}</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{chat.lastMessage ?? 'No messages yet'}</p>
      </div>
    </button>
  )
}