/**
 * Echo Secret API
 * 彩蛋密码验证
 */

import { api } from './request'

export interface SecretResponse {
  success: boolean
  content: string
}

/**
 * 验证彩蛋密码
 * POST /api/secret
 */
export async function verifySecret(password: string): Promise<SecretResponse> {
  return api.post<SecretResponse>('/api/secret', { password })
}
