<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('Echo App Launch')
})

onShow(() => {
  console.log('Echo App Show')
})

onHide(() => {
  console.log('Echo App Hide')
})
</script>

<style>
/* 全局基础样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif;
  color: #e2e8f0;
  -webkit-tap-highlight-color: transparent;
}

view, text, image, scroll-view {
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* ChatBubble 气泡样式（全局） */
.chat-bubble {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 0 8px;
}

.chat-bubble.user,
.chat-bubble.self {
  flex-direction: row-reverse;
  animation: userBubbleFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.chat-bubble.ai,
.chat-bubble.other {
  animation: aiBubbleFadeIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes userBubbleFadeIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes aiBubbleFadeIn {
  0% { opacity: 0; transform: translateY(16px) scale(0.96); filter: blur(4px); }
  50% { opacity: 0.7; filter: blur(1px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background: radial-gradient(circle, #fb923c 0%, rgba(251, 146, 60, 0.3) 100%);
  margin-right: 12px;
  box-shadow: 0 0 10px rgba(251, 146, 60, 0.3);
}

.user-avatar,
.other-avatar {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.8) 0%, rgba(246, 211, 101, 0.6) 100%);
  margin-left: 12px;
  box-shadow: 0 0 10px rgba(251, 146, 60, 0.2);
}

.avatar-text {
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.bubble {
  max-width: 70%;
  padding: 14px 18px;
  border-radius: 20px;
  position: relative;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.3s ease;
}

.bubble.ai {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(251, 146, 60, 0.15);
  border-top-left-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.bubble.user,
.bubble.self {
  background: rgba(251, 146, 60, 0.12);
  border: 1px solid rgba(251, 146, 60, 0.25);
  border-top-right-radius: 4px;
  box-shadow: 0 4px 20px rgba(251, 146, 60, 0.1);
}

.bubble.other {
  background: rgba(100, 116, 139, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-top-left-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.bubble-text {
  font-size: 15px;
  line-height: 1.7;
  color: #e2e8f0;
  font-weight: 300;
}

.bubble.user .bubble-text,
.bubble.self .bubble-text {
  color: #fef3c7;
}

.bubble.other .bubble-text {
  color: #e2e8f0;
}

/* 语音气泡 */
.bubble-voice {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 100px;
}

.voice-icon {
  width: 20px;
  height: 20px;
  color: #fb923c;
  flex-shrink: 0;
}

.voice-duration {
  font-size: 14px;
  color: #fef3c7;
  font-weight: 400;
  min-width: 28px;
}

/* 播放动画 */
.playing-waves {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: 8px;
}

.wave-bar {
  width: 3px;
  height: 12px;
  border-radius: 2px;
  background: #fb923c;
  animation: wavePulse 0.8s ease-in-out infinite;
}

.wave-bar:nth-child(1) {
  animation-delay: 0s;
}

.wave-bar:nth-child(2) {
  animation-delay: 0.15s;
}

.wave-bar:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes wavePulse {
  0%, 100% {
    transform: scaleY(0.5);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1.5);
    opacity: 1;
  }
}

.bubble-playing {
  border-color: rgba(251, 146, 60, 0.5) !important;
  box-shadow: 0 0 15px rgba(251, 146, 60, 0.3) !important;
}
</style>
