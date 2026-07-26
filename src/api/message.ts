/**
 * Echo Message API
 * 历史消息获取
 */

import { api } from './request'

export interface HistoryMessage {
  role: string
  content: string
  timestamp?: number
  duration?: number // 语音时长（秒）
  is_voice?: boolean
  audio_url?: string // 音频文件路径（不含域名）
}

export interface HistoryResponse {
  messages: HistoryMessage[]
  total: number
  page: number
  page_size: number
}

/**
 * 获取历史消息
 * POST /api/messages/history
 * @param page 页码
 * @param pageSize 每页条数
 * @param start 从末尾的第 n 条开始
 */
export async function fetchHistory(page: number, pageSize: number, start: number): Promise<HistoryResponse> {
  return api.post<HistoryResponse>('/api/messages/history', {
    page,
    page_size: pageSize,
    start,
  })
}
