<template>
  <view class="egg-page" :class="{ visible: show }">
    <!-- 返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="#f8fafc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </view>

    <!-- 背景光晕 -->
    <view class="bg-halo"></view>

    <!-- 密码锁界面 -->
    <view v-if="phase === 'lock' || phase === 'lockOut'" class="center-area" :class="{ 'fade-out': phase === 'lockOut' }">
      <!-- 密码锁 -->
      <view class="lock-wrapper">
        <view class="lock-ring"></view>
        <view class="lock-halo outer"></view>
        <view class="lock-halo mid"></view>
        <view class="lock-halo inner"></view>
        <view class="lock-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="11" width="14" height="10" rx="2" fill="rgba(251, 146, 60, 0.15)" stroke="#fb923c" stroke-width="1.5"/>
            <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="#fb923c"/>
          </svg>
        </view>
      </view>
      <text class="secret-label">Protected Info...</text>

      <!-- 密码输入框 -->
      <view class="password-box">
        <input
          v-model="password"
          class="password-input"
          type="text"
          :password="true"
          placeholder="输入密码..."
          placeholder-class="password-placeholder"
          @confirm="handleSubmit"
          :disabled="phase !== 'lock'"
        />
        <view class="submit-btn" @tap="handleSubmit" :class="{ disabled: phase !== 'lock' }">
          <svg v-if="phase === 'lock'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <view v-else class="loading-dot"></view>
        </view>
      </view>
    </view>

    <!-- 等待中 -->
    <view v-if="phase === 'waiting' || phase === 'waitingOut'" class="waiting-overlay" :class="{ 'fade-out': phase === 'waitingOut', 'fade-in-waiting': phase === 'waiting' }">
      <text class="waiting-text">等待中...</text>
    </view>

    <!-- 书信内容 -->
    <view v-if="phase === 'letter'" class="letter-container" :class="{ 'fade-in': letterVisible }">
      <scroll-view class="letter-scroll" scroll-y>
        <view class="letter-paper">
          <view class="letter-header">
            <view class="letter-seal"></view>
            <view class="letter-line"></view>
          </view>
          <rich-text class="letter-content" :nodes="secretContent"></rich-text>
          <view class="letter-footer">
            <view class="letter-line"></view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { verifySecret } from '../../api/secret'

const password = ref('')
const show = ref(false)
const phase = ref<'lock' | 'lockOut' | 'waiting' | 'waitingOut' | 'letter'>('lock')
const secretContent = ref('')
const letterVisible = ref(false)

onLoad(() => {
  nextTick(() => {
    show.value = true
  })
})

function goBack() {
  uni.navigateBack()
}

async function handleSubmit() {
  if (!password.value.trim() || phase.value !== 'lock') return

  phase.value = 'lockOut'

  try {
    const res = await verifySecret(password.value.trim())
    if (res.success && res.content) {
      // 1. 密码锁淡出 (已触发)
      await sleep(500)
      // 2. 等待中淡入
      phase.value = 'waiting'
      await sleep(1200)
      // 3. 等待中淡出
      phase.value = 'waitingOut'
      await sleep(500)
      // 4. 书信淡入
      secretContent.value = res.content
      phase.value = 'letter'
      await nextTick()
      setTimeout(() => { letterVisible.value = true }, 50)
    } else {
      // 密码错误
      phase.value = 'lock'
      uni.showToast({ title: '密码错误', icon: 'none' })
    }
  } catch (err) {
    phase.value = 'lock'
    uni.showToast({ title: '请求失败，请重试', icon: 'none' })
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
</script>

<style scoped>
.egg-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(165deg, #0a0c16 0%, #121424 50%, #181930 100%);
  color: #e2e8f0;
  position: relative;
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.egg-page.visible {
  opacity: 1;
  transform: scale(1);
}

/* 背景大光晕 */
.bg-halo {
  position: absolute;
  top: 38%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.02) 40%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  animation: bgHaloBreath 5s ease-in-out infinite;
}

@keyframes bgHaloBreath {
  0%, 100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
}

.back-btn {
  position: absolute;
  top: 48px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.25s ease;
  opacity: 0;
  animation: fadeIn 0.5s 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

.back-btn:active {
  transform: scale(0.9);
  background: rgba(251, 146, 60, 0.1);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

/* 中心区域（密码锁） */
.center-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  opacity: 0;
  animation: centerFadeIn 0.7s 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.center-area.fade-out {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

@keyframes centerFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 等待中 */
.waiting-overlay {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.waiting-overlay.fade-in-waiting {
  opacity: 1;
}

.waiting-overlay.fade-out {
  opacity: 0;
}

.waiting-text {
  font-size: 18px;
  color: rgba(251, 146, 60, 0.7);
  letter-spacing: 3px;
  animation: waitingPulse 1.5s ease-in-out infinite;
}

@keyframes waitingPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.lock-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 柔和光圈边框 */
.lock-ring {
  position: absolute;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 1.5px solid rgba(251, 146, 60, 0.2);
  box-shadow:
    0 0 20px rgba(251, 146, 60, 0.08),
    inset 0 0 20px rgba(251, 146, 60, 0.05);
  animation: ringBreath 3.5s ease-in-out infinite;
}

@keyframes ringBreath {
  0%, 100% { border-color: rgba(251, 146, 60, 0.15); box-shadow: 0 0 15px rgba(251, 146, 60, 0.06), inset 0 0 15px rgba(251, 146, 60, 0.04); }
  50% { border-color: rgba(251, 146, 60, 0.35); box-shadow: 0 0 30px rgba(251, 146, 60, 0.12), inset 0 0 25px rgba(251, 146, 60, 0.08); }
}

.secret-label {
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: -16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

/* 三层光晕 */
.lock-halo {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.lock-halo.outer {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.06) 0%, transparent 70%);
  filter: blur(30px);
  animation: haloOuter 4s ease-in-out infinite;
}

.lock-halo.mid {
  width: 75%;
  height: 75%;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.12) 0%, transparent 70%);
  filter: blur(18px);
  animation: haloMid 3s ease-in-out infinite;
}

.lock-halo.inner {
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.2) 0%, transparent 70%);
  filter: blur(10px);
  animation: haloInner 2.5s ease-in-out infinite;
}

@keyframes haloOuter {
  0%, 100% { transform: scale(0.9); opacity: 0.4; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

@keyframes haloMid {
  0%, 100% { transform: scale(0.85); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 1; }
}

@keyframes haloInner {
  0%, 100% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
}

.lock-icon {
  position: relative;
  z-index: 1;
}

.lock-icon svg {
  width: 64px;
  height: 64px;
  filter: drop-shadow(0 0 16px rgba(251, 146, 60, 0.4));
}

.password-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 6px 6px 20px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(251, 146, 60, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  width: 280px;
}

.password-input {
  flex: 1;
  height: 44px;
  background: transparent;
  color: #f8fafc;
  font-size: 15px;
  letter-spacing: 2px;
}

.password-placeholder {
  color: #64748b;
  letter-spacing: 0;
}

.submit-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.submit-btn:active {
  transform: scale(0.9);
}

.submit-btn.disabled {
  opacity: 0.6;
}

.submit-btn svg {
  width: 18px;
  height: 18px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  animation: loadingPulse 0.8s ease-in-out infinite;
}

@keyframes loadingPulse {
  0%, 100% { transform: scale(0.6); opacity: 0.4; }
  50% { transform: scale(1); opacity: 1; }
}

/* 书信界面 */
.letter-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px 40px;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.letter-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.letter-scroll {
  width: 100%;
  max-height: 100%;
  -webkit-overflow-scrolling: touch;
}

.letter-paper {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(251, 146, 60, 0.12);
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
}

.letter-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.letter-seal {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, rgba(251, 146, 60, 0.05) 100%);
  border: 1px solid rgba(251, 146, 60, 0.25);
  box-shadow: 0 0 12px rgba(251, 146, 60, 0.15);
}

.letter-line {
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(251, 146, 60, 0.2) 50%, transparent 100%);
}

.letter-content {
  color: #e2e8f0;
  font-size: 15px;
  line-height: 1.8;
  font-weight: 300;
}

.letter-content :deep(div) {
  overflow-y: auto;
  height: 300px;
  text-decoration: underline dashed 1px;
}

.letter-footer {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
