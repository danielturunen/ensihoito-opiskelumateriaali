import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, useReducedMotion, type MotionValue } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, FadeSwap, rc, Stage, StateTabs } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'

/* Benign paroxysmal positional vertigo (article Huimaus; Lääkärin käsikirja 2026): debris from
 * the otolith organ lies in the posterior semicircular canal. In the Dix–Hallpike position it
 * starts moving after a latency, nystagmus appears and fatigues. Time is compressed. */

type Mode = 'sit' | 'test' | 'again'

const RING = { cx: 228, cy: 100, r: 52 }
const LIE_DEG = -110
// timeline (compressed): rotate 0–0.8 s, latency to 2.2 s, debris moves 2.2–4.0 s, nystagmus 2.4–6.4 s
const T_LAT = 2.2
const T_MOVE = 1.8
const T_NYS_END = 6.4
const PARTICLES = [-7, -3.5, 0, 3.5, 7, 1.8]

const INFO: Record<Mode, { title: string; tone: string; items: string[] }> = {
  sit: {
    title: 'Istuessa sakka lepää',
    tone: 'text-[var(--text)]',
    items: [
      'Tasapainoelin on kolme nestetäytteistä kaarikäytävää ja kaksi otoliittielintä. Otoliittielimistä irtoava sakka kulkeutuu kaarikäytävään – 85–95 %:lla takimmaiseen.',
      'Kun pää pysyy paikallaan, sakka on käytävän alimmassa kohdassa eikä huimausta ole.',
    ],
  },
  test: {
    title: 'Dix–Hallpiken koe: viive, huimaus ja nystagmus',
    tone: 'text-brand-600',
    items: [
      'Pää käännetään 45° ja potilas ohjataan nopeasti selinmakuulle niska hieman ojennettuna – kaarikäytävä kääntyy, ja sakka lähtee liikkeelle.',
      'Nystagmus alkaa noin 5–20 sekunnin viiveellä ja lyö enemmän sairaaseen korvaan päin. Huimaus ja nystagmus loppuvat yleensä minuutin kuluessa.',
    ],
  },
  again: {
    title: 'Toistettaessa oire väsyy',
    tone: 'text-teal-600',
    items: [
      'Uusi asennonmuutos aiheuttaa lievemmän kohtauksen – nystagmus väsyy liikettä toistettaessa.',
      'Hoito on asentohoito (esim. Epley tai Semont), ei lääkitys. Potilaalle kerrotaan taudin hyvänlaatuisuudesta ja häntä rohkaistaan liikkumaan.',
    ],
  },
}

function ringPoint(angleDeg: number, r = RING.r) {
  const a = (angleDeg * Math.PI) / 180
  return { x: RING.cx + r * Math.cos(a), y: RING.cy + r * Math.sin(a) }
}

export default function Bppv(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('sit')
  const [phase, setPhase] = useState<'idle' | 'latency' | 'nys' | 'done'>('idle')
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false
  const clock = useMotionValue(0)
  // 0 = sitting, 1 = first test, 2 = repeated test – a motion value so transforms never read a stale mode
  const modeMV = useMotionValue(0)

  useEffect(() => {
    modeMV.set(mode === 'sit' ? 0 : mode === 'test' ? 1 : 2)
    clock.jump(reduce ? 99 : 0)
    setPhase(mode === 'sit' ? 'idle' : reduce ? 'done' : 'latency')
  }, [mode, reduce, clock, modeMV])

  useFrameLoop(ref, (dt) => {
    if (mode === 'sit') return
    const t = clock.get() + dt
    clock.set(t)
    const next = t < T_LAT ? 'latency' : t < T_NYS_END ? 'nys' : 'done'
    if (next !== phase) setPhase(next)
  })

  const lying = mode !== 'sit'
  const ringDeg = lying ? LIE_DEG : 0
  const startDeg = 90 // ring-local angle of the lowest point when sitting
  const endDeg = 90 - LIE_DEG // lowest point after the ring has turned

  const debrisDeg = useTransform([clock, modeMV], ([t, m]: number[]) => {
    if (m === 0) return startDeg
    const k = Math.min(1, Math.max(0, (t - T_LAT) / T_MOVE))
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
    return startDeg + (endDeg - startDeg) * e
  })
  const pupil = useTransform([clock, modeMV], ([t, m]: number[]) => {
    if (m === 0 || t < T_LAT + 0.2 || t > T_NYS_END) return 'translateX(0px)'
    const amp = m === 2 ? 0.4 : 1
    const env = Math.min(1, (t - T_LAT - 0.2) / 0.5) * Math.max(0, 1 - (t - T_LAT - 0.2) / (T_NYS_END - T_LAT - 0.2))
    const beat = (t * 2.6) % 1 // slow drift then a quick corrective jerk
    const x = beat < 0.82 ? -beat / 0.82 : -(1 - (beat - 0.82) / 0.18)
    return `translateX(${(x * 7 * env * amp + 3.5 * env * amp).toFixed(2)}px)`
  })

  const info = INFO[mode]
  const nysVisible = lying && (phase === 'nys' || (reduce && phase === 'done'))

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="bppv-mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'sit', label: 'Istuu' },
          { value: 'test', label: 'Dix–Hallpike' },
          { value: 'again', label: 'Toistettu koe' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label={`Takimmainen kaarikäytävä ja sakka. ${info.title}.`}>
          {/* head pose */}
          <motion.g
            initial={false}
            animate={{ transform: `rotate(${ringDeg}deg)` }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
            style={{ transformBox: 'view-box', originX: '70px', originY: '92px' }}
          >
            <circle cx={70} cy={92} r={34} fill={svg.raised} stroke={svg.line} strokeWidth={2} />
            <path d="M37 88L28 96L37 100" fill={svg.raised} stroke={svg.line} strokeWidth={2} strokeLinejoin="round" />
            <ellipse cx={86} cy={92} rx={5} ry={8} fill="none" stroke={svg.dim} strokeWidth={1.6} />
          </motion.g>
          <text x={70} y={148} textAnchor="middle" fontSize={11} fill={svg.dim}>
            {lying ? 'makuulla, pää käännettynä' : 'istuu'}
          </text>

          {/* eye with nystagmus */}
          <g>
            <ellipse cx={70} cy={176} rx={24} ry={11} fill={svg.surface} stroke={svg.dim} strokeWidth={1.6} />
            <motion.g style={{ transform: pupil }}>
              <circle cx={70} cy={176} r={6.5} fill={svg.ink} />
            </motion.g>
            {nysVisible && (
              <text x={102} y={180} fontSize={11} fontWeight={700} fill={svg.brand}>
                nystagmus
              </text>
            )}
          </g>

          {/* posterior canal + otolith organ */}
          <motion.g
            initial={false}
            animate={{ transform: `rotate(${ringDeg}deg)` }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
            style={{ transformBox: 'view-box', originX: `${RING.cx}px`, originY: `${RING.cy}px` }}
          >
            <circle cx={RING.cx} cy={RING.cy} r={RING.r} fill="none" stroke={rc.cartilage} strokeWidth={14} opacity={0.28} />
            <circle cx={RING.cx} cy={RING.cy} r={RING.r} fill="none" stroke={rc.cartilage} strokeWidth={1.4} />
            {(() => {
              const u = ringPoint(-30, RING.r + 4)
              return <ellipse cx={u.x} cy={u.y} rx={17} ry={11} fill={svg.tealSoft} stroke={svg.teal} strokeWidth={1.6} transform={`rotate(-30 ${u.x} ${u.y})`} />
            })()}
            {PARTICLES.map((off, i) => (
              <Debris key={i} angle={debrisDeg} offset={off} r={RING.r + (i % 2 ? 3 : -3)} />
            ))}
          </motion.g>
          <text x={RING.cx} y={190} textAnchor="middle" fontSize={11} fill={svg.dim}>
            takimmainen kaarikäytävä
          </text>

          {lying && phase === 'latency' && (
            <g>
              <rect x={176} y={6} width={104} height={22} rx={11} fill={svg.brandSoft} />
              <text x={228} y={21} textAnchor="middle" fontSize={11} fontWeight={700} fill={svg.brand}>
                viive 5–20 s
              </text>
            </g>
          )}
        </svg>
      </Stage>

      <FadeSwap k={mode} className="mt-3">
        <p className={`mb-1.5 font-display text-[15px] font-semibold ${info.tone}`}>{info.title}</p>
        <Bullets items={info.items} />
      </FadeSwap>
    </div>
  )
}

function Debris({ angle, offset, r }: { angle: MotionValue<number>; offset: number; r: number }) {
  const cx = useTransform(angle, (a) => ringPoint(a + offset, r).x)
  const cy = useTransform(angle, (a) => ringPoint(a + offset, r).y)
  return <motion.circle cx={cx} cy={cy} r={3.2} fill={svg.brand} stroke={svg.surface} strokeWidth={1} />
}
