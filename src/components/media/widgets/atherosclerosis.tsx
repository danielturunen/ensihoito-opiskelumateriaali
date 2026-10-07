import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Caption, Segmented, svg, toneSurface, toneText, type Tone } from '../ui'
import { clamp, seeded, useFrameLoop, useSvgId } from '../parts/cardio-hooks'

/* ---------------------------------------------------------------- stages */

type Myo = 'normal' | 'exertion' | 'partial' | 'full'

interface Stage {
  short: string
  title: string
  text: string
  tag?: { label: string; tone: Tone }
  /** plaque height on the top / bottom wall, thrombus height (SVG units, lumen = 76) */
  hp: number
  hb: number
  hc: number
  flow: number
  flowLabel: string
  flowTone: Tone
  myo: Myo
}

const STAGES: Stage[] = [
  {
    short: 'Normaali',
    title: 'Normaali suoni',
    text: 'Veri virtaa esteettä.',
    hp: 0,
    hb: 0,
    hc: 0,
    flow: 1,
    flowLabel: 'Esteetön',
    flowTone: 'ok',
    myo: 'normal',
  },
  {
    short: 'Plakki',
    title: 'Plakin kertyminen',
    text: 'Rasvaplakkia kertyy suonen sisäpintaan. Vaihe on oireeton.',
    tag: { label: 'Oireeton', tone: 'neutral' },
    hp: 15,
    hb: 5,
    hc: 0,
    flow: 0.95,
    flowLabel: 'Esteetön',
    flowTone: 'ok',
    myo: 'normal',
  },
  {
    short: 'Ahtauma',
    title: 'Ahtauma > 50 %',
    text: 'Oireita syntyy tyypillisesti vasta, kun ahtauma ylittää noin 50 %. Kun sydänlihaksen hapenkulutus ylittää tarjonnan → iskemia → angina pectoris. Stabiilissa AP:ssa kipu tulee rasituksessa ja helpottaa levossa tai nitraatilla.',
    tag: { label: 'Stabiili AP', tone: 'warning' },
    hp: 36,
    hb: 11,
    hc: 0,
    flow: 0.72,
    flowLabel: 'Riittää levossa',
    flowTone: 'warning',
    myo: 'exertion',
  },
  {
    short: 'Repeämä',
    title: 'Plakin repeämä ja hyytymä',
    text: 'Repeämä laukaisee hyytymän muodostumisen → osittainen tukos. Epästabiili angina pectoris (UAP) tai NSTEMI: vaurio sisimmässä lihaskerroksessa, ei ST-nousuja.',
    tag: { label: 'UAP / NSTEMI', tone: 'danger' },
    hp: 36,
    hb: 11,
    hc: 18,
    flow: 0.3,
    flowLabel: 'Osittain estynyt',
    flowTone: 'danger',
    myo: 'partial',
  },
  {
    short: 'Tukos',
    title: 'Täydellinen tukos',
    text: 'STEMI: koko seinämän läpäisevä vaurio, joka näkyy EKG:ssä ST-nousuina. Aika on lihasta – nopea reperfuusio: PCI ensisijainen, liuotushoito, jos PCI-viive on liian pitkä.',
    tag: { label: 'STEMI', tone: 'danger' },
    hp: 36,
    hb: 11,
    hc: 38,
    flow: 0,
    flowLabel: 'Pysähtynyt',
    flowTone: 'danger',
    myo: 'full',
  },
]

const MYO_LABEL: Record<Myo, { text: string; tone: Tone }> = {
  normal: { text: 'Normaali', tone: 'ok' },
  exertion: { text: 'Iskemia rasituksessa', tone: 'warning' },
  partial: { text: 'Iskemia / osittainen vaurio', tone: 'danger' },
  full: { text: 'Koko seinämän vaurio', tone: 'danger' },
}

/* -------------------------------------------------------------- geometry */

const W = 340
const H = 156
const TOP = 36
const BOT = 112
const LUMEN = BOT - TOP

/** Smooth raised-cosine bump, asymmetric so the plaque doesn't look stamped. */
function bump(x: number, c: number, left: number, right: number) {
  const u = x < c ? (x - c) / left : (x - c) / right
  return Math.abs(u) >= 1 ? 0 : 0.5 * (1 + Math.cos(Math.PI * u))
}
const plaqueTopAt = (x: number, hp: number) => TOP + hp * bump(x, 168, 80, 100)
const clotAt = (x: number, hc: number) => hc * Math.pow(bump(x, 172, 22 + hc * 0.9, 26 + hc), 0.7)
const topAt = (x: number, hp: number, hc: number) => plaqueTopAt(x, hp) + clotAt(x, hc)
const botAt = (x: number, hb: number) => BOT - hb * bump(x, 164, 70, 84)

const f = (n: number) => n.toFixed(1)
const XS = Array.from({ length: 47 }, (_, i) => 60 + i * 5)
const XC = Array.from({ length: 51 }, (_, i) => 108 + i * 3)

function topPlaquePath(hp: number) {
  return `M60 ${TOP - 1} ` + XS.map((x) => `L${x} ${f(plaqueTopAt(x, hp))}`).join(' ') + ` L290 ${TOP - 1} Z`
}
function capPath(hp: number) {
  return XS.filter((x) => x >= 85 && x <= 270)
    .map((x, i) => `${i ? 'L' : 'M'}${x} ${f(plaqueTopAt(x, hp))}`)
    .join(' ')
}
function bottomPlaquePath(hb: number) {
  return `M60 ${BOT + 1} ` + XS.map((x) => `L${x} ${f(botAt(x, hb))}`).join(' ') + ` L290 ${BOT + 1} Z`
}
function clotPath(hp: number, hb: number, hc: number) {
  const upper = XC.map((x, i) => `${i ? 'L' : 'M'}${x} ${f(plaqueTopAt(x, hp) - 0.5)}`)
  const lower = [...XC].reverse().map((x) => `L${x} ${f(Math.min(topAt(x, hp, hc), botAt(x, hb) + 0.5))}`)
  return upper.join(' ') + ' ' + lower.join(' ') + ' Z'
}
function tearPath(hp: number) {
  const y = plaqueTopAt(170, hp)
  return `M161 ${f(y)} L165 ${f(y - 3)} L168.5 ${f(y + 2)} L172 ${f(y - 2.5)} L176 ${f(y + 1)}`
}
const LIPIDS: [number, number][] = [
  [138, 0.45],
  [152, 0.62],
  [166, 0.42],
  [178, 0.66],
  [194, 0.45],
  [208, 0.6],
]
function lipidPath(hp: number) {
  return LIPIDS.map(([x, k]) => {
    const y = TOP + (plaqueTopAt(x, hp) - TOP) * k
    return `M${x - 1.8} ${f(y)} a1.8 1.8 0 1 0 3.6 0 a1.8 1.8 0 1 0 -3.6 0`
  }).join(' ')
}

/* ---------------------------------------------------------------- colors */

const WALL = 'rgba(225,29,72,0.10)'
const WALL_EDGE = 'rgba(225,29,72,0.32)'
const LUMEN_FILL = 'rgba(194,65,12,0.05)'
const PLAQUE = '#f2c14e'
const PLAQUE_EDGE = '#c98a12'
const LIPID = 'rgba(201,138,18,0.55)'
const CLOT = '#b91c1c'
const CLOT_EDGE = '#7f1d1d'
const OK_FILL = 'rgba(15,184,172,0.24)'

/* ------------------------------------------------------------- particles */

const N = 40
const SPEED = 64

interface Cell {
  x: number
  lane: number
}

function cellAttrs(c: Cell, P: number, B: number, C: number, q: number) {
  const t = topAt(c.x, P, C)
  const b = botAt(c.x, B)
  const gap = b - t
  const y = (t + b) / 2 + c.lane * (gap / 2) * 0.82
  let o = clamp((gap - 4) / 6, 0, 1)
  if (c.x > 178) o *= 0.3 + 0.7 * q
  return { transform: `translate(${f(c.x)} ${f(y)})`, opacity: o.toFixed(2) }
}

/* ---------------------------------------------------------- myocardium */

const MCX = 60
const MCY = 158
function band(r1: number, r2: number) {
  const a0 = ((-90 - 22) * Math.PI) / 180
  const a1 = ((-90 + 22) * Math.PI) / 180
  const p = (r: number, a: number) => `${f(MCX + r * Math.cos(a))} ${f(MCY + r * Math.sin(a))}`
  return `M${p(r2, a0)} A${r2} ${r2} 0 0 1 ${p(r2, a1)} L${p(r1, a1)} A${r1} ${r1} 0 0 0 ${p(r1, a0)} Z`
}
const LAYERS = [band(92, 106), band(106, 120), band(120, 134)] // inner (endocardial) → outer

type LayerState = 'ok' | 'pulse' | 'isch' | 'dmg'
const LAYER_STATES: Record<Myo, [LayerState, LayerState, LayerState]> = {
  normal: ['ok', 'ok', 'ok'],
  exertion: ['pulse', 'ok', 'ok'],
  partial: ['dmg', 'isch', 'isch'],
  full: ['dmg', 'dmg', 'dmg'],
}
const LUMEN_SCALE = [1, 0.85, 0.5, 0.2, 0]

function Myocardium({ myo, step, reduce }: { myo: Myo; step: number; reduce: boolean }) {
  const states = LAYER_STATES[myo]
  const t = reduce ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' as const }
  return (
    <svg viewBox="0 0 120 80" className="h-auto w-full max-w-[150px]" role="img" aria-label={`Sydänlihas: ${MYO_LABEL[myo].text}`}>
      {/* coronary artery in cross-section on the outer surface */}
      <circle cx="60" cy="13" r="9" fill={WALL} stroke={WALL_EDGE} strokeWidth="1.5" />
      <g transform="translate(60 13)">
        <motion.circle
          r="6"
          fill={svg.blood}
          initial={false}
          animate={{ scale: LUMEN_SCALE[step] }}
          transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.6, bounce: 0.1 }}
        />
      </g>
      {LAYERS.map((d, i) => {
        const s = states[i]
        return (
          <g key={i}>
            <path d={d} fill={svg.surface} />
            <path d={d} fill={OK_FILL} />
            <motion.path
              d={d}
              fill={svg.brand}
              initial={false}
              animate={
                s === 'pulse'
                  ? reduce
                    ? { opacity: 0.6 }
                    : { opacity: [0.1, 0.75, 0.1] }
                  : { opacity: s === 'isch' ? 0.5 : 0 }
              }
              transition={s === 'pulse' && !reduce ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : t}
            />
            <motion.path d={d} fill={svg.danger} initial={false} animate={{ opacity: s === 'dmg' ? 0.72 : 0 }} transition={t} />
            <path d={d} fill="none" stroke={svg.surface} strokeWidth="1.5" />
          </g>
        )
      })}
      <path d={band(92, 134)} fill="none" stroke={WALL_EDGE} strokeWidth="1" />
    </svg>
  )
}

/* ----------------------------------------------------------- the artery */

function Artery({ step, reduce }: { step: number; reduce: boolean }) {
  const s = STAGES[step]
  const hp = useMotionValue(s.hp)
  const hb = useMotionValue(s.hb)
  const hc = useMotionValue(s.hc)
  const flow = useMotionValue(s.flow)
  const ref = useRef<SVGSVGElement>(null)
  const fadeId = useSvgId('artery-fade')
  const maskId = useSvgId('artery-mask')

  const plaqueTop = useTransform(() => topPlaquePath(hp.get()))
  const plaqueBot = useTransform(() => bottomPlaquePath(hb.get()))
  const cap = useTransform(() => capPath(hp.get()))
  const capOpacity = useTransform(() => clamp(hp.get() / 5, 0, 1))
  const lipids = useTransform(() => lipidPath(hp.get()))
  const lipidOpacity = useTransform(() => clamp((hp.get() - 6) / 8, 0, 1))
  const clot = useTransform(() => clotPath(hp.get(), hb.get(), hc.get()))
  const tear = useTransform(() => tearPath(hp.get()))
  const topOpacity = useTransform(() => clamp(hp.get() / 2, 0, 1))
  const botOpacity = useTransform(() => clamp(hb.get() / 2, 0, 1))
  const clotOpacity = useTransform(() => clamp(hc.get() / 2, 0, 1))

  // Cells are mutated in place by the frame loop; the initial attributes are a constant
  // prop, so React never rewrites what the loop has set.
  const [{ cells, initial }] = useState(() => {
    const rnd = seeded(11)
    const list: Cell[] = Array.from({ length: N }, (_, i) => ({ x: -16 + ((i + rnd() * 0.9) * (W + 32)) / N, lane: (rnd() * 2 - 1) * 0.8 }))
    return { cells: list, initial: list.map((c) => cellAttrs(c, s.hp, s.hb, s.hc, s.flow)) }
  })
  const els = useRef<(SVGEllipseElement | null)[]>([])

  const place = () => {
    const P = hp.get()
    const B = hb.get()
    const C = hc.get()
    const q = flow.get()
    cells.forEach((c, i) => {
      const el = els.current[i]
      if (!el) return
      const a = cellAttrs(c, P, B, C, q)
      el.setAttribute('transform', a.transform)
      el.setAttribute('opacity', a.opacity)
    })
  }

  useFrameLoop(ref, (dt) => {
    const P = hp.get()
    const B = hb.get()
    const C = hc.get()
    const q = flow.get()
    for (const c of cells) {
      const gap = botAt(c.x, B) - topAt(c.x, P, C)
      // continuity: the same flow speeds up through the narrowing
      c.x += SPEED * q * clamp(LUMEN / Math.max(gap, 1), 1, 3.2) * dt
      if (c.x > W + 14) {
        c.x -= W + 32
        c.lane = (Math.random() * 2 - 1) * 0.8
      }
    }
    place()
  })

  useEffect(() => {
    const target = STAGES[step]
    const pairs: [MotionValue<number>, number][] = [
      [hp, target.hp],
      [hb, target.hb],
      [hc, target.hc],
      [flow, target.flow],
    ]
    if (reduce) {
      pairs.forEach(([mv, v]) => mv.jump(v))
      place()
      return
    }
    const ctrls = pairs.map(([mv, v]) => animate(mv, v, { type: 'spring', duration: 0.8, bounce: 0.08 }))
    return () => ctrls.forEach((c) => c.stop())
  }, [step, reduce])

  const fade = reduce ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' as const }

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Sepelvaltimon pitkittäisleikkaus: ${s.title}`}
    >
      <defs>
        <linearGradient id={fadeId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.07" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.93" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill={`url(#${fadeId})`} />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        {/* vessel wall + lumen */}
        <rect x="0" y="20" width={W} height="16" fill={WALL} />
        <rect x="0" y={BOT} width={W} height="16" fill={WALL} />
        <rect x="0" y={TOP} width={W} height={LUMEN} fill={LUMEN_FILL} />
        <g stroke={WALL_EDGE} strokeWidth="1.25">
          <line x1="0" x2={W} y1="20" y2="20" />
          <line x1="0" x2={W} y1="128" y2="128" />
          <line x1="0" x2={W} y1={TOP} y2={TOP} strokeDasharray="1 3" strokeLinecap="round" />
          <line x1="0" x2={W} y1={BOT} y2={BOT} strokeDasharray="1 3" strokeLinecap="round" />
        </g>

        {/* blood cells */}
        <g aria-hidden>
          {initial.map((a, i) => (
            <ellipse
              key={i}
              transform={a.transform}
              opacity={a.opacity}
              ref={(el) => {
                els.current[i] = el
              }}
              rx="4.2"
              ry="2.8"
              fill={svg.blood}
              fillOpacity={i % 3 === 0 ? 0.65 : 0.9}
            />
          ))}
        </g>

        {/* plaque, thrombus */}
        <motion.path d={plaqueBot} fill={PLAQUE} style={{ opacity: botOpacity }} />
        <motion.path d={plaqueTop} fill={PLAQUE} style={{ opacity: topOpacity }} />
        <motion.path d={lipids} fill={LIPID} style={{ opacity: lipidOpacity }} />
        <motion.path d={cap} fill="none" stroke={PLAQUE_EDGE} strokeWidth="1.5" strokeLinecap="round" style={{ opacity: capOpacity }} />
        <motion.path d={clot} fill={CLOT} stroke={CLOT_EDGE} strokeWidth="1" strokeLinejoin="round" style={{ opacity: clotOpacity }} />
        <motion.path
          d={tear}
          fill="none"
          stroke={CLOT_EDGE}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ opacity: step >= 3 ? 1 : 0 }}
          transition={fade}
        />
      </g>

      {/* labels */}
      <g aria-hidden fontFamily="inherit">
        <g fill={svg.dim}>
          <text x="8" y="13" fontSize="12" fontWeight="500">
            Virtaus
          </text>
          <path d="M56 9.5h16m-4-4 4 4-4 4" fill="none" stroke={svg.dim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <motion.g initial={false} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={fade}>
          <text x="150" y="12" textAnchor="middle" fontSize="13" fontWeight="600" fill={svg.ink}>
            Plakki
          </text>
          <line x1="150" y1="16" x2="150" y2="43" stroke={svg.ink} strokeWidth="1" />
          <circle cx="150" cy="43" r="2" fill={svg.ink} />
        </motion.g>
        <motion.g initial={false} animate={{ opacity: step >= 3 ? 1 : 0 }} transition={fade}>
          <text x="190" y="151" textAnchor="middle" fontSize="13" fontWeight="600" fill={svg.danger}>
            Hyytymä
          </text>
          <line x1="190" y1="139" x2="190" y2="79" stroke={svg.danger} strokeWidth="1" />
          <circle cx="190" cy="79" r="2" fill={svg.danger} />
        </motion.g>
      </g>
    </svg>
  )
}

/* ---------------------------------------------------------------- widget */

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{label}</p>
      {children}
    </div>
  )
}

const barColor: Record<Tone, string> = {
  ok: 'bg-teal-500',
  warning: 'bg-brand-500',
  danger: 'bg-danger-500',
  brand: 'bg-brand-500',
  neutral: 'bg-[var(--text-dim)]',
  info: 'bg-[var(--text-dim)]',
}

export default function Atherosclerosis() {
  const reduce = useReducedMotion() ?? false
  const [step, setStep] = useState(0)
  const s = STAGES[step]
  const myo = MYO_LABEL[s.myo]
  const swap = reduce ? { duration: 0 } : { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const }

  return (
    <div className="@container">
      <Artery step={step} reduce={reduce} />

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Tile label="Sydänlihas">
          <div className="mt-1 flex justify-center">
            <Myocardium myo={s.myo} step={step} reduce={reduce} />
          </div>
          <p className={`mt-1 text-[13px] font-semibold leading-snug transition-colors duration-200 ${toneText[myo.tone]}`} aria-live="polite">
            {myo.text}
          </p>
        </Tile>
        <Tile label="Virtaus">
          <p className={`mt-1 font-display text-[15px] font-semibold leading-snug transition-colors duration-200 ${toneText[s.flowTone]}`} aria-live="polite">
            {s.flowLabel}
          </p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--bg)]" aria-hidden>
            <motion.div
              className={`h-full w-full origin-left rounded-full transition-colors duration-300 ${barColor[s.flowTone]}`}
              initial={false}
              animate={{ scaleX: Math.max(s.flow, 0.02) }}
              transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.6, bounce: 0.1 }}
            />
          </div>
          <p className="mt-auto pt-2 text-[12px] leading-snug text-[var(--text-dim)]">
            {s.flow === 0 ? 'Veri ei pääse tukoksen ohi.' : s.flow < 0.5 ? 'Vain kapea rako hyytymän ohi.' : s.flow < 0.9 ? 'Ei riitä, kun hapenkulutus kasvaa.' : 'Suoni on avoin.'}
          </p>
        </Tile>
      </div>

      <div className="mt-3">
        <Segmented
          layoutId="atherosclerosis-step"
          value={String(step)}
          onChange={(v) => setStep(Number(v))}
          options={STAGES.map((_, i) => ({ value: String(i), label: String(i + 1) }))}
        />
      </div>

      <div className={`mt-2 rounded-xl border px-4 py-3 ${toneSurface[s.tag?.tone ?? 'neutral']}`} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={swap}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[12px] font-semibold tabular-nums text-[var(--text-dim)]">{step + 1}/5</span>
              <p className="font-display text-[15px] font-semibold text-[var(--text)]">{s.title}</p>
              {s.tag && (
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneSurface[s.tag.tone]} ${toneText[s.tag.tone]}`}>{s.tag.label}</span>
              )}
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-dim)]">{s.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setStep((n) => Math.max(0, n - 1))}
          disabled={step === 0}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-full border border-[var(--border)] px-4 text-[13px] font-semibold text-[var(--text)] transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Edellinen
        </button>
        <button
          type="button"
          onClick={() => setStep((n) => Math.min(STAGES.length - 1, n + 1))}
          disabled={step === STAGES.length - 1}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-full bg-brand-500 px-4 text-[13px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] disabled:opacity-40 disabled:shadow-none"
        >
          Seuraava <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3">
        <Caption>UAP, NSTEMI ja STEMI muodostavat yhdessä akuutin sepelvaltimotautikohtauksen (AKS).</Caption>
      </div>
    </div>
  )
}
