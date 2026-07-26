/**
 * PCM 音频播放器
 * 用于播放后端返回的 PCM 格式音频文件
 */

let audioContext: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null
let isPlaying = false
let onEndCallback: (() => void) | null = null

/** 获取或创建 AudioContext */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

/** 播放 PCM 音频 */
export async function playPcm(url: string, onEnd?: () => void): Promise<void> {
  // 停止当前播放
  stopPcm()

  onEndCallback = onEnd || null

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const ctx = getAudioContext()

    // 移动端需要 resume（用户手势后）
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    // PCM 参数（根据后端实际配置调整）
    const sampleRate = 16000 // 16kHz
    const numChannels = 1 // 单声道
    const bitsPerSample = 16 // 16-bit

    // 计算音频时长
    const bytesPerSample = bitsPerSample / 8
    const numSamples = arrayBuffer.byteLength / bytesPerSample
    const duration = numSamples / sampleRate

    // 创建 AudioBuffer
    const audioBuffer = ctx.createBuffer(numChannels, numSamples, sampleRate)

    // 填充音频数据（16-bit PCM → Float32）
    const channelData = audioBuffer.getChannelData(0)
    const dataView = new DataView(arrayBuffer)

    for (let i = 0; i < numSamples; i++) {
      // 16-bit signed integer → -1.0 to 1.0
      const sample = dataView.getInt16(i * bytesPerSample, true) // little-endian
      channelData[i] = sample / 32768.0
    }

    // 创建播放源
    currentSource = ctx.createBufferSource()
    currentSource.buffer = audioBuffer
    currentSource.connect(ctx.destination)

    currentSource.onended = () => {
      isPlaying = false
      currentSource = null
      onEndCallback?.()
    }

    currentSource.start(0)
    isPlaying = true
  } catch (err) {
    console.error('[AudioPlayer] play failed:', err)
    isPlaying = false
    throw err
  }
}

/** 停止播放 */
export function stopPcm(): void {
  if (currentSource) {
    try {
      currentSource.stop()
    } catch {
      // 可能已经停止
    }
    currentSource = null
  }
  isPlaying = false
  onEndCallback = null
}

/** 是否正在播放 */
export function getIsPlaying(): boolean {
  return isPlaying
}
