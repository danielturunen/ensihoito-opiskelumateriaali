import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useAnimationFrame } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import {
  Bullets,
  FadeSwap,
  Stage,
  StateTabs,
  StatusTile,
  Swatch,
  mixHex,
  rc,
  smoothstep,
  useAnimatedNumber,
  useLoop,
} from '../parts/resp-kit'

type Mode = 'normal' | 'pneumonia' | 'edema' | 'embolism'

const MODES: { value: Mode; label: string }[] = [
  { value: 'normal', label: 'Normaali' },
  { value: 'pneumonia', label: 'Keuhkokuume' },
  { value: 'edema', label: 'Keuhkopöhö' },
  { value: 'embolism', label: 'Keuhkoembolia' },
]

/* ---------- geometry (viewBox 360 × 224) ---------- */
const CX = 180
const CY = 114
const R_IN = 68.8 // inner surface of the alveolar wall
/** Alveolar duct + sac (open at the top, where air comes in). */
const ALV_D = 'M168 -4V45A70 70 0 1 0 192 45V-4'
/** Capillary centre line: comes in from the left, cradles the alveolus, leaves to the right. */
const CAP_D = 'M-8 104C40 104 87.3 121.4 107.3 156A84 84 0 0 0 252.7 156C272.7 121.4 320 104 368 104'
const N_CELLS = 13
const SPEED = 58 // svg units per second
const CLOT = { x: 66, y: 119.6, angle: 26 }

const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const
}

/* ---------- content (from the articles) ---------- */
interface Info {
  status: [boolean, boolean, boolean]
  facts: ReactNode[]
  callout?: { tone: 'ok' | 'danger'; text: ReactNode }
}

const INFO: Record<Mode, Info> = {
  normal: {
    status: [true, true, true],
    facts: [
      'Ilma pääsee alveoliin ja kapillaarissa virtaa verta.',
      'Happi siirtyy alveolista vereen, hiilidioksidi verestä alveoliin.',
      'Kaasujenvaihto vaatii, että ilma pääsee alveoleihin, alveolit ovat auki, keuhkojen verenkierto toimii ja hemoglobiini pystyy sitomaan happea.',
    ],
  },
  pneumonia: {
    status: [false, true, false],
    facts: [
      <>
        Alveoli täyttyy <strong className="font-semibold">tulehduseritteellä</strong> (neste, kuolleet solut, bakteerit) → konsolidaatio: kudos
        muuttuu tiiviiksi ja ilmattomaksi.
      </>,
      'Kaasujenvaihto estyy paikallisesti: veri virtaa, mutta ei hapetu.',
      'Auskultaatiossa paikalliset rahinat; kuume usein.',
    ],
    callout: { tone: 'ok', text: 'Sepsiksessä nesteytys usein tarpeen.' },
  },
  edema: {
    status: [false, true, false],
    facts: [
      <>
        Vasen kammio pettää → <strong className="font-semibold">kapillaaripaine nousee</strong> ja plasmaa suodattuu alveoliin.
      </>,
      'Vaahtoava yskös; molemminpuoliset rahinat.',
    ],
    callout: {
      tone: 'danger',
      text: (
        <>
          <strong className="font-semibold">ÄLÄ anna nestettä.</strong> Hoidon ydin: istuva asento, happi, nitraatti ja CPAP.
        </>
      ),
    },
  },
  embolism: {
    status: [true, false, false],
    facts: [
      <>
        Hyytymä tukkii keuhkovaltimon haaran: alveoli saa ilmaa, mutta kapillaarissa ei virtaa verta →{' '}
        <strong className="font-semibold">”dead space”</strong>.
      </>,
      'Auskultaatio usein täysin normaali; takykardia.',
      'Tukos nostaa painetta sydämen oikealla puolella → oikean kammion kuormitus.',
    ],
  },
}

const ARIA: Record<Mode, string> = {
  normal: 'Keuhkorakkula ja sitä ympäröivä kapillaari: ilma virtaa sisään, veri virtaa ja hapettuu, happi siirtyy vereen ja hiilidioksidi alveoliin.',
  pneumonia: 'Keuhkokuume: keuhkorakkula on täynnä tulehduseritettä, valkosoluja ja bakteereja; veri virtaa mutta ei hapetu.',
  edema: 'Keuhkopöhö: kapillaari on laajentunut, plasmaa suodattuu keuhkorakkulaan ja sen pinnalla on vaahtoa; veri ei hapetu.',
  embolism: 'Keuhkoembolia: hyytymä tukkii kapillaariin tulevan suonen, verisolut pysähtyvät; keuhkorakkula saa ilmaa mutta kaasujenvaihtoa ei tapahdu.',
}

/* ---------- small svg parts ---------- */

/** Arrow drawn along +x from r1 to r2, rotated to `deg` around the alveolus centre. */
function RadialArrow({ deg, r1, r2, color, active, delay }: { deg: number; r1: number; r2: number; color: string; active: boolean; delay: number }) {
  const dir = Math.sign(r2 - r1)
  const head = `M${r2 - dir * 6} -4.5L${r2} 0L${r2 - dir * 6} 4.5`
  return (
    <g transform={`translate(${CX} ${CY}) rotate(${deg})`}>
      <motion.g
        initial={false}
        animate={active ? { x: [-dir * 5, dir * 5], opacity: [0, 1, 1, 0] } : { x: 0, opacity: 1 }}
        transition={active ? { duration: 1.6, delay, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      >
        <path d={`M${r1} 0H${r2}${head}`} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </g>
  )
}

function Neutrophil({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={7.5} fill={svg.surface} stroke={rc.exudate} strokeWidth={1.3} />
      <g fill="#8b6fc0">
        <circle cx={-2.6} cy={-1.4} r={2.1} />
        <circle cx={1.6} cy={-2.4} r={2} />
        <circle cx={1.4} cy={2.2} r={2.1} />
      </g>
    </g>
  )
}

const NEUTROPHILS: [number, number][] = [
  [150, 90], [208, 82], [176, 130], [140, 144], [216, 142], [184, 168],
]
const BACTERIA: [number, number, number][] = [
  [168, 66, 30], [200, 110, -20], [158, 112, 70], [230, 112, 10], [152, 166, -40], [208, 166, 50], [128, 112, -60], [186, 96, 15], [222, 82, -35],
]
const DEBRIS: [number, number][] = [
  [140, 70], [196, 140], [164, 150], [232, 128], [124, 128], [194, 66], [170, 180],
]
const FOAM: [number, number, number][] = [
  [130, 71, 4], [140, 68, 5.5], [151, 71, 4.5], [162, 67, 6], [174, 70, 4.5], [185, 66, 5.5], [197, 70, 5], [208, 67, 4.5], [219, 70, 5.5], [229, 72, 3.8],
  [146, 78, 3], [170, 79, 2.6], [192, 78, 3.2], [214, 79, 2.6],
]

export default function Alveolus(props: WidgetProps) {
  const start = MODES.some((m) => m.value === props.state) ? (props.state as Mode) : 'normal'
  const [mode, setMode] = useState<Mode>(start)
  const { ref, reduce, active } = useLoop<HTMLDivElement>()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const info = INFO[mode]
  const stalled = mode === 'embolism'
  const ventilated = mode === 'normal' || mode === 'embolism'

  /* oxygenation along the capillary (only when gas exchange works) */
  const oxyMV = useAnimatedNumber(mode === 'normal' ? 1 : 0, reduce, { duration: 0.6, ease: 'easeOut' })

  /* blood cells: positioned along the capillary path every frame */
  const capRef = useRef<SVGPathElement>(null)
  const cellRefs = useRef<(SVGGElement | null)[]>([])
  const offset = useRef(0)
  const lenRef = useRef(0)
  const stopRef = useRef<number | null>(null)

  const place = () => {
    const path = capRef.current
    if (!path) return
    if (!lenRef.current) lenRef.current = path.getTotalLength()
    const L = lenRef.current
    const oxy = oxyMV.get()
    if (stalled && stopRef.current === null) {
      let l = 0
      while (l < L && path.getPointAtLength(l).x < CLOT.x - 14) l += 1
      stopRef.current = l
    }
    for (let i = 0; i < N_CELLS; i++) {
      const el = cellRefs.current[i]
      if (!el) continue
      let l: number
      if (stalled) {
        l = (stopRef.current ?? 0) - 3 - i * 11.5
        if (l < 0) {
          el.setAttribute('opacity', '0')
          continue
        }
      } else {
        l = (offset.current + (i * L) / N_CELLS) % L
      }
      const p = path.getPointAtLength(l)
      el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`)
      el.setAttribute('fill', stalled ? rc.deoxy : mixHex(rc.deoxy, rc.oxy, oxy * smoothstep(0.42, 0.62, l / L)))
      el.setAttribute('opacity', '1')
    }
  }

  useLayoutEffect(place)

  useAnimationFrame((_, delta) => {
    if (!active || stalled) return
    offset.current = (offset.current + (delta / 1000) * SPEED) % (lenRef.current || 420)
    place()
  })

  /* fluid inside the alveolus: exudate (pneumonia) or plasma (oedema) */
  const fluidTop = mode === 'pneumonia' ? 38 : mode === 'edema' ? 70 : 190
  const swollen = mode === 'edema'

  return (
    <div ref={ref} className="space-y-4">
      <StateTabs value={mode} onChange={setMode} options={MODES} layoutId={`alv-${uid}`} />

      <Stage className="mx-auto max-w-[540px]">
        <svg viewBox="0 0 360 224" className="block h-auto w-full" role="img" aria-label={ARIA[mode]}>
          <defs>
            <clipPath id={`${uid}-in`}>
              <circle cx={CX} cy={CY} r={R_IN} />
            </clipPath>
          </defs>

          {/* neighbouring alveoli for context */}
          <g aria-hidden fill={svg.airSoft} stroke={rc.tissue} strokeWidth={2} opacity={0.45}>
            <circle cx={62} cy={26} r={46} />
            <circle cx={298} cy={26} r={46} />
          </g>

          {/* capillary */}
          <motion.path
            d={CAP_D}
            fill="none"
            stroke={rc.oxy}
            strokeOpacity={0.4}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeWidth: swollen ? 28 : 22 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.1 }}
          />
          <motion.path
            d={CAP_D}
            fill="none"
            stroke={svg.surface}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeWidth: swollen ? 24 : 18 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.1 }}
          />
          <motion.path
            d={CAP_D}
            fill="none"
            stroke={rc.oxy}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeWidth: swollen ? 24 : 18, strokeOpacity: stalled ? 0.03 : swollen ? 0.16 : 0.08 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.1 }}
          />
          <path ref={capRef} d={CAP_D} fill="none" stroke="none" />

          {/* alveolus */}
          <path d={ALV_D} fill={svg.airSoft} />
          <g clipPath={`url(#${uid}-in)`}>
            <motion.g initial={false} animate={{ y: fluidTop }} transition={{ type: 'spring', duration: 0.6, bounce: 0.05 }}>
              <rect x={CX - 72} y={0} width={144} height={200} fill={svg.surface} />
              <motion.rect
                x={CX - 72}
                y={0}
                width={144}
                height={200}
                initial={false}
                animate={{ fill: mode === 'pneumonia' ? rc.exudateSoft : rc.plasmaSoft }}
                transition={{ duration: 0.3 }}
              />
            </motion.g>
          </g>
          <motion.path
            d={ALV_D}
            fill="none"
            stroke={rc.tissue}
            strokeLinejoin="round"
            initial={false}
            animate={{ strokeWidth: mode === 'pneumonia' ? 3.4 : 2.4 }}
          />

          {/* air coming in */}
          <g aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => {
              const dx = (i - 2) * 3.2
              const spread = (i - 2) * 16
              const endY = ventilated ? 96 - Math.abs(i - 2) * 8 : mode === 'pneumonia' ? 30 : 56
              /* static frame: a tidy stream down the duct (stopping at the fluid when blocked) */
              const still = ventilated
                ? { x: i < 3 ? 0 : (i - 2.5) * 22, y: 8 + i * 14, opacity: 0.9 }
                : { x: 0, y: 6 + i * 9, opacity: i < 3 ? 0.75 : 0 }
              return (
                <motion.circle
                  key={i}
                  cx={CX}
                  cy={-4}
                  r={3}
                  fill={rc.airInk}
                  initial={false}
                  animate={
                    active
                      ? { x: [dx, ventilated ? spread : dx], y: [0, endY + 4], opacity: [0, 1, ventilated ? 0.9 : 0.6, 0] }
                      : still
                  }
                  transition={active ? { duration: 2.4, delay: i * 0.48, repeat: Infinity, ease: 'easeOut' } : { duration: 0.2 }}
                />
              )
            })}
          </g>

          {/* pneumonia: inflammatory exudate */}
          <AnimatePresence>
            {mode === 'pneumonia' && (
              <motion.g
                key="pn"
                clipPath={`url(#${uid}-in)`}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.3 }}
              >
                <g fill={rc.exudate} opacity={0.55}>
                  {DEBRIS.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={1.8} />
                  ))}
                </g>
                {BACTERIA.map(([x, y, a], i) => (
                  <motion.rect
                    key={i}
                    x={-4.8}
                    y={-1.9}
                    width={9.6}
                    height={3.8}
                    rx={1.9}
                    fill="#3f9a62"
                    transform={`translate(${x} ${y}) rotate(${a})`}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 * i, duration: 0.25 }}
                  />
                ))}
                {NEUTROPHILS.map(([x, y], i) => (
                  <motion.g
                    key={i}
                    initial={reduce ? false : { opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5, bounce: 0.2, delay: 0.06 * i }}
                  >
                    <Neutrophil x={x} y={y} />
                  </motion.g>
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* oedema: plasma filtering in + foam */}
          <AnimatePresence>
            {mode === 'edema' && (
              <motion.g key="ed" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <g fill="rgba(255,255,255,0.6)" stroke={rc.plasma} strokeWidth={1.1}>
                  {FOAM.map(([x, y, r], i) => (
                    <circle key={i} cx={x} cy={y} r={r} />
                  ))}
                </g>
                {[62, 90, 118].map((deg, i) => (
                  <RadialArrow key={deg} deg={deg} r1={96} r2={60} color={rc.plasma} active={active} delay={i * 0.35} />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* gas exchange arrows */}
          <AnimatePresence>
            {mode === 'normal' && (
              <motion.g key="gx" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <RadialArrow deg={108} r1={48} r2={82} color={svg.teal} active={active} delay={0} />
                <RadialArrow deg={132} r1={48} r2={82} color={svg.teal} active={active} delay={0.5} />
                <RadialArrow deg={72} r1={88} r2={54} color={svg.dim} active={active} delay={0.25} />
                <RadialArrow deg={48} r1={88} r2={54} color={svg.dim} active={active} delay={0.75} />
                <text x={polar(120, 34)[0]} y={polar(120, 34)[1] + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill={svg.teal}>
                  O₂
                </text>
                <text x={polar(60, 34)[0]} y={polar(60, 34)[1] + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill={svg.dim}>
                  CO₂
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* embolism: dead space */}
          <AnimatePresence>
            {mode === 'embolism' && (
              <motion.g key="em" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <text x={CX} y={112} textAnchor="middle" fontSize={15} fontWeight={600} fontStyle="italic" fill={svg.dim}>
                  dead space
                </text>
                <text x={polar(120, 40)[0]} y={polar(120, 40)[1] + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill={svg.teal}>
                  O₂
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* red blood cells */}
          <motion.g key={stalled ? 'stop' : 'flow'} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            {Array.from({ length: N_CELLS }, (_, i) => (
              <g
                key={i}
                ref={(el) => {
                  cellRefs.current[i] = el
                }}
                opacity={0}
                fill={rc.deoxy}
              >
                <circle r={5.3} />
                <circle r={2} fill="rgba(255,255,255,0.3)" />
              </g>
            ))}
          </motion.g>

          {/* embolism: clot upstream */}
          <AnimatePresence>
            {mode === 'embolism' && (
              <motion.g
                key="clot"
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', duration: 0.5, bounce: 0.25 }}
              >
                <g transform={`translate(${CLOT.x} ${CLOT.y}) rotate(${CLOT.angle})`}>
                  <path d="M-12 -7C-6 -12 6 -12 12 -8C16 -3 15 5 11 9C5 13 -6 12 -11 8C-15 4 -16 -3 -12 -7Z" fill={rc.clot} />
                  <path d="M-8 -4L6 5M-6 6L8 -5M-10 1H10" stroke="rgba(255,255,255,0.35)" strokeWidth={1.1} strokeLinecap="round" />
                </g>
                <text x={CLOT.x - 4} y={CLOT.y - 22} textAnchor="middle" fontSize={14} fontWeight={600} fill={svg.danger}>
                  hyytymä
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </Stage>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {mode === 'normal' && (
          <>
            <Swatch color={rc.deoxy} label="Hapeton veri" />
            <Swatch color={rc.oxy} label="Hapettunut veri" />
            <Swatch color={svg.airSoft} stroke={rc.airLine} label="Ilma" />
          </>
        )}
        {mode === 'pneumonia' && (
          <>
            <Swatch color={rc.exudateSoft} stroke={rc.exudate} label="Tulehduserite" />
            <Swatch color="#8b6fc0" label="Valkosolut" />
            <Swatch color="#3f9a62" shape="bar" label="Bakteerit" />
          </>
        )}
        {mode === 'edema' && (
          <>
            <Swatch color={rc.plasmaSoft} stroke={rc.plasma} label="Plasmaa alveoliin" />
            <Swatch color="transparent" stroke={rc.plasma} shape="ring" label="Vaahto" />
          </>
        )}
        {mode === 'embolism' && (
          <>
            <Swatch color={rc.clot} label="Hyytymä" />
            <Swatch color={svg.airSoft} stroke={rc.airLine} label="Ilmaa tulee" />
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatusTile ok={info.status[0]} title="Ilma" sub="ventilaatio" />
        <StatusTile ok={info.status[1]} title="Veri" sub="perfuusio" />
        <StatusTile ok={info.status[2]} title={'Kaasujen­vaihto'} />
      </div>

      <FadeSwap k={mode} className="space-y-3">
        <Bullets items={info.facts} />
        {info.callout && (
          <div
            className={`rounded-xl border px-3.5 py-2.5 text-[13.5px] leading-snug text-[var(--text)] ${
              info.callout.tone === 'danger' ? 'border-danger-500/35 bg-danger-500/10' : 'border-teal-500/30 bg-teal-500/10'
            }`}
          >
            {info.callout.text}
          </div>
        )}
      </FadeSwap>
    </div>
  )
}
