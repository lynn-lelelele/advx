/**
 * Echo WebSocket 服务
 * 协议：
 *   连接  wss://.../ws/chat?token={token}
 *   发送  {"type":"message","content":"..."}
 *   接收  {"type":"start"} / {"type":"chunk","content":"..."} / {"type":"end"}
 *   心跳  {"type":"ping"} → {"type":"pong"}
 */

const WS_BASE = 'ws://127.0.0.1:8000/ws/chat'

export interface WsConnectParams {
  token: string
}

/** 流式回调 */
export interface StreamHandlers {
  onStart?: () => void
  onChunk?: (content: string) => void
  onEnd?: () => void
  onSent?: (data: any) => void
  onMatch?: (data: any) => void
  onApprove?: (data: any) => void
  onInfo?: (data: any) => void
  onExited?: (data: any) => void
}

type RawHandler = (data: any) => void

let socketTask: UniApp.SocketTask | null = null
let isConnected = false
let rawHandlers: RawHandler[] = []
let streamHandlers: StreamHandlers = {}
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let connectParams: WsConnectParams | null = null
let isIntentionalClose = false

/** 建立 WebSocket 连接 */
export function connectWebSocket(params: WsConnectParams): Promise<void> {
  isIntentionalClose = false
  connectParams = params
  const url = `${WS_BASE}?token=${encodeURIComponent(params.token)}`

  return new Promise((resolve, reject) => {
    if (socketTask && isConnected) {
      resolve()
      return
    }

    socketTask = uni.connectSocket({
      url,
      complete: () => {},
    })

    socketTask.onOpen(() => {
      isConnected = true
      clearReconnectTimer()
      startHeartbeat()
      resolve()
    })

    socketTask.onMessage((res) => {
      let data: any
      try {
        data = JSON.parse(res.data as string)
      } catch {
        data = res.data
      }
      handleMessage(data)
    })

    socketTask.onClose(() => {
      isConnected = false
      socketTask = null
      stopHeartbeat()
      if (!isIntentionalClose) {
        scheduleReconnect()
      }
      isIntentionalClose = false
    })

    socketTask.onError(() => {
      isConnected = false
      reject(new Error('WebSocket connection failed'))
    })
  })
}

/** 处理收到的消息 */
function handleMessage(data: any): void {
  // 心跳 pong 忽略
  if (data?.type === 'pong') return

  // 消息发送确认
  if (data?.type === 'sent') {
    streamHandlers.onSent?.(data)
    return
  }

  // 匹配结果
  if (data?.type === 'matched') {
    streamHandlers.onMatch?.(data)
    return
  }

  // 审批结果
  if (data?.type === 'approve' || data?.type === 'getApprove') {
    streamHandlers.onApprove?.(data)
    return
  }

  // 聊天基本信息
  if (data?.type === 'info') {
    streamHandlers.onInfo?.(data)
    return
  }

  // 对方退出聊天室
  if (data?.type === 'exited') {
    streamHandlers.onExited?.(data)
    return
  }

  // 流式事件
  if (data?.type === 'start') {
    streamHandlers.onStart?.()
  } else if (data?.type === 'chunk') {
    streamHandlers.onChunk?.(data.content ?? '')
  } else if (data?.type === 'end') {
    streamHandlers.onEnd?.()
  } else if (data?.type === 'message' || data?.content) {
    // 兆底：后端直接返回完整消息（非流式）
    streamHandlers.onStart?.()
    streamHandlers.onChunk?.(data.content ?? '')
    streamHandlers.onEnd?.()
  }

  // 原始消息分发（给其他监听者）
  rawHandlers.forEach((h) => h(data))
}

/** 发送文本消息 */
export function sendWebSocketMessage(content: string): void {
  if (!socketTask || !isConnected) {
    console.warn('[WebSocket] not connected, message dropped:', content)
    return
  }
  const payload = JSON.stringify({ type: 'message', content })
  socketTask.send({ data: payload })
}

/** 发送音频消息（base64） */
export function sendAudioMessage(base64Data: string): void {
  if (!socketTask || !isConnected) {
    console.warn('[WebSocket] not connected, audio dropped')
    return
  }
  const payload = JSON.stringify({ type: 'audio', data: base64Data })
  socketTask.send({ data: payload })
}

/** 发送匹配查询请求 */
export function sendGetMatch(): void {
  if (!socketTask || !isConnected) {
    console.warn('[WebSocket] not connected, getMatch dropped')
    return
  }
  const payload = JSON.stringify({ type: 'getMatch', test: true })
  socketTask.send({ data: payload })
}

/** 发送同意加入聊天室 */
export function sendApprove(): void {
  if (!socketTask || !isConnected) {
    console.warn('[WebSocket] not connected, approve dropped')
    return
  }
  const payload = JSON.stringify({ type: 'approve' })
  socketTask.send({ data: payload })
}

/** 检测聊天室是否可用（可用则直接建立） */
export function sendGetApprove(): void {
  if (!socketTask || !isConnected) {
    console.warn('[WebSocket] not connected, getApprove dropped')
    return
  }
  const payload = JSON.stringify({ type: 'getApprove' })
  socketTask.send({ data: payload })
}

/** 发送拒绝匹配请求 */
export function sendReject(): void {
  if (!socketTask || !isConnected) {
    console.warn('[WebSocket] not connected, reject dropped')
    return
  }
  const payload = JSON.stringify({ type: 'reject' })
  socketTask.send({ data: payload })
}

/** 获取聊天基本信息 */
export function sendInfo(): void {
  if (!socketTask || !isConnected) {
    console.warn('[WebSocket] not connected, info dropped')
    return
  }
  const payload = JSON.stringify({ type: 'info' })
  socketTask.send({ data: payload })
}

/** 结束聊天 */
export function sendEnd(): void {
  if (!socketTask || !isConnected) {
    console.warn('[WebSocket] not connected, end dropped')
    return
  }
  const payload = JSON.stringify({ type: 'end' })
  socketTask.send({ data: payload })
}

/** 注册流式回调 */
export function setStreamHandlers(handlers: StreamHandlers): void {
  streamHandlers = handlers
}

/** 注册原始消息监听，返回取消函数 */
export function onWebSocketMessage(handler: RawHandler): () => void {
  rawHandlers.push(handler)
  return () => {
    rawHandlers = rawHandlers.filter((h) => h !== handler)
  }
}

/** 关闭连接 */
export function closeWebSocket(): void {
  clearReconnectTimer()
  stopHeartbeat()
  isIntentionalClose = true
  if (socketTask) {
    socketTask.close({})
    socketTask = null
  }
  isConnected = false
  rawHandlers = []
  streamHandlers = {}
  connectParams = null
}

/** 获取连接状态 */
export function isWebSocketConnected(): boolean {
  return isConnected
}

/* ---------- 心跳 ---------- */

function startHeartbeat(): void {
  stopHeartbeat()
  heartbeatTimer = setInterval(() => {
    if (socketTask && isConnected) {
      socketTask.send({ data: JSON.stringify({ type: 'ping' }) })
    }
  }, 30000)
}

function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

/* ---------- 断线重连 ---------- */

function scheduleReconnect(): void {
  if (reconnectTimer || !connectParams) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    if (connectParams) {
      connectWebSocket(connectParams).catch(() => {
        scheduleReconnect()
      })
    }
  }, 3000)
}

function clearReconnectTimer(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}
