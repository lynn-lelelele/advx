/**
 * Echo Chat Store
 * 管理 AI 对话状态、消息列表、模拟 AI 回复
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProfileStore } from './profile'

export interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
}

// 模拟 AI 安慰话术池
const aiComforts = [
  '我能感受到你现在的情绪，这很正常，每个人都会有这样的时候。愿意多说一点吗？',
  '谢谢你愿意跟我分享这些。这些事情放在心里确实很重，说出来会好一些。',
  '我听到你的声音了。你已经在面对这些了，这本身就很有勇气。',
  '那种感觉我懂，就好像被困在一个房间里找不到出口。但其实门一直都在，只是你现在太累了看不清。',
  '你知道吗？你能意识到这些，已经比大多数人走得更远了。很多人甚至连面对的勇气都没有。',
  '先深呼吸一下。你现在是安全的，这里没有任何评判，只有倾听。',
]

// 触发画像提取的对话轮数
const PROFILE_TRIGGER_ROUNDS = 4

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isAiTyping = ref(false)
  const roundCount = ref(0) // 对话轮数计数
  const profileExtracted = ref(false)

  let msgIdCounter = 0

  function genId(): string {
    return `msg_${Date.now()}_${++msgIdCounter}`
  }

  /** 初始化：AI 主动开场 */
  function initChat() {
    if (messages.value.length > 0) return
    messages.value.push({
      id: genId(),
      role: 'ai',
      content: '嗨，我是 Echo。今天过得怎么样？有没有什么想跟我聊聊的？开心的、不开心的，都可以。',
      timestamp: Date.now(),
    })
  }

  /** 用户发送消息 */
  async function sendMessage(content: string) {
    if (!content.trim() || isAiTyping.value) return

    // 1. 添加用户消息
    messages.value.push({
      id: genId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    })

    roundCount.value++

    // 2. AI 开始"打字"
    isAiTyping.value = true

    await delay(800 + Math.random() * 1200)

    // 3. AI 回复
    const reply = pickReply(roundCount.value)
    messages.value.push({
      id: genId(),
      role: 'ai',
      content: reply,
      timestamp: Date.now(),
    })

    isAiTyping.value = false

    // 4. 达到轮数 → 触发画像提取弹窗
    if (roundCount.value >= PROFILE_TRIGGER_ROUNDS && !profileExtracted.value) {
      profileExtracted.value = true
      await delay(600)
      const profileStore = useProfileStore()
      profileStore.extractProfile(messages.value)
      profileStore.showModal = true
    }
  }

  /** 从话术池中选一条 AI 回复 */
  function pickReply(round: number): string {
    // 最后一轮触发弹窗前，给一个过渡语
    if (round === PROFILE_TRIGGER_ROUNDS) {
      return '嗯，我大概了解你的状态了。等一下，我好像发现了一些关于你的有趣的东西……'
    }
    return aiComforts[(round - 1) % aiComforts.length]
  }

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  return {
    messages,
    isAiTyping,
    roundCount,
    profileExtracted,
    initChat,
    sendMessage,
  }
})
