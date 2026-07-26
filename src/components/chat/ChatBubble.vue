<template>
  <view :class="['chat-bubble', displayRole]">
    <!-- AI 头像 -->
    <view v-if="displayRole === 'ai'" class="avatar ai-avatar">
      <text class="avatar-text">E</text>
    </view>
    <!-- 自己 -->
    <view v-else-if="displayRole === 'self'" class="avatar user-avatar">
      <text class="avatar-text">我</text>
    </view>
    <!-- 对方 -->
    <view v-else class="avatar other-avatar">
      <text class="avatar-text">^_^</text>
    </view>
    <!-- 消息气泡 -->
    <view :class="['bubble', displayRole, { 'bubble-voice': isVoice, 'bubble-playing': isPlaying }]" @tap="handleVoiceTap">
      <template v-if="isVoice">
        <!-- 语音气泡 -->
        <view class="voice-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C10.9 2 10 2.9 10 4V12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12V4C14 2.9 13.1 2 12 2Z" fill="currentColor" opacity="0.9"/>
            <path d="M17 10C17 10 17 12 15 13.5C15 15.5 13.7 17 12 17C10.3 17 9 15.5 9 13.5C7 12 7 10 7 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
            <path d="M12 17V21M8 21H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
          </svg>
        </view>
        <text class="voice-duration">{{ Math.round(duration ?? 0) }}''</text>
        <!-- 播放动画 -->
        <view v-if="isPlaying" class="playing-waves">
          <view class="wave-bar"></view>
          <view class="wave-bar"></view>
          <view class="wave-bar"></view>
        </view>
      </template>
      <text v-else class="bubble-text">{{ content }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { playPcm, stopPcm, getIsPlaying } from '../../api/audioPlayer'

const props = defineProps<{
  role: string // user_id
  currentUserId: string
  content: string
  isVoice?: boolean
  duration?: number
  audioUrl?: string
}>()

const displayRole = computed(() => {
  if (props.role.startsWith('ai')) return 'ai'
  if (props.role === props.currentUserId) return 'self'
  return 'other'
})

const isPlaying = ref(false)

async function handleVoiceTap() {
  if (!props.audioUrl) return

  if (isPlaying.value) {
    // 正在播放，点击停止
    stopPcm()
    isPlaying.value = false
    return
  }

  try {
    isPlaying.value = true
    await playPcm(props.audioUrl, () => {
      isPlaying.value = false
    })
  } catch {
    isPlaying.value = false
    uni.showToast({ title: '播放失败', icon: 'none' })
  }
}
</script>
