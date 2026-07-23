<template>
  <view class="chat-input-bar">
    <view class="input-wrapper">
      <input
        class="text-input"
        v-model="inputText"
        type="text"
        placeholder="说说你的心里话..."
        :disabled="disabled"
        confirm-type="send"
        @confirm="handleSend"
        :adjust-position="true"
      />
    </view>
    <view
      :class="['send-btn', { disabled: !canSend }]"
      @tap="handleSend"
    >
      <text class="send-icon">↑</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
}>()

const inputText = ref('')

const canSend = computed(() => inputText.value.trim().length > 0 && !props.disabled)

function handleSend() {
  if (!canSend.value) return
  emit('send', inputText.value)
  inputText.value = ''
}
</script>

<style scoped>
.chat-input-bar {
  display: flex;
  align-items: flex-end;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 250, 245, 0.98);
  border-top: 1rpx solid rgba(232, 135, 91, 0.12);
  backdrop-filter: blur(20rpx);
}

.input-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 40rpx;
  padding: 16rpx 28rpx;
  margin-right: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(232, 135, 91, 0.06);
}

.text-input {
  width: 100%;
  font-size: 30rpx;
  line-height: 1.5;
  min-height: 40rpx;
  max-height: 160rpx;
  color: #5c3d2e;
}

.send-btn {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fda085, #f6d365);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(253, 160, 133, 0.3);
  transition: opacity 0.2s, transform 0.15s;
}

.send-btn:active {
  transform: scale(0.92);
}

.send-btn.disabled {
  opacity: 0.35;
}

.send-icon {
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
}
</style>
