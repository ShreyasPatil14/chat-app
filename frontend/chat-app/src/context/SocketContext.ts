import { createContext } from 'react'
import type { Client } from '@stomp/stompjs'

export interface SocketContextValue {
  client: Client | null
  connected: boolean
}

export const SocketContext = createContext<SocketContextValue>({
  client: null,
  connected: false,
})