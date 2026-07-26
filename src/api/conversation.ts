/**
 * Echo Conversation API
 * 创建会话 / 结束会话
 */

import { api } from './request'

/**
 * 创建会话
 * POST /api/conversations?user_id={userId}
 * 返回 conversation_id
 */
export async function createConversation(userId: string): Promise<string> {
  const res = await api.post<{ id: string }>(
    `/api/conversations?user_id=${encodeURIComponent(userId)}`,
  )
  return res.id
}

export interface ConversationResult {
  match_score: number
  breakdown: Record<string, any>
  mirror: string
  icebreakers: string[]
}

/**
 * 结束会话，获取匹配结果
 * POST /api/conversations/{conversationId}/end?user_id={userId}
 * Header: X-Token (自动注入)
 */
export async function endConversation(
  conversationId: string,
  userId: string,
): Promise<ConversationResult> {
  return api.post<ConversationResult>(
    `/api/conversations/${conversationId}/end?user_id=${encodeURIComponent(userId)}`,
  )
}
