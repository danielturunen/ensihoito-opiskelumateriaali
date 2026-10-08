import { useState } from 'react'
import { motion } from 'motion/react'
import { Armchair, Droplets, Pill, Wind, CircleGauge, Check } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Caption, Result, svg } from '../ui'
import { rc, Stage, useLoop, wavyCircle } from '../parts/resp-kit'
import { useSvgId } from '../parts/cardio-hooks'

type Tx = 'sit' | 'o2' | 'nitro' | 'cpap' | 'fluid'

const TX: { id: Tx; label: string; effect: string; icon: typeof Armchair; danger?: boolean }[] = [
  { id: 'sit', label: 'Istuva asento', effect: 'Esikuorma ↓', icon: Armchair },
  { id: 'o2', label: 'Happi', effect: 'Hypoksemia korjaantuu', icon: Wind },
  { id: 'nitro', label: 'Nitraatti', effect: 'Esi- ja jälkikuorma ↓', icon: Pill },
  { id: 'cpap', label: 'CPAP', effect: 'Neste pois rakkuloista', icon: CircleGauge },
  { id: 'fluid', label: 'Nesteen anto', effect: 'Pahentaa!', icon: Droplets, danger: true },
]

const spring = { type: 'spring', duration: 0.7, bounce: 0.08 } as const

export default function CpapNitro(_props: WidgetProps) {
  const [on, setOn] = useState<Record<Tx, boolean>>({ sit: false, o2: false, nitro: false, cpap: false, fluid: false })
  const { ref, active } = useLoop<HTMLDivElement>()
  const clipId = useSvgId('cpn-alv')
  const toggle = (id: Tx) => setOn((s) => ({ ...s, [id]: !s[id] }))

  // Illustrative weights: CPAP is "the most effective single treatment", nitrate next.
  const congestion = Math.max(0.06, Math.min(1.15, 1 - (on.sit ? 0.18 : 0) - (on.nitro ? 0.3 : 0) - (on.cpap ? 0.38 : 0) + (on.fluid ? 0.4 : 0)))
  const preload = Math.max(0.25, 1 - (on.sit ? 0.2 : 0) - (on.nitro ? 0.25 : 0) - (on.cpap ? 0.2 : 0) + (on.fluid ? 0.35 : 0))
  const afterload = on.nitro ? 0.65 : 1
  const exchange = Math.max(0, 1 - congestion) * (on.o2 ? 1 : 0.8)
  const core = on.nitro && on.cpap && !on.fluid

  // Alveolus geometry
  const ax = 92
  const ay = 96
  const ar = 54
  const level = ay + ar - congestion * 1.55 * ar // fluid surface y
  const t = spring

  return (
    <div ref={ref}>
      <Stage>
        <svg viewBox="0 0 360 214" className="h-auto w-full" role="img" aria-label={`Keuhkorakkula ja sydän. Nestettä rakkulassa ${Math.round(congestion * 100)} % lähtötilanteesta.`}>
          <defs>
            <clipPath id={clipId}>
              <path d={wavyCircle(ax, ay, ar - 3, 0, 1)} />
            </clipPath>
          </defs>

          {/* airway into the alveolus */}
          <rect x={ax - 9} y={0} width={18} height={ay - ar + 6} fill={rc.lungSoft} stroke={rc.lung} strokeWidth={1.5} />
          {/* alveolus */}
          <path d={wavyCircle(ax, ay, ar, 0, 1)} fill={svg.surface} stroke={rc.lung} strokeWidth={2.2} />
          <g clipPath={`url(#${clipId})`}>
            <motion.rect x={ax - ar} width={ar * 2} height={ar * 2.4} fill="rgba(250,204,21,0.36)" initial={false} animate={{ y: level }} transition={t} />
            {/* foam on the surface */}
            {Array.from({ length: 7 }, (_, i) => (
              <motion.circle
                key={i}
                cx={ax - ar + 14 + i * 13}
                r={4 + (i % 3)}
                fill="none"
                stroke={rc.plasma}
                strokeWidth={1.2}
                initial={false}
                animate={{ cy: level - 2 + (i % 2) * 3, opacity: congestion > 0.3 ? 0.9 : 0 }}
                transition={t}
              />
            ))}
          </g>

          {/* CPAP pressure arrows */}
          <motion.g initial={false} animate={{ opacity: on.cpap ? 1 : 0 }} transition={{ duration: 0.25 }} aria-hidden>
            {[-22, 0, 22].map((dx, i) => (
              <motion.path
                key={dx}
                d={`M${ax + dx} ${ay - 26}v18m-5 -6l5 6 5 -6`}
                stroke={rc.airInk}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                animate={active && on.cpap ? { y: [0, 6, 0] } : { y: 0 }}
                transition={{ duration: 1.4, repeat: active && on.cpap ? Infinity : 0, delay: i * 0.15, ease: 'easeInOut' }}
              />
            ))}
            <text x={ax + 14} y={16} fontSize={11} fontWeight={700} fill={rc.airInk}>
              CPAP-paine
            </text>
          </motion.g>

          {/* capillary under the alveolus */}
          <motion.path
            d={`M8 ${ay + ar + 18} Q${ax} ${ay + ar + 2} 176 ${ay + ar + 18}`}
            fill="none"
            stroke={rc.oxy}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeWidth: 10 + congestion * 8, opacity: 0.55 + congestion * 0.3 }}
            transition={t}
          />
          <text x={8} y={208} fontSize={10.5} fill={svg.dim}>
            Keuhkokapillaari – paine {congestion > 0.75 ? 'koholla' : congestion > 0.4 ? 'laskee' : 'normalisoituu'}
          </text>
          {/* plasma leaking up */}
          {[ax - 20, ax + 4, ax + 26].map((x, i) => (
            <motion.path
              key={x}
              d={`M${x} ${ay + ar + 4}v-12`}
              stroke={rc.plasma}
              strokeWidth={2.2}
              strokeLinecap="round"
              initial={false}
              animate={{ opacity: congestion > 0.45 ? [0, 1, 0] : 0, y: active ? [0, -8] : 0 }}
              transition={{ duration: 1.3, repeat: active ? Infinity : 0, delay: i * 0.3 }}
            />
          ))}
          {/* oxygen crossing */}
          {[ax - 30, ax - 8, ax + 14, ax + 34].map((x, i) => (
            <motion.circle
              key={x}
              cx={x}
              r={3.2}
              fill={rc.airInk}
              initial={false}
              animate={active ? { cy: [ay + 10, ay + ar + 14], opacity: [0, exchange, 0] } : { cy: ay + ar - 10, opacity: exchange }}
              transition={{ duration: 1.8, repeat: active ? Infinity : 0, delay: i * 0.4, ease: 'easeIn' }}
            />
          ))}

          {/* heart */}
          <g transform="translate(262 100)">
            <motion.path
              d="M0 30C-34 6-44-14-30-28C-20-38-6-34 0-22C6-34 20-38 30-28C44-14 34 6 0 30Z"
              fill={rc.heartSoft}
              stroke={rc.heart}
              strokeWidth={2}
              animate={active ? { scale: [1, 1.07, 1] } : { scale: 1 }}
              transition={{ duration: 0.75, repeat: active ? Infinity : 0, ease: 'easeOut' }}
            />
            <text x={0} y={-2} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={rc.heart}>
              VASEN
            </text>
            <text x={0} y={10} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={rc.heart}>
              KAMMIO
            </text>
          </g>
          {/* preload (in) and afterload (out) arrows */}
          <motion.path
            d="M192 166 C222 166 238 154 246 130"
            fill="none"
            stroke={rc.vein}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeWidth: 3 + preload * 9 }}
            transition={t}
          />
          <path d="M239 134l7 -8 4 10" fill="none" stroke={rc.vein} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          <text x={192} y={188} fontSize={11} fontWeight={600} fill={svg.dim}>
            Esikuorma {preload < 0.7 ? '↓' : preload > 1.1 ? '↑' : ''}
          </text>
          <motion.path
            d="M280 70 C292 50 312 42 340 42"
            fill="none"
            stroke={rc.oxy}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeWidth: 3 + afterload * 9 }}
            transition={t}
          />
          <path d="M334 35l8 7 -8 7" fill="none" stroke={rc.oxy} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          <text x={262} y={22} fontSize={11} fontWeight={600} fill={svg.dim}>
            Jälkikuorma {afterload < 1 ? '↓' : ''}
          </text>
          {/* back-pressure from the heart into the lungs */}
          <motion.path
            d="M224 100 H186"
            stroke={rc.plasma}
            strokeWidth={2.4}
            strokeDasharray="4 5"
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: congestion > 0.5 ? 1 : 0.15 }}
            transition={{ duration: 0.4 }}
          />
          <path d="M192 94l-7 6 7 6" fill="none" stroke={rc.plasma} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" opacity={congestion > 0.5 ? 1 : 0.15} />
        </svg>
      </Stage>

      <div className="mt-3 grid grid-cols-2 gap-2 min-[520px]:grid-cols-3">
        {TX.map((x) => {
          const sel = on[x.id]
          const Icon = x.icon
          return (
            <button
              key={x.id}
              onClick={() => toggle(x.id)}
              aria-pressed={sel}
              className={`flex min-h-[52px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] ${
                sel ? (x.danger ? 'border-danger-500 bg-danger-500/10' : 'border-teal-500 bg-teal-500/10') : 'border-[var(--border)] bg-[var(--bg-card)]'
              } ${x.id === 'fluid' ? 'col-span-2 min-[520px]:col-span-1' : ''}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${sel ? (x.danger ? 'bg-danger-500 text-white' : 'bg-teal-500 text-white') : 'bg-[var(--bg)] text-[var(--text-dim)]'}`}>
                {sel && !x.danger ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-tight text-[var(--text)]">{x.label}</span>
                <span className={`block text-[11px] leading-tight ${x.danger ? 'text-danger-500' : 'text-[var(--text-dim)]'}`}>{x.effect}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3">
        {on.fluid ? (
          <Result tone="danger" title="Älä anna nestettä!">
            Keuhkopöhöpotilas on nesteylikuormitteinen – suonensisäinen neste pahentaa tilaa hengenvaarallisesti.
          </Result>
        ) : core ? (
          <Result tone="ok" title="Hoidon ydin: nitraatti + CPAP">
            Yhdistelmä on erittäin tehokas ja usein nopeasti vaikuttava, kun sitä käytetään oikea-aikaisesti.
            {on.nitro && ' Seuraa verenpainetta – nitraatti voi laskea sitä liikaa.'}
          </Result>
        ) : (
          <Result tone="neutral" title="Valitse hoidot">
            Katso, miten neste vähenee keuhkorakkulasta ja kuormitus sydämessä kevenee.
            {on.nitro && ' Seuraa verenpainetta – nitraatti voi laskea sitä liikaa.'}
          </Result>
        )}
      </div>
      <div className="mt-2">
        <Caption>Kaaviokuva: vaikutusten suuruudet ovat havainnollistavia. CPAP on tehokkain yksittäinen hoitokeino.</Caption>
      </div>
    </div>
  )
}
