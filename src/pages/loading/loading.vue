<template>
  <view class="loading-page">
    <view class="transition-content">
      <view class="transition-spinner"></view>
      <text class="transition-text">请等待</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useChatStore } from '../../stores/chat'

const chatStore = useChatStore()

onLoad(() => {
  chatStore.initChat()
})
</script>

<style scoped>
.loading-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(165deg, #0a0c16 0%, #121424 50%, #181930 100%);
}

.transition-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.transition-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(251, 146, 60, 0.2);
  border-top-color: #fb923c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.transition-text {
  font-size: 16px;
  color: #fef3c7;
  letter-spacing: 2px;
  font-weight: 300;
}
</style>
