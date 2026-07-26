
export async function sendToAI(
  _message: string,
  _history: { role: string; content: string }[],
): Promise<string> {
  // TODO: 调用 POST /api/chat
  // return api.post('/api/chat', { message, history }).then(res => res.data.reply)
  return 'Hello. World!'
}

/**
 * 请求 AI 提取用户画像
 */
export async function extractProfile(_messages: { role: string; content: string }[]): Promise<{
  mood: string
  moodEmoji: string
  tags: string[]
  summary: string
  style: string
}> {
  // TODO: 调用 POST /api/profile/extract
  // return api.post('/api/profile/extract', { messages }).then(res => res.data)
  throw new Error('API not implemented yet')
}

/**
 * 请求匹配另一个用户
 */
export async function requestMatch(_profileId: string): Promise<{
  matchId: string
  matchedUser: { id: string; profile: any }
}> {
  // TODO: 调用 POST /api/match
  throw new Error('API not implemented yet')
}
