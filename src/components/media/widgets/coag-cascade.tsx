import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { TriangleAlert } from 'lucide-react'
import { Segmented, svg, toneSurface } from '../ui'
import { useFrameLoop } from '../parts/cardio-hooks'

type Mode = 'none' | 'lmwh' | 'ufh'

/* ----------------------------------------------------------------- model */

/** Share of the flow that gets past each step (schematic, for the animation only). */
const PASS: Record<Mode, [number, number]> = {
  none: [1, 1],
  lmwh: [0.2, 0.8],
  ufh: [0.42, 0.42],
}
/** Visual strength of the AT-III block at Xa and IIa. */
type Strength = 'base' | 'weak' | 'mid' | 'strong'
const BLOCK: Record<Mode, [Strength, Strength]> = {
  none: ['base', 'base'],
  lmwh: ['strong', 'weak'],
  ufh: ['mid', 'mid'],
}
const STROKE: Record<Strength, { w: number; o: number; bar: number; ring: number }> = {
  base: { w: 1.75, o: 0.5, bar: 12, ring: 0 },
  weak: { w: 2.25, o: 0.75, bar: 14, ring: 0.25 },
  mid: { w: 3.75, o: 1, bar: 20, ring: 0.55 },
  strong: { w: 5.5, o: 1, bar: 26, ring: 0.9 },
}

const COPY: Record<Mode, { title: string; text: string }> = {
  none: {
    title: 'Ilman lääkettä',
    text: 'Kaskadi etenee tekijä Xa:sta trombiiniin (IIa) ja fibriiniin → hyytymä kasvaa. Antitrombiini III (AT-III) on elimistön oma hyytymisen estäjä.',
  },
  lmwh: {
    title: 'Enoksapariini (LMWH)',
    text: 'Sitoutuu AT-III:een ja tehostaa sen kykyä inaktivoida tekijä Xa:ta. Vaikutus painottuu selvästi Xa:n estoon – trombiinin (IIa) esto jää vähäisemmäksi.',
  },
  ufh: {
    title: 'Fraktioimaton hepariini (UFH)',
    text: 'Vaikuttaa tasapainoisemmin molempiin: tekijä Xa:han ja trombiiniin (IIa).',
  },
}
const METER: Record<Mode, [number, number]> = { none: [0, 0], lmwh: [3, 1], ufh: [2, 2] }

/* ---------------------------------------------------------------- layouts */

interface Pt {
  x: number
  y: number
}
interface Layout {
  name: string
  w: number
  h: number
  nodes: Pt[]
  label: (i: number) => { x: number; y: number; anchor: 'start' | 'middle' | 'end'; sub: number }
  at: Pt
  pill: Pt & { dx: number; dy: number }
  drift: Pt
}

const R = 25
const AT_R = 30

const VERTICAL: Layout = {
  name: 'v',
  w: 340,
  h: 432,
  nodes: [36, 124, 212, 300, 388].map((y) => ({ x: 182, y })),
  label: (i) => ({ x: 144, y: [36, 124, 212, 300, 388][i] + (i === 2 ? -3 : 5), anchor: 'end', sub: 17 }),
  at: { x: 290, y: 168 },
  pill: { x: 290, y: 124, dx: 0, dy: -18 },
  drift: { x: 18, y: 0 },
}
const HORIZONTAL: Layout = {
  name: 'h',
  w: 720,
  h: 244,
  nodes: [80, 220, 360, 500, 640].map((x) => ({ x, y: 96 })),
  label: (i) => ({ x: [80, 220, 360, 500, 640][i], y: i === 2 ? 40 : 52, anchor: 'middle', sub: 17 }),
  at: { x: 290, y: 200 },
  pill: { x: 356, y: 200, dx: 20, dy: 0 },
  drift: { x: 0, y: 18 },
}

const LABELS: [string, string?][] = [['Hyytymiskaskadi'], ['Tekijä Xa'], ['Trombiini', 'tekijä IIa'], ['Fibriini'], ['Hyytymä']]

function inhibitLine(at: Pt, node: Pt) {
  const dx = node.x - at.x
  const dy = node.y - at.y
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  const a = { x: at.x + ux * (AT_R + 4), y: at.y + uy * (AT_R + 4) }
  const b = { x: node.x - ux * (R + 7), y: node.y - uy * (R + 7) }
  return { a, b, nx: -uy, ny: ux }
}

/* --------------------------------------------------------------- colors */

const PATH_STROKE = 'rgba(194,65,12,0.55)'
const PATH_TINT = 'rgba(194,65,12,0.07)'
const AT_TINT = 'rgba(15,184,172,0.14)'
const EDGE = 'color-mix(in srgb, var(--text) 22%, transparent)'

/* ------------------------------------------------------------ particles */

const N = 18
const SPEED = 0.5 // segments per second
const BLOCK_T = 0.7

interface Dot {
  s: number
  u1: number
  u2: number
  c1: boolean
  c2: boolean
  blocked: boolean
  bt: number
  bx: number
  by: number
}

const STATIC: Record<Mode, { flow: number[]; blocked: number[] }> = {
  none: { flow: [0.35, 0.65, 1.35, 1.65, 2.35, 2.65, 3.35, 3.65], blocked: [] },
  lmwh: { flow: [0.35, 0.65, 1.55, 2.5], blocked: [1] },
  ufh: { flow: [0.35, 0.65, 1.4, 1.7, 2.5], blocked: [1, 2] },
}

function posAt(nodes: Pt[], s: number): Pt {
  const i = Math.min(Math.floor(s), nodes.length - 2)
  const t = s - i
  return { x: nodes[i].x + (nodes[i + 1].x - nodes[i].x) * t, y: nodes[i].y + (nodes[i + 1].y - nodes[i].y) * t }
}

/* ------------------------------------------------------------- drawing */

function Glyph({ i }: { i: number }) {
  if (i === 0)
    return (
      <g fill="none" stroke={svg.blood} strokeWidth="1.75" strokeLinecap="round">
        <path d="M-9 6L0 -5L9 6" opacity="0.6" />
        <circle cx="-9" cy="6" r="3.2" fill={svg.surface} />
        <circle cx="0" cy="-5" r="3.2" fill={svg.surface} />
        <circle cx="9" cy="6" r="3.2" fill={svg.surface} />
      </g>
    )
  if (i === 1 || i === 2)
    return (
      <text y="5.5" textAnchor="middle" fontSize="15" fontWeight="700" fill={svg.blood}>
        {i === 1 ? 'Xa' : 'IIa'}
      </text>
    )
  if (i === 3)
    return (
      <g fill="none" stroke={svg.blood} strokeWidth="1.75" strokeLinecap="round">
        <path d="M-12 -6C-6 -9 0 -3 6 -6S12 -4 13 -5" />
        <path d="M-13 1C-7 -2 -1 4 5 1S11 3 13 2" />
        <path d="M-12 8C-6 5 0 11 6 8S11 9 12 8" />
      </g>
    )
  return null
}

function ClotGlyph() {
  return (
    <g>
      <g fill="none" stroke={svg.blood} strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
        <path d="M-13 -7L12 8M-12 7L13 -6M-2 -14L3 14M-14 0H14" />
      </g>
      <ellipse cx="-6" cy="-3" rx="4.5" ry="3" fill={svg.danger} />
      <ellipse cx="5" cy="4" rx="4.5" ry="3" fill={svg.danger} />
      <ellipse cx="4" cy="-7" rx="3.6" ry="2.4" fill={svg.danger} opacity="0.85" />
    </g>
  )
}

function Pathway({ layout: L, mode, reduce }: { layout: Layout; mode: Mode; reduce: boolean }) {
  const ref = useRef<SVGSVGElement>(null)
  const dotEls = useRef<(SVGCircleElement | null)[]>([])
  const clotEl = useRef<SVGGElement | null>(null)
  const modeRef = useRef(mode)
  const pulse = useRef(0)
  const segLen = Math.hypot(L.nodes[1].x - L.nodes[0].x, L.nodes[1].y - L.nodes[0].y)
  const exitOff = (R + 5) / segLen

  const [dots] = useState<Dot[]>(() =>
    Array.from({ length: N }, (_, i) => ({ s: (i * 4) / N, u1: (i * 0.618) % 1, u2: (i * 0.382 + 0.5) % 1, c1: i * 4 >= N * (1 + exitOff), c2: i * 4 >= N * (2 + exitOff), blocked: false, bt: 0, bx: 0, by: 0 })),
  )

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const draw = (el: SVGCircleElement, p: Pt, fill: string, opacity: number, scale = 1) => {
    el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${scale.toFixed(2)})`)
    el.setAttribute('fill', fill)
    el.setAttribute('opacity', opacity.toFixed(2))
  }

  const respawn = (d: Dot) => {
    d.s = 0
    d.u1 = Math.random()
    d.u2 = Math.random()
    d.c1 = d.c2 = d.blocked = false
    d.bt = 0
  }

  const running = useFrameLoop(ref, (dt) => {
    const [p1, p2] = PASS[modeRef.current]
    dots.forEach((d, i) => {
      const el = dotEls.current[i]
      if (d.blocked) {
        d.bt += dt
        if (d.bt >= BLOCK_T) respawn(d)
      } else {
        d.s += SPEED * dt
        if (!d.c1 && d.s >= 1 + exitOff) {
          d.c1 = true
          if (d.u1 > p1) d.blocked = true
        }
        if (!d.blocked && !d.c2 && d.s >= 2 + exitOff) {
          d.c2 = true
          if (d.u2 > p2) d.blocked = true
        }
        if (d.blocked) {
          const p = posAt(L.nodes, d.s)
          d.bx = p.x
          d.by = p.y
        }
        if (d.s >= 4) {
          pulse.current = 1
          respawn(d)
        }
      }
      if (!el) return
      if (d.blocked) {
        const e = 1 - Math.pow(1 - d.bt / BLOCK_T, 3)
        draw(el, { x: d.bx + L.drift.x * e, y: d.by + L.drift.y * e }, svg.teal, 1 - d.bt / BLOCK_T, 1 - 0.35 * e)
      } else {
        draw(el, posAt(L.nodes, d.s), d.s < 2 ? svg.brand : svg.blood, Math.min(1, d.s / 0.25))
      }
    })
    pulse.current = Math.max(0, pulse.current - dt * 2.5)
    const c = L.nodes[4]
    clotEl.current?.setAttribute('transform', `translate(${c.x} ${c.y}) scale(${(1 + 0.16 * pulse.current).toFixed(3)})`)
  })

  // Static, still informative frame when motion is off (or before the loop starts).
  useEffect(() => {
    if (running) return
    const spec = STATIC[mode]
    dotEls.current.forEach((el, i) => {
      if (!el) return
      if (i < spec.flow.length) {
        const s = spec.flow[i]
        draw(el, posAt(L.nodes, s), s < 2 ? svg.brand : svg.blood, 1)
      } else if (i - spec.flow.length < spec.blocked.length) {
        const n = spec.blocked[i - spec.flow.length]
        const p = posAt(L.nodes, n + exitOff + 0.05)
        draw(el, { x: p.x + L.drift.x * 0.8, y: p.y + L.drift.y * 0.8 }, svg.teal, 0.85, 0.8)
      } else {
        el.setAttribute('opacity', '0')
      }
    })
  }, [running, mode])

  const lines = [inhibitLine(L.at, L.nodes[1]), inhibitLine(L.at, L.nodes[2])]
  const t = reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.5, bounce: 0.15 }

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${L.w} ${L.h}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Hyytymisreitti: hyytymiskaskadi, tekijä Xa, trombiini, fibriini, hyytymä. ${COPY[mode].title}.`}
    >
      {/* main pathway */}
      <g aria-hidden>
        {L.nodes.slice(0, -1).map((a, i) => {
          const b = L.nodes[i + 1]
          const ux = (b.x - a.x) / segLen
          const uy = (b.y - a.y) / segLen
          const tip = { x: b.x - ux * (R + 4), y: b.y - uy * (R + 4) }
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={tip.x} y2={tip.y} stroke={EDGE} strokeWidth="2" strokeLinecap="round" />
              <path
                d={`M${tip.x - ux * 7 - uy * 5} ${tip.y - uy * 7 + ux * 5}L${tip.x} ${tip.y}L${tip.x - ux * 7 + uy * 5} ${tip.y - uy * 7 - ux * 5}`}
                fill="none"
                stroke={EDGE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )
        })}
      </g>

      {/* particles travel under the nodes */}
      <g aria-hidden>
        {Array.from({ length: N }, (_, i) => (
          <circle
            key={i}
            ref={(el) => {
              dotEls.current[i] = el
            }}
            r="4.5"
            opacity="0"
          />
        ))}
      </g>

      {/* AT-III inhibition */}
      <g aria-hidden>
        {lines.map((ln, k) => {
          const st = STROKE[BLOCK[mode][k]]
          const half = st.bar / 2
          return (
            <g key={k}>
              <motion.line
                x1={ln.a.x}
                y1={ln.a.y}
                x2={ln.b.x}
                y2={ln.b.y}
                stroke={svg.teal}
                strokeLinecap="round"
                initial={false}
                animate={{ strokeWidth: st.w, opacity: st.o }}
                transition={t}
                strokeDasharray={mode === 'none' ? '3 5' : undefined}
              />
              <motion.line
                x1={ln.b.x + ln.nx * half}
                y1={ln.b.y + ln.ny * half}
                x2={ln.b.x - ln.nx * half}
                y2={ln.b.y - ln.ny * half}
                stroke={svg.teal}
                strokeLinecap="round"
                initial={false}
                animate={{ strokeWidth: Math.max(2.5, st.w), opacity: st.o, x1: ln.b.x + ln.nx * half, y1: ln.b.y + ln.ny * half, x2: ln.b.x - ln.nx * half, y2: ln.b.y - ln.ny * half }}
                transition={t}
              />
              <motion.circle
                cx={L.nodes[k + 1].x}
                cy={L.nodes[k + 1].y}
                r={R + 6}
                fill="none"
                stroke={svg.teal}
                strokeWidth="3"
                initial={false}
                animate={{ opacity: st.ring }}
                transition={t}
              />
            </g>
          )
        })}
      </g>

      {/* nodes */}
      {L.nodes.map((n, i) => {
        const lab = L.label(i)
        const [main, sub] = LABELS[i]
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={R} fill={svg.surface} />
            <circle cx={n.x} cy={n.y} r={R} fill={PATH_TINT} stroke={PATH_STROKE} strokeWidth="1.75" />
            {i === 4 ? (
              <g ref={clotEl} transform={`translate(${n.x} ${n.y})`}>
                <ClotGlyph />
              </g>
            ) : (
              <g transform={`translate(${n.x} ${n.y})`}>
                <Glyph i={i} />
              </g>
            )}
            <text x={lab.x} y={lab.y} textAnchor={lab.anchor} fontSize="15" fontWeight="600" fill={svg.ink}>
              {main}
            </text>
            {sub && (
              <text x={lab.x} y={lab.y + lab.sub} textAnchor={lab.anchor} fontSize="13" fill={svg.dim}>
                {sub}
              </text>
            )}
          </g>
        )
      })}

      {/* antithrombin III + docking drug */}
      <motion.circle
        cx={L.at.x}
        cy={L.at.y}
        r={AT_R + 7}
        fill={svg.tealSoft}
        initial={false}
        animate={{ opacity: mode === 'none' ? 0 : 1 }}
        transition={t}
      />
      <circle cx={L.at.x} cy={L.at.y} r={AT_R} fill={svg.surface} />
      <circle cx={L.at.x} cy={L.at.y} r={AT_R} fill={AT_TINT} stroke={svg.teal} strokeWidth="2" />
      <text x={L.at.x} y={L.at.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={svg.ink}>
        AT-III
      </text>
      <AnimatePresence initial={false}>
        {mode !== 'none' && (
          <motion.g
            key={mode}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: L.pill.dx, y: L.pill.dy }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: L.pill.dx, y: L.pill.dy, transition: { duration: 0.15 } }}
            transition={t}
          >
            <rect x={L.pill.x - 32} y={L.pill.y - 13} width="64" height="26" rx="13" fill={svg.brand} />
            <text x={L.pill.x} y={L.pill.y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
              {mode === 'lmwh' ? 'LMWH' : 'UFH'}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  )
}

/* -------------------------------------------------------------- widget */

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11.5px] font-medium leading-tight text-[var(--text-dim)]">{label}</p>
      <div className="mt-1 flex gap-1" aria-label={`${label}: ${['ei', 'vähäinen', 'kohtalainen', 'voimakas'][value]}`} role="img">
        {[1, 2, 3].map((k) => (
          <span key={k} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${k <= value ? 'bg-teal-500' : 'bg-[var(--border)]'}`} />
        ))}
      </div>
    </div>
  )
}

const ROWS: { label: string; lmwh: string; ufh: string }[] = [
  { label: 'Vaikutus painottuu', lmwh: 'Tekijä Xa:n estoon, IIa vähemmän', ufh: 'Tasapainoisesti Xa ja IIa' },
  { label: 'Seuranta', lmwh: 'Ei vaadi rutiininomaista hyytymisen seurantaa', ufh: 'Vaatii seurantaa (esim. aPTT)' },
  { label: 'Kumoaminen', lmwh: 'Protamiini neutraloi vain osittain', ufh: 'Protamiini neutraloi tehokkaasti' },
  { label: 'Puoliintumisaika', lmwh: 'Pidempi → harvempi annostelu', ufh: 'Lyhyempi' },
]

export default function CoagCascade() {
  const reduce = useReducedMotion() ?? false
  const [mode, setMode] = useState<Mode>('none')
  const copy = COPY[mode]
  const [mx, mi] = METER[mode]
  const cell = (col: 'lmwh' | 'ufh') =>
    `rounded-lg px-2.5 py-1.5 text-[13px] leading-snug transition-colors duration-200 ${
      mode === col ? 'bg-brand-500/10 text-[var(--text)]' : 'text-[var(--text-dim)]'
    }`

  return (
    <div className="@container">
      <Segmented
        layoutId="coag-mode"
        size="sm"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'none', label: 'Ilman lääkettä' },
          { value: 'lmwh', label: 'Enoksapariini' },
          { value: 'ufh', label: 'UFH' },
        ]}
      />

      <div className="mx-auto mt-3 max-w-[380px] @xl:hidden">
        <Pathway layout={VERTICAL} mode={mode} reduce={reduce} />
      </div>
      <div className="mt-3 hidden @xl:block">
        <Pathway layout={HORIZONTAL} mode={mode} reduce={reduce} />
      </div>

      <div className={`mt-3 rounded-xl border px-4 py-3 transition-colors duration-200 ${toneSurface[mode === 'none' ? 'neutral' : 'ok']}`} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduce ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className={`font-display text-[15px] font-semibold ${mode === 'none' ? 'text-[var(--text)]' : 'text-teal-600'}`}>{copy.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-dim)]">{copy.text}</p>
            {mode !== 'none' && (
              <>
                <div className="mt-2.5 grid grid-cols-2 gap-3">
                  <Meter label="Tekijä Xa:n esto" value={mx} />
                  <Meter label="Trombiinin (IIa) esto" value={mi} />
                </div>
                <p className="mt-2.5 text-[13px] font-medium leading-snug text-[var(--text)]">
                  Lopputulos: olemassa olevat hyytymät eivät kasva ja uusia syntyy vähemmän.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-2.5">
        <div className="grid grid-cols-2 gap-x-1.5">
          <p className={`${cell('lmwh')} font-display !text-[13px] font-semibold`}>Enoksapariini (LMWH)</p>
          <p className={`${cell('ufh')} font-display !text-[13px] font-semibold`}>Fraktioimaton hepariini (UFH)</p>
          {ROWS.map((r) => (
            <div key={r.label} className="col-span-2 mt-1.5 grid grid-cols-2 gap-x-1.5 border-t border-[var(--border)] pt-1.5">
              <p className="col-span-2 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{r.label}</p>
              <p className={cell('lmwh')}>{r.lmwh}</p>
              <p className={cell('ufh')}>{r.ufh}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-[var(--text-dim)]">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger-500" strokeWidth={2.25} />
        <span>Suurin riski on verenvuoto – erityisesti iäkkäillä ja munuaisten vajaatoimintaa sairastavilla.</span>
      </p>
    </div>
  )
}
