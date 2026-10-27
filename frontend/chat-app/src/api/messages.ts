import { api } from "./axios";
import type { Message } from "../types/message";

export const PAGE_SIZE = 30
export const getMessages = (chatId: number, before?: number, limit = PAGE_SIZE) =>
  api
    .get<
      Message[]
    >(`/api/chats/${chatId}/messages`, { params: { before, limit } })
    .then((res) => res.data);

export const syncMessages = () =>
  api.get<Message[]>("/api/messages/sync").then((res) => res.data);

