/**
 * 音频录制工具（H5 MediaRecorder → PCM 转换）
 * 输出格式：PCM 16kHz 16-bit 单声道
 */

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let stream: MediaStream | null = null
let recordStartTime = 0

export interface RecordingResult {
  base64: string
  duration: number // 秒数，精确到秒
}

// PCM 参数
const PCM_SAMPLE_RATE = 16000
const PCM_CHANNELS = 1
const PCM_BITS_PER_SAMPLE = 16

/** 请求麦克风权限并开始录音 */
export async function startRecording(): Promise<void> {
  if (mediaRecorder && mediaRecorder.state === 'recording') return

  // 检查是否安全上下文（HTTPS 或 localhost）
  if (!window.isSecureContext) {
    throw new Error('需要 HTTPS 环境才能使用麦克风。当前页面不是安全上下文。')
  }

  // 检查浏览器是否支持
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('浏览器不支持麦克风访问')
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioChunks = []

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: getSupportedMimeType(),
    })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data)
      }
    }

    mediaRecorder.start()
    recordStartTime = Date.now()
  } catch (err: any) {
    const msg = err?.name === 'NotAllowedError'
      ? '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问'
      : err?.name === 'NotFoundError'
      ? '未检测到麦克风设备'
      : err?.message || '未知错误'
    console.error('[Recorder] start failed:', err)
    throw new Error(msg)
  }
}

/** 停止录音并返回 PCM base64 数据和时长 */
export async function stopRecording(): Promise<RecordingResult> {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    throw new Error('Not recording')
  }

  const duration = Math.max(1, Math.round((Date.now() - recordStartTime) / 1000))

  return new Promise((resolve, reject) => {
    mediaRecorder!.onstop = async () => {
      try {
        const blob = new Blob(audioChunks, { type: mediaRecorder!.mimeType || 'audio/webm' })
        const arrayBuffer = await blob.arrayBuffer()

        // 解码音频
        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

        // 转换为 PCM 16kHz 16-bit 单声道
        const pcmData = convertToPcm(audioBuffer)

        // 转 base64
        const base64 = arrayBufferToBase64(pcmData)

        audioContext.close()
        cleanup()
        resolve({ base64, duration })
      } catch (err) {
        console.error('[Recorder] conversion failed:', err)
        cleanup()
        reject(new Error('音频转换失败'))
      }
    }

    mediaRecorder!.onerror = () => {
      cleanup()
      reject(new Error('Recording error'))
    }

    mediaRecorder!.stop()
  })
}

/** 将 AudioBuffer 转换为 PCM 16kHz 16-bit 单声道 */
function convertToPcm(audioBuffer: AudioBuffer): Int16Array {
  const sourceSampleRate = audioBuffer.sampleRate
  const sourceChannels = audioBuffer.numberOfChannels
  const sourceLength = audioBuffer.length

  // 混音为单声道（如果是立体声）
  let monoData: Float32Array
  if (sourceChannels > 1) {
    monoData = new Float32Array(sourceLength)
    for (let i = 0; i < sourceLength; i++) {
      let sum = 0
      for (let ch = 0; ch < sourceChannels; ch++) {
        sum += audioBuffer.getChannelData(ch)[i]
      }
      monoData[i] = sum / sourceChannels
    }
  } else {
    monoData = audioBuffer.getChannelData(0)
  }

  // 重采样到 16kHz
  const ratio = sourceSampleRate / PCM_SAMPLE_RATE
  const targetLength = Math.round(sourceLength / ratio)
  const resampledData = new Float32Array(targetLength)

  for (let i = 0; i < targetLength; i++) {
    const sourceIndex = i * ratio
    const index = Math.floor(sourceIndex)
    const frac = sourceIndex - index

    if (index + 1 < sourceLength) {
      // 线性插值
      resampledData[i] = monoData[index] * (1 - frac) + monoData[index + 1] * frac
    } else {
      resampledData[i] = monoData[index] || 0
    }
  }

  // 转换为 16-bit PCM
  const pcmData = new Int16Array(targetLength)
  for (let i = 0; i < targetLength; i++) {
    const sample = Math.max(-1, Math.min(1, resampledData[i]))
    pcmData[i] = sample < 0 ? sample * 32768 : sample * 32767
  }

  return pcmData
}

/** ArrayBuffer 转 base64 */
function arrayBufferToBase64(buffer: ArrayBuffer | Int16Array): string {
  let bytes: Uint8Array
  if (buffer instanceof Int16Array) {
    bytes = new Uint8Array(buffer.buffer)
  } else {
    bytes = new Uint8Array(buffer)
  }

  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/** 取消录音（不返回数据） */
export function cancelRecording(): void {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.onstop = null
    mediaRecorder.stop()
  }
  cleanup()
}

/** 是否正在录音 */
export function isRecording(): boolean {
  return mediaRecorder?.state === 'recording'
}

function cleanup(): void {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
    stream = null
  }
  mediaRecorder = null
  audioChunks = []
  recordStartTime = 0
}

/** 获取浏览器支持的 MIME 类型 */
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return 'audio/webm'
}
