import { api } from './axios'
import type { Message } from '../types/message'

export const getMessages = (chatId: number, before?: number, limit = 30) =>
  api
    .get<Message[]>(`/api/chats/${chatId}/messages`, { params: { before, limit } })
    .then((res) => res.data)