import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Result, svg, type Tone } from '../ui'

/* Compression-rate trainer: tap in rhythm, target 100–120/min (Käypä hoito Elvytys 2021).
 * Optional metronome at 110/min using the Web Audio API. */

const MIN = 100
const MAX = 120

export default function CprRate() {
  const [taps, setTaps] = useState<number[]>([])
  const [count, setCount] = useState(0)
  const [metro, setMetro] = useState(false)
  const [pulse, setPulse] = useState(0)
  const ctxRef = useRef<AudioContext | null>(null)
  const reduce = useReducedMotion()

  const recent = taps.slice(-6)
  const rate = recent.length >= 3 ? Math.round(60000 / ((recent[recent.length - 1] - recent[0]) / (recent.length - 1))) : null

  useEffect(() => {
    if (!metro) return
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = ctxRef.current ?? new Ctx()
    ctxRef.current = ctx
    const id = setInterval(() => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 880
      g.gain.setValueAtTime(0.15, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
      o.connect(g).connect(ctx.destination)
      o.start()
      o.stop(ctx.currentTime + 0.07)
      setPulse((p) => p + 1)
    }, 60000 / 110)
    return () => clearInterval(id)
  }, [metro])

  function tap() {
    const now = performance.now()
    setTaps((t) => {
      const last = t[t.length - 1]
      return last && now - last > 2000 ? [now] : [...t.slice(-11), now]
    })
    setCount((c) => (c >= 30 ? 1 : c + 1))
  }

  let tone: Tone = 'neutral'
  let title = 'Napauta painiketta painelutahdissa'
  let text = 'Vähintään kolme napautusta, niin näet tahdin. Kokeile myös metronomia (110/min).'
  if (rate !== null) {
    if (rate < MIN) {
      tone = 'warning'
      title = `${rate}/min – liian hidas`
      text = 'Nopeuta: tavoite on 100–120 painallusta minuutissa.'
    } else if (rate > MAX) {
      tone = 'warning'
      title = `${rate}/min – liian nopea`
      text = 'Hidasta: tavoite on 100–120/min. Anna rintakehän palautua täysin jokaisen painalluksen jälkeen – painevaihtelu lisää laskimopaluuta.'
    } else {
      tone = 'ok'
      title = `${rate}/min – hyvä tahti`
      text = 'Muista myös syvyys 5–6 cm ja rintakehän täydellinen palautuminen jokaisen painalluksen välillä.'
    }
  }

  const angle = rate === null ? -90 : Math.max(-90, Math.min(90, ((rate - 60) / 120) * 180 - 90))

  return (
    <div>
      <svg viewBox="0 0 240 130" className="mx-auto h-auto w-full max-w-[320px]" role="img" aria-label={rate ? `Tahti ${rate} painallusta minuutissa` : 'Tahtimittari'}>
        <g aria-hidden>
          {/* scale 60–180 / min */}
          <path d="M30 116 A90 90 0 0 1 210 116" fill="none" stroke={svg.line} strokeWidth={14} />
          <path d={(() => {
            const a = (v: number) => (((v - 60) / 120) * 180 - 180) * (Math.PI / 180)
            const p = (v: number) => `${120 + 90 * Math.cos(a(v))} ${116 + 90 * Math.sin(a(v))}`
            return `M${p(MIN)} A90 90 0 0 1 ${p(MAX)}`
          })()} fill="none" stroke={svg.teal} strokeWidth={14} />
          <text x={30} y={128} fontSize={9} fill={svg.dim} textAnchor="middle">
            60
          </text>
          <text x={210} y={128} fontSize={9} fill={svg.dim} textAnchor="middle">
            180
          </text>
          <text x={120} y={18} fontSize={9} fill={svg.teal} textAnchor="middle">
            100–120
          </text>
          <motion.line
            x1={120}
            y1={116}
            x2={120}
            y2={40}
            stroke={svg.ink}
            strokeWidth={3}
            strokeLinecap="round"
            initial={false}
            animate={{ rotate: angle }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 14 }}
            style={{ transformBox: 'view-box', transformOrigin: '120px 116px' }}
          />
          <circle cx={120} cy={116} r={6} fill={svg.ink} />
        </g>
      </svg>

      <motion.button
        onPointerDown={tap}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        className="mx-auto mt-2 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-brand-500 text-white shadow-lg select-none"
        aria-label="Paina tahdissa"
      >
        <span className="font-display text-[15px] font-bold">PAINA</span>
        <span className="text-[12px] tabular-nums opacity-90">{count}/30</span>
      </motion.button>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2">
        <span className="flex items-center gap-2 text-[13px] text-[var(--text)]">
          Metronomi 110/min
          {metro && <motion.span key={pulse} className="h-2.5 w-2.5 rounded-full bg-teal-500" initial={{ opacity: 1, scale: 1.4 }} animate={{ opacity: 0.3, scale: 1 }} transition={{ duration: 0.4 }} />}
        </span>
        <button
          role="switch"
          aria-checked={metro}
          onClick={() => setMetro((m) => !m)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${metro ? 'bg-teal-500' : 'bg-[var(--bg-raised)] ring-1 ring-[var(--border)]'}`}
        >
          <span className="sr-only">Metronomi</span>
          <motion.span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow" initial={false} animate={{ x: metro ? 20 : 0 }} transition={{ duration: reduce ? 0 : 0.18 }} />
        </button>
      </div>

      <div className="mt-3">
        <Result tone={tone} title={title}>
          {text}
        </Result>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-dim)]">
        30 painallusta ja 2 puhallusta, kunnes hengitystie on varmistettu. Painelija vaihtuu 2 minuutin välein.
      </p>
    </div>
  )
}
