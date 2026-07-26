/**
 * Echo User API
 * 用户创建
 */

import { api } from './request'

export interface UserCredentials {
  /** 服务端返回的用户 ID */
  id: string
  token: string
}

/**
 * 创建用户
 * POST /api/users
 * @param userId 客户端生成的 user_id
 * @returns 服务端 id + token
 */
export async function createUser(userId: string): Promise<UserCredentials> {
  const res = await api.post<{ id: string; token: string }>('/api/users', {
    user_id: userId,
  })
  return {
    id: res.id,
    token: res.token,
  }
}

/**
 * 获取聊天信息（角色等）
 * GET /api/info
 * @returns character: 'ai' | 'user'
 */
export async function fetchInfo(): Promise<{ character: string; user_id: string }> {
  return api.get<{ character: string; user_id: string }>('/api/info')
}
