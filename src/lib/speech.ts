/* Thin wrapper over the Web Speech API. Works offline on iOS/macOS (on-device voices).
 * speak() must be called synchronously from a user gesture — iOS Safari drops
 * utterances started after an await, so never make it async. */

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

export function findVoice(lang: string): SpeechSynthesisVoice | undefined {
  if (!speechSupported()) return undefined
  const voices = window.speechSynthesis.getVoices()
  const base = lang.split('-')[0].toLowerCase()
  return voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ?? voices.find((v) => v.lang.toLowerCase().startsWith(base))
}

export function hasVoiceFor(lang: string): boolean {
  return Boolean(findVoice(lang))
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel()
}

export function speak(
  text: string,
  opts: { lang: string; rate?: number; onEnd?: () => void; onError?: (code: string) => void } = { lang: 'fi-FI' },
): SpeechSynthesisUtterance | null {
  if (!speechSupported()) return null
  const synth = window.speechSynthesis
  const u = new SpeechSynthesisUtterance(text)
  u.lang = opts.lang
  const voice = findVoice(opts.lang)
  if (voice) u.voice = voice
  u.rate = opts.rate ?? 1
  u.onend = () => opts.onEnd?.()
  u.onerror = (e) => opts.onError?.(e.error)
  synth.speak(u)
  return u
}

/** Voices load asynchronously in Chrome; call once on mount so later gestures find them. */
export function warmUpVoices(onReady?: () => void) {
  if (!speechSupported()) return () => {}
  const synth = window.speechSynthesis
  synth.getVoices()
  const handler = () => onReady?.()
  synth.addEventListener?.('voiceschanged', handler)
  return () => synth.removeEventListener?.('voiceschanged', handler)
}
