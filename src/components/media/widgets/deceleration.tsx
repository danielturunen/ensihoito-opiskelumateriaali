import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, FadeSwap, rc, Stage, StateTabs } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'

/* Deceleration in blunt trauma (article Tylppä vamma): the body wall stops at the barrier,
 * the organs keep moving and strike the wall or each other. Schematic torso in side view,
 * direction of travel to the right. Loop: travel 1.2 s, impact, rebound, pause. */

type Energy = 'low' | 'high'

const LOOP = 3.4
const T_IMPACT = 1.2
const TRAVEL = 108
const GAP = 11 // free space between the heart and the inner front wall

const INFO: Record<Energy, { reach: number; tone: string; title: string; items: string[] }> = {
  low: {
    reach: 5,
    tone: 'text-teal-600',
    title: 'Matala energia',
    items: ['Kaatuminen samalta tasolta tai hidas törmäys aiheuttaa yleensä rajatun vamman.'],
  },
  high: {
    reach: 20,
    tone: 'text-danger-500',
    title: 'Korkea energia',
    items: [
      'Kun keho pysähtyy, sisäelimet jatkavat liikettä ja törmäävät toisiinsa tai luihin – vaurio syntyy sekä iskukohtaan että epäsuorasti.',
      'Korkea energia (nopea liikenneonnettomuus, putoaminen yli 3–4 metristä, jalankulkija tai pyöräilijä auton alle, moottoripyörä, räjähdys) voi vaurioittaa useita elinjärjestelmiä yhtä aikaa.',
      'Iho voi olla ehjä ja ulkoinen löydös vähäinen, vaikka sisäinen vaurio on laaja. Jos tapahtumatietoja ei saada selville, potilasta kohdellaan korkeaenergisesti vammautuneena.',
    ],
  },
}

export default function Deceleration(_props: WidgetProps) {
  const [energy, setEnergy] = useState<Energy>('high')
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false
  const clock = useMotionValue(reduce ? T_IMPACT + 0.22 : 0)
  const reach = useMotionValue(INFO[energy].reach)
  useEffect(() => reach.set(INFO[energy].reach), [energy, reach])

  useFrameLoop(ref, (dt) => clock.set((clock.get() + dt) % LOOP))

  const bodyX = useTransform(clock, (t) => (t < T_IMPACT ? (t / T_IMPACT) * TRAVEL : TRAVEL))
  const bodyTransform = useTransform(bodyX, (x) => `translateX(${x.toFixed(1)}px)`)
  // organ lag relative to the body after the stop: forward swing, rebound, settle
  const lag = useTransform([clock, reach], ([t, r]: number[]) => {
    if (t < T_IMPACT) return 0
    const s = t - T_IMPACT
    const swing = r * Math.sin(Math.min(Math.PI, (s / 0.42) * Math.PI)) * (s < 0.42 ? 1 : 0)
    const settle = s >= 0.42 ? -r * 0.25 * Math.exp(-(s - 0.42) * 4) * Math.sin((s - 0.42) * 14) : 0
    return Math.min(GAP, swing) + settle
  })
  const organTransform = useTransform(lag, (l) => `translateX(${l.toFixed(1)}px)`)
  const hit = useTransform(lag, (l) => (l >= GAP - 0.5 ? 1 : 0))
  const tetherHeart = useTransform(lag, (l) => `M36 86L${(86 + l).toFixed(1)} 86`)
  const tetherLiver = useTransform(lag, (l) => `M36 128L${(80 + l).toFixed(1)} 128`)
  const speedOpacity = useTransform(clock, (t) => (t < T_IMPACT ? 0.7 : 0))
  // fade the scene out before the loop restarts so the body never jumps back visibly
  const sceneOpacity = useTransform(clock, (t) => Math.min(1, t / 0.2, (LOOP - t) / 0.35))
  // attachments flash red only while a high-energy swing stretches them
  const strain = useTransform([lag, reach], ([l, r]: number[]) => (r > GAP && l > GAP - 3 ? 1 : 0))
  const info = INFO[energy]

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="decel-energy"
        value={energy}
        onChange={setEnergy}
        options={[
          { value: 'low', label: 'Matala energia' },
          { value: 'high', label: 'Korkea energia' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 320 190" className="h-auto w-full" role="img" aria-label={`Hidastuvuusvamma, ${info.title.toLowerCase()}: keho pysähtyy esteeseen, sisäelimet jatkavat liikettä.`}>
          {/* ground and barrier */}
          <path d="M8 172H312" stroke={svg.line} strokeWidth={2} />
          <rect x={246} y={44} width={16} height={128} rx={3} fill={svg.dim} opacity={0.45} />
          <text x={254} y={36} textAnchor="middle" fontSize={11} fill={svg.dim}>
            este
          </text>

          <motion.g style={{ transform: bodyTransform, opacity: reduce ? 1 : sceneOpacity }}>
            {/* speed lines */}
            <motion.g style={{ opacity: speedOpacity }} aria-hidden>
              {[74, 104, 134].map((y) => (
                <path key={y} d={`M0 ${y}H14`} stroke={svg.dim} strokeWidth={2} strokeLinecap="round" />
              ))}
            </motion.g>
            {/* body wall: back (left), front (right) */}
            <rect x={24} y={56} width={112} height={100} rx={26} fill={svg.raised} stroke={svg.line} strokeWidth={3} />
            <path d="M34 66V146" stroke={svg.dim} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
            <text x={80} y={168} textAnchor="middle" fontSize={11} fill={svg.dim}>
              iho ehjä
            </text>
            {/* attachments */}
            <motion.path d={tetherHeart} stroke={svg.dim} strokeWidth={2.4} strokeLinecap="round" />
            <motion.path d={tetherLiver} stroke={svg.dim} strokeWidth={2.4} strokeLinecap="round" />
            <motion.path d={tetherHeart} stroke={svg.danger} strokeWidth={3} strokeLinecap="round" style={{ opacity: strain }} />
            <motion.path d={tetherLiver} stroke={svg.danger} strokeWidth={3} strokeLinecap="round" style={{ opacity: strain }} />
            {/* organs */}
            <motion.g style={{ transform: organTransform }}>
              <circle cx={100} cy={86} r={13} fill={rc.heartSoft} stroke={rc.heart} strokeWidth={2} />
              <path d="M70 120C84 112 106 114 112 126C116 136 100 142 84 140C72 138 64 128 70 120Z" fill="rgba(180,83,9,0.22)" stroke="#b45309" strokeWidth={2} />
            </motion.g>
            <motion.circle cx={124} cy={86} r={10} fill="none" stroke={svg.danger} strokeWidth={2.4} style={{ opacity: hit }} />
            <text x={100} y={52} textAnchor="middle" fontSize={11} fill={svg.dim}>
              sisäelimet
            </text>
          </motion.g>
        </svg>
      </Stage>

      <FadeSwap k={energy} className="mt-3">
        <p className={`mb-1.5 font-display text-[15px] font-semibold ${info.tone}`}>{info.title}</p>
        <Bullets items={info.items} />
      </FadeSwap>
    </div>
  )
}
