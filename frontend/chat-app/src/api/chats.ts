import { api } from './axios'
import type { ChatResponse, ChatSummary } from '../types/chat'

export const getMyChats = () =>
  api.get<ChatSummary[]>('/api/chats').then((res) => res.data)

export const createDirectChat = (userId: number) =>
  api.post<ChatResponse>('/api/chats/direct', { userId }).then((res) => res.data)