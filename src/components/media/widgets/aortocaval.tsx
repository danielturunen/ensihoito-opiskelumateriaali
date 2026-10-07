import { useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationFrame, useInView, useReducedMotion } from 'motion/react'
import { Hand, Heart } from 'lucide-react'
import { Caption, Segmented, svg, toneSurface, toneText, type Tone } from '../ui'

type Pose = 'supine' | 'tilt' | 'manual'

const VEIN = '#3b82f6'
const VEIN_SOFT = 'rgba(59,130,246,0.2)'
const UTERUS = '#ec4899'
const UTERUS_SOFT = 'rgba(236,72,153,0.13)'
const MUSCLE_SOFT = 'rgba(194,65,12,0.12)'

// Article: raskaana-oleva-synnyttaja (vasen kylkiasento, elvytys).
const POSES: Record<Pose, { label: string; tone: Tone; title: string; text: string }> = {
  supine: {
    label: 'Selinmakuu',
    tone: 'danger',
    title: 'Laskimopaluu vähenee',
    text: 'Kasvanut kohtu painaa alaonttolaskimoa → laskimopaluu vähenee → äidin verenpaine voi romahtaa.',
  },
  tilt: {
    label: 'Vasen kylkiasento',
    tone: 'ok',
    title: 'Alaonttolaskimo avautuu',
    text: 'Kohtu painuu vasemmalle pois laskimon päältä, ja laskimopaluu palautuu. Hoida ja kuljeta vasemmassa kylkiasennossa.',
  },
  manual: {
    label: 'Kohdun siirto käsin',
    tone: 'ok',
    title: 'Alaonttolaskimo avautuu',
    text: 'Kohtua siirretään käsin vasemmalle. Myös elvytyksessä kohtu siirretään tai kallistetaan vasemmalle laskimopaluun turvaamiseksi.',
  },
}

/* ───────────── Cross-section (viewed from the feet: patient's right = image left) ───────────── */

const W = 340
const H = 300

const BODY = 'M 80 250 C 54 240 40 212 40 180 C 40 116 90 30 172 28 C 254 30 304 116 304 180 C 304 212 290 240 264 250 C 234 262 110 262 80 250 Z'
// Uterus drawn around its own centre; lowest lobe sits over the vena cava (patient's right).
const UTERUS_PATH = 'M 0 -72 C 54 -72 92 -40 92 -2 C 92 32 68 58 34 64 C 14 67 -4 75 -26 74 C -64 72 -92 40 -92 0 C -92 -40 -54 -72 0 -72 Z'
const UTERUS_INNER = 'M 0 -60 C 45 -60 78 -34 78 -2 C 78 27 58 49 30 54 C 12 57 -4 63 -24 62 C -55 60 -78 34 -78 0 C -78 -34 -45 -60 0 -60 Z'
const UTERUS_AT = { x: 169.2, y: 133.2 }
const UTERUS_SCALE = 0.93
const UTERUS_SHIFT = { x: 26, y: -10 }
const FETUS = 'M -50 34 C -64 8 -46 -26 -12 -32 C 24 -38 54 -16 52 10 C 50 34 26 44 4 38'

const IVC_OPEN = { cx: 145, cy: 200, rx: 12, ry: 9 }
const IVC_FLAT = { cx: 142, cy: 206, rx: 14, ry: 3 }

const TILT_DEG = 32
const BED_Y = 261

function Section({ pose, reduce }: { pose: Pose; reduce: boolean }) {
  const tilt = pose === 'tilt'
  const open = pose !== 'supine'
  const slow = reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.8, bounce: 0.12 }
  const later = (d: number) => (reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.6, bounce: 0.1, delay: d })
  const clip = `${useId().replace(/[^a-zA-Z0-9]/g, '')}-body`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={
        open
          ? 'Poikkileikkaus loppuraskaudessa: kohtu on siirtynyt vasemmalle ja alaonttolaskimo on auki.'
          : 'Poikkileikkaus loppuraskaudessa selinmakuulla: kohtu painaa alaonttolaskimon litteäksi.'
      }
    >
      <defs>
        <clipPath id={clip}>
          <path d={BODY} />
        </clipPath>
      </defs>

      {/* bed */}
      <rect x={12} y={BED_Y} width={316} height={9} rx={4.5} fill={svg.line} />

      {/* wedge under the right side in left tilt */}
      <motion.path
        d={`M 22 ${BED_Y} L 196 ${BED_Y} L 22 ${BED_Y - 108} Z`}
        fill={svg.raised}
        stroke={svg.dim}
        strokeOpacity={0.5}
        strokeWidth={1.5}
        strokeLinejoin="round"
        initial={false}
        animate={{ opacity: tilt ? 1 : 0, x: tilt ? 0 : -24 }}
        transition={reduce ? { duration: 0 } : { duration: 0.35, delay: tilt ? 0.35 : 0, ease: [0.23, 1, 0.32, 1] }}
        aria-hidden="true"
      />

      <motion.g
        style={{ transformBox: 'view-box' }}
        initial={false}
        animate={{ rotate: tilt ? TILT_DEG : 0, y: tilt ? -24 : 0 }}
        transition={slow}
      >
        <path d={BODY} fill={svg.raised} />
        <path d={BODY} fill="rgba(251,146,60,0.08)" stroke={svg.dim} strokeOpacity={0.75} strokeWidth={2} strokeLinejoin="round" />

        {/* psoas muscles */}
        <ellipse cx={128} cy={226} rx={14} ry={11} fill={MUSCLE_SOFT} />
        <ellipse cx={213} cy={226} rx={14} ry={11} fill={MUSCLE_SOFT} />

        {/* vertebra */}
        <g stroke={svg.dim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M 163 234 L 145 239 M 177 234 L 195 239 M 170 244 L 170 256" fill="none" strokeWidth={4.5} strokeOpacity={0.55} />
          <circle cx={170} cy={235} r={10} fill={svg.raised} />
          <circle cx={170} cy={236.5} r={4.5} fill={svg.line} strokeWidth={1.5} />
          <ellipse cx={170} cy={214} rx={19} ry={14} fill={svg.raised} />
        </g>

        {/* aorta */}
        <circle cx={195} cy={205} r={8} fill={svg.dangerSoft} stroke={svg.danger} strokeWidth={2} />
        <circle cx={195} cy={205} r={3.4} fill={svg.danger} opacity={0.55} />

        {/* inferior vena cava */}
        <motion.ellipse
          fill={VEIN_SOFT}
          stroke={VEIN}
          strokeWidth={2}
          initial={false}
          animate={open ? IVC_OPEN : IVC_FLAT}
          transition={later(open ? 0.3 : 0.08)}
        />

        {/* uterus */}
        <g clipPath={`url(#${clip})`}>
          <g transform={`translate(${UTERUS_AT.x} ${UTERUS_AT.y})`}>
            <motion.g initial={false} animate={open ? UTERUS_SHIFT : { x: 0, y: 0 }} transition={later(open ? 0.15 : 0)}>
              <g transform={`scale(${UTERUS_SCALE})`}>
                <path d={UTERUS_PATH} fill={UTERUS_SOFT} stroke={UTERUS} strokeOpacity={0.8} strokeWidth={2.5} strokeLinejoin="round" />
                <path d={UTERUS_INNER} fill="rgba(236,72,153,0.05)" stroke={UTERUS} strokeOpacity={0.25} strokeWidth={1.25} />
                <g stroke={UTERUS} strokeOpacity={0.35} strokeWidth={2} fill="none" strokeLinecap="round">
                  <circle cx={-34} cy={18} r={19} />
                  <path d={FETUS} />
                </g>
              </g>
            </motion.g>
          </g>
        </g>

        {/* push direction (manual displacement) */}
        <motion.path
          d="M 62 128 L 94 128 M 87 121 L 95 128 L 87 135"
          fill="none"
          stroke={svg.brand}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ opacity: pose === 'manual' ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.25, delay: pose === 'manual' ? 0.3 : 0 }}
          aria-hidden="true"
        />

        {/* side markers (rotate with the body) */}
        <g fontSize={14} fontWeight={700} fill={svg.dim} textAnchor="middle" fontFamily="inherit" aria-hidden="true">
          <text x={66} y={210}>O</text>
          <text x={276} y={210}>V</text>
        </g>
      </motion.g>

      {/* hand pushing the uterus to the patient's left */}
      <motion.g
        initial={false}
        animate={{ opacity: pose === 'manual' ? 1 : 0, x: pose === 'manual' ? 0 : -26 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0.15 }}
        aria-hidden="true"
      >
        <g transform="rotate(90 30 128)">
          <Hand x={10} y={108} width={40} height={40} color={svg.brand} strokeWidth={2} />
        </g>
      </motion.g>
    </svg>
  )
}

/* ───────────── Longitudinal flow strip ───────────── */

const SY = 34
const SH = 9
const START = 18
const END = 298
const SPAN = END - START
const PINCH = 150
const N = 10
const V = 48

function tube(p: number) {
  const top = `M ${START} ${SY - SH} L ${PINCH - 44} ${SY - SH} C ${PINCH - 20} ${SY - SH} ${PINCH - 14} ${SY - p} ${PINCH} ${SY - p} C ${PINCH + 14} ${SY - p} ${PINCH + 20} ${SY - SH} ${PINCH + 44} ${SY - SH} L ${END} ${SY - SH}`
  const bot = `M ${START} ${SY + SH} L ${PINCH - 44} ${SY + SH} C ${PINCH - 20} ${SY + SH} ${PINCH - 14} ${SY + p} ${PINCH} ${SY + p} C ${PINCH + 14} ${SY + p} ${PINCH + 20} ${SY + SH} ${PINCH + 44} ${SY + SH} L ${END} ${SY + SH}`
  const fill = `${top} L ${END} ${SY + SH} L ${PINCH + 44} ${SY + SH} C ${PINCH + 20} ${SY + SH} ${PINCH + 14} ${SY + p} ${PINCH} ${SY + p} C ${PINCH - 14} ${SY + p} ${PINCH - 20} ${SY + SH} ${PINCH - 44} ${SY + SH} L ${START} ${SY + SH} Z`
  return { top, bot, fill }
}
const TUBE_OPEN = tube(SH)
const TUBE_PINCHED = tube(1.6)

const slot = (k: number) => PINCH - 16 - k * 9
const evenly = (i: number) => START + 10 + (i / N) * SPAN
const fade = (x: number) => Math.max(0, Math.min(1, (x - START) / 14, (END - x) / 14))
const INITIAL = Array.from({ length: N }, (_, i) => evenly(i))

function FlowStrip({ blocked, reduce, active }: { blocked: boolean; reduce: boolean; active: boolean }) {
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const state = useRef(INITIAL.map((x) => ({ x, s: V })))

  useAnimationFrame((_, delta) => {
    if (reduce || !active) return
    const dt = Math.min(delta, 50) / 1000
    const ps = state.current
    const ease = (k: number) => 1 - Math.exp(-dt * k)
    if (!blocked) {
      for (const p of ps) {
        p.s += (V - p.s) * ease(5)
        p.x += p.s * dt
        if (p.x > END) p.x -= SPAN
      }
    } else {
      // particles at/after the obstruction drain away; the rest queue up behind it
      const waiting = ps.filter((p) => p.x < PINCH - 6).sort((a, b) => b.x - a.x)
      for (const p of ps) {
        if (p.x >= PINCH - 6) {
          p.x += V * dt
          if (p.x > END) p.x -= SPAN
        }
      }
      waiting.forEach((p, k) => {
        const target = slot(k)
        const next = p.x + V * dt
        if (next < target - 6) {
          p.x = next
          p.s = V
        } else {
          p.x += (target - p.x) * ease(7)
          p.s = 0
        }
      })
    }
    ps.forEach((p, i) => {
      const el = dots.current[i]
      if (!el) return
      el.setAttribute('cx', p.x.toFixed(1))
      el.setAttribute('opacity', fade(p.x).toFixed(2))
    })
  })

  const t = TUBE_OPEN
  const tp = blocked ? TUBE_PINCHED : TUBE_OPEN
  const tr = reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.6, bounce: 0.1, delay: blocked ? 0.1 : 0.3 }

  return (
    <svg viewBox="0 0 340 62" className="h-auto w-full" role="img" aria-label={blocked ? 'Alaonttolaskimon virtaus on pysähtynyt puristuskohtaan.' : 'Veri virtaa alaonttolaskimossa kohti sydäntä.'}>
      <motion.path d={t.fill} initial={false} animate={{ d: tp.fill }} transition={tr} fill={VEIN_SOFT} />
      {INITIAL.map((x0, i) => {
        // reduced motion: static frame (evenly spaced, or queued behind the obstruction)
        const x = reduce ? (blocked ? slot(i) : x0) : x0
        return (
          <circle
            key={i}
            ref={(el) => {
              dots.current[i] = el
            }}
            cx={x}
            cy={SY}
            r={3.3}
            fill={VEIN}
            opacity={fade(x)}
          />
        )
      })}
      <motion.path d={t.top} initial={false} animate={{ d: tp.top }} transition={tr} fill="none" stroke={VEIN} strokeWidth={2} strokeLinecap="round" />
      <motion.path d={t.bot} initial={false} animate={{ d: tp.bot }} transition={tr} fill="none" stroke={VEIN} strokeWidth={2} strokeLinecap="round" />
      {/* uterus pressing from above */}
      <motion.ellipse
        cx={PINCH}
        cy={SY - 24}
        rx={30}
        ry={12}
        fill={UTERUS_SOFT}
        stroke={UTERUS}
        strokeOpacity={0.8}
        strokeWidth={2}
        initial={false}
        animate={{ y: blocked ? 10.5 : -4, opacity: blocked ? 1 : 0.45 }}
        transition={tr}
        aria-hidden="true"
      />
      <Heart x={306} y={SY - 11} width={22} height={22} color={svg.danger} fill={svg.dangerSoft} strokeWidth={2.25} aria-hidden="true" />
    </svg>
  )
}

/* ───────────── Widget ───────────── */

const LEGEND = [
  { label: 'Kohtu', color: UTERUS },
  { label: 'Alaonttolaskimo', color: VEIN },
  { label: 'Aorta', color: svg.danger },
  { label: 'Selkäranka', color: 'var(--text-dim)' },
]

export default function Aortocaval() {
  const reduce = !!useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' })
  const [pose, setPose] = useState<Pose>('supine')
  const info = POSES[pose]
  const blocked = pose === 'supine'

  return (
    <div ref={ref}>
      <Segmented
        layoutId="aortocaval-pose"
        size="sm"
        value={pose}
        onChange={setPose}
        options={(Object.keys(POSES) as Pose[]).map((p) => ({ value: p, label: POSES[p].label }))}
      />

      <div className="mx-auto mt-3 w-full max-w-[400px]">
        <Section pose={pose} reduce={reduce} />
        <ul className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {LEGEND.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5 text-[12px] text-[var(--text-dim)]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} aria-hidden="true" />
              {l.label}
            </li>
          ))}
        </ul>
        <p className="mt-1 text-center text-[11px] text-[var(--text-dim)]">Poikkileikkaus jalkopäästä katsottuna · O = oikea, V = vasen</p>
      </div>

      <div className="mt-3 rounded-xl bg-[var(--bg)] px-3 pb-2 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Laskimopaluu sydämeen</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold transition-colors duration-200 ${
              blocked ? 'bg-danger-500/12 text-danger-500' : 'bg-teal-500/12 text-teal-600'
            }`}
          >
            {blocked ? 'Estynyt' : 'Virtaa'}
          </span>
        </div>
        <div className="mt-1">
          <FlowStrip blocked={blocked} reduce={reduce} active={inView} />
        </div>
      </div>

      <div className="mt-3" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pose}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className={`rounded-xl border px-4 py-3 ${toneSurface[info.tone]}`}
          >
            <p className={`font-display text-[15px] font-semibold ${toneText[info.tone]}`}>{info.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{info.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3">
        <Caption>
          <span className="font-semibold text-[var(--text)]">Raskauden puolivälin jälkeen (noin 20 raskausviikon jälkeen) vältä selinmakuuta.</span> Hoida ja
          kuljeta vasemmassa kylkiasennossa tai siirrä kohtua käsin vasemmalle.
        </Caption>
      </div>
    </div>
  )
}
