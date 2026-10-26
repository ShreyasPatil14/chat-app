import { useEffect } from 'react'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'
import { syncMessages } from '../api/messages'
import type { Message } from '../types/message'

export function useDeliveryReceipts() {
  const { client, connected } = useSocket()
  const { user } = useAuth()

  useEffect(() => {
    if (!client || !connected || !user) return

    const sendDelivered = (chatId: number, messageId: number) => {
      if (!client.connected) return
      client.publish({
        destination: '/app/chat.delivered',
        body: JSON.stringify({ chatId, messageId }),
      })
    }

    syncMessages().then((missed) => {
      const latest = new Map<number, number>()
      for (const m of missed) {
        latest.set(m.chatId, Math.max(latest.get(m.chatId) ?? 0, m.id))
      }
      latest.forEach((messageId, chatId) => sendDelivered(chatId, messageId))
    })

    const sub = client.subscribe('/user/queue/messages', (frame) => {
      const msg: Message = JSON.parse(frame.body)
      if (msg.senderId !== user.userId) sendDelivered(msg.chatId, msg.id)
    })

    return () => sub.unsubscribe()
  }, [client, connected, user])
}
