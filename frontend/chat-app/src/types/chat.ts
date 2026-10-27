export type ChatType = 'DIRECT' | 'GROUP'

export interface ChatResponse {
  id: number
  type: ChatType
  name: string
}

export interface ChatSummary {
  id: number
  type: ChatType
  name: string
  lastMessage: string | null
  lastMessageAt: string | null
  lastMessageSender: string | null
  otherUserId: number | null
  online: boolean
  lastSeen: string | null
  unreadCount: number
}

export interface PresenceUpdate {
  userId: number
  online: boolean
  lastSeen: string | null
}

