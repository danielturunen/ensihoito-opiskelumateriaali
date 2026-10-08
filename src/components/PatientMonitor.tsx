import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { Activity, BellRing, Heart } from 'lucide-react'
import type { ScenarioVitals } from '../content/types'
import { scoreHR, scoreRR, scoreSBP, scoreSpO2 } from '../lib/news2'

/* Bedside-style patient monitor for the case scenarios. It only shows what the step texts
 * state: values carry over from earlier steps (dimmed, "aiempi") until re-measured, and a
 * parameter that was never measured stays empty. Alarm colours use the NEWS2 bands. */

type Num = { value: number; fresh: boolean } | null

function latest<K extends keyof ScenarioVitals>(history: (ScenarioVitals | undefined)[], key: K) {
  for (let i = history.length - 1; i >= 0; i--) {
    const v = history[i]?.[key]
    if (v !== undefined) return { value: v as NonNullable<ScenarioVitals[K]>, fresh: i === history.length - 1 }
  }
  return null
}

export function hasMonitorData(history: (ScenarioVitals | undefined)[]) {
  return history.some((v) => v && (v.hr ?? v.spo2 ?? v.bp ?? v.rr ?? v.gcs ?? v.glucose ?? v.ketones ?? v.pain) !== undefined)
}

const C = {
  panel: '#070b14',
  grid: 'rgba(148,163,184,0.10)',
  line: 'rgba(148,163,184,0.18)',
  hr: '#4ade80',
  spo2: '#22d3ee',
  resp: '#facc15',
  bp: '#e2e8f0',
  dim: '#64748b',
  amber: '#fb923c',
  red: '#ef4444',
}

type Level = 0 | 1 | 2
const level = (score: number): Level => (score >= 3 ? 2 : score >= 1 ? 1 : 0)

/* ---------------------------------------------------------------- waveforms */

/** Seeded PRNG so irregular rhythms look the same on every visit. */
function prng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface WaveSpec {
  /** events per minute, or null = flat line */
  rate: number | null
  irregular?: boolean
  /** relative amplitude 0..1 */
  amp: number
  kind: 'pleth' | 'resp'
}

const plethShape = (tau: number) =>
  tau < 0 ? 0 : Math.exp(-(((tau - 0.1) / 0.05) ** 2)) + 0.38 * Math.exp(-(((tau - 0.3) / 0.075) ** 2)) + 0.1 * Math.exp(-tau / 0.5)
const respShape = (ph: number) => (ph < 0.4 ? 0.5 - 0.5 * Math.cos((ph / 0.4) * Math.PI) : Math.exp(-((ph - 0.4) / 0.6) * 4.2))

/** Event-driven signal generator: beats/breaths are scheduled as time advances. */
function makeSignal(spec: WaveSpec, seed: number) {
  const rand = prng(seed)
  const events: { t: number; a: number; len: number }[] = []
  let next = 0.15
  return (t: number) => {
    if (!spec.rate) return 0
    const period = 60 / spec.rate
    while (next <= t) {
      const jitter = spec.irregular ? 0.6 + rand() * 0.8 : 1
      const a = spec.kind === 'resp' && spec.irregular ? 0.35 + rand() * 0.65 : 1
      const len = period * jitter
      events.push({ t: next, a, len })
      next += len
      if (events.length > 8) events.shift()
    }
    let v = 0
    for (const e of events) {
      const tau = t - e.t
      if (spec.kind === 'pleth') v += plethShape(tau) * e.a
      else if (tau >= 0 && tau < e.len) v += respShape(tau / e.len) * e.a
    }
    return v * spec.amp
  }
}

function Wave({ spec, color, speed, label, onBeat }: { spec: WaveSpec; color: string; speed: number; label: string; onBeat?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inView = useInView(canvasRef, { margin: '60px 0px' })
  const reduce = useReducedMotion()
  const onBeatRef = useRef(onBeat)
  onBeatRef.current = onBeat
  const key = `${spec.rate}-${spec.irregular}-${spec.amp}-${spec.kind}`

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    let w = 0
    let h = 0
    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
    }
    resize()
    const signal = makeSignal(spec, spec.kind === 'pleth' ? 7 : 13)
    const yOf = (v: number) => h - 6 - v * (h - 12) * (spec.kind === 'pleth' ? 0.78 : 0.9)
    const flat = !spec.rate

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.globalAlpha = flat ? 0.35 : 1
      ctx.setLineDash(flat ? [3, 5] : [])
      ctx.beginPath()
      for (let x = 0; x <= w; x += 1) {
        const y = yOf(flat ? 0 : signal(x / speed))
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.setLineDash([])
    }

    if (reduce || flat || !inView) {
      drawStatic()
      return
    }

    let raf = 0
    let last = performance.now()
    let t = 0
    let x = 0
    let prevY = yOf(0)
    let lastBeat = -1
    const tick = (now: number) => {
      const dt = Math.min(now - last, 200) / 1000
      last = now
      const steps = Math.max(1, Math.round(dt * speed))
      for (let i = 0; i < steps; i++) {
        t += 1 / speed
        const v = signal(t)
        const y = yOf(v)
        // erase bar ahead of the pen, like a real sweep monitor
        ctx.clearRect(x + 1, 0, 14, h)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(x, prevY)
        ctx.lineTo(x + 1, y)
        ctx.stroke()
        prevY = y
        x += 1
        if (x >= w) {
          x = 0
          ctx.clearRect(0, 0, 14, h)
        }
        if (spec.kind === 'pleth' && spec.rate) {
          const beatIdx = Math.floor(t * 1000)
          if (v > 0.9 * spec.amp && beatIdx - lastBeat > 250) {
            lastBeat = beatIdx
            onBeatRef.current?.()
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }
    ctx.clearRect(0, 0, w, h)
    raf = requestAnimationFrame(tick)
    const ro = new ResizeObserver(() => {
      resize()
      x = 0
    })
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
    // spec is captured through `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, color, speed, reduce, inView])

  return (
    <div className="relative h-[60px]">
      <span className="absolute top-1 left-2 text-[10px] font-semibold tracking-wide" style={{ color }}>
        {label}
      </span>
      {!spec.rate && (
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium" style={{ color: C.dim }}>
          ei mitattu
        </span>
      )}
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block h-full w-full" />
    </div>
  )
}

/* ---------------------------------------------------------------- numerics */

function useCounted(target: number | null, decimals = 0) {
  const [shown, setShown] = useState(target)
  const reduce = useReducedMotion()
  const prev = useRef(target)
  useEffect(() => {
    const from = prev.current
    prev.current = target
    if (target === null || from === null || reduce || from === target) {
      setShown(target)
      return
    }
    const c = animate(from, target, { duration: 0.7, ease: [0.23, 1, 0.32, 1], onUpdate: (v) => setShown(Number(v.toFixed(decimals))) })
    return () => c.stop()
  }, [target, reduce, decimals])
  return shown
}

function fmt(v: number | null, decimals = 0) {
  if (v === null) return '—'
  return decimals ? v.toFixed(decimals).replace('.', ',') : String(Math.round(v))
}

function Param({
  label,
  unit,
  num,
  color,
  lvl = 0,
  decimals = 0,
  big = true,
  children,
}: {
  label: string
  unit?: string
  num: Num
  color: string
  lvl?: Level
  decimals?: number
  big?: boolean
  children?: ReactNode
}) {
  const shown = useCounted(num?.value ?? null, decimals)
  const stale = num !== null && !num.fresh
  const tint = lvl === 2 ? C.red : lvl === 1 ? C.amber : color
  return (
    <div
      className="relative flex min-w-0 flex-col justify-between gap-1 rounded-lg px-2 py-1.5"
      style={{ background: lvl === 2 ? 'rgba(239,68,68,0.16)' : 'rgba(148,163,184,0.06)', boxShadow: lvl === 2 ? `inset 0 0 0 1px ${C.red}` : undefined }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[10px] font-semibold tracking-wide" style={{ color: tint }}>
          {label}
        </span>
        {children}
      </div>
      <div className="flex items-baseline gap-1" style={{ opacity: stale ? 0.5 : 1 }}>
        <span className={`font-display font-bold leading-none tabular-nums ${big ? 'text-[24px]' : 'text-[19px]'}`} style={{ color: num ? tint : C.dim }}>
          {fmt(shown, decimals)}
        </span>
        {unit && num && (
          <span className="text-[10px] font-medium" style={{ color: C.dim }}>
            {unit}
          </span>
        )}
      </div>
      {stale && (
        <span className="absolute right-1.5 bottom-1 text-[9px] font-medium uppercase tracking-wide" style={{ color: C.dim }}>
          aiempi
        </span>
      )}
      {num?.fresh && lvl === 2 && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{ boxShadow: `0 0 0 2px ${C.red}` }}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: [0.9, 0.15, 0.9] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}

function BpParam({ bp, lvl, irregular }: { bp: { value: [number, number]; fresh: boolean } | null; lvl: Level; irregular: boolean }) {
  const sys = useCounted(bp?.value[0] ?? null)
  const dia = useCounted(bp?.value[1] ?? null)
  const tint = lvl === 2 ? C.red : lvl === 1 ? C.amber : C.bp
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5"
      style={{ background: lvl === 2 ? 'rgba(239,68,68,0.16)' : 'rgba(148,163,184,0.06)', boxShadow: lvl === 2 ? `inset 0 0 0 1px ${C.red}` : undefined }}
    >
      <span className="text-[10px] font-semibold tracking-wide" style={{ color: tint }}>
        VERENPAINE
        {irregular && (
          <span className="ml-2 font-medium normal-case tracking-normal" style={{ color: C.dim }}>
            syke epäsäännöllinen
          </span>
        )}
      </span>
      <span className="flex items-baseline gap-1" style={{ opacity: bp && !bp.fresh ? 0.5 : 1 }}>
        {bp && !bp.fresh && (
          <span className="mr-1 text-[9px] font-medium uppercase tracking-wide" style={{ color: C.dim }}>
            aiempi
          </span>
        )}
        <span className="font-display text-[22px] font-bold leading-none tabular-nums" style={{ color: bp ? tint : C.dim }}>
          {bp ? `${fmt(sys)}/${fmt(dia)}` : '—'}
        </span>
        {bp && (
          <span className="text-[10px] font-medium" style={{ color: C.dim }}>
            mmHg
          </span>
        )}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------- monitor */

export function PatientMonitor({ history }: { history: (ScenarioVitals | undefined)[] }) {
  const hr = latest(history, 'hr')
  const spo2 = latest(history, 'spo2')
  const bp = latest(history, 'bp')
  const rr = latest(history, 'rr')
  const gcs = latest(history, 'gcs')
  const glucose = latest(history, 'glucose')
  const ketones = latest(history, 'ketones')
  const pain = latest(history, 'pain')
  const pulse = latest(history, 'pulse')
  const breath = latest(history, 'breath')
  const findings = history[history.length - 1]?.findings ?? []
  const heartRef = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()

  const lv = {
    hr: hr ? level(scoreHR(hr.value)) : 0,
    spo2: spo2 ? level(scoreSpO2(spo2.value)) : 0,
    bp: bp ? level(scoreSBP(bp.value[0])) : 0,
    rr: rr ? level(scoreRR(rr.value)) : 0,
  } as Record<string, Level>
  const alarm = Math.max(...Object.values(lv)) as Level

  const beat = () => {
    if (reduce) return
    heartRef.current?.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(0.23,1,0.32,1)' })
  }

  const breathAmp = breath?.value === 'deep' ? 1 : breath?.value === 'shallow' ? 0.32 : breath?.value === 'irregular' ? 0.75 : 0.6
  const extras = [
    gcs && { k: 'GCS', v: fmt(gcs.value), fresh: gcs.fresh },
    glucose && { k: 'B-gluk', v: `${fmt(glucose.value, 1)} mmol/l`, fresh: glucose.fresh },
    ketones && { k: 'Ketoaineet', v: `${fmt(ketones.value, 1)} mmol/l`, fresh: ketones.fresh },
    pain && { k: 'Kipu VAS', v: `${pain.value}/10`, fresh: pain.fresh },
  ].filter(Boolean) as { k: string; v: string; fresh: boolean }[]

  return (
    <div role="group" aria-label="Potilasmonitori" className="overflow-hidden rounded-2xl border border-white/10 shadow-[var(--shadow)]" style={{ background: C.panel }}>
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: C.line }}>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.dim }}>
          <Activity className="h-3.5 w-3.5" /> Monitori
        </span>
        {alarm > 0 && (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: alarm === 2 ? '#fff' : C.amber, background: alarm === 2 ? C.red : 'rgba(251,146,60,0.14)' }}
          >
            <BellRing className="h-3 w-3" /> {alarm === 2 ? 'Hälytys' : 'Poikkeava'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-1.5 p-1.5">
        <div className="rounded-lg" style={{ background: `repeating-linear-gradient(90deg, ${C.grid} 0 1px, transparent 1px 24px)` }}>
          <Wave spec={{ rate: hr?.value ?? null, irregular: pulse?.value === 'irregular', amp: 1, kind: 'pleth' }} color={C.spo2} speed={70} label="PLETH" onBeat={beat} />
        </div>
        <div className="grid w-[132px] grid-cols-2 gap-1.5">
          <Param label="SYKE" num={hr} color={C.hr} lvl={lv.hr}>
            <span ref={heartRef} className="inline-flex" style={{ color: hr ? C.hr : C.dim }}>
              <Heart className="h-3 w-3" fill="currentColor" />
            </span>
          </Param>
          <Param label="SpO₂" unit="%" num={spo2} color={C.spo2} lvl={lv.spo2} />
        </div>

        <div className="rounded-lg" style={{ background: `repeating-linear-gradient(90deg, ${C.grid} 0 1px, transparent 1px 24px)` }}>
          <Wave spec={{ rate: rr?.value ?? null, irregular: breath?.value === 'irregular', amp: breathAmp, kind: 'resp' }} color={C.resp} speed={34} label="RESP" />
        </div>
        <div className="grid w-[132px]">
          <Param label="HENGITYS" unit="/min" num={rr} color={C.resp} lvl={lv.rr} />
        </div>
      </div>

      <div className="px-1.5 pb-1.5">
        <BpParam bp={bp} lvl={lv.bp} irregular={pulse?.value === 'irregular' && !!hr} />
      </div>

      {(extras.length > 0 || findings.length > 0) && (
        <div className="flex flex-wrap gap-1.5 border-t px-2.5 py-2" style={{ borderColor: C.line }}>
          {extras.map((e) => (
            <span
              key={e.k}
              className="rounded-md px-2 py-1 text-[11px] font-semibold tabular-nums"
              style={{ background: 'rgba(148,163,184,0.10)', color: C.bp, opacity: e.fresh ? 1 : 0.55 }}
            >
              <span style={{ color: C.dim }}>{e.k}</span> {e.v}
            </span>
          ))}
          {findings.map((f) => (
            <span key={f} className="rounded-md px-2 py-1 text-[11px] font-medium" style={{ background: 'rgba(250,204,21,0.08)', color: '#fde68a' }}>
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
