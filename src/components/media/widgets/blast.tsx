import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Ambulance, Bolt, Building, EarOff, Flame, PersonStanding, Radio, TriangleAlert, Wind, type LucideIcon } from 'lucide-react'
import { svg } from '../ui'

type MechId = 'p1' | 'p2' | 'p3' | 'p4'

interface Mechanism {
  id: MechId
  ordinal: string
  short: string
  title: string
  angle: number // bisector, degrees (0 = right, clockwise)
  color: string
  iconClass: string
  Icon: LucideIcon
  iconTilt?: boolean
  body: string
  organs?: string[]
  note?: { tone: 'danger' | 'warning'; text: string }
}

// Article: rajahdysvamma (+ traumapotilaan-tutkiminen).
const MECHS: Mechanism[] = [
  {
    id: 'p1',
    ordinal: 'Primaari',
    short: 'Paineaalto',
    title: 'Primaari – paineaalto',
    angle: -135,
    color: '#0ea5e9',
    iconClass: 'text-sky-600',
    Icon: Radio,
    body: 'Vauriot kaasu-neste-rajapinnoissa. Vaikea havaita ulkoisesti.',
    organs: ['Keuhkot', 'Korvat', 'Suolisto'],
    note: { tone: 'danger', text: 'Verenvuoto korvista viittaa painevammaan ja lisääntyneeseen keuhko- ja suolistorepeämän riskiin.' },
  },
  {
    id: 'p2',
    ordinal: 'Sekundaari',
    short: 'Sirpaleet',
    title: 'Sekundaari – sirpaleet',
    angle: -45,
    color: svg.danger,
    iconClass: 'text-danger-500',
    Icon: Bolt,
    body: 'Lävistävät vammat – etsi pienimmätkin huolellisesti.',
    note: { tone: 'warning', text: 'Lävistäneitä esineitä ei poisteta pään, kaulan tai vartalon alueelta.' },
  },
  {
    id: 'p3',
    ordinal: 'Tertiaari',
    short: 'Heitto',
    title: 'Tertiaari – heittovaikutus ja sortuma',
    angle: 45,
    color: '#8b5cf6',
    iconClass: 'text-violet-500',
    Icon: PersonStanding,
    iconTilt: true,
    body: 'Potilaan sinkoutuminen tai sortuman alle jääminen aiheuttaa tylppiä vammoja.',
  },
  {
    id: 'p4',
    ordinal: 'Kvaternaari',
    short: 'Kuumuus',
    title: 'Kvaternaari – kuumuus ja kemikaalit',
    angle: 135,
    color: svg.brand,
    iconClass: 'text-brand-600',
    Icon: Flame,
    body: 'Liekit ja palokaasut aiheuttavat palovammoja ja myrkytyksiä.',
  },
]

const FOOT: { Icon: LucideIcon; text: string }[] = [
  { Icon: Building, text: 'Suljettu tila voimistaa paineaaltoa.' },
  { Icon: Wind, text: 'Painehengitys (PEEP/CPAP) voi pahentaa paineaallon keuhkovauriota.' },
  { Icon: EarOff, text: 'Potilas ei välttämättä kuule – käytä visuaalista kommunikaatiota.' },
  { Icon: Ambulance, text: 'Kuljetetaan aina; tutkiminen toistetaan kuljetuksen aikana.' },
]

const S = 340
const C = S / 2
const R0 = 60
const R1 = 154
const HALF_GAP = 7
const RAD = Math.PI / 180

const pt = (r: number, a: number) => [C + r * Math.cos(a), C + r * Math.sin(a)] as const
const f = (n: number) => n.toFixed(1)

/** Donut sector around `angle` with parallel-edged gaps. */
function sectorPath(angle: number) {
  const a = angle * RAD
  const o1 = Math.asin(HALF_GAP / R1)
  const o0 = Math.asin(HALF_GAP / R0)
  const q = Math.PI / 4
  const [ax, ay] = pt(R1, a - q + o1)
  const [bx, by] = pt(R1, a + q - o1)
  const [cx, cy] = pt(R0, a + q - o0)
  const [dx, dy] = pt(R0, a - q + o0)
  return `M ${f(ax)} ${f(ay)} A ${R1} ${R1} 0 0 1 ${f(bx)} ${f(by)} L ${f(cx)} ${f(cy)} A ${R0} ${R0} 0 0 0 ${f(dx)} ${f(dy)} Z`
}

const BURST = Array.from({ length: 24 }, (_, i) => {
  const r = i % 2 === 0 ? 33 : 19
  const [x, y] = pt(r, (i / 24) * Math.PI * 2 - Math.PI / 2)
  return `${f(x)},${f(y)}`
}).join(' ')

const WAVE_PERIOD = 2.7
const RINGS = [0, 1, 2]

export default function Blast() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' })
  const [sel, setSel] = useState<MechId>('p1')
  const m = MECHS.find((x) => x.id === sel)!
  const loop = inView && !reduce
  const waveEmph = sel === 'p1'

  return (
    <div ref={ref}>
      <div className="relative mx-auto w-full max-w-[380px]">
        <svg
          viewBox={`0 0 ${S} ${S}`}
          className="h-auto w-full"
          role="img"
          aria-label="Räjähdyksen neljä vammamekanismia: paineaalto, sirpaleet, heittovaikutus ja kuumuus tai kemikaalit."
        >
          {/* sectors */}
          {MECHS.map((x) => {
            const active = x.id === sel
            const a = x.angle * RAD
            return (
              <motion.path
                key={x.id}
                d={sectorPath(x.angle)}
                fill={x.color}
                stroke={x.color}
                strokeWidth={8}
                strokeLinejoin="round"
                initial={false}
                animate={{
                  x: active ? Math.cos(a) * 6 : 0,
                  y: active ? Math.sin(a) * 6 : 0,
                  opacity: active ? 0.24 : 0.11,
                }}
                transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.2 }}
                aria-hidden="true"
              />
            )
          })}
          {/* active outline */}
          {MECHS.map((x) => {
            const a = x.angle * RAD
            return (
              <motion.path
                key={`o-${x.id}`}
                d={sectorPath(x.angle)}
                fill="none"
                stroke={x.color}
                strokeWidth={2}
                strokeLinejoin="round"
                initial={false}
                animate={{ x: Math.cos(a) * 6, y: Math.sin(a) * 6, opacity: x.id === sel ? 0.9 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.2 }}
                style={{ pointerEvents: 'none' }}
                aria-hidden="true"
              />
            )
          })}

          {/* pressure wave */}
          <g aria-hidden="true">
            {loop
              ? RINGS.map((i) => (
                  <motion.circle
                    key={`w${i}`}
                    cx={C}
                    cy={C}
                    r={160}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth={waveEmph ? 2.5 : 1.75}
                    vectorEffect="non-scaling-stroke"
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: [0.2, 1], opacity: [waveEmph ? 0.85 : 0.5, 0] }}
                    transition={{ duration: WAVE_PERIOD, ease: [0.2, 0.6, 0.35, 1], repeat: Infinity, delay: (i * WAVE_PERIOD) / RINGS.length }}
                  />
                ))
              : [0.42, 0.66, 0.9].map((s, i) => (
                  <circle
                    key={`s${i}`}
                    cx={C}
                    cy={C}
                    r={160 * s}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth={1.75}
                    strokeOpacity={0.55 - i * 0.15}
                    strokeDasharray={i === 0 ? undefined : '3 5'}
                  />
                ))}
          </g>

          {/* burst */}
          <g aria-hidden="true">
            <circle cx={C} cy={C} r={46} fill={svg.brandSoft} />
            <motion.g
              initial={false}
              animate={loop ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={loop ? { duration: WAVE_PERIOD / RINGS.length, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
            >
              <polygon points={BURST} fill={svg.brand} stroke={svg.brand} strokeWidth={2} strokeLinejoin="round" />
              <circle cx={C} cy={C} r={13} fill="#fbbf24" />
              <circle cx={C} cy={C} r={5.5} fill="#fff7d6" />
            </motion.g>
          </g>
        </svg>

        {/* quadrant buttons with HTML labels */}
        {MECHS.map((x) => {
          const active = x.id === sel
          const a = x.angle * RAD
          const left = Math.cos(a) < 0
          const top = Math.sin(a) < 0
          const [lx, ly] = pt((R0 + R1) / 2 + 2, a)
          // label position inside the quadrant button (percent of the quadrant)
          const px = ((left ? lx : lx - C) / C) * 100
          const py = ((top ? ly : ly - C) / C) * 100
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => setSel(x.id)}
              aria-pressed={active}
              aria-label={`${x.ordinal}: ${x.short}`}
              className={`group absolute h-1/2 w-1/2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
                left ? 'left-0' : 'left-1/2'
              } ${top ? 'top-0' : 'top-1/2'} ${left && top ? 'rounded-tl-[40%]' : !left && top ? 'rounded-tr-[40%]' : left ? 'rounded-bl-[40%]' : 'rounded-br-[40%]'}`}
            >
              <motion.span
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
                style={{ left: `${px}%`, top: `${py}%` }}
                initial={false}
                animate={{ x: active ? Math.cos(a) * 5 : 0, y: active ? Math.sin(a) * 5 : 0 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.2 }}
              >
                <x.Icon className={`h-5 w-5 transition-transform duration-150 ease-out group-active:scale-90 ${x.iconClass} ${x.iconTilt ? 'rotate-[28deg]' : ''}`} strokeWidth={2.25} />
                <span className={`mt-1 font-display text-[13px] font-semibold leading-tight ${active ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'}`}>{x.short}</span>
                <span className="text-[11px] leading-tight text-[var(--text-dim)]">{x.ordinal}</span>
              </motion.span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 min-h-[132px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={m.id}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
          >
            <p className="flex items-center gap-2 font-display text-[15px] font-semibold text-[var(--text)]">
              <m.Icon className={`h-4 w-4 ${m.iconClass} ${m.iconTilt ? 'rotate-[28deg]' : ''}`} strokeWidth={2.25} />
              {m.title}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{m.body}</p>
            {m.organs && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.organs.map((o) => (
                  <span key={o} className="rounded-full bg-sky-500/12 px-2.5 py-1 text-[12px] font-medium text-[var(--text)] ring-1 ring-sky-500/30">
                    {o}
                  </span>
                ))}
              </div>
            )}
            {m.note && (
              <p
                className={`mt-2.5 flex gap-2 rounded-lg px-3 py-2 text-[13px] leading-snug text-[var(--text)] ${
                  m.note.tone === 'danger' ? 'bg-danger-500/10' : 'bg-brand-500/10'
                }`}
              >
                <TriangleAlert className={`mt-0.5 h-4 w-4 shrink-0 ${m.note.tone === 'danger' ? 'text-danger-500' : 'text-brand-600'}`} strokeWidth={2.25} />
                {m.note.text}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {FOOT.map(({ Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 rounded-xl bg-[var(--bg)] px-3 py-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-card)] text-[var(--text-dim)]">
              <Icon className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <span className="text-[12.5px] leading-snug text-[var(--text)]">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
