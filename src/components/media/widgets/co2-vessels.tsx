import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, FadeSwap, FlowDots, rc, spring, Stage, StateTabs, useLoop } from '../parts/resp-kit'

/* Carbon dioxide, cerebral vessels and intracranial pressure (articles Tajuttomuus and Pään vamma).
 * Skull volume is fixed: dilated vessels raise ICP, constricted vessels reduce brain blood flow.
 * Gauge and vessel calibres are qualitative. */

type Mode = 'hypo' | 'normo' | 'hyper'

const VESSELS = [
  'M104 186C102 160 96 136 80 116C70 104 62 94 58 80',
  'M108 186C110 156 112 128 110 100C108 80 104 62 100 46',
  'M112 186C118 160 132 140 150 124C160 116 166 104 168 90',
]

const CFG: Record<Mode, { width: number; flow: number; dots: number; needle: number; tone: string; title: string; items: string[] }> = {
  hypo: {
    width: 2.4,
    flow: 3.4,
    dots: 3,
    needle: -60,
    tone: 'text-brand-600',
    title: 'Hyperventilaatio: matala hiilidioksidi',
    items: [
      'Liiallinen ventilaatio laskee hiilidioksidia ja supistaa aivoverisuonia – aivoihin virtaa vähemmän verta, ja seurauksena voi olla aivoiskemia.',
      'Tavoitteena on aina normoventilaatio, ei hyperventilaatio.',
    ],
  },
  normo: {
    width: 5,
    flow: 2,
    dots: 6,
    needle: -10,
    tone: 'text-teal-600',
    title: 'Normoventilaatio',
    items: [
      'Aivovammapotilaan tavoite ensihoidossa on SpO₂ yli 94 % ja EtCO₂ 4–4,5 kPa.',
      'Aivojen verenkierto riippuu perfuusiopaineesta: CPP = MAP − ICP. Riittävän happeutumisen turvaamiseksi CPP:n tulisi pysyä vähintään noin 50–60 mmHg:ssa.',
    ],
  },
  hyper: {
    width: 8.5,
    flow: 2,
    dots: 7,
    needle: 62,
    tone: 'text-danger-500',
    title: 'Hypoventilaatio tai hypoksia',
    items: [
      'Hypoksia ja korkea hiilidioksidi laajentavat aivoverisuonia.',
      'Kallon sisällä on vakiotilavuus (aivokudos, veri ja aivo-selkäydinneste): kun veren osuus kasvaa, kallonsisäinen paine nousee – ja perfuusiopaine laskee.',
      'Aivovammapotilas ei saa hypoventiloida: hengitystie auki ja tarvittaessa ventilaation tuki.',
    ],
  },
}

export default function Co2Vessels(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('normo')
  const { ref, reduce, active } = useLoop<HTMLDivElement>()
  const c = CFG[mode]
  const t = reduce ? { duration: 0 } : spring

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="co2-mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'hypo', label: 'Hyperventilaatio' },
          { value: 'normo', label: 'Normoventilaatio' },
          { value: 'hyper', label: 'Hypoventilaatio' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 320 218" className="h-auto w-full" role="img" aria-label={`Aivoverisuonet ja kallonsisäinen paine: ${c.title}.`}>
          {/* skull: fixed volume */}
          <ellipse cx={112} cy={108} rx={92} ry={90} fill="none" stroke={svg.dim} strokeWidth={6} opacity={0.5} />
          <motion.ellipse
            cx={112}
            cy={110}
            rx={80}
            ry={78}
            fill={rc.tissueSoft}
            stroke={rc.tissue}
            strokeWidth={1.6}
            initial={false}
            animate={{ transform: mode === 'hyper' ? 'scale(1.07)' : 'scale(1)' }}
            transition={t}
            style={{ transformBox: 'fill-box', originX: 0.5, originY: 0.5 }}
          />
          {VESSELS.map((d, i) => (
            <g key={i}>
              <motion.path d={d} fill="none" stroke={rc.oxy} strokeLinecap="round" opacity={0.75} initial={false} animate={{ strokeWidth: c.width }} transition={t} />
              <FlowDots d={d} count={c.dots} duration={c.flow} active={active} color="#fecaca" r={Math.max(1.4, c.width / 3.4)} />
            </g>
          ))}
          <text x={112} y={214} textAnchor="middle" fontSize={11} fill={svg.dim}>
            kallo – vakiotilavuus
          </text>

          {/* ICP gauge */}
          <g transform="translate(262 92)">
            <path d="M-44 0A44 44 0 0 1 44 0" fill="none" stroke={svg.line} strokeWidth={10} strokeLinecap="round" />
            <path d="M15 -41.4A44 44 0 0 1 44 0" fill="none" stroke={svg.danger} strokeWidth={10} strokeLinecap="round" opacity={0.55} />
            <circle cx={0} cy={0} r={5} fill={svg.ink} />
            <text x={0} y={22} textAnchor="middle" fontSize={12} fontWeight={700} fill={svg.ink}>
              ICP
            </text>
            <text x={0} y={38} textAnchor="middle" fontSize={11} fill={mode === 'hyper' ? svg.danger : svg.dim}>
              {mode === 'hyper' ? 'koholla' : mode === 'hypo' ? 'ei koholla' : 'normaali'}
            </text>
          </g>
          <motion.path
            d="M262 92L262 56"
            stroke={svg.ink}
            strokeWidth={3}
            strokeLinecap="round"
            initial={false}
            animate={{ transform: `rotate(${c.needle}deg)` }}
            transition={t}
            style={{ transformBox: 'view-box', originX: '262px', originY: '92px' }}
          />
        </svg>
      </Stage>

      <FadeSwap k={mode} className="mt-3">
        <p className={`mb-1.5 font-display text-[15px] font-semibold ${c.tone}`}>{c.title}</p>
        <Bullets items={c.items} />
      </FadeSwap>
    </div>
  )
}
