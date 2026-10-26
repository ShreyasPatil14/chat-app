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
  otherUserId: number | null
  online: boolean
  lastSeen: string | null
}