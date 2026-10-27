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

export interface ChatMember {
  id: number
  username: string
  role: string
  online: boolean
  lastSeen: string | null
}
