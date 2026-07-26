/**
 * Echo Chat Store
 * 管理 AI 对话状态、消息列表，通过 WebSocket 与后端通信（流式）
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useProfileStore } from './profile'
import {
  connectWebSocket,
  sendWebSocketMessage,
  sendAudioMessage,
  sendGetMatch,
  sendApprove,
  sendGetApprove,
  sendReject,
  setStreamHandlers,
  closeWebSocket,
  isWebSocketConnected,
} from '../api/websocket'
import { setToken } from '../api/request'
import { createUser, fetchInfo } from '../api/user'
import { fetchHistory } from '../api/message'

export interface Message {
  id: string
  role: string // user_id: 'user_xxx' 或 'ai_xxx'
  content: string
  timestamp: number
  isVoice?: boolean
  duration?: number // 语音时长（秒）
  audioUrl?: string // PCM 音频地址
}

// 触发画像提取的对话轮数
const PROFILE_TRIGGER_ROUNDS = 4

// 本地存储键名
const STORAGE_KEY_USER_ID = 'echo_user_id'
const STORAGE_KEY_TOKEN = 'echo_token'
const STORAGE_KEY_CLIENT_ID = 'echo_client_id'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isAiTyping = ref(false)
  const roundCount = ref(0)
  const profileExtracted = ref(false)
  const wsConnected = ref(false)
  const isLoadingHistory = ref(false)
  const hasMoreHistory = ref(true)
  const character = ref<'ai' | 'user' | null>(null)
  const currentUserId = ref<string>('')
  // 匹配状态
  const matchConversationId = ref<string | null>(null)
  const showMatchPrompt = ref(false)
  const matchDismissing = ref(false)
  const selfApproved = ref(false)
  const matchResolved = ref(false)

  // 监听 character 变化，切换场景时清空消息
  let lastCharacter: 'ai' | 'user' | null = null
  watch(character, (newChar: 'ai' | 'user' | null) => {
    if (newChar !== lastCharacter && lastCharacter !== null) {
      // 场景切换，清空消息
      console.log('[ChatStore] character changed from', lastCharacter, 'to', newChar, ', clearing messages')
      messages.value = []
      messageCount = 0
      hasMoreHistory.value = true
    }
    lastCharacter = newChar
  })

  let msgIdCounter = 0
  /** 消息计数器：跟踪已加载/发送的消息总数，用作 history 的 start 参数 */
  let messageCount = 0
  /** 当前正在流式接收的 AI 消息 ID */
  let streamingMsgId: string | null = null
  let responseTimer: ReturnType<typeof setTimeout> | null = null
  let matchPollingTimer: ReturnType<typeof setInterval> | null = null
  let approvePollingTimer: ReturnType<typeof setInterval> | null = null
  const PAGE_SIZE = 50

  function genId(): string {
    return `msg_${Date.now()}_${++msgIdCounter}`
  }

  /** 加载历史消息（支持分页） */
  async function loadHistory(prepend = false): Promise<void> {
    if (isLoadingHistory.value) return
    isLoadingHistory.value = true

    try {
      const start = prepend ? messageCount : 0
      // 带 10s 超时
      const history = await Promise.race([
        fetchHistory(1, PAGE_SIZE, start),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('fetchHistory timeout')), 10000)),
      ])
      console.log('[ChatStore] history start', start, ':', history)

      if (!history.messages || history.messages.length === 0) {
        hasMoreHistory.value = false
        return
      }

      const loaded: Message[] = history.messages
        .filter((m) => m.content || m.duration)
        .map((m) => ({
          id: genId(),
          role: m.role ?? '',
          content: m.content ?? '',
          timestamp: m.timestamp ?? Date.now(),
          isVoice: !!m.duration,
          duration: m.duration,
          audioUrl: m.audio_url || undefined,
        }))

      if (prepend) {
        // 加载更多：插入到前面
        messages.value = [...loaded, ...messages.value]
      } else {
        // 初始加载：直接赋值
        messages.value = loaded
        roundCount.value = loaded.filter((m) => m.role === 'user').length
      }

      // 更新计数器
      messageCount += history.messages.length

      // 判断是否还有更多
      if (history.messages.length < PAGE_SIZE) {
        hasMoreHistory.value = false
      }
    } catch (err) {
      console.warn('[ChatStore] load history failed:', err)
    } finally {
      isLoadingHistory.value = false
    }
  }

  /** 加载更多历史（向上滚动触发） */
  async function loadMoreHistory(): Promise<void> {
    if (!hasMoreHistory.value || isLoadingHistory.value) return
    await loadHistory(true)
  }

  /** 查询匹配的人（通过 WebSocket） */
  function checkMatch(): void {
    sendGetMatch()
  }

  /** 开始定期检测匹配 */
  function startMatchPolling(): void {
    stopMatchPolling()
    matchPollingTimer = setInterval(() => {
      // 已有匹配弹窗或正在关闭时不再检测
      if (showMatchPrompt.value || matchConversationId.value || matchDismissing.value) {
        stopMatchPolling()
        return
      }
      checkMatch()
    }, 1000) // 每 1 秒检测一次
  }

  /** 停止定期检测匹配 */
  function stopMatchPolling(): void {
    if (matchPollingTimer) {
      clearInterval(matchPollingTimer)
      matchPollingTimer = null
    }
  }

  /** 开始定期检测审批状态 */
  function startApprovePolling(): void {
    stopApprovePolling()
    matchResolved.value = false
    approvePollingTimer = setInterval(() => {
      // 收到 approved/rejected 后停止轮询
      if (matchResolved.value) {
        stopApprovePolling()
        return
      }
      sendGetApprove()
    }, 2000)
  }

  /** 停止定期检测审批状态 */
  function stopApprovePolling(): void {
    if (approvePollingTimer) {
      clearInterval(approvePollingTimer)
      approvePollingTimer = null
    }
  }

  /** 关闭匹配提示（带动画） */
  function dismissMatch(): void {
    matchDismissing.value = true
    stopApprovePolling()
    sendReject()
    setTimeout(() => {
      showMatchPrompt.value = false
      matchDismissing.value = false
      matchConversationId.value = null
      selfApproved.value = false
      matchResolved.value = true
      startMatchPolling()
    }, 300)
  }

  /** 加入聊天室 */
  function joinChatRoom(): void {
    if (!matchConversationId.value || selfApproved.value) return
    selfApproved.value = true
    sendApprove()
  }

  /** 进入聊天室：关闭连接，跳转到 Loading 页重新初始化 */
  function enterChatRoom(): void {
    console.log('[ChatStore] enterChatRoom: navigating to loading page')
    // 先停止所有轮询，防止在关闭连接期间发送额外请求
    stopMatchPolling()
    stopApprovePolling()
    // 关闭当前连接
    closeWebSocket()
    // 清空当前消息和状态
    messages.value = []
    matchConversationId.value = null
    showMatchPrompt.value = false
    selfApproved.value = false
    matchResolved.value = false
    // 跳转到 Loading 页，由它调用 initChat 并决定下一步去向
    uni.redirectTo({ url: '/pages/loading/loading' })
  }

  /** 打开 WebSocket 连接（由聊天页面调用） */
  async function openWebSocket(token: string): Promise<void> {
    await Promise.race([
      connectWebSocket({ token }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('WebSocket timeout')), 10000)),
    ])
    wsConnected.value = true
  }

  /** 注册流式回调（由聊天页面调用） */
  function registerStreamHandlers(): void {
    setStreamHandlers({
      onSent: (data: any) => {
        const msg: Message = {
          id: genId(),
          role: data.role ?? '',
          content: data.content ?? '',
          timestamp: Date.now(),
          isVoice: !!data.duration,
          duration: data.duration,
          audioUrl: data.audio_url || undefined,
        }
        messages.value.push(msg)
        messageCount++
      },
      onStart: () => {
        if (responseTimer) { clearTimeout(responseTimer); responseTimer = null }
        streamingMsgId = genId()
        messages.value.push({
          id: streamingMsgId,
          role: 'ai_default',
          content: '',
          timestamp: Date.now(),
        })
        isAiTyping.value = true
      },
      onChunk: (content: string) => {
        if (!streamingMsgId) return
        const msg = messages.value.find((m) => m.id === streamingMsgId)
        if (msg) {
          msg.content += content
        }
      },
      onEnd: () => {
        isAiTyping.value = false
        streamingMsgId = null

        if (roundCount.value >= PROFILE_TRIGGER_ROUNDS && !profileExtracted.value) {
          profileExtracted.value = true
          const profileStore = useProfileStore()
          profileStore.extractProfile(messages.value)
          profileStore.showModal = true
        }
      },
      onMatch: (data: any) => {
        console.log('[ChatStore] match response:', JSON.stringify(data))
        if (data?.conversation_id != null) {
          matchConversationId.value = data.conversation_id
          selfApproved.value = !!data?.self_approved
          showMatchPrompt.value = true
          stopMatchPolling()
          // 弹窗出现后立即开始轮询 approved
          startApprovePolling()
        }
      },
      onApprove: (data: any) => {
        console.log('[ChatStore] approve response:', JSON.stringify(data))
        const result = data?.result
        if (result === 'approved' || result === 'ok') {
          if (data?.conversation_id) {
            matchConversationId.value = data.conversation_id
          }
          matchResolved.value = true
          console.log('[ChatStore] approved, waiting 1s before navigating to loading')
          setTimeout(() => {
            enterChatRoom()
          }, 1000)
        } else if (result === 'no' || result === 'rejected') {
          // 对方拒绝，自动关闭弹窗
          showMatchPrompt.value = false
          matchConversationId.value = null
          selfApproved.value = false
          matchResolved.value = true
          startMatchPolling()
        }
      },
      onExited: (data: any) => {
        console.log('[ChatStore] exited:', JSON.stringify(data))
        enterChatRoom()
      },
    })
  }

  /** 初始化：创建用户 → HTTP 获取角色 → 跳转对应页面（WebSocket 由聊天页面自行打开） */
  async function initChat() {
    console.log('[ChatStore] initChat start')

    // 总体超时 30s
    const globalTimeout = setTimeout(() => {
      console.error('[ChatStore] initChat global timeout')
    }, 30000)

    try {
      // 1. 获取用户凭证（每次都调用 HTTP 接口）
      let clientId = uni.getStorageSync(STORAGE_KEY_CLIENT_ID) as string
      if (!clientId) {
        clientId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        uni.setStorageSync(STORAGE_KEY_CLIENT_ID, clientId)
      }
      console.log('[ChatStore] calling createUser with clientId:', clientId)
      const creds = await createUser(clientId)
      uni.setStorageSync(STORAGE_KEY_USER_ID, creds.id)
      uni.setStorageSync(STORAGE_KEY_TOKEN, creds.token)
      console.log('[ChatStore] user created, id:', creds.id)

      // 设置全局 Token
      setToken(creds.token)

      // 2. HTTP 获取角色（不再通过 WebSocket）
      try {
        const info = await Promise.race([
          fetchInfo(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('fetchInfo timeout')), 10000)),
        ])
        const ch = info?.character === 'user' ? 'user' : 'ai'
        character.value = ch
        if (info?.user_id) {
          currentUserId.value = info.user_id
        }
        console.log('[ChatStore] character:', ch, 'user_id:', currentUserId.value)
      } catch (err) {
        console.warn('[ChatStore] fetchInfo failed, defaulting to ai:', err)
        character.value = 'ai'
      }

      // 3. 根据角色跳转到对应聊天页面
      if (character.value === 'user') {
        uni.redirectTo({ url: '/pages/user-chat/user-chat' })
      } else {
        uni.redirectTo({ url: '/pages/ai-chat/ai-chat' })
      }

      clearTimeout(globalTimeout)
    } catch (err) {
      console.error('[ChatStore] initChat error:', err)
      clearTimeout(globalTimeout)
    }
  }

  /** 用户发送消息（通过 WebSocket） */
  async function sendMessage(content: string) {
    if (!content.trim() || isAiTyping.value) return

    if (!isWebSocketConnected()) {
      uni.showToast({ title: '连接已断开，请重试', icon: 'none' })
      return
    }

    // 不立即 push，等待服务器 sent 确认

    roundCount.value++
    isAiTyping.value = true

    // 超时保护：15s 无响应则重置
    if (responseTimer) clearTimeout(responseTimer)
    responseTimer = setTimeout(() => {
      if (isAiTyping.value && !streamingMsgId) {
        isAiTyping.value = false
        console.warn('[ChatStore] response timeout')
      }
    }, 15000)

    sendWebSocketMessage(content.trim())
  }

  /** 发送语音（base64 → WebSocket → 后端 ASR → AI → 流式返回文字） */
  async function sendAudio(base64Data: string, duration: number) {
    if (isAiTyping.value) return

    if (!isWebSocketConnected()) {
      uni.showToast({ title: '连接已断开，请重试', icon: 'none' })
      return
    }

    // 不立即 push，等待服务器 sent 确认

    roundCount.value++
    isAiTyping.value = true

    // 超时保护：20s（语音处理更慢）
    if (responseTimer) clearTimeout(responseTimer)
    responseTimer = setTimeout(() => {
      if (isAiTyping.value && !streamingMsgId) {
        isAiTyping.value = false
        console.warn('[ChatStore] audio response timeout')
      }
    }, 20000)

    sendAudioMessage(base64Data)
  }

  /** 清理资源 */
  function dispose() {
    closeWebSocket()
    stopMatchPolling()
    stopApprovePolling()
    wsConnected.value = false
    streamingMsgId = null
  }

  return {
    messages,
    isAiTyping,
    roundCount,
    profileExtracted,
    wsConnected,
    isLoadingHistory,
    hasMoreHistory,
    character,
    currentUserId,
    matchConversationId,
    showMatchPrompt,
    matchDismissing,
    selfApproved,
    initChat,
    openWebSocket,
    registerStreamHandlers,
    startMatchPolling,
    enterChatRoom,
    sendMessage,
    sendAudio,
    loadHistory,
    loadMoreHistory,
    dismissMatch,
    joinChatRoom,
    dispose,
  }
})
