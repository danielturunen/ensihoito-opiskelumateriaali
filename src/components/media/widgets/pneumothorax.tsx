import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useTransform } from 'motion/react'
import { RotateCcw, Syringe } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import {
  Bullets,
  FadeSwap,
  InfoCard,
  Stage,
  StateTabs,
  Swatch,
  closedCurve,
  rc,
  spring,
  useAnimatedNumber,
  useLoop,
  type Pt,
} from '../parts/resp-kit'

type Mode = 'normal' | 'pneumo' | 'tension' | 'hemo'

const MODES: { value: Mode; label: string }[] = [
  { value: 'normal', label: 'Normaali' },
  { value: 'pneumo', label: 'Ilmarinta' },
  { value: 'tension', label: 'Jänniteilmarinta' },
  { value: 'hemo', label: 'Veririnta' },
]

/* ---------- geometry (viewBox 360 × 300, frontal view) ----------
 * Side A = viewer's left = the affected side. Side B = healthy side.
 * Every outline has 14 points; W_* says how strongly a point follows the
 * mediastinum when it shifts (medial points 1, lateral wall 0). */

const CAV_A: Pt[] = [
  [114, 50], [78, 65], [55, 103], [46, 156], [46, 212], [54, 260], [82, 240],
  [110, 229], [141, 236], [160, 247], [162, 196], [160, 140], [155, 92], [141, 59],
]
const LUNG_A: Pt[] = [
  [114, 57], [82, 71], [61, 107], [52, 156], [52, 210], [59, 251], [84, 233],
  [110, 223], [139, 230], [154, 240], [156, 196], [154, 142], [149, 96], [137, 66],
]
/** Lung A pushed up by blood pooling at the base (haemothorax). */
const LUNG_A_HEMO: Pt[] = [
  [114, 57], [82, 71], [61, 107], [52, 150], [54, 180], [62, 192], [86, 191],
  [110, 189], [136, 190], [152, 193], [155, 170], [154, 136], [149, 96], [137, 66],
]
const W_A = [0.3, 0, 0, 0, 0, 0, 0, 0, 0.5, 1, 1, 0.9, 0.75, 0.5]

const CAV_B: Pt[] = [
  [246, 50], [282, 65], [305, 103], [314, 156], [314, 212], [306, 260], [278, 242],
  [258, 238], [252, 214], [248, 188], [230, 160], [204, 140], [205, 92], [219, 59],
]
const LUNG_B: Pt[] = [
  [246, 57], [278, 71], [299, 107], [308, 156], [308, 210], [301, 251], [276, 236],
  [262, 231], [258, 212], [254, 186], [236, 158], [210, 138], [211, 96], [223, 66],
]
const W_B = [0.3, 0, 0, 0, 0, 0, 0.4, 0.8, 1, 1, 1, 0.9, 0.75, 0.5]

const HILUM_A: Pt = [150, 140]
const S_MAX = 30 // mediastinal shift at full tension
const STAGES = 4 // breaths for the tension to build up
const K_PNEUMO = 0.72
const K_TENSION = 0.36

const TORSO =
  'M154 -4V18C154 32 128 36 92 42C54 48 30 62 26 96L20 306H340L334 96C330 62 306 48 268 42C232 36 206 32 206 18V-4Z'
const DIAPHRAGM = 'M44 266C66 246 92 233 112 234C136 235 156 250 180 252C204 250 228 240 252 242C276 244 298 252 316 266'
const HEART =
  'M170 148C160 166 160 198 170 220C182 242 220 248 240 234C256 222 252 192 236 170C222 152 198 142 182 143C176 144 172 146 170 148Z'
const RIB_Y = [74, 104, 134, 164, 194, 224]

const shifted = (pts: Pt[], w: number[], s: number): Pt[] => pts.map((p, i) => [p[0] + s * w[i], p[1]] as const)

function lungAPath(k: number, s: number, h: number) {
  const hx = HILUM_A[0] + 0.9 * s
  const hy = HILUM_A[1]
  return closedCurve(
    LUNG_A.map((p, i) => {
      const x = p[0] + (LUNG_A_HEMO[i][0] - p[0]) * h + s * W_A[i]
      const y = p[1] + (LUNG_A_HEMO[i][1] - p[1]) * h
      return [hx + (x - hx) * k, hy + (y - hy) * k] as const
    }),
  )
}

const tracheaD = (s: number) => {
  const cx = 180 + 0.75 * s
  return `M180 -6L180 30C180 64 ${cx} 78 ${cx} 116`
}
const bronchiD = (s: number) => {
  const cx = 180 + 0.75 * s
  const ax = 150 + 0.9 * s
  const bx = 210 + 0.9 * s
  return `M${ax} 140C${ax + 12} 132 ${cx - 8} 124 ${cx} 116C${cx + 8} 124 ${bx - 12} 132 ${bx} 140`
}
/** Superior vena cava: stays inside the mediastinum, bends as it is pushed aside. */
const svcD = (s: number) => `M${165 + 0.2 * s} 50C${165 + 0.5 * s} 90 ${167 + 0.85 * s} 120 ${170 + s} 148`

/* ---------- content (from the article) ---------- */

interface Info {
  lead: string
  chips?: { label: string; tone: 'ok' | 'warn' | 'danger' }[]
  findings?: ReactNode[]
  care?: ReactNode[]
}

const INFO: Record<Mode, Info> = {
  normal: {
    lead: 'Pleuratilassa on normaalisti vain ohut nestekalvo, jonka ansiosta keuhko liukuu rintakehän sisällä hengitysliikkeen aikana.',
  },
  pneumo: {
    lead: 'Ilmaa kertyy pleuratilaan ja keuhko painuu osittain kasaan. Paine ei nouse jatkuvasti — tilanne voi pysyä suhteellisen vakaana. Välikarsina pysyy keskellä.',
    chips: [
      { label: 'Paine ei nouse jatkuvasti', tone: 'ok' },
      { label: 'Verenkierto usein vakaa', tone: 'ok' },
    ],
    findings: ['Rintakipu', 'Hengenahdistus', 'Tihentynyt hengitys (takypnea)', 'Toispuoleisesti heikentyneet hengitysäänet'],
    care: ['Happi tarpeen mukaan', 'Aktiivinen seuranta: kehittyykö jänniteilmarinnaksi?', 'Kuljetus päivystykseen'],
  },
  tension: {
    lead: 'Venttiilimekanismi: ilma pääsee pleuratilaan sisäänhengityksellä, mutta ei pääse ulos uloshengityksellä — paine nousee jatkuvasti.',
    chips: [
      { label: 'Paine nousee jatkuvasti', tone: 'danger' },
      { label: 'Obstruktiivinen sokki', tone: 'danger' },
    ],
    findings: [
      <>
        <span className="mr-1.5 rounded-md bg-danger-500/12 px-1.5 py-0.5 text-[11px] font-semibold text-danger-500">Kardinaalilöydös</span>
        <strong className="font-semibold">Toispuoleisesti täysin puuttuvat tai hyvin vaimeat hengitysäänet</strong>
      </>,
      'Kaulalaskimoiden pullotus',
      'Ihonalainen ilma',
      'Hypotensio ja takykardia',
    ],
    care: [
      <>
        <strong className="font-semibold">Välitön neulatorakosenteesi</strong> — diagnoosi on kliininen, kuvantamista ei odoteta
      </>,
      'Runsasvirtauksinen happi varaajamaskilla',
      <>
        <strong className="font-semibold text-danger-500">EI ylipainehengitystä</strong> (esim. CPAP) ennen dekompressiota
      </>,
    ],
  },
  hemo: {
    lead: 'Verta kertyy pleuratilaan ja painaa keuhkoa kasaan alhaalta päin. Veririntaan voi menetyksenä hukkua merkittävä määrä verta.',
    chips: [{ label: 'Hypovolemia (verenvajaus)', tone: 'danger' }],
    findings: ['Rintakipu', 'Hengenahdistus', 'Toispuoleisesti heikentyneet hengitysäänet', 'Hypovolemian merkit: hypotensio, takykardia'],
    care: ['Happi', 'Nesteytys', 'Nopea kuljetus traumakeskukseen'],
  },
}

const ARIA: Record<Mode, string> = {
  normal: 'Rintakehä edestä: keuhkot täyttävät rintaontelon, pleuratila on ohut ja välikarsina keskellä.',
  pneumo: 'Ilmarinta: ilmaa toisen puolen pleuratilassa, keuhko osittain kasassa, välikarsina keskellä.',
  tension:
    'Jänniteilmarinta: ilmaa kertyy venttiilimekanismilla, keuhko painuu täysin kasaan ja sydän sekä henkitorvi siirtyvät terveelle puolelle.',
  hemo: 'Veririnta: verta pleuratilan pohjalla, keuhko painuu kasaan alhaalta.',
}

const chipTone = {
  ok: 'border-teal-500/30 bg-teal-500/10 text-teal-600',
  warn: 'border-brand-500/35 bg-brand-500/10 text-brand-600',
  danger: 'border-danger-500/35 bg-danger-500/10 text-danger-500',
}

function Badge({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={10.5} fill={svg.danger} />
      <text y={5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">
        {n}
      </text>
    </g>
  )
}

export default function Pneumothorax(props: WidgetProps) {
  const start = MODES.some((m) => m.value === props.state) ? (props.state as Mode) : 'normal'
  const [mode, setMode] = useState<Mode>(start)
  const [stage, setStage] = useState(0)
  const [decompressed, setDecompressed] = useState(false)
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const [breathN, setBreathN] = useState(0)
  const { ref, reduce, active } = useLoop<HTMLDivElement>()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const growing = mode === 'tension' && !decompressed
  const half = growing ? 750 : mode === 'normal' ? 1700 : 1150 // ms per half breath

  /* breathing clock: drives chest motion, the one-way valve and the tension build-up */
  const phaseRef = useRef<'in' | 'out'>('in')
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      const next = phaseRef.current === 'in' ? 'out' : 'in'
      phaseRef.current = next
      setPhase(next)
      if (next === 'in') {
        setBreathN((n) => n + 1)
        if (growing) setStage((s) => Math.min(STAGES, s + 1))
      }
    }, half)
    return () => window.clearInterval(id)
  }, [active, half, growing])

  const choose = (m: Mode) => {
    setMode(m)
    setStage(0)
    setDecompressed(false)
  }

  /* targets */
  const st = reduce ? STAGES : stage
  let kT = 1
  let sT = 0
  let airT = 0
  let hemoT = 0
  if (mode === 'pneumo') {
    kT = K_PNEUMO
    airT = 1
  } else if (mode === 'tension') {
    airT = 1
    if (decompressed) {
      kT = 0.64
      sT = 4
    } else {
      kT = K_PNEUMO - (K_PNEUMO - K_TENSION) * (st / STAGES)
      sT = (S_MAX * st) / STAGES
    }
  } else if (mode === 'hemo') {
    hemoT = 1
  }

  const relief = { type: 'spring', duration: 0.9, bounce: 0.08, delay: 0.35 } as const
  const kMV = useAnimatedNumber(kT, reduce, decompressed ? relief : spring)
  const sMV = useAnimatedNumber(sT, reduce, decompressed ? relief : spring)
  const airMV = useAnimatedNumber(airT, reduce, { duration: 0.35, ease: 'easeOut' })
  const hemoMV = useAnimatedNumber(hemoT, reduce, { type: 'spring', duration: 0.6, bounce: 0.05 })

  const cavA = useTransform(sMV, (s) => closedCurve(shifted(CAV_A, W_A, s)))
  const cavB = useTransform(sMV, (s) => closedCurve(shifted(CAV_B, W_B, s)))
  const lungB = useTransform(sMV, (s) => closedCurve(shifted(LUNG_B, W_B, s)))
  const lungA = useTransform([kMV, sMV, hemoMV], ([k, s, h]: number[]) => lungAPath(k, s, h))
  const trachea = useTransform(sMV, tracheaD)
  const bronchi = useTransform(sMV, bronchiD)
  const svc = useTransform(sMV, svcD)
  const bloodY = useTransform(hemoMV, (h) => (1 - h) * 90)
  const bloodOpacity = useTransform(hemoMV, [0, 0.2], [0, 1])
  const badgeOpacity = useTransform(sMV, [16, 26], [0, 1])
  const pressureOpacity = useTransform(sMV, [5, 14], [0, 1])
  const valveX = useTransform([kMV, sMV], ([k, s]: number[]) => {
    const hx = HILUM_A[0] + 0.9 * s
    return hx + (52 - hx) * k
  })
  const valveY = useTransform(kMV, (k) => HILUM_A[1] + 16 * k)

  const breatheIn = active && phase === 'in'
  const amp = mode === 'normal' ? 1.022 : growing ? 1.01 : 1.015
  const fastHeart = growing || mode === 'hemo'
  const info = INFO[mode]

  return (
    <div ref={ref} className="space-y-4">
      <StateTabs value={mode} onChange={choose} options={MODES} layoutId={`ptx-${uid}`} />

      <Stage className="mx-auto max-w-[520px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between px-3 pt-2.5 text-[11px] font-semibold uppercase tracking-wide">
          <motion.span animate={{ opacity: mode === 'normal' ? 0 : 1 }} transition={{ duration: 0.2 }} className="text-danger-500">
            Vaurioitunut puoli
          </motion.span>
          <motion.span animate={{ opacity: mode === 'normal' ? 0 : 1 }} transition={{ duration: 0.2 }} className="text-teal-600">
            Terve puoli
          </motion.span>
        </div>

        <svg viewBox="0 0 360 300" className="block h-auto w-full" role="img" aria-label={ARIA[mode]}>
          <defs>
            <clipPath id={`${uid}-cav`}>
              <motion.path d={cavA} />
            </clipPath>
          </defs>

          <path d={TORSO} fill={svg.surface} stroke={svg.line} strokeWidth={1.5} />

          <motion.g
            animate={{ scale: breatheIn ? amp : 1 }}
            transition={{ duration: half / 1000, ease: 'easeInOut' }}
          >
            <path d={DIAPHRAGM} fill="none" stroke={svg.dim} strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />

            {/* pleural cavities (parietal pleura) */}
            <motion.path d={cavA} fill="var(--bg)" stroke={svg.dim} strokeOpacity={0.4} strokeWidth={1.2} />
            <motion.path d={cavB} fill="var(--bg)" stroke={svg.dim} strokeOpacity={0.4} strokeWidth={1.2} />

            {/* air in the pleural space */}
            <motion.path d={cavA} fill={svg.airSoft} stroke={rc.airLine} strokeWidth={1.4} style={{ opacity: airMV }} />

            {/* blood pooled at the base */}
            <g clipPath={`url(#${uid}-cav)`}>
              <motion.g style={{ y: bloodY, opacity: bloodOpacity }}>
                <path d="M30 186Q46 197 66 198L196 198L196 306L30 306Z" fill={svg.blood} fillOpacity={0.78} />
                <path d="M30 186Q46 197 66 198L196 198" fill="none" stroke={svg.blood} strokeWidth={1.6} />
              </motion.g>
            </g>

            {/* lungs (visceral pleura); opaque underlay keeps the lung pink over air/blood */}
            <motion.path d={lungB} fill={rc.lungSoft} stroke={rc.lung} strokeWidth={1.8} strokeLinejoin="round" />
            <motion.path d={lungA} fill={svg.surface} />
            <motion.path d={lungA} fill={rc.lungSoft} stroke={rc.lung} strokeWidth={1.8} strokeLinejoin="round" />

            {/* faint ribs and clavicles */}
            <g aria-hidden fill="none" stroke={svg.line} strokeOpacity={0.85} strokeWidth={3.5} strokeLinecap="round">
              {RIB_Y.map((y) => (
                <g key={y}>
                  <path d={`M166 ${y}C132 ${y - 14} 72 ${y - 12} 48 ${y + 14}`} />
                  <path d={`M194 ${y}C228 ${y - 14} 288 ${y - 12} 312 ${y + 14}`} />
                </g>
              ))}
              <path d="M172 40C150 34 112 40 80 32" />
              <path d="M188 40C210 34 248 40 280 32" />
            </g>

            {/* rising pressure pushes the mediastinum away */}
            <motion.g aria-hidden style={{ opacity: pressureOpacity }}>
              {[150, 196].map((y) => (
                <motion.path
                  key={y}
                  d={`M54 ${y}H74M66 ${y - 7}L74 ${y}L66 ${y + 7}`}
                  fill="none"
                  stroke={rc.airInk}
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{ x: breatheIn && growing ? 5 : 0 }}
                  transition={{ duration: half / 1000, ease: 'easeInOut' }}
                />
              ))}
            </motion.g>

            {/* one-way valve on the lung surface */}
            {growing && (
              <motion.g aria-hidden style={{ x: valveX, y: valveY }}>
                <path d="M0 -6Q-4 0 0 6" fill="none" stroke={rc.lung} strokeWidth={2.2} strokeLinecap="round" />
                {reduce ? (
                  <g fill={rc.airInk}>
                    <circle cx={-12} cy={-4} r={2.6} />
                    <circle cx={-20} cy={3} r={2.2} />
                  </g>
                ) : phase === 'in' ? (
                  <g key={`in-${breathN}`}>
                    {[0, 1, 2].map((i) => (
                      <motion.circle
                        key={i}
                        r={2.8 - i * 0.3}
                        fill={rc.airInk}
                        initial={{ x: -2, y: 0, opacity: 0 }}
                        animate={{ x: -24 - i * 5, y: (i - 1) * 9, opacity: [0, 1, 0] }}
                        transition={{ duration: half / 1000, delay: i * 0.07, ease: 'easeOut' }}
                      />
                    ))}
                  </g>
                ) : (
                  <motion.g
                    key={`out-${breathN}`}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', duration: 0.3, bounce: 0.3 }}
                    stroke={svg.danger}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                  >
                    <path d="M-15 -5L-7 3M-7 -5L-15 3" />
                  </motion.g>
                )}
              </motion.g>
            )}

            {/* mediastinum: superior vena cava, trachea + main bronchi, heart */}
            <motion.path d={svc} fill="none" stroke={rc.vein} strokeOpacity={0.75} strokeWidth={7} strokeLinecap="round" />
            <g fill="none" strokeLinecap="round">
              <motion.path d={trachea} stroke={svg.dim} strokeOpacity={0.55} strokeWidth={14} />
              <motion.path d={bronchi} stroke={svg.dim} strokeOpacity={0.55} strokeWidth={11} strokeLinejoin="round" />
              <motion.path d={trachea} stroke={svg.surface} strokeWidth={10.5} />
              <motion.path d={bronchi} stroke={svg.surface} strokeWidth={7.5} strokeLinejoin="round" />
              <motion.path d={trachea} stroke={svg.dim} strokeOpacity={0.3} strokeWidth={10.5} strokeDasharray="2 5" strokeLinecap="butt" />
            </g>
            <motion.g style={{ x: sMV }}>
              <motion.g
                animate={active ? { scale: [1, 1.035, 1] } : { scale: 1 }}
                transition={active ? { duration: fastHeart ? 0.5 : 0.9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
              >
                <path d={HEART} fill={svg.surface} />
                <path d={HEART} fill={rc.heartSoft} stroke={rc.heart} strokeWidth={1.8} />
                <path d="M206 150C214 176 220 206 228 236" fill="none" stroke={rc.heart} strokeOpacity={0.35} strokeWidth={1.5} strokeLinecap="round" />
              </motion.g>
            </motion.g>

            {/* numbered call-outs (explained below the figure) */}
            {growing && (
              <motion.g style={{ opacity: badgeOpacity }}>
                <path d="M203 72H198M162 96H177" stroke={svg.danger} strokeWidth={1.6} strokeLinecap="round" />
                <Badge n={1} x={214} y={72} />
                <Badge n={2} x={152} y={96} />
              </motion.g>
            )}
          </motion.g>

          {/* needle decompression */}
          <AnimatePresence>
            {mode === 'tension' && decompressed && (
              <motion.g
                key="needle"
                initial={reduce ? false : { x: -30, y: -17, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', duration: 0.5, bounce: 0 }}
              >
                <line x1={25} y1={65} x2={80} y2={96} stroke={svg.dim} strokeWidth={2.4} strokeLinecap="round" />
                <g transform="translate(22 63) rotate(29.6)">
                  <rect x={-13} y={-5.5} width={17} height={11} rx={3} fill={svg.brand} />
                  <rect x={-18} y={-3} width={6} height={6} rx={1.5} fill={svg.brand} fillOpacity={0.55} />
                </g>
                {(reduce ? [0, 1] : [0, 1, 2]).map((i) =>
                  reduce ? (
                    <circle key={i} cx={8 - i * 3} cy={46 - i * 10} r={3 + i} fill={svg.airSoft} stroke={rc.airLine} strokeWidth={1.2} />
                  ) : (
                    <motion.circle
                      key={i}
                      cx={9}
                      cy={55}
                      r={3.2}
                      fill={svg.airSoft}
                      stroke={rc.airLine}
                      strokeWidth={1.2}
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                      animate={{ opacity: [0, 1, 0], x: (i - 1) * 6, y: -24, scale: 1.5 }}
                      transition={{ duration: 0.9, delay: 0.45 + i * 0.22, repeat: 4, ease: 'easeOut' }}
                    />
                  ),
                )}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {mode === 'tension' && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center px-3">
            <span
              className="max-w-full rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-1 text-center text-[12px] font-medium leading-snug text-[var(--text)] shadow-sm"
              aria-live="polite"
            >
              {decompressed ? (
                'Ilma purkautuu neulan kautta — kuuluu usein sihinänä'
              ) : reduce ? (
                'Sisään pääsee, ulos ei — paine nousee'
              ) : phase === 'in' ? (
                <>
                  <span className="text-sky-600">Sisäänhengitys</span> → ilmaa pleuratilaan
                </>
              ) : (
                <>
                  <span className="text-danger-500">Uloshengitys</span> → ilma ei pääse ulos
                </>
              )}
            </span>
          </div>
        )}
      </Stage>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        <Swatch color={rc.lungSoft} stroke={rc.lung} label="Keuhko" />
        {(mode === 'pneumo' || mode === 'tension') && <Swatch color={svg.airSoft} stroke={rc.airLine} label="Ilma pleuratilassa" />}
        {mode === 'hemo' && <Swatch color={svg.blood} label="Veri pleuratilassa" />}
        {mode === 'normal' && <Swatch color="var(--bg)" stroke={svg.dim} label="Ohut pleuratila" />}
        <Swatch color={rc.heartSoft} stroke={rc.heart} label="Sydän" />
      </div>

      {mode === 'tension' && (
        <div className="space-y-3">
          {decompressed ? (
            <button
              onClick={() => setDecompressed(false)}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 text-[14px] font-semibold text-[var(--text)] transition-transform duration-150 ease-out active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2.25} />
              Nollaa
            </button>
          ) : (
            <button
              onClick={() => setDecompressed(true)}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-[14px] font-semibold text-white shadow-sm transition-transform duration-150 ease-out active:scale-[0.98]"
            >
              <Syringe className="h-4 w-4" strokeWidth={2.25} />
              Neulatorakosenteesi
            </button>
          )}
          <FadeSwap k={decompressed ? 'dec' : 'ten'}>
            {decompressed ? (
              <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-3 text-[13.5px] leading-snug text-[var(--text)]">
                <strong className="font-semibold text-teal-600">Paine purkautuu.</strong> Välikarsina palaa kohti keskiviivaa ja keuhko alkaa
                laajeta — potilaan tila voi korjaantua dramaattisen nopeasti. Neula viedään hoito-ohjeen mukaisesta pistokohdasta.
              </div>
            ) : (
              <ol className="space-y-2">
                {['Henkitorvi siirtyy terveelle puolelle (myöhäinen löydös)', 'Laskimopaluu estyy → obstruktiivinen sokki'].map((t, i) => (
                  <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-[var(--text)]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-500 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            )}
          </FadeSwap>
        </div>
      )}

      <FadeSwap k={mode} className="space-y-3">
        <p className="text-[14px] leading-relaxed text-[var(--text)]">{info.lead}</p>
        {info.chips && (
          <div className="flex flex-wrap gap-1.5">
            {info.chips.map((c) => (
              <span key={c.label} className={`rounded-full border px-2.5 py-1 text-[12px] font-semibold ${chipTone[c.tone]}`}>
                {c.label}
              </span>
            ))}
          </div>
        )}
        {info.findings && info.care && (
          <div className="grid gap-2 sm:grid-cols-2">
            <InfoCard title="Löydökset">
              <Bullets items={info.findings} />
            </InfoCard>
            <InfoCard title="Hoito" accent={mode === 'tension' ? 'danger' : 'teal'}>
              <Bullets items={info.care} dot={mode === 'tension' ? 'bg-danger-500' : 'bg-teal-500'} />
            </InfoCard>
          </div>
        )}
        {mode === 'normal' && <p className="text-[12px] text-[var(--text-dim)]">Valitse tila nähdäksesi löydökset ja ensihoidon.</p>}
      </FadeSwap>
    </div>
  )
}
