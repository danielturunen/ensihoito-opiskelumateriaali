import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import { svg } from '../ui'
import { useFrameLoop } from './cardio-hooks'

/* Shared building blocks for the clinical examination animations: an articulated side-view
 * figure, a front-view face, a pose tween and a step player. Poses are plain numbers so any
 * examination can be described as a list of target poses. */

export const FIG = {
  fill: 'color-mix(in srgb, var(--text) 16%, var(--bg-raised))',
  far: 'color-mix(in srgb, var(--text) 9%, var(--bg-raised))',
  line: 'var(--border)',
  hand: svg.brand,
  handSoft: svg.brandSoft,
} as const

const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)

/** Tween every numeric key of `target` from the current value (instant with reduced motion). */
export function useTween<T extends Record<string, number>>(target: T, duration = 0.8): T {
  const reduce = useReducedMotion() ?? false
  const [cur, setCur] = useState<T>(target)
  const curRef = useRef<T>(target)
  const key = JSON.stringify(target)

  useEffect(() => {
    if (reduce || duration <= 0) {
      curRef.current = target
      setCur(target)
      return
    }
    const from = curRef.current
    const t0 = performance.now()
    let raf = 0
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / (duration * 1000))
      const e = easeInOut(k)
      const next = { ...target }
      for (const k2 of Object.keys(target) as (keyof T)[]) {
        const a = (from[k2] ?? target[k2]) as number
        next[k2] = (a + ((target[k2] as number) - a) * e) as T[keyof T]
      }
      curRef.current = next
      setCur(next)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // `key` captures the target's contents
  }, [key, reduce, duration])

  return cur
}

/* ---------- side-view figure (faces right) ---------- */

export interface SidePose {
  x: number
  y: number
  /** torso rotation about the hip; 0 = upright, −90 = lying on the back (head to the left) */
  torso: number
  /** + flexion (chin to chest), − extension */
  neck: number
  shoulder: number
  elbow: number
  hip: number
  knee: number
  ankle?: number
  /** far-side limbs, default to the near ones */
  shoulderFar?: number
  elbowFar?: number
  hipFar?: number
  kneeFar?: number
}

export const FIG_DIM = { torso: 56, neck: 5, head: 11, upperArm: 28, forearm: 25, thigh: 36, shin: 34, foot: 12 } as const

function Limb({ a, b, len1, len2, far, foot, ankle = 0, hand }: { a: number; b: number; len1: number; len2: number; far?: boolean; foot?: boolean; ankle?: number; hand?: ReactNode }) {
  const color = far ? FIG.far : FIG.fill
  return (
    <g transform={`rotate(${a})`}>
      <path d={`M0 0L0 ${len1}`} stroke={color} strokeWidth={far ? 8 : 9} strokeLinecap="round" />
      <g transform={`translate(0 ${len1}) rotate(${b})`}>
        <path d={`M0 0L0 ${len2}`} stroke={color} strokeWidth={far ? 7 : 8} strokeLinecap="round" />
        {foot && <path d={`M0 ${len2}L${FIG_DIM.foot} ${len2}`} stroke={color} strokeWidth={far ? 6 : 7} strokeLinecap="round" transform={`rotate(${ankle} 0 ${len2})`} />}
        {hand}
      </g>
    </g>
  )
}

/** Articulated figure. Children are drawn in the head's frame (e.g. markers on the face). */
export function SideFigure({ p, headExtra, torsoExtra }: { p: SidePose; headExtra?: ReactNode; torsoExtra?: ReactNode }) {
  const { torso: T, neck: N, head: H, upperArm, forearm, thigh, shin } = FIG_DIM
  const headCy = -T - N - H
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.torso})`}>
      {/* far limbs */}
      <Limb a={-(p.hipFar ?? p.hip)} b={p.kneeFar ?? p.knee} len1={thigh} len2={shin} far foot ankle={p.ankle} />
      <g transform={`translate(0 ${-T + 6})`}>
        <Limb a={-(p.shoulderFar ?? p.shoulder)} b={-(p.elbowFar ?? p.elbow)} len1={upperArm} len2={forearm} far />
      </g>
      {/* torso */}
      <rect x={-11} y={-T} width={22} height={T + 8} rx={11} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
      {torsoExtra}
      {/* head */}
      <g transform={`rotate(${p.neck} 0 ${-T})`}>
        <path d={`M0 ${-T + 2}L0 ${-T - N - 2}`} stroke={FIG.fill} strokeWidth={10} strokeLinecap="round" />
        <circle cx={0} cy={headCy} r={H} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
        <path d={`M${H - 1} ${headCy - 2}L${H + 4} ${headCy + 2}L${H - 1} ${headCy + 4}`} fill={FIG.fill} stroke={FIG.line} strokeWidth={1} strokeLinejoin="round" />
        <circle cx={H - 4} cy={headCy - 3} r={1.4} fill={svg.ink} />
        {headExtra}
      </g>
      {/* near limbs */}
      <Limb a={-p.hip} b={p.knee} len1={thigh} len2={shin} foot ankle={p.ankle} />
      <g transform={`translate(0 ${-T + 6})`}>
        <Limb a={-p.shoulder} b={-p.elbow} len1={upperArm} len2={forearm} />
      </g>
    </g>
  )
}

/* ---------- front-view face ---------- */

export function Face({
  cx,
  cy,
  r = 30,
  gaze = 0,
  gazeR,
  droop = 0,
  smile = 0,
  eyesClosed = false,
}: {
  cx: number
  cy: number
  r?: number
  /** −1 … 1, horizontal gaze of both eyes (positive = viewer's right) */
  gaze?: number
  /** separate gaze for the viewer-right eye (skew/dysconjugate) – vertical offset in px */
  gazeR?: { dy: number }
  /** 0 … 1: viewer-left mouth corner droops (patient's right) */
  droop?: number
  /** 0 … 1: both mouth corners rise (grimace/smile) */
  smile?: number
  eyesClosed?: boolean
}) {
  const ex = r * 0.38
  const ey = cy - r * 0.12
  const pupil = (side: -1 | 1) => {
    const dy = side === 1 && gazeR ? gazeR.dy : 0
    return <circle cx={cx + side * ex + gaze * r * 0.12} cy={ey + dy} r={r * 0.09} fill={svg.ink} />
  }
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r * 0.86} ry={r} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.4} />
      {[-1, 1].map((s) =>
        eyesClosed ? (
          <path key={s} d={`M${cx + s * ex - r * 0.16} ${ey}Q${cx + s * ex} ${ey + r * 0.08} ${cx + s * ex + r * 0.16} ${ey}`} fill="none" stroke={svg.ink} strokeWidth={1.6} strokeLinecap="round" />
        ) : (
          <g key={s}>
            <ellipse cx={cx + s * ex} cy={ey} rx={r * 0.2} ry={r * 0.13} fill={svg.surface} stroke={svg.dim} strokeWidth={1.2} />
            {pupil(s as -1 | 1)}
          </g>
        ),
      )}
      <path d={`M${cx} ${cy - r * 0.05}L${cx - r * 0.08} ${cy + r * 0.22}L${cx + r * 0.06} ${cy + r * 0.24}`} fill="none" stroke={svg.dim} strokeWidth={1.4} strokeLinejoin="round" />
      <path
        d={`M${cx - r * 0.36} ${cy + r * 0.48 - smile * r * 0.14 + droop * r * (0.22 + smile * 0.14)}Q${cx} ${cy + r * 0.62 + smile * r * 0.06 + droop * r * 0.06} ${cx + r * 0.36} ${cy + r * 0.48 - smile * r * 0.14}`}
        fill="none"
        stroke={svg.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  )
}

/* ---------- beating eye (nystagmus) ---------- */

/** Pupil x-offset in −1…1 for a jerk nystagmus: slow drift, fast correction toward `fast` side. */
export function useNystagmus(ref: RefObject<Element | null>, on: boolean, amp = 1, fast: 1 | -1 = 1, rate = 2.4) {
  const [x, setX] = useState(0)
  const t = useRef(0)
  useFrameLoop(
    ref,
    (dt) => {
      t.current += dt
      const beat = (t.current * rate) % 1
      const s = beat < 0.8 ? beat / 0.8 : 1 - (beat - 0.8) / 0.2 // 0→1 slow, 1→0 fast
      setX(fast * (0.5 - s) * amp)
    },
    on,
  )
  return on ? x : 0
}

/* ---------- step player ---------- */

export interface ExamStep {
  title: string
  text: string
  /** seconds the step stays on screen while playing */
  dur?: number
}

export function useStepper(count: number, durs: number[]) {
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    if (i >= count - 1) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setI((v) => v + 1), (durs[i] ?? 2.5) * 1000)
    return () => clearTimeout(t)
  }, [playing, i, count, durs])
  return {
    i,
    playing,
    go: (n: number) => {
      setPlaying(false)
      setI(Math.max(0, Math.min(count - 1, n)))
    },
    toggle: () => {
      if (i >= count - 1) setI(0)
      setPlaying((p) => !p)
    },
  }
}

export function StepControls({ steps, s }: { steps: ExamStep[]; s: ReturnType<typeof useStepper> }) {
  const step = steps[s.i]
  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <button onClick={() => s.go(s.i - 1)} disabled={s.i === 0} aria-label="Edellinen vaihe" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--text)] disabled:opacity-35">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={s.toggle} className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 text-[13px] font-semibold text-white active:scale-[0.98]">
          {s.playing ? <Pause className="h-4 w-4" /> : s.i >= steps.length - 1 ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {s.playing ? 'Tauko' : s.i >= steps.length - 1 ? 'Alusta' : 'Toista vaiheet'}
        </button>
        <button onClick={() => s.go(s.i + 1)} disabled={s.i === steps.length - 1} aria-label="Seuraava vaihe" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--text)] disabled:opacity-35">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2.5 flex gap-1" aria-hidden>
        {steps.map((_, n) => (
          <span key={n} className={`h-1 flex-1 rounded-full transition-colors duration-200 ${n <= s.i ? 'bg-brand-500' : 'bg-[var(--border)]'}`} />
        ))}
      </div>
      <div className="mt-2.5 rounded-xl bg-[var(--bg)] px-3.5 py-3" aria-live="polite">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
          Vaihe {s.i + 1} / {steps.length}
        </p>
        <p className="mt-0.5 font-display text-[15px] font-semibold leading-snug text-[var(--text)]">{step.title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{step.text}</p>
      </div>
    </div>
  )
}
