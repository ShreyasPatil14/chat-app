import { api } from './axios'
import type { ChatResponse, ChatSummary, ChatMember } from '../types/chat'

export const getMyChats = () =>
  api.get<ChatSummary[]>('/api/chats').then((res) => res.data)

export const createDirectChat = (userId: number) =>
  api.post<ChatResponse>('/api/chats/direct', { userId }).then((res) => res.data)

export const createGroupChat = (name: string, memberIds: number[]) =>
  api.post<ChatResponse>('/api/chats/group', { name, memberIds }).then((res) => res.data)

export const getMembers = (chatId: number) =>
  api.get<ChatMember[]>(`/api/chats/${chatId}/members`).then((res) => res.data)

export const removeMember = (chatId: number, userId: number) =>
  api.delete(`/api/chats/${chatId}/members/${userId}`)

export const addMember = (chatId: number, userId: number) =>
  api.post(`/api/chats/${chatId}/members`, { userId })