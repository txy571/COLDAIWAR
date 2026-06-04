/**
 * @file Audio Manager
 * @desc Web Audio API synthesizer generating UI sound effects dynamically.
 *       Mute state saved in localStorage.
 */

let audioCtx: AudioContext | null = null
let isMuted = false

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export const audioManager = {
  init() {
    if (typeof window !== 'undefined') {
      isMuted = localStorage.getItem('game_audio_muted') === 'true'
    }
  },

  isMuted() {
    return isMuted
  },

  toggleMute() {
    isMuted = !isMuted
    if (typeof window !== 'undefined') {
      localStorage.setItem('game_audio_muted', String(isMuted))
    }
    return isMuted
  },

  playClick() {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime) // 600Hz click
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1)

    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  },

  playTick() {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(250, ctx.currentTime)
    gain.gain.setValueAtTime(0.05, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  },

  playAlert() {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.linearRampToValueAtTime(300, now + 0.2)
    osc.frequency.linearRampToValueAtTime(150, now + 0.4)

    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(now + 0.5)
  },

  playWin() {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [261.63, 329.63, 392.00, 523.25] // C E G C major chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.12)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.12 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.12)
      osc.stop(now + idx * 0.12 + 0.4)
    })
  },

  playLose() {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [311.13, 293.66, 277.18, 220.00] // Minor/detuned falling notes
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, now + idx * 0.15)
      gain.gain.setValueAtTime(0.06, now + idx * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.15)
      osc.stop(now + idx * 0.15 + 0.5)
    })
  },
}
