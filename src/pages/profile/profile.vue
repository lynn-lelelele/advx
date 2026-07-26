<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-wrapper">
        <text class="avatar-text">👤</text>
      </view>
      <view class="user-info">
        <text class="user-name">Echo 用户</text>
        <text class="user-desc">签名：让沟通更有温度</text>
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

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(165deg, #0a0c16 0%, #121424 50%, #181930 100%);
  padding-bottom: 40rpx;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 60rpx 30rpx 40rpx;
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(245, 87, 108, 0.1) 100%);
  margin-bottom: 20rpx;
  border-bottom: 1px solid rgba(251, 146, 60, 0.1);
}

.avatar-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
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
  color: #f8fafc;
  margin-bottom: 8rpx;
}

.user-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.edit-btn {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  padding: 12rpx 24rpx;
  border: 1rpx solid rgba(251, 146, 60, 0.3);
  border-radius: 30rpx;
}

.menu-section {
  background: rgba(255, 255, 255, 0.04);
  margin: 0 30rpx 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.04);
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
  color: #cbd5e1;
}

.menu-arrow {
  font-size: 36rpx;
  color: #475569;
}
</style>
