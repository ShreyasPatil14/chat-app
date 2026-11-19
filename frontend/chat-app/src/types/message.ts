export interface Message {
  id: number
  chatId: number
  senderId: number
  senderUsername: string
  content: string
  createdAt: string
  clientId?: string | null
}

export interface PendingMessage {
  clientId: string
  chatId: number
  content: string
  createdAt: string
  status: 'sending' | 'failed'
}