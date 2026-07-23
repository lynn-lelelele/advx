<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-wrapper">
        <text class="avatar-text">👤</text>
      </view>
      <view class="user-info">
        <text class="user-name">Echo 用户</text>
        <text class="user-desc">签名: 让沟通更有温度</text>
      </view>
      <text class="edit-btn">编辑</text>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item">
        <text class="menu-icon">📁</text>
        <text class="menu-label">我的文件</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">⭐</text>
        <text class="menu-label">收藏</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">💾</text>
        <text class="menu-label">本地存储</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 设置菜单 -->
    <view class="menu-section">
      <view class="menu-item">
        <text class="menu-icon">🔔</text>
        <text class="menu-label">通知设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">🔒</text>
        <text class="menu-label">隐私设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">❓</text>
        <text class="menu-label">关于 Echo</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-bottom: 20rpx;
}

.avatar-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.avatar-text {
  font-size: 56rpx;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.user-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.edit-btn {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  padding: 12rpx 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 30rpx;
}

.menu-section {
  background: #ffffff;
  margin: 0 30rpx 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}
</style>
