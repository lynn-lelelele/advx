<template>
  <view class="chat-page">
    <!-- 顶部状态栏 -->
    <view class="chat-header">
      <view class="header-avatar">
        <text class="header-avatar-text">E</text>
      </view>
      <view class="header-info">
        <text class="header-name">Echo</text>
        <text class="header-status">在线 · 倾听中</text>
      </view>
    </view>

    <!-- 对话区域 -->
    <scroll-view
      class="chat-scroll"
      :scroll-y="true"
      :scroll-with-animation="true"
      :scroll-into-view="scrollToId"
      :enhanced="true"
      :show-scrollbar="false"
    >
      <view class="chat-list">
        <ChatBubble
          v-for="msg in chatStore.messages"
          :key="msg.id"
          :id="msg.id"
          :role="msg.role"
          :content="msg.content"
        />

        <!-- AI 正在输入 -->
        <view v-if="chatStore.isAiTyping" class="typing-indicator">
          <view class="typing-avatar">E</view>
          <view class="typing-bubble">
            <view class="typing-dot" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.15}s` }"></view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 输入栏 -->
    <ChatInput
      :disabled="chatStore.isAiTyping"
      @send="chatStore.sendMessage"
    />

    <!-- 画像提取弹窗 -->
    <ProfileModal />
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import ChatBubble from '@/components/chat/ChatBubble.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import ProfileModal from '@/components/profile/ProfileModal.vue'

const chatStore = useChatStore()
const scrollToId = ref('')

// 新消息到达时自动滚动到底部
watch(
  () => chatStore.messages.length,
  async () => {
    await nextTick()
    const lastMsg = chatStore.messages[chatStore.messages.length - 1]
    if (lastMsg) {
      scrollToId.value = lastMsg.id
    }
  },
)

onMounted(() => {
  chatStore.initChat()
})
</script>

<style>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #fef8f2 0%, #fef3e8 100%);
}

/* 顶部栏 */
.chat-header {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  padding-top: calc(20rpx + var(--status-bar-height, 44px));
  background: rgba(255, 250, 245, 0.95);
  backdrop-filter: blur(20rpx);
  border-bottom: 1rpx solid rgba(232, 135, 91, 0.12);
  flex-shrink: 0;
}

.header-avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fda085, #f6d365);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(253, 160, 133, 0.3);
}

.header-avatar-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #5c3d2e;
}

.header-status {
  font-size: 24rpx;
  color: #e8875b;
  margin-top: 4rpx;
}

/* 对话区域 */
.chat-scroll {
  flex: 1;
  overflow-y: auto;
}

.chat-list {
  padding: 32rpx 0;
}

/* AI 正在输入 */
.typing-indicator {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  margin-bottom: 32rpx;
}

.typing-avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fda085, #f6d365);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(253, 160, 133, 0.25);
}

.typing-bubble {
  display: flex;
  gap: 8rpx;
  padding: 24rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;
  border-top-left-radius: 6rpx;
  box-shadow: 0 2rpx 16rpx rgba(232, 135, 91, 0.08);
}

.typing-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #f6d365;
  animation: typingBounce 1.2s infinite;
}

@keyframes typingBounce {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-8rpx); }
}
</style>
