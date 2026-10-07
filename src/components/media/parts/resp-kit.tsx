import { useEffect, useRef, type ReactNode } from 'react'
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
  type ValueAnimationTransition,
} from 'motion/react'
import { Check, X } from 'lucide-react'
import { Segmented } from '../ui'

/* Shared helpers for the respiratory illustration widgets (pneumothorax, alveolus,
 * bronchus, airway-anatomy). Semi-transparent tints read well on both light and dark
 * surfaces; solid strokes are mid-saturation for the same reason. */

export const rc = {
  lung: '#e0789c',
  lungSoft: 'rgba(224,120,156,0.22)',
  tissue: '#de8aa2',
  tissueSoft: 'rgba(222,138,162,0.2)',
  heart: '#dc2626',
  heartSoft: 'rgba(220,38,38,0.2)',
  vein: '#6b72d9',
  deoxy: '#6d5bd0',
  oxy: '#dc2626',
  airLine: '#38bdf8',
  airInk: '#0ea5e9',
  muscle: '#e0674a',
  muscleSoft: 'rgba(224,103,74,0.42)',
  mucosa: '#ec7f9a',
  mucosaSoft: 'rgba(241,155,176,0.5)',
  mucosaHot: 'rgba(232,74,112,0.55)',
  mucus: '#b5a637',
  mucusSoft: 'rgba(206,190,72,0.78)',
  cartilage: '#8fb3cf',
  wallSoft: 'rgba(148,163,184,0.13)',
  exudate: '#b8901f',
  exudateSoft: 'rgba(214,170,40,0.4)',
  plasma: '#d9a400',
  plasmaSoft: 'rgba(250,204,21,0.26)',
  clot: '#8f1d1d',
} as const

export const spring = { type: 'spring', duration: 0.55, bounce: 0.12 } as const
export const easeOut = [0.23, 1, 0.32, 1] as const

/** A number that springs to `target` whenever it changes (instant with reduced motion). */
export function useAnimatedNumber(
  target: number,
  reduce: boolean,
  transition: ValueAnimationTransition<number> = spring,
): MotionValue<number> {
  const mv = useMotionValue(target)
  useEffect(() => {
    if (reduce) {
      mv.jump(target)
      return
    }
    const controls = animate(mv, target, transition)
    return () => controls.stop()
    // transition is read from the render that changed the target
  }, [target, reduce, mv])
  return mv
}

/** Reduced-motion flag + whether loops should run (on screen and motion allowed). */
export function useLoop<T extends Element = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { amount: 0.1 })
  const reduce = useReducedMotion() ?? false
  return { ref, reduce, active: inView && !reduce }
}

/* ---------- geometry ---------- */

export type Pt = readonly [number, number]

const r1 = (n: number) => Math.round(n * 10) / 10

/** Smooth closed Catmull-Rom curve through the points, as an SVG path. */
export function closedCurve(pts: readonly Pt[], tension = 1): string {
  const n = pts.length
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i + n - 1) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`
  }
  return d + 'Z'
}

/** Circle with sinusoidal folds (e.g. a folded mucosa). */
export function wavyCircle(cx: number, cy: number, r: number, amp: number, lobes: number, phase = 0, steps = 60): string {
  const pts: Pt[] = []
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const rr = r + amp * Math.sin(lobes * a + phase)
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)])
  }
  return closedCurve(pts)
}

export function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (p: number, s: number) => (p >> s) & 255
  const m = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t)
  return `rgb(${m(16)},${m(8)},${m(0)})`
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/* ---------- animated dots that travel along a path ---------- */

export function FlowDots({
  d,
  count,
  duration,
  active,
  color,
  r = 3,
  reverse = false,
}: {
  d: string
  count: number
  /** seconds for one dot to travel the whole path */
  duration: number
  active: boolean
  color: string
  r?: number
  reverse?: boolean
}) {
  const pathRef = useRef<SVGPathElement>(null)
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const t0 = useRef(0)

  const place = () => {
    const path = pathRef.current
    if (!path) return
    const len = path.getTotalLength()
    for (let i = 0; i < count; i++) {
      const el = dots.current[i]
      if (!el) continue
      let t = (t0.current + i / count) % 1
      if (reverse) t = 1 - t
      const p = path.getPointAtLength(t * len)
      const edge = Math.min(1, t / 0.12, (1 - t) / 0.12)
      el.setAttribute('cx', p.x.toFixed(1))
      el.setAttribute('cy', p.y.toFixed(1))
      el.setAttribute('opacity', edge.toFixed(2))
    }
  }

  useEffect(() => {
    place()
  }, [d, count, reverse])

  useAnimationFrame((_, delta) => {
    if (!active) return
    t0.current = (t0.current + delta / 1000 / duration) % 1
    place()
  })

  return (
    <g aria-hidden>
      <path ref={pathRef} d={d} fill="none" stroke="none" />
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          ref={(el) => {
            dots.current[i] = el
          }}
          r={r}
          fill={color}
          opacity={0}
        />
      ))}
    </g>
  )
}

/* ---------- HTML building blocks ---------- */

/** Tinted stage the figure sits on. */
export function Stage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`relative overflow-hidden rounded-2xl bg-[var(--bg)] ${className}`}>{children}</div>
}

/**
 * State switcher: the shared `Segmented` on wide screens, a 2-column grid of the same
 * style on phones (long Finnish labels never get clipped or scroll sideways).
 */
export function StateTabs<T extends string>({
  value,
  onChange,
  options,
  layoutId,
  gridOnly = false,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  layoutId: string
  gridOnly?: boolean
}) {
  return (
    <>
      {!gridOnly && (
        <div className="hidden sm:block">
          <Segmented value={value} onChange={onChange} options={options} layoutId={layoutId} />
        </div>
      )}
      <div className={`no-select grid grid-cols-2 gap-1 rounded-xl bg-[var(--bg)] p-1 ${gridOnly ? '' : 'sm:hidden'}`} role="tablist">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(o.value)}
              className={`relative min-h-[44px] rounded-lg px-2 text-[13px] font-medium leading-tight transition-colors duration-150 ${
                active ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`${layoutId}-grid`}
                  className="absolute inset-0 rounded-lg bg-[var(--bg-raised)] shadow-sm"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                />
              )}
              <span className="relative">{o.label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

/** Content that fades/slides in when `k` changes. */
export function FadeSwap({ k, children, className = '' }: { k: string; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      key={k}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: easeOut }}
    >
      {children}
    </motion.div>
  )
}

export function Bullets({ items, dot = 'bg-[var(--text-dim)]' }: { items: ReactNode[]; dot?: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-[13.5px] leading-snug text-[var(--text)]">
          <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
          <span className="min-w-0">{it}</span>
        </li>
      ))}
    </ul>
  )
}

/** Small titled card for findings / treatment lists. */
export function InfoCard({
  title,
  accent = 'neutral',
  children,
}: {
  title: string
  accent?: 'neutral' | 'brand' | 'teal' | 'danger'
  children: ReactNode
}) {
  const head = {
    neutral: 'text-[var(--text-dim)]',
    brand: 'text-brand-600',
    teal: 'text-teal-600',
    danger: 'text-danger-500',
  }[accent]
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-3">
      <p className={`mb-2 text-[11px] font-semibold uppercase tracking-wide ${head}`}>{title}</p>
      {children}
    </div>
  )
}

/** ✓ / ✗ status tile (icon on top so three fit side by side at 360px). */
export function StatusTile({ ok, title, sub }: { ok: boolean; title: string; sub?: string }) {
  const reduce = useReducedMotion()
  return (
    <div
      className={`flex flex-col items-center rounded-xl border px-1.5 py-2.5 text-center transition-colors duration-200 ${
        ok ? 'border-teal-500/30 bg-teal-500/10' : 'border-danger-500/30 bg-danger-500/10'
      }`}
    >
      <motion.span
        key={ok ? 'ok' : 'no'}
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
        className={`flex h-7 w-7 items-center justify-center rounded-full text-white ${ok ? 'bg-teal-500' : 'bg-danger-500'}`}
      >
        {ok ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
        <span className="sr-only">{ok ? 'toimii' : 'ei toimi'}</span>
      </motion.span>
      <span className="mt-1.5 font-display text-[13px] font-semibold leading-tight text-[var(--text)] [hyphens:auto]" lang="fi">
        {title}
      </span>
      {sub && <span className="text-[11px] leading-tight text-[var(--text-dim)]">{sub}</span>}
    </div>
  )
}

/** Legend item with a colour swatch. */
export function Swatch({ color, label, shape = 'dot', stroke }: { color: string; label: string; shape?: 'dot' | 'bar' | 'ring'; stroke?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-dim)]">
      <span
        aria-hidden
        className={shape === 'bar' ? 'h-2.5 w-4 rounded-[3px]' : 'h-2.5 w-2.5 rounded-full'}
        style={{
          background: shape === 'ring' ? 'transparent' : color,
          border: `1.5px solid ${stroke ?? (shape === 'ring' ? color : 'transparent')}`,
        }}
      />
      {label}
    </span>
  )
}
