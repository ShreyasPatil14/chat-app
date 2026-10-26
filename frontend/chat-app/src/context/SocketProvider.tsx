import { useEffect, useState, type ReactNode } from 'react'
import { Client } from '@stomp/stompjs'
import { SocketContext } from './SocketContext'
import { useAuth } from '../hooks/useAuth'

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) return

    const stomp = new Client({
      brokerURL: import.meta.env.VITE_API_URL.replace(/^http/, 'ws') + '/ws',
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onWebSocketClose: () => setConnected(false),
      onStompError: (frame) => console.error('STOMP error:', frame.headers['message']),
    })

    stomp.activate()
    setClient(stomp)

    return () => {
      stomp.deactivate()
      setClient(null)
      setConnected(false)
    }
  }, [token])

  return (
    <SocketContext.Provider value={{ client, connected }}>
      {children}
    </SocketContext.Provider>
  )
}