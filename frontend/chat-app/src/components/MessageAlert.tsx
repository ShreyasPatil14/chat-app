import { useNavigate } from 'react-router-dom'
import type { Message } from '../types/message'

export default function MessageAlert({
  alert,
  onClose,
}: {
  alert: Message | null
  onClose: () => void
}) {
  const navigate = useNavigate()
  if (!alert) return null

  return (
    <button
      type="button"
      onClick={() => {
        navigate(`/chats/${alert.chatId}`)
        onClose()
      }}
      className="fixed top-3 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 cursor-pointer rounded-xl bg-white px-4 py-3 text-left shadow-lg ring-1 ring-black/10"
    >
      <p className="text-sm font-semibold text-gray-900">{alert.senderUsername}</p>
      <p className="truncate text-sm text-gray-600">{alert.content}</p>
    </button>
  )
}