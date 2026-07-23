<template>
  <view v-if="profileStore.showModal" class="modal-overlay" @tap="profileStore.closeModal">
    <view class="modal-card" @tap.stop>
      <!-- 头部：惊喜标题 -->
      <view class="modal-header">
        <text class="sparkle">✨</text>
        <text class="modal-title">我发现了关于你的一些事</text>
      </view>

      <!-- 加载中 -->
      <view v-if="profileStore.isExtracting" class="loading-area">
        <text class="loading-text">正在分析你的故事...</text>
        <view class="loading-dots">
          <view class="dot" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.2}s` }"></view>
        </view>
      </view>

      <!-- 画像内容 -->
      <view v-else-if="profileStore.profile" class="profile-content">
        <!-- 情绪卡片 -->
        <view class="mood-card">
          <text class="mood-emoji">{{ profileStore.profile.moodEmoji }}</text>
          <text class="mood-label">{{ profileStore.profile.mood }}</text>
        </view>

        <!-- 标签 -->
        <view class="tags-row">
          <view
            v-for="tag in profileStore.profile.tags"
            :key="tag"
            class="tag"
          >
            #{{ tag }}
          </view>
        </view>

        <!-- 一句话总结 -->
        <view class="summary-box">
          <text class="summary-text">"{{ profileStore.profile.summary }}"</text>
        </view>

        <!-- 风格 -->
        <view class="style-row">
          <text class="style-label">表达风格</text>
          <text class="style-value">{{ profileStore.profile.style }}</text>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="modal-footer">
        <button class="btn-primary" @tap="handleFindMatch">
          🔗 帮我找到对的人
        </button>
        <text class="btn-link" @tap="profileStore.closeModal">先继续聊聊</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()

function handleFindMatch() {
  // TODO: 调用匹配接口
  uni.showToast({ title: '匹配功能即将上线', icon: 'none' })
  profileStore.closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 48rpx;
  backdrop-filter: blur(8rpx);
}

.modal-card {
  width: 100%;
  max-width: 600rpx;
  background: linear-gradient(180deg, #fffaf6 0%, #fff5ed 100%);
  border-radius: 32rpx;
  padding: 48rpx 40rpx 40rpx;
  box-shadow: 0 16rpx 48rpx rgba(232, 135, 91, 0.18);
  animation: slideUp 0.35s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(60rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 36rpx;
}

.sparkle {
  font-size: 56rpx;
  display: block;
  margin-bottom: 12rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
}

/* 加载动画 */
.loading-area {
  text-align: center;
  padding: 48rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #888;
  margin-bottom: 24rpx;
  display: block;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #f6d365;
  animation: bounce 1.2s infinite;
}

@keyframes bounce {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 画像内容 */
.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
}

.mood-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 48rpx;
  background: linear-gradient(135deg, #fff0e6, #ffe8d6);
  border-radius: 20rpx;
  width: 100%;
}

.mood-emoji {
  font-size: 80rpx;
  margin-bottom: 8rpx;
}

.mood-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #5c3d2e;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16rpx;
}

.tag {
  padding: 12rpx 28rpx;
  background: linear-gradient(135deg, #fff5ed, #ffe8d6);
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #e8875b;
  font-weight: 500;
  border: 1rpx solid rgba(232, 135, 91, 0.15);
}

.summary-box {
  width: 100%;
  padding: 24rpx 28rpx;
  background: linear-gradient(135deg, #fffaf6, #fff5ed);
  border-radius: 16rpx;
  border-left: 6rpx solid #f6d365;
}

.summary-text {
  font-size: 28rpx;
  color: #7a5c4f;
  line-height: 1.7;
  font-style: italic;
}

.style-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.style-label {
  font-size: 26rpx;
  color: #b8a094;
}

.style-value {
  font-size: 28rpx;
  color: #5c3d2e;
  font-weight: 500;
  padding: 8rpx 24rpx;
  background: linear-gradient(135deg, #fff5ed, #ffe8d6);
  border-radius: 20rpx;
}

/* 底部按钮 */
.modal-footer {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.btn-primary {
  width: 100%;
  padding: 24rpx 0;
  background: linear-gradient(135deg, #fda085, #f5576c);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(245, 87, 108, 0.3);
}

.btn-link {
  font-size: 26rpx;
  color: #c4a89a;
}
</style>
