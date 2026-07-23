<template>
  <view :class="['chat-bubble', role]">
    <!-- AI 头像 -->
    <view v-if="role === 'ai'" class="avatar ai-avatar">
      <text class="avatar-text">E</text>
    </view>

    <!-- 消息气泡 -->
    <view :class="['bubble', role]">
      <text class="bubble-text">{{ content }}</text>
    </view>

    <!-- 用户头像 -->
    <view v-if="role === 'user'" class="avatar user-avatar">
      <text class="avatar-text">我</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  role: 'user' | 'ai'
  content: string
}>()
</script>

<style scoped>
.chat-bubble {
  display: flex;
  align-items: flex-start;
  margin-bottom: 36rpx;
  padding: 0 24rpx;
}

.chat-bubble.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #fda085, #f6d365);
  margin-right: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(253, 160, 133, 0.25);
}

.user-avatar {
  background: linear-gradient(135deg, #e8875b, #f0a07a);
  margin-left: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(232, 135, 91, 0.25);
}

.avatar-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.bubble {
  max-width: 70%;
  padding: 22rpx 30rpx;
  border-radius: 24rpx;
  position: relative;
}

.bubble.ai {
  background: #ffffff;
  border-top-left-radius: 6rpx;
  box-shadow: 0 2rpx 20rpx rgba(232, 135, 91, 0.08);
}

.bubble.user {
  background: linear-gradient(135deg, #fda085, #f5576c);
  border-top-right-radius: 6rpx;
  box-shadow: 0 4rpx 16rpx rgba(245, 87, 108, 0.2);
}

.bubble-text {
  font-size: 30rpx;
  line-height: 1.8;
  color: #5c3d2e;
}

.bubble.user .bubble-text {
  color: #fff;
}
</style>
