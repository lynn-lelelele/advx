<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <text class="search-placeholder">搜索共鸣</text>
    </view>

    <!-- 消息列表 -->
    <view class="message-list">
      <view class="message-item" v-for="(msg, index) in messages" :key="index">
        <view class="avatar">
          <text class="avatar-text">{{ msg.name[0] }}</text>
        </view>
        <view class="message-content">
          <view class="message-header">
            <text class="message-name">{{ msg.name }}</text>
            <text class="message-time">{{ msg.time }}</text>
          </view>
          <text class="message-preview">{{ msg.preview }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Message {
  name: string
  time: string
  preview: string
}

const messages = ref<Message[]>([])
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(165deg, #0a0c16 0%, #121424 50%, #181930 100%);
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 20rpx 30rpx;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 50rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: #64748b;
}

.message-list {
  margin: 0 30rpx;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
}

.message-item:last-child {
  border-bottom: none;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fb923c, #f6d365);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.message-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #cbd5e1;
}

.message-time {
  font-size: 22rpx;
  color: #64748b;
}

.message-preview {
  font-size: 24rpx;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #cbd5e1;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #64748b;
}
</style>
