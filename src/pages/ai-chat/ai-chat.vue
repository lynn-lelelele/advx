<template>
  <view class="home-page" :class="{ 'has-messages': hasMessages }">
    <!-- 夜空深处暖色微光 -->
    <view class="bg-warm-glow"></view>

    <!-- 中间核心交互区 -->
    <view class="main-container" :class="{ recording: isRecording, 'has-messages': hasMessages }">
      <!-- AI 倾诉引导卡片 -->
      <view class="welcome-card" v-if="!hasMessages">
        <view class="ai-identity">
          <view class="ai-avatar"></view>
          <text class="ai-name">Echo</text>
        </view>
        <text class="prompt-text">
          今晚这里很安静。\n不论是疲惫、压抑，还是无处安放的情绪... 按住告诉我，我都听着。
        </text>
      </view>

      <!-- 对话列表 -->
      <scroll-view
        v-else
        class="chat-list"
        scroll-y
        :scroll-top="scrollTop"
        :scroll-with-animation="true"
        :upper-threshold="50"
        @scrolltoupper="handleScrollTop"
      >
        <ChatBubble
          v-for="msg in chatStore.messages"
          :key="msg.id"
          :role="msg.role"
          :current-user-id="chatStore.currentUserId"
          :content="msg.content"
          :is-voice="msg.isVoice"
          :duration="msg.duration"
          :audio-url="msg.audioUrl"
        />
        <!-- AI 正在输入指示器 -->
        <view v-if="chatStore.isAiTyping" class="typing-indicator">
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
        </view>
      </scroll-view>

      <!-- 匹配提示（悬浮在顶部） -->
      <view v-if="chatStore.showMatchPrompt" :class="['match-prompt', { dismissing: chatStore.matchDismissing }]">
        <view class="match-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21C12 21 4 14.5 4 9.5C4 6.5 6.5 4 9.5 4C11 4 12 5 12 5C12 5 13 4 14.5 4C17.5 4 20 6.5 20 9.5C20 14.5 12 21 12 21Z" fill="#fb923c" opacity="0.9"/>
          </svg>
        </view>
        <text class="match-text">Echo 发现了一个可能与你共鸣的人</text>
        <view class="match-actions">
          <view
            :class="['match-btn', 'join', { pending: chatStore.selfApproved }]"
            @tap="chatStore.joinChatRoom()"
          >
            {{ chatStore.selfApproved ? '等待中...' : '开启新聊天' }}
          </view>
          <view class="match-btn dismiss" @tap="chatStore.dismissMatch()">暂时不用</view>
        </view>
      </view>

      <!-- 融边呼吸麦克风按钮 -->
      <view class="mic-wrapper" v-if="!hasMessages">
        <view class="mic-ambient-glow"></view>
        <view
          class="mic-button"
          @tap="handleMicTap"
          @longpress="startRecording"
          @touchend="stopRecording"
        >
          <svg
            class="mic-icon"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M511.097956 755.560178c-93.264127 0-169.139212-75.874061-169.139212-169.139212L341.958744 234.611365c0-93.264127 75.875085-169.139212 169.139212-169.139212 93.26515 0 169.139212 75.875085 169.139212 169.139212l0 351.809601C680.237167 679.685094 604.363106 755.560178 511.097956 755.560178zM511.097956 119.596865c-63.427588 0-115.015523 51.600215-115.015523 115.0145l0 351.809601c0 63.415308 51.587935 115.015523 115.015523 115.015523 63.413262 0 115.015523-51.601238 115.015523-115.015523L626.113479 234.611365C626.113479 171.19708 574.511217 119.596865 511.097956 119.596865z"
              fill="#FFE8C5"
            />
            <path
              d="M436.675966 349.625866c-7.479345 0-13.532201-6.051833-13.532201-13.531178L423.143765 220.842781c0-36.273135 23.336498-60.652382 65.63486-60.652382l10.478655 0c7.478322 0 13.532201 6.052856 13.532201 13.531178 0 7.479345-6.053879 13.531178-13.532201 13.531178l-10.478655 0c-10.240225 0-38.571481 2.418073-38.571481 33.590026l0 115.252931C450.207144 343.574033 444.142008 349.625866 436.675966 349.625866z"
              fill="#FFE8C5"
            />
            <path
              d="M436.675966 403.750577c-7.479345 0-13.532201-6.051833-13.532201-13.531178l0-13.531178c0-7.479345 6.052856-13.531178 13.532201-13.531178 7.466042 0 13.531178 6.051833 13.531178 13.531178l0 13.531178C450.207144 397.698744 444.142008 403.750577 436.675966 403.750577z"
              fill="#FFE8C5"
            />
            <path
              d="M512.325923 863.810624l-2.867304 0c-159.572322 0-289.281499-135.338385-289.281499-295.545156l0-15.668865c0-14.947434 12.116969-27.064402 27.062356-27.064402 14.944364 0 27.062356 12.115945 27.062356 27.064402l0 15.668865c0 128.613216 107.179045 241.420445 235.156788 241.420445l2.867304 0c124.939547 0 235.56611-110.561072 235.56611-241.420445l0-15.668865c0-14.947434 12.119015-27.064402 27.061332-27.064402 14.945387 0 27.064402 12.115945 27.064402 27.064402l0 15.668865C802.018791 731.232097 669.269371 863.810624 512.325923 863.810624z"
              fill="#FFE8C5"
            />
            <path
              d="M621.03788 958.528869 390.995577 958.528869c-14.945387 0-27.062356-12.117992-27.062356-27.061332 0-14.945387 12.116969-27.063379 27.062356-27.063379L621.03788 904.404158c14.945387 0 27.062356 12.117992 27.062356 27.063379C648.100236 946.410877 635.983267 958.528869 621.03788 958.528869z"
              fill="#FFE8C5"
            />
            <path
              d="M504.331855 931.466514c-14.944364 0-27.061332-12.117992-27.061332-27.063379l0-67.655889c0-14.944364 12.116969-27.061332 27.061332-27.061332 14.945387 0 27.063379 12.117992 27.063379 27.061332l0 67.655889C531.395234 919.348522 519.277242 931.466514 504.331855 931.466514z"
              fill="#FFE8C5"
            />
          </svg>
          <view class="recording-icon">
            <view class="recording-bar"></view>
            <view class="recording-bar"></view>
            <view class="recording-bar"></view>
          </view>
        </view>
        <text class="recording-hint">正在聆听...</text>
      </view>
    </view>

    <!-- 底部输入栏 -->
    <view class="bottom-bar">
      <view
        class="mic-side-button"
        :class="{ recording: isRecording }"
        @tap="handleMicTap"
        @longpress="startRecording"
        @touchend="stopRecording"
      >
        <svg
          class="mic-side-icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M511.097956 755.560178c-93.264127 0-169.139212-75.874061-169.139212-169.139212L341.958744 234.611365c0-93.264127 75.875085-169.139212 169.139212-169.139212 93.26515 0 169.139212 75.875085 169.139212 169.139212l0 351.809601C680.237167 679.685094 604.363106 755.560178 511.097956 755.560178zM511.097956 119.596865c-63.427588 0-115.015523 51.600215-115.015523 115.0145l0 351.809601c0 63.415308 51.587935 115.015523 115.015523 115.015523 63.413262 0 115.015523-51.601238 115.015523-115.015523L626.113479 234.611365C626.113479 171.19708 574.511217 119.596865 511.097956 119.596865z"
            fill="#FFE8C5"
          />
          <path
            d="M512.325923 863.810624l-2.867304 0c-159.572322 0-289.281499-135.338385-289.281499-295.545156l0-15.668865c0-14.947434 12.116969-27.064402 27.062356-27.064402 14.944364 0 27.062356 12.115945 27.062356 27.064402l0 15.668865c0 128.613216 107.179045 241.420445 235.156788 241.420445l2.867304 0c124.939547 0 235.56611-110.561072 235.56611-241.420445l0-15.668865c0-14.947434 12.119015-27.064402 27.061332-27.064402 14.945387 0 27.064402 12.115945 27.064402 27.064402l0 15.668865C802.018791 731.232097 669.269371 863.810624 512.325923 863.810624z"
            fill="#FFE8C5"
          />
          <path
            d="M504.331855 931.466514c-14.944364 0-27.061332-12.117992-27.061332-27.063379l0-67.655889c0-14.944364 12.116969-27.061332 27.061332-27.061332 14.945387 0 27.063379 12.117992 27.063379 27.061332l0 67.655889C531.395234 919.348522 519.277242 931.466514 504.331855 931.466514z"
            fill="#FFE8C5"
          />
        </svg>
        <view class="recording-icon mini">
          <view class="recording-bar"></view>
          <view class="recording-bar"></view>
          <view class="recording-bar"></view>
        </view>
      </view>
      <view class="input-box">
        <input
          v-model="inputValue"
          class="input"
          :placeholder="'或者, 在这儿说一你想说的话...'"
        />
        <view class="send-button" @tap="handleSendTap">
          <svg
            class="send-icon"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M931.6 523.2L160.8 916.8c-12.8 6.4-27.2 4.8-37.6-4.8-10.4-9.6-13.6-24-8-37.6l128-352c2.4-6.4 7.2-11.2 13.6-13.6l320-128c9.6-3.2 16-12.8 16-22.4 0-9.6-6.4-19.2-16-22.4l-320-128c-6.4-2.4-11.2-7.2-13.6-13.6l-128-352c-5.6-13.6-2.4-28 8-37.6 10.4-9.6 24.8-11.2 37.6-4.8l770.8 393.6c10.4 5.6 16.8 16 16.8 27.2 0 11.2-6.4 22.4-16.8 27.2z"
              fill="#FFFFFF"
            />
          </svg>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useChatStore } from '../../stores/chat'
import ChatBubble from '../../components/chat/ChatBubble.vue'
import { startRecording as startRec, stopRecording as stopRec, isRecording as isRec } from '../../api/recorder'

const chatStore = useChatStore()
const isRecording = ref(false)
const inputValue = ref('')
let suppressNextTap = false
let emptySendCount = 0

const hasMessages = computed(() => chatStore.messages.length > 0)

// 自动滚动到底部
const scrollTop = ref(0)
watch(
  () => {
    const msgs = chatStore.messages
    const last = msgs[msgs.length - 1]
    return `${msgs.length}_${last?.content?.length ?? 0}`
  },
  () => {
    nextTick(() => {
      scrollTop.value = scrollTop.value >= 99999 ? 99998 : 99999
    })
  },
)

onLoad(async () => {
  // 1. 打开 WebSocket
  const token = uni.getStorageSync('echo_token') as string
  if (token) {
    await chatStore.openWebSocket(token)
  }
  // 2. 注册流式回调
  chatStore.registerStreamHandlers()
  // 3. 启动匹配轮询
  chatStore.startMatchPolling()
  // 4. 加载历史消息
  await chatStore.loadHistory()
})

onUnload(() => {
  chatStore.dispose()
})

function handleMicTap() {
  if (suppressNextTap) {
    suppressNextTap = false
    return
  }
  if (isRecording.value) return
  uni.showToast({ title: '长按说话', icon: 'none', duration: 1500 })
}

async function startRecording() {
  suppressNextTap = true
  try {
    await startRec()
    isRecording.value = true
  } catch (err: any) {
    isRecording.value = false
    uni.showToast({ title: err?.message || '无法访问麦克风', icon: 'none', duration: 3000 })
  }
}

async function stopRecording() {
  if (!isRecording.value) return
  isRecording.value = false
  setTimeout(() => {
    suppressNextTap = false
  }, 100)

  try {
    const result = await stopRec()
    await chatStore.sendAudio(result.base64, result.duration)
  } catch {
    console.warn('[Index] recording stopped without data')
  }
}

async function handleSendTap() {
  const content = inputValue.value.trim()
  if (!content) {
    emptySendCount++
    if (emptySendCount >= 10) {
      emptySendCount = 0
      uni.navigateTo({ url: '/pages/easter-egg/easter-egg' })
    }
    return
  }
  emptySendCount = 0
  inputValue.value = ''
  await chatStore.sendMessage(content)
}

/** 滚动到顶部，加载更多历史 */
async function handleScrollTop() {
  await chatStore.loadMoreHistory()
}
</script>

<style scoped>

.home-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(165deg, #0a0c16 0%, #121424 50%, #181930 100%);
  background-size: 200% 200%;
  animation: ambientBackground 16s ease infinite;
  color: #e2e8f0;
}

@keyframes ambientBackground {
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
}

.bg-warm-glow {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.1) 0%, rgba(245, 158, 11, 0.02) 50%, rgba(0, 0, 0, 0) 75%);
  filter: blur(50px);
  pointer-events: none;
  transition: opacity 0.8s ease;
}

.home-page.has-messages .bg-warm-glow {
  opacity: 0.5;
}

.header {
  padding: 48px 24px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.brand-title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 2px;
  color: #f8fafc;
  font-family: Georgia, serif;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fb923c;
  box-shadow: 0 0 8px #fb923c;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 0 24px;
  z-index: 10;
  min-height: 0;
  overflow: hidden;
  transition: padding 0.6s cubic-bezier(0.22, 1, 0.36, 1), justify-content 0.6s;
}

.main-container.has-messages {
  justify-content: flex-start;
  padding-top: 60px;
  padding-bottom: 12px;
}

.welcome-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(251, 146, 60, 0.15);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: cardFadeIn 1.2s ease-out;
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.recording .welcome-card {
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.ai-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.ai-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: radial-gradient(circle, #fb923c 0%, rgba(251, 146, 60, 0.3) 100%);
  box-shadow: 0 0 10px rgba(251, 146, 60, 0.4);
}

.ai-name {
  font-size: 14px;
  font-weight: 500;
  color: #fef3c7;
  letter-spacing: 1px;
}

.prompt-text {
  font-size: 15px;
  line-height: 1.6;
  color: #cbd5e1;
  font-weight: 300;
}

.mic-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  margin: 20px 0;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.recording .mic-wrapper {
  transform: scale(1.12);
}

.mic-ambient-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, rgba(251, 146, 60, 0) 70%);
  filter: blur(15px);
  animation: echoAmbientGlow 4s ease-in-out infinite;
}

.mic-button {
  position: relative;
  height: 130px;
  width: 130px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(251, 146, 60, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: echoButtonBreath 4s ease-in-out infinite;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.mic-button:active {
  transform: scale(0.95);
  background: rgba(251, 146, 60, 0.1);
}

.mic-icon {
  width: 56px;
  height: 56px;
  opacity: 0.75;
  filter: drop-shadow(0 0 8px rgba(251, 146, 60, 0.3));
  transition: opacity 0.4s ease;
}

.mic-hint {
  position: absolute;
  bottom: -10px;
  font-size: 12px;
  color: #64748b;
  letter-spacing: 1px;
}

@keyframes echoAmbientGlow {
  0%, 100% {
    transform: scale(0.85);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.7;
  }
}

@keyframes echoButtonBreath {
  0%, 100% {
    border-color: rgba(251, 146, 60, 0.15);
    box-shadow: 0 0 20px rgba(251, 146, 60, 0.08);
  }
  50% {
    border-color: rgba(251, 146, 60, 0.35);
    box-shadow: 0 0 35px rgba(251, 146, 60, 0.2);
  }
}

.bottom-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px 32px;
  z-index: 10;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease;
}

.mic-side-button {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(251, 146, 60, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.mic-side-button:active {
  transform: scale(0.92);
  background: rgba(251, 146, 60, 0.08);
}

.mic-side-button.recording {
  transform: scale(1.12);
  background: rgba(251, 146, 60, 0.1);
  border-color: rgba(251, 146, 60, 0.4);
}

.mic-side-icon {
  width: 22px;
  height: 22px;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.mic-side-button.recording .mic-side-icon {
  opacity: 0;
}

.input-box {
  flex: 1;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(251, 146, 60, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  background: transparent;
  color: #f8fafc;
  font-size: 14px;
  text-align: left;
  transition: all 0.3s ease;
}

.input::placeholder {
  color: #94a3b8;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  margin-left: 4px;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.send-button:active {
  transform: scale(0.92);
  filter: brightness(1.1);
}

.send-icon {
  width: 18px;
  height: 18px;
  opacity: 0.95;
}

.recording .input-box {
  opacity: 0.6;
  transform: scale(0.98);
}

.recording-icon {
  position: absolute;
  display: none;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 44px;
}

.recording .recording-icon,
.mic-side-button.recording .recording-icon {
  display: flex;
}

.recording .mic-icon {
  opacity: 0;
}

.recording-bar {
  width: 5px;
  height: 22px;
  border-radius: 3px;
  background: #FFE8C5;
  animation: soundWave 0.8s ease-in-out infinite;
}

.recording-bar:nth-child(1) {
  animation-delay: 0s;
}

.recording-bar:nth-child(2) {
  animation-delay: 0.15s;
}

.recording-bar:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes soundWave {
  0%, 100% {
    transform: scaleY(0.5);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1.4);
    opacity: 1;
  }
}

.recording-hint {
  position: absolute;
  bottom: -32px;
  font-size: 13px;
  color: #fb923c;
  letter-spacing: 1px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.recording .recording-hint {
  opacity: 1;
}

.chat-list {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  animation: chatFadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes chatFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.recording-icon.mini {
  position: absolute;
  height: 22px;
}

.recording-icon.mini .recording-bar {
  width: 3px;
  height: 12px;
  background: #FFE8C5;
}

/* AI 正在输入指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
  margin: 8px 0;
  width: fit-content;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(251, 146, 60, 0.12);
  border-radius: 16px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(251, 146, 60, 0.6);
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* 匹配提示（悬浮顶部） */
.match-prompt {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  width: calc(100% - 48px);
  max-width: 360px;
  background: rgba(24, 25, 48, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(251, 146, 60, 0.15);
  animation: matchSlideDown 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes matchSlideDown {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.match-prompt.dismissing {
  animation: matchSlideUp 0.3s ease-in forwards;
}

@keyframes matchSlideUp {
  from { opacity: 1; transform: translateX(-50%) translateY(0); }
  to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
}

.match-icon {
  width: 40px;
  height: 40px;
  animation: matchPulse 2s ease-in-out infinite;
}

@keyframes matchPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.match-text {
  font-size: 14px;
  color: #fef3c7;
  text-align: center;
  line-height: 1.5;
}

.match-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.match-btn {
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.match-btn.join {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(251, 146, 60, 0.3);
}

.match-btn.join:active {
  transform: scale(0.95);
}

.match-btn.join.pending {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.match-btn.join.pending:active {
  transform: none;
}

.match-btn.dismiss {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #94a3b8;
}

.match-btn.dismiss:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.08);
}
</style>
