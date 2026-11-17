import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'
import type { Message } from '../types/message'

export function useMessageAlerts() {
  const { client, connected } = useSocket()
  const { user } = useAuth()
  const { pathname } = useLocation()
  const pathRef = useRef(pathname)
  const [alert, setAlert] = useState<Message | null>(null)

  useEffect(() => {
    pathRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (!client || !connected || !user) return

    let timer: ReturnType<typeof setTimeout> | undefined

    const sub = client.subscribe('/user/queue/messages', (frame) => {
      const msg: Message = JSON.parse(frame.body)
      if (msg.senderId === user.userId) return

      const path = pathRef.current
      if (path === '/') return
      if (path === `/chats/${msg.chatId}` || path.startsWith(`/chats/${msg.chatId}/`)) return

      setAlert(msg)
      clearTimeout(timer)
      timer = setTimeout(() => setAlert(null), 4000)
    })

    return () => {
      sub.unsubscribe()
      clearTimeout(timer)
    }
  }, [client, connected, user])

  return { alert, dismiss: () => setAlert(null) }
}