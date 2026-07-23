<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <text class="search-placeholder">搜索消息</text>
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

      <view class="empty-state" v-if="messages.length === 0">
        <text class="empty-icon">💭</text>
        <text class="empty-text">还没有消息</text>
        <text class="empty-hint">快来开始第一次对话吧</text>
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

<style>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 20rpx 30rpx;
  padding: 20rpx 30rpx;
  background: #ffffff;
  border-radius: 50rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: #999;
}

.message-list {
  margin: 0 30rpx;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.message-item:last-child {
  border-bottom: none;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  color: #333;
}

.message-time {
  font-size: 22rpx;
  color: #999;
}

.message-preview {
  font-size: 24rpx;
  color: #666;
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
  color: #333;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
}
</style>
