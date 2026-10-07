import { useId, useRef, useState, type PointerEvent } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowRight, Wind } from 'lucide-react'
import { Caption, NumberField, svg } from '../ui'

// Article: raskaana-oleva-synnyttaja – SpO₂ noin 65 % (2 min), 85 % (5 min), 90 % (10 min).
const POINTS = [
  { m: 2, v: 65 },
  { m: 5, v: 85 },
  { m: 10, v: 90 },
]
const APGAR = [1, 5, 10]

const W = 340
const H = 228
const PL = 40
const PR = 324
const PT = 14
const PB = 184
const X = (m: number) => PL + (m / 10) * (PR - PL)
const Y = (v: number) => PB - ((v - 50) / 50) * (PB - PT)

/* Monotone cubic (Fritsch–Carlson) through the three article points – no overshoot, no invented points. */
const TANGENTS = (() => {
  const d = POINTS.slice(1).map((p, i) => (p.v - POINTS[i].v) / (p.m - POINTS[i].m))
  const t = POINTS.map((_, i) => (i === 0 ? d[0] : i === POINTS.length - 1 ? d[d.length - 1] : (d[i - 1] + d[i]) / 2))
  d.forEach((dk, k) => {
    const a = t[k] / dk
    const b = t[k + 1] / dk
    const s = a * a + b * b
    if (s > 9) {
      const tau = 3 / Math.sqrt(s)
      t[k] = tau * a * dk
      t[k + 1] = tau * b * dk
    }
  })
  return t
})()

function spo2At(m: number) {
  let k = 0
  while (k < POINTS.length - 2 && m > POINTS[k + 1].m) k++
  const a = POINTS[k]
  const b = POINTS[k + 1]
  const h = b.m - a.m
  const t = (m - a.m) / h
  const t2 = t * t
  const t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * a.v + (t3 - 2 * t2 + t) * h * TANGENTS[k] + (-2 * t3 + 3 * t2) * b.v + (t3 - t2) * h * TANGENTS[k + 1]
}

const f = (n: number) => n.toFixed(1)
const CURVE = POINTS.slice(1).reduce((acc, b, i) => {
  const a = POINTS[i]
  const h = b.m - a.m
  const c1 = [X(a.m + h / 3), Y(a.v + (TANGENTS[i] * h) / 3)]
  const c2 = [X(b.m - h / 3), Y(b.v - (TANGENTS[i + 1] * h) / 3)]
  return `${acc} C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(X(b.m))} ${f(Y(b.v))}`
}, `M ${f(X(POINTS[0].m))} ${f(Y(POINTS[0].v))}`)
const AREA = `${CURVE} L ${f(X(10))} ${PB} L ${f(X(2))} ${PB} Z`

const LABELS = [
  { x: X(2) - 9, y: Y(65) + 4, anchor: 'end' as const },
  { x: X(5) - 9, y: Y(85) - 8, anchor: 'end' as const },
  { x: X(10), y: Y(90) - 13, anchor: 'end' as const },
]

const fmt = (n: number) => String(n).replace('.', ',')

export default function NewbornSpo2() {
  const reduce = useReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [minute, setMinute] = useState(5)
  const dragging = useRef(false)

  const drawn = reduce || inView
  const value = Math.round(spo2At(minute))
  const mx = X(minute)
  const my = Y(spo2At(minute))
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.35, bounce: 0 }

  function fromPointer(e: PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    const m = Math.round(((vx - PL) / (PR - PL)) * 10)
    setMinute(Math.max(2, Math.min(10, m)))
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{fmt(minute)} min syntymästä</p>
          <p className="font-display text-[30px] font-bold leading-none tabular-nums text-teal-600">
            ≈ {value}
            <span className="ml-0.5 text-[16px] font-semibold"> %</span>
          </p>
        </div>
        <span className="mb-0.5 rounded-full bg-[var(--bg)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
          suuntaa-antava
        </span>
      </div>

      <p className="mt-3 text-[12px] font-medium text-[var(--text-dim)]">SpO₂ %</p>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full cursor-pointer select-none"
        style={{ touchAction: 'pan-y' }}
        role="img"
        aria-label="Terveen vastasyntyneen happisaturaation suuntaa-antavat tavoitteet: noin 65 % kahden, noin 85 % viiden ja noin 90 % kymmenen minuutin kohdalla."
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          fromPointer(e)
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <defs>
          <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={svg.teal} stopOpacity="0.26" />
            <stop offset="100%" stopColor={svg.teal} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* grid + axes */}
        <g aria-hidden="true">
          {[50, 60, 70, 80, 90, 100].map((v) => (
            <g key={v}>
              <line x1={PL} x2={PR} y1={Y(v)} y2={Y(v)} stroke={svg.line} strokeWidth={v === 50 ? 1.5 : 1} />
              <text x={PL - 8} y={Y(v) + 4.5} textAnchor="end" fontSize={13} fill={svg.dim} className="tabular-nums">
                {v}
              </text>
            </g>
          ))}
          {Array.from({ length: 11 }, (_, m) => (
            <g key={m}>
              <line x1={X(m)} x2={X(m)} y1={PB} y2={PB + 4} stroke={svg.dim} strokeOpacity={0.5} strokeWidth={1} />
              <text x={X(m)} y={PB + 19} textAnchor="middle" fontSize={13} fill={svg.dim} className="tabular-nums">
                {m}
              </text>
            </g>
          ))}
          {APGAR.map((m) => (
            <path key={m} d={`M ${X(m)} ${PB + 26} l 5 5 l -5 5 l -5 -5 Z`} fill={svg.brand} />
          ))}
        </g>

        {/* target curve */}
        <motion.path
          d={AREA}
          fill={`url(#${uid}-area)`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: drawn ? 1 : 0 }}
          transition={{ duration: 0.6, delay: reduce ? 0 : 0.5 }}
          aria-hidden="true"
        />
        <motion.path
          d={CURVE}
          fill="none"
          stroke={svg.teal}
          strokeWidth={3}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: drawn ? 1 : 0 }}
          transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
          aria-hidden="true"
        />
        {POINTS.map((p, i) => (
          <motion.g
            key={p.m}
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={drawn ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.4, bounce: 0.3, delay: 0.15 + i * 0.4 }}
            aria-hidden="true"
          >
            <circle cx={X(p.m)} cy={Y(p.v)} r={5} fill={svg.raised} stroke={svg.teal} strokeWidth={2.5} />
            <text x={LABELS[i].x} y={LABELS[i].y} textAnchor={LABELS[i].anchor} fontSize={13} fontWeight={700} fill={svg.ink}>
              ≈{p.v} %
            </text>
          </motion.g>
        ))}

        {/* minute marker */}
        <g aria-hidden="true">
          <motion.line
            stroke={svg.brand}
            strokeWidth={1.5}
            strokeDasharray="3 4"
            initial={false}
            animate={{ x1: mx, x2: mx, y1: PB, y2: my }}
            transition={spring}
          />
          <motion.line
            stroke={svg.brand}
            strokeWidth={1.5}
            strokeDasharray="3 4"
            strokeOpacity={0.6}
            initial={false}
            animate={{ x1: PL, x2: mx, y1: my, y2: my }}
            transition={spring}
          />
          <motion.circle r={11} fill={svg.brandSoft} initial={false} animate={{ cx: mx, cy: my }} transition={spring} />
          <motion.circle r={6} fill={svg.brand} stroke={svg.raised} strokeWidth={2.5} initial={false} animate={{ cx: mx, cy: my }} transition={spring} />
        </g>
      </svg>
      <div className="-mt-0.5 flex items-center justify-between gap-2 text-[12px] text-[var(--text-dim)]">
        <span className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden="true">
            <path d="M 5 0 L 10 5 L 5 10 L 0 5 Z" fill={svg.brand} />
          </svg>
          Apgar 1, 5 ja tarvittaessa 10 min
        </span>
        <span>min syntymästä</span>
      </div>

      <div className="mt-3">
        <NumberField label="Minuutteja syntymästä" unit="min" value={minute} onChange={setMinute} min={2} max={10} />
      </div>

      <div className="mt-3">
        <Caption>
          Terveen vastasyntyneen saturaatio nousee asteittain – <span className="font-semibold text-[var(--text)]">täyttä 100 %:n tavoitetta ei haeta heti.</span>
        </Caption>
      </div>

      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        <p className="flex items-center gap-2 font-display text-[15px] font-semibold text-[var(--text)]">
          <Wind className="h-4 w-4 text-teal-600" strokeWidth={2.25} />
          Huonokuntoinen: tärkein hoito on tehokas ventilaatio
        </p>
        <ol className="mt-2 flex flex-col gap-2">
          {[
            { when: 'Hengitys puutteellista tai syke alle 100/min', then: 'Ventilaatio maskilla 30–60/min', tone: 'brand' },
            { when: 'Syke pysyy alle 60/min tehokkaasta ventiloinnista huolimatta', then: 'Paineluelvytys 3:1', tone: 'danger' },
          ].map((s) => (
            <li key={s.then} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-snug">
              <span className="text-[var(--text-dim)]">{s.when}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-dim)]" strokeWidth={2.5} aria-hidden="true" />
              <span
                className={`rounded-full px-2.5 py-0.5 font-semibold ${s.tone === 'danger' ? 'bg-danger-500/10 text-danger-500' : 'bg-brand-500/10 text-brand-600'}`}
              >
                {s.then}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
