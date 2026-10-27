import { api } from './axios'
import type { UserResponse } from '../types/user'

export const searchUsers = (username: string) =>
  api
    .get<UserResponse[]>('/api/users/search', { params: { username } })
    .then((res) => res.data)