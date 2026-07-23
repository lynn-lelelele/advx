/**
 * Echo Profile Store
 * 管理 AI 自动提取的用户画像 + 弹窗状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message } from './chat'

export interface UserProfile {
  mood: string
  moodEmoji: string
  tags: string[]
  summary: string
  style: string
  generatedAt: number
}

export const useProfileStore = defineStore('profile', () => {
  const showModal = ref(false)
  const profile = ref<UserProfile | null>(null)
  const isExtracting = ref(false)

  /**
   * 从前端对话中模拟提取画像
   * 实际项目中会调用后端 AI 接口
   */
  async function extractProfile(messages: Message[]) {
    isExtracting.value = true

    // 模拟 AI 分析延迟
    await new Promise((r) => setTimeout(r, 1500))

    // 简单地根据用户消息内容做关键字匹配，生成画像
    const userMessages = messages.filter((m) => m.role === 'user')
    const allText = userMessages.map((m) => m.content).join(' ')

    const { mood, emoji, tags, summary, style } = analyzeText(allText)

    profile.value = {
      mood,
      moodEmoji: emoji,
      tags,
      summary,
      style,
      generatedAt: Date.now(),
    }

    isExtracting.value = false
  }

  /** 关闭弹窗 */
  function closeModal() {
    showModal.value = false
  }

  return {
    showModal,
    profile,
    isExtracting,
    extractProfile,
    closeModal,
  }
})

/**
 * 简单的前端文本分析（Mock）
 * 实际接入后端时替换为真实 AI 分析
 */
function analyzeText(text: string): {
  mood: string
  emoji: string
  tags: string[]
  summary: string
  style: string
} {
  const lower = text.toLowerCase()

  // 情绪判断
  let mood = '有点心事'
  let emoji = '🌤️'

  if (lower.includes('累') || lower.includes('压力') || lower.includes('烦')) {
    mood = '最近压力有点大'
    emoji = '😮‍💨'
  } else if (lower.includes('孤独') || lower.includes('一个人') || lower.includes('没人')) {
    mood = '渴望被理解'
    emoji = '🥺'
  } else if (lower.includes('开心') || lower.includes('高兴') || lower.includes('快乐')) {
    mood = '心情不错'
    emoji = '😊'
  } else if (lower.includes('迷茫') || lower.includes('不知道') || lower.includes('困惑')) {
    mood = '正在寻找方向'
    emoji = '🧭'
  } else if (lower.includes('生气') || lower.includes('愤怒') || lower.includes('讨厌')) {
    mood = '有点情绪需要释放'
    emoji = '😤'
  }

  // 标签提取
  const tags: string[] = []
  if (lower.includes('工作') || lower.includes('上班') || lower.includes('老板')) tags.push('职场人')
  if (lower.includes('恋爱') || lower.includes('对象') || lower.includes('分手')) tags.push('情感探索者')
  if (lower.includes('学习') || lower.includes('考试') || lower.includes('考研')) tags.push('学习者')
  if (lower.includes('朋友') || lower.includes('社交') || lower.includes('聚会')) tags.push('社交达人')
  if (lower.includes('家庭') || lower.includes('父母') || lower.includes('爸妈')) tags.push('顾家型')
  if (tags.length === 0) tags.push('生活观察者', '内心丰富')

  // 表达风格
  let style = '细腻感性'
  if (text.length > 200) style = '表达丰富'
  if (text.length < 60) style = '言简意赅'

  // 一句话总结
  const summary = `一个${mood}的${tags[0] || '普通人'}，正在寻找一个能听懂自己的人。`

  return { mood, emoji, tags, summary, style }
}
