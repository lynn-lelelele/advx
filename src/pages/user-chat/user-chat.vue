<template>
  <view class="user-chat-page" :class="{ 'has-messages': hasMessages }">
    <!-- 背景光晕 -->
    <view class="bg-warm-glow"></view>

    <!-- 中间核心交互区 -->
    <view class="main-container" :class="{ 'has-messages': hasMessages }">
      <!-- 匹配引导卡片 -->
      <view class="welcome-card" v-if="!hasMessages">
        <view class="match-identity">
          <view class="match-avatar"></view>
          <text class="match-name">共鸣</text>
        </view>
        <text class="greeting-text">Hi~ 检测到心灵感应</text>
        <text class="prompt-text">
          在某个瞬间，有人正想着和你相似的事情。\n向对方说一点话吧。
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
      </scroll-view>
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
      <view
        v-if="chatStore.character === 'user'"
        class="end-side-button"
        @tap="handleEndChat"
      >
        <svg
          class="end-side-icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M794.666667 682.666667c0 23.466667-19.2 42.666667-42.666667 42.666666H272c-23.466667 0-42.666667-19.2-42.666667-42.666666V341.333333c0-23.466667 19.2-42.666667 42.666667-42.666666h480c23.466667 0 42.666667 19.2 42.666667 42.666666v341.333334z"
            fill="none"
          />
          <path
            d="M682.666667 256L341.333333 768M341.333333 256l341.333334 512"
            stroke="#fb923c"
            stroke-width="64"
            stroke-linecap="round"
          />
        </svg>
      </view>
      <view class="input-box">
        <input
          v-model="inputValue"
          class="input"
          placeholder="说点什么..."
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
import { sendEnd } from '../../api/websocket'

const chatStore = useChatStore()
const inputValue = ref('')
const isRecording = ref(false)
let suppressNextTap = false

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
  // 3. 加载历史消息
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
    console.warn('[UserChat] recording stopped without data')
  }
}

async function handleSendTap() {
  const content = inputValue.value.trim()
  if (!content) return
  inputValue.value = ''
  await chatStore.sendMessage(content)
}

async function handleScrollTop() {
  await chatStore.loadMoreHistory()
}

function handleEndChat() {
  sendEnd()
}
</script>

<style scoped>

.user-chat-page {
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

.user-chat-page.has-messages .bg-warm-glow {
  opacity: 0.5;
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
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: cardFadeIn 1.2s ease-out;
  display: flex;
  flex-direction: column;
  text-align: left;
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.match-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  margin-left: 0;
}

.match-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, #fb923c 0%, rgba(251, 146, 60, 0.3) 100%);
  box-shadow: 0 0 10px rgba(251, 146, 60, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(251, 146, 60, 0.5); }
  50% { transform: scale(1.1); box-shadow: 0 0 18px rgba(251, 146, 60, 0.7); }
}

.match-name {
  font-size: 16px;
  font-weight: 500;
  color: #fef3c7;
  letter-spacing: 2px;
}

.greeting-text {
  font-size: 20px;
  font-weight: 400;
  color: #fb923c;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.prompt-text {
  font-size: 14px;
  line-height: 1.8;
  color: #94a3b8;
  font-weight: 300;
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

.bottom-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px 32px;
  z-index: 10;
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

.recording-icon.mini {
  position: absolute;
  display: none;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 22px;
}

.mic-side-button.recording .recording-icon.mini {
  display: flex;
}

.recording-icon.mini .recording-bar {
  width: 3px;
  height: 12px;
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

.end-side-button {
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
  transition: all 0.3s ease;
}

.end-side-button:active {
  transform: scale(0.92);
  background: rgba(251, 146, 60, 0.1);
}

.end-side-icon {
  width: 20px;
  height: 20px;
}
</style>
