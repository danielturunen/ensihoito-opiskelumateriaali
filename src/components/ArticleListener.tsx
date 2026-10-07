import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Headphones, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'
import { hasVoiceFor, speak, speechSupported, stopSpeaking, warmUpVoices } from '../lib/speech'

interface Chunk {
  el: HTMLElement
  text: string
}

const RATES = [1, 1.25, 1.5]

function buildChunks(root: HTMLElement): Chunk[] {
  const picked = Array.from(root.querySelectorAll<HTMLElement>('h2, h3, p, li, tr')).filter((el) => {
    if (el.closest('[data-media]')) return false
    // Skip nodes nested inside another picked node (e.g. <p> inside <li> or a table cell).
    const parent = el.parentElement?.closest('li, tr')
    return !(parent && root.contains(parent))
  })
  const chunks: Chunk[] = []
  for (const el of picked) {
    const text = el.tagName === 'TR' ? Array.from(el.children).map((c) => c.textContent?.trim()).filter(Boolean).join(', ') : (el.textContent ?? '').trim()
    if (!text) continue
    // Sentence-sized pieces: long utterances get cut off on some engines.
    const parts = text.length > 220 ? text.split(/(?<=[.!?])\s+/) : [text]
    for (const p of parts) if (p.trim()) chunks.push({ el, text: p.replace(/\[!\w+\]\s*/g, '') })
  }
  return chunks
}

export function ArticleListener({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const [state, setState] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [index, setIndex] = useState(0)
  const [rate, setRate] = useState(1)
  const [, setVoices] = useState(0)
  const chunks = useRef<Chunk[]>([])
  const playingRef = useRef(false)
  // Bumped on every new utterance/stop: a cancelled utterance's late "end" event (Safari) must not advance playback.
  const genRef = useRef(0)
  const reduce = useReducedMotion()

  useEffect(() => warmUpVoices(() => setVoices((n) => n + 1)), [])

  const clearHighlight = () => {
    targetRef.current?.querySelectorAll('.tts-active').forEach((el) => el.classList.remove('tts-active'))
  }

  const playFrom = useCallback(
    (i: number, r: number) => {
      const list = chunks.current
      if (i >= list.length) {
        playingRef.current = false
        clearHighlight()
        setState('idle')
        setIndex(0)
        return
      }
      const chunk = list[i]
      clearHighlight()
      chunk.el.classList.add('tts-active')
      const rect = chunk.el.getBoundingClientRect()
      if (rect.top < 80 || rect.bottom > window.innerHeight - 160) {
        chunk.el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
      }
      setIndex(i)
      const gen = ++genRef.current
      speak(chunk.text, {
        lang: 'fi-FI',
        rate: r,
        onEnd: () => {
          if (playingRef.current && gen === genRef.current) playFrom(i + 1, r)
        },
        onError: (code) => {
          // cancel() during skip/pause/rate change fires "interrupted"/"canceled" on the old utterance — not a real failure.
          if (code === 'interrupted' || code === 'canceled' || !playingRef.current || gen !== genRef.current) return
          playingRef.current = false
          setState('paused')
        },
      })
    },
    [reduce],
  )

  function start() {
    if (!targetRef.current) return
    chunks.current = buildChunks(targetRef.current)
    playingRef.current = true
    setState('playing')
    stopSpeaking()
    playFrom(state === 'paused' ? index : 0, rate)
  }

  function pause() {
    playingRef.current = false
    genRef.current++
    stopSpeaking()
    setState('paused')
  }

  function close() {
    playingRef.current = false
    genRef.current++
    stopSpeaking()
    clearHighlight()
    setState('idle')
    setIndex(0)
  }

  function jump(delta: number) {
    const target = Math.max(0, Math.min(chunks.current.length - 1, index + delta))
    playingRef.current = true
    setState('playing')
    stopSpeaking()
    playFrom(target, rate)
  }

  function cycleRate() {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
    setRate(next)
    if (state === 'playing') {
      stopSpeaking()
      playingRef.current = true
      playFrom(index, next)
    }
  }

  useEffect(
    () => () => {
      playingRef.current = false
      stopSpeaking()
    },
    [],
  )

  if (!speechSupported()) return null
  const total = chunks.current.length || 1
  const noVoice = !hasVoiceFor('fi-FI')

  return (
    <>
      <button
        onClick={state === 'playing' ? pause : start}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-[13px] font-semibold text-[var(--text)] transition-[border-color,transform] duration-150 ease-out hover:border-brand-300 active:scale-[0.97]"
      >
        <Headphones className="h-4 w-4" /> {state === 'idle' ? 'Kuuntele' : state === 'playing' ? 'Tauko' : 'Jatka'}
      </button>

      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
            className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+76px)] z-40 mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)]/90 p-3 shadow-2xl backdrop-blur-xl backdrop-saturate-150 lg:bottom-6"
            role="region"
            aria-label="Artikkelin kuuntelu"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Headphones className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[var(--text)]">{noVoice ? 'Suomenkielistä ääntä ei löytynyt' : 'Luetaan ääneen'}</p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--bg-card)]">
                  <div className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out" style={{ width: `${((index + 1) / total) * 100}%` }} />
                </div>
              </div>
              <button onClick={cycleRate} className="h-10 min-w-10 shrink-0 rounded-full px-2 font-display text-[12px] font-bold tabular-nums text-[var(--text-dim)] active:scale-90" aria-label="Nopeus">
                {String(rate).replace('.', ',')}×
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <button onClick={() => jump(-1)} aria-label="Edellinen kappale" className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--text)] active:scale-90">
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={state === 'playing' ? pause : start}
                aria-label={state === 'playing' ? 'Tauko' : 'Jatka'}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] transition-transform duration-150 active:scale-90"
              >
                {state === 'playing' ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
              </button>
              <button onClick={() => jump(1)} aria-label="Seuraava kappale" className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--text)] active:scale-90">
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            <button onClick={close} aria-label="Sulje kuuntelu" className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text-dim)] shadow active:scale-90">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
