import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Check, Droplet, FlaskConical, RotateCcw, Scissors, Snowflake, type LucideIcon } from 'lucide-react'
import { Caption, svg } from '../ui'

type NodeId = 'hypo' | 'acid' | 'coag'

interface TriadNode {
  id: NodeId
  name: string
  x: number
  y: number
  label: 'above' | 'below'
  color: string
  soft: string
  iconClass: string
  Icon: LucideIcon
  mechanism: string
  fix: string
}

const W = 340
const H = 300
const R = 27

// Article: traumapotilaan-tutkiminen + liikenneonnettomuus (kuoleman kolmio).
const NODES: TriadNode[] = [
  {
    id: 'hypo',
    name: 'Hypotermia',
    x: 170,
    y: 78,
    label: 'above',
    color: '#0ea5e9',
    soft: 'rgba(14,165,233,0.16)',
    iconClass: 'text-sky-500',
    Icon: Snowflake,
    mechanism: 'Heikentää veren hyytymistä ja sydämen pumppausta.',
    fix: 'Pidä potilas lämpimänä koko hoitoketjun ajan: paljasta – tutki – peitä, eristys alustasta, lämmitetty hoitotila.',
  },
  {
    id: 'acid',
    name: 'Asidoosi',
    x: 282,
    y: 228,
    label: 'below',
    color: svg.brand,
    soft: svg.brandSoft,
    iconClass: 'text-brand-600',
    Icon: FlaskConical,
    mechanism: 'Hypotermia ja huono kudosperfuusio → laktaatti nousee → sydämen pumppaus heikkenee.',
    fix: 'Verenvuodon aktiivinen hoito.',
  },
  {
    id: 'coag',
    name: 'Koagulopatia',
    x: 58,
    y: 228,
    label: 'below',
    color: svg.danger,
    soft: svg.dangerSoft,
    iconClass: 'text-danger-500',
    Icon: Droplet,
    mechanism: 'Hyytymistekijät vähenevät ja laimenevat → vuoto lisääntyy.',
    fix: 'Vältä ylimääräistä kirkkaiden nesteiden antoa. Traneksaamihappo mahdollisimman pian merkittävässä vuodossa (1 g i.v.).',
  },
]

const byId = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<NodeId, TriadNode>
const CX = NODES.reduce((s, n) => s + n.x, 0) / 3
const CY = NODES.reduce((s, n) => s + n.y, 0) / 3

const norm = (x: number, y: number) => {
  const l = Math.hypot(x, y) || 1
  return [x / l, y / l] as const
}

/** Outward-bowing curved arrow from disc a to disc b (cycle order). */
function makeArc(a: TriadNode, b: TriadNode) {
  const [ux, uy] = norm(b.x - a.x, b.y - a.y)
  let nx = -uy
  let ny = ux
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  if ((mx - CX) * nx + (my - CY) * ny < 0) {
    nx = -nx
    ny = -ny
  }
  const c = [mx + nx * 24, my + ny * 24] as const
  const [sx0, sy0] = norm(c[0] - a.x, c[1] - a.y)
  const s = [a.x + sx0 * (R + 6), a.y + sy0 * (R + 6)] as const
  const [ex0, ey0] = norm(c[0] - b.x, c[1] - b.y)
  const e = [b.x + ex0 * (R + 13), b.y + ey0 * (R + 13)] as const
  // arrowhead along the end tangent
  const [tx, ty] = norm(e[0] - c[0], e[1] - c[1])
  const tip = [e[0] + tx * 9, e[1] + ty * 9]
  const head = `M ${tip[0].toFixed(1)} ${tip[1].toFixed(1)} L ${(e[0] - ty * 6).toFixed(1)} ${(e[1] + tx * 6).toFixed(1)} L ${(e[0] + ty * 6).toFixed(1)} ${(e[1] - tx * 6).toFixed(1)} Z`
  // midpoint + chord direction for the "cut" mark
  const mid = [0.25 * s[0] + 0.5 * c[0] + 0.25 * e[0], 0.25 * s[1] + 0.5 * c[1] + 0.25 * e[1]] as const
  const [kx, ky] = norm(e[0] - s[0], e[1] - s[1])
  const cut = `M ${(mid[0] - ky * 11).toFixed(1)} ${(mid[1] + kx * 11).toFixed(1)} L ${(mid[0] + ky * 11).toFixed(1)} ${(mid[1] - kx * 11).toFixed(1)}`
  return {
    d: `M ${s[0].toFixed(1)} ${s[1].toFixed(1)} Q ${c[0].toFixed(1)} ${c[1].toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`,
    head,
    cut,
  }
}

// Cycle: hypotermia → asidoosi → koagulopatia → (vuoto) → hypotermia
const ARCS = [makeArc(byId.hypo, byId.acid), makeArc(byId.acid, byId.coag), makeArc(byId.coag, byId.hypo)]

const spring = { type: 'spring', duration: 0.45, bounce: 0.15 } as const

export default function DeathTriad() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' })
  const [selected, setSelected] = useState<NodeId | null>(null)
  const [broken, setBroken] = useState(false)

  const flowing = inView && !reduce && !broken
  const t = reduce ? { duration: 0 } : spring
  const sel = selected ? byId[selected] : null

  return (
    <div ref={ref}>
      <div className="relative mx-auto w-full max-w-[400px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Kuoleman kolmio: hypotermia, asidoosi ja koagulopatia pahentavat toisiaan kierteenä, ja verenvuoto pahenee.">
          {/* triangle body */}
          <motion.polygon
            points={NODES.map((n) => `${n.x},${n.y}`).join(' ')}
            strokeWidth={1.5}
            strokeLinejoin="round"
            initial={false}
            animate={{
              fill: broken ? 'rgba(15,184,172,0.06)' : 'rgba(220,38,38,0.05)',
              stroke: broken ? 'rgba(15,184,172,0.28)' : 'rgba(220,38,38,0.2)',
            }}
            transition={{ duration: reduce ? 0 : 0.35 }}
            aria-hidden="true"
          />

          {/* centre glow */}
          <motion.circle
            cx={CX}
            cy={CY - 4}
            r={42}
            initial={false}
            animate={{
              fill: broken ? svg.tealSoft : svg.dangerSoft,
              scale: flowing ? [1, 1.07, 1] : 1,
            }}
            transition={{
              fill: { duration: reduce ? 0 : 0.35 },
              scale: flowing ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 },
            }}
            aria-hidden="true"
          />

          {/* cycle arrows */}
          <g aria-hidden="true">
            {ARCS.map((a, i) => (
              <g key={i}>
                <motion.path
                  d={a.d}
                  fill="none"
                  stroke={svg.danger}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  initial={false}
                  animate={{ strokeOpacity: broken ? 0.12 : 0.28 }}
                  transition={{ duration: reduce ? 0 : 0.3 }}
                />
                <motion.path
                  d={a.d}
                  fill="none"
                  stroke={svg.danger}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  strokeDasharray="0.01 13.99"
                  initial={false}
                  animate={{
                    opacity: broken ? 0 : 1,
                    strokeDashoffset: flowing ? [0, -28] : 0,
                  }}
                  transition={{
                    opacity: { duration: reduce ? 0 : 0.3 },
                    strokeDashoffset: flowing ? { duration: 2.2, ease: 'linear', repeat: Infinity } : { duration: 0 },
                  }}
                />
                <motion.path d={a.head} fill={svg.danger} initial={false} animate={{ opacity: broken ? 0.2 : 0.9 }} transition={{ duration: reduce ? 0 : 0.3 }} />
                <AnimatePresence>
                  {broken && (
                    <motion.path
                      d={a.cut}
                      stroke={svg.teal}
                      strokeWidth={4.5}
                      strokeLinecap="round"
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      exit={reduce ? undefined : { opacity: 0 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.28, delay: 0.12 * i, ease: [0.23, 1, 0.32, 1] }}
                    />
                  )}
                </AnimatePresence>
              </g>
            ))}
          </g>

          {/* vertex discs */}
          <g aria-hidden="true">
            {NODES.map((n) => {
              const active = selected === n.id
              return (
                <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
                  <motion.g initial={false} animate={{ scale: active ? 1.08 : 1 }} transition={t}>
                    <circle r={R} fill={svg.raised} />
                    <circle r={R} fill={n.soft} stroke={n.color} strokeWidth={active ? 3 : 2} />
                    <motion.circle
                      r={R + 5}
                      fill="none"
                      stroke={svg.teal}
                      strokeWidth={2.5}
                      initial={false}
                      animate={{ opacity: broken ? 1 : 0, scale: broken ? 1 : 0.85 }}
                      transition={reduce ? { duration: 0 } : { ...spring, delay: broken ? 0.15 : 0 }}
                    />
                  </motion.g>
                </g>
              )
            })}
          </g>
        </svg>

        {/* centre label */}
        <div
          className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
          style={{ left: `${(CX / W) * 100}%`, top: `${((CY - 4) / H) * 100}%` }}
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={broken ? 'ok' : 'bleed'}
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-center"
            >
              {broken ? <Check className="h-4 w-4 text-teal-600" strokeWidth={3} /> : <Droplet className="h-4 w-4 fill-danger-500/25 text-danger-500" strokeWidth={2.25} />}
              <span className={`mt-0.5 font-display text-[12.5px] font-semibold leading-tight ${broken ? 'text-teal-600' : 'text-danger-500'}`}>
                {broken ? (
                  <>
                    Kierre
                    <br />
                    katkaistu
                  </>
                ) : (
                  <>
                    Verenvuoto
                    <br />
                    pahenee
                  </>
                )}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* vertex buttons (≥ 44 px) with HTML labels */}
        {NODES.map((n) => {
          const active = selected === n.id
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelected(n.id)}
              aria-pressed={active}
              aria-label={`${n.name}: näytä mekanismi ja katkaisukeino`}
              className="group absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%` }}
            >
              <n.Icon className={`h-[22px] w-[22px] transition-transform duration-150 ease-out group-active:scale-90 ${n.iconClass}`} strokeWidth={2.25} />
              {broken && (
                <motion.span
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={reduce ? { duration: 0 } : { ...spring, delay: 0.2 }}
                  className="absolute right-1 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-teal-500 text-white shadow-sm"
                >
                  <Check className="h-3 w-3" strokeWidth={3.5} />
                </motion.span>
              )}
              <span
                className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[13px] font-semibold transition-colors duration-150 ${
                  n.label === 'above' ? 'bottom-[calc(100%+2px)]' : 'top-[calc(100%+2px)]'
                } ${active ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'}`}
              >
                {n.name}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex justify-center">
        {broken ? (
          <button
            type="button"
            onClick={() => setBroken(false)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--bg-card)] px-5 text-[14px] font-semibold text-[var(--text)] ring-1 ring-[var(--border)] transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.25} /> Nollaa
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setBroken(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-500 px-5 text-[14px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            <Scissors className="h-4 w-4" strokeWidth={2.25} /> Katkaise kierre
          </button>
        )}
      </div>

      <div className="mt-3 min-h-[148px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {broken ? (
            <motion.ul
              key="broken"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2"
            >
              {NODES.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={reduce ? false : { opacity: 0.35, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={reduce ? { duration: 0 } : { ...spring, delay: 0.15 + i * 0.12 }}
                  className={`flex gap-3 rounded-xl border px-3.5 py-2.5 ${
                    selected === n.id ? 'border-teal-500 bg-teal-500/12' : 'border-teal-500/30 bg-teal-500/8'
                  }`}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-teal-600">{n.name}</span>
                    <span className="block text-[13px] leading-snug text-[var(--text)]">{n.fix}</span>
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          ) : sel ? (
            <motion.div
              key={sel.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
            >
              <p className="flex items-center gap-2 font-display text-[15px] font-semibold text-[var(--text)]">
                <sel.Icon className={`h-4 w-4 ${sel.iconClass}`} strokeWidth={2.25} />
                {sel.name}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Mekanismi</p>
              <p className="text-[13px] leading-relaxed text-[var(--text)]">{sel.mechanism}</p>
              <div className="mt-2.5 rounded-lg bg-teal-500/10 px-3 py-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-teal-600">
                  <Scissors className="h-3.5 w-3.5" strokeWidth={2.5} /> Näin katkaiset
                </p>
                <p className="text-[13px] leading-relaxed text-[var(--text)]">{sel.fix}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex min-h-[148px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-center"
            >
              <p className="text-[13px] leading-relaxed text-[var(--text-dim)]">
                Hypotermia, asidoosi ja koagulopatia pahentavat toisiaan – ja verenvuoto lisääntyy.
              </p>
              <p className="mt-1 text-[13px] font-medium text-[var(--text)]">Napauta kulmaa: mekanismi ja katkaisukeino.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3">
        <Caption>
          <span className="font-semibold text-[var(--text)]">Kaikkia kolmea torjutaan samanaikaisesti</span> – lämmönhukan esto on yhtä tärkeää kuin
          verenvuodon tyrehdytys.
        </Caption>
      </div>
    </div>
  )
}
