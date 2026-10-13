import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { BodySilhouette } from '../parts/body-silhouette'
import { Bullets, FadeSwap, Stage, StateTabs, useLoop } from '../parts/resp-kit'

/* Heat balance and its failure (article Lämpöhalvaus). Body silhouette in body space
 * (200 × 410) scaled 0.48. Thermometer levels are illustrative; only the 40 °C (heat stroke)
 * and 41,6–42 °C (tissue damage) marks come from the article. */

type Mode = 'ok' | 'humid' | 'dry' | 'fail' | 'cool'

const DROPS: [number, number][] = [
  [92, 34],
  [108, 30],
  [84, 96],
  [116, 104],
  [100, 128],
  [52, 150],
  [148, 150],
]

const THERMO = { x: 236, top: 26, bottom: 186 } // 36 °C at bottom, 43 °C at top
const tempY = (c: number) => THERMO.bottom - ((c - 36) / 7) * (THERMO.bottom - THERMO.top)

const CFG: Record<Mode, { level: number; flush: number; drops: 'evap' | 'stay' | 'few' | 'none'; heat: number; cool?: boolean; tone: string; title: string; items: string[] }> = {
  ok: {
    level: 37.6,
    flush: 0.22,
    drops: 'evap',
    heat: 1,
    tone: 'text-teal-600',
    title: 'Lämmönsäätely toimii',
    items: [
      'Kun ruumiinlämpö nousee, elimistö lisää lämmönhukkaa lisäämällä ihoverenkiertoa ja hikoilemalla.',
      'Ympäristön lämmetessä lämmönhukka riippuu yhä enemmän hikoilusta – kuivissa oloissa jopa 98 %.',
    ],
  },
  humid: {
    level: 39.3,
    flush: 0.3,
    drops: 'stay',
    heat: 0.35,
    tone: 'text-brand-600',
    title: 'Kostea ilma: hiki ei haihdu',
    items: ['Jos hikoilu estyy tai hiki ei pääse haihtumaan (kostea ilma, kuivuminen, hienerityksen häiriö), elimistön lämpö nousee.'],
  },
  dry: {
    level: 40.2,
    flush: 0.14,
    drops: 'few',
    heat: 0.5,
    tone: 'text-brand-600',
    title: 'Kuivuminen',
    items: [
      'Runsas hikoilu ilman riittävää juomista johtaa kuivumiseen ja suolahukkaan.',
      'Veritilavuus ja verenpaine laskevat.',
    ],
  },
  fail: {
    level: 42.4,
    flush: 0.05,
    drops: 'none',
    heat: 0.1,
    tone: 'text-danger-500',
    title: 'Lämmönsäätely pettää',
    items: [
      'Lopulta ihoverenkierto ja hikoilu vähenevät, ja lämpö nousee hallitsemattomasti.',
      'Lämpöhalvaus: ydinlämpö yli 40 °C ja keskushermoston häiriö sekavuudesta tajuttomuuteen.',
      'Noin 41,6–42 °C:sta alkaen syntyy kudosvaurioita; tulehdusreaktio ja hyytymisjärjestelmän aktivoituminen voivat johtaa monielinvaurioon.',
    ],
  },
  cool: {
    level: 38.4,
    flush: 0.16,
    drops: 'none',
    heat: 1.2,
    cool: true,
    tone: 'text-teal-600',
    title: 'Välitön viilennys',
    items: [
      'Pois kuumuudesta ja ulkoinen viilennys, esimerkiksi viilennyspeitteet. Lääkkeet eivät viilennä.',
      'Aika lämmön noususta viilennyksen aloitukseen on suoraan yhteydessä elinvaurion vaikeuteen ja kuolleisuuteen.',
      'Hyvän toipumisen paras ennusmerkki on tajunnan palautuminen viilennyksen aikana.',
    ],
  },
}

function Drop({ x, y, kind, i, active }: { x: number; y: number; kind: 'evap' | 'stay' | 'few'; i: number; active: boolean }) {
  const d = `M${x} ${y - 5}C${x + 3} ${y - 1} ${x + 3.5} ${y + 2} ${x} ${y + 3.5}C${x - 3.5} ${y + 2} ${x - 3} ${y - 1} ${x} ${y - 5}Z`
  if (!active) return <path d={d} fill="#38bdf8" opacity={0.8} />
  const anim =
    kind === 'stay'
      ? { opacity: [0, 1, 1], transform: ['translate(0px, 0px)', 'translate(0px, 5px)', 'translate(0px, 12px)'] }
      : { opacity: [0, 1, 0], transform: ['translate(0px, 0px)', 'translate(0px, -3px)', 'translate(8px, -14px)'] }
  return (
    <motion.path
      d={d}
      fill="#38bdf8"
      initial={{ opacity: 0 }}
      animate={anim}
      transition={{ duration: kind === 'stay' ? 3.2 : 2.2, repeat: Infinity, delay: i * 0.33, ease: 'linear' }}
    />
  )
}

export default function HeatBalance(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('ok')
  const { ref, reduce, active } = useLoop<HTMLDivElement>()
  const c = CFG[mode]
  const drops = c.drops === 'none' ? [] : c.drops === 'few' ? DROPS.slice(0, 3) : DROPS
  const ease = reduce ? { duration: 0 } : { duration: 0.9, ease: [0.77, 0, 0.175, 1] as const }

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="heat-mode"
        gridOnly
        value={mode}
        onChange={setMode}
        options={[
          { value: 'ok', label: 'Säätely toimii' },
          { value: 'humid', label: 'Kostea ilma' },
          { value: 'dry', label: 'Kuivuminen' },
          { value: 'fail', label: 'Säätely pettää' },
          { value: 'cool', label: 'Viilennys' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label={`Lämmönsäätely: ${c.title}.`}>
          <g transform="translate(50 6) scale(0.48)">
            <BodySilhouette view="front" />
            {/* skin blood flow */}
            <motion.g initial={false} animate={{ opacity: c.flush }} transition={ease}>
              <BodySilhouette view="front" fill="#ef4444" gap="transparent" details={false} />
            </motion.g>
            {drops.map(([x, y], i) => (
              <Drop key={`${mode}-${i}`} x={x} y={y} kind={c.drops as 'evap' | 'stay' | 'few'} i={i} active={active} />
            ))}
          </g>

          {/* heat leaving the body */}
          {[54, 92, 130].map((y, i) => (
            <motion.path
              key={`${mode}-h${i}`}
              d={`M160 ${y}C166 ${y - 6} 172 ${y + 6} 178 ${y}C184 ${y - 6} 190 ${y + 6} 196 ${y}`}
              fill="none"
              stroke={c.cool ? '#38bdf8' : svg.brand}
              strokeWidth={2.4}
              strokeLinecap="round"
              initial={false}
              animate={
                active
                  ? { opacity: [0, c.heat > 0.2 ? Math.min(1, c.heat) : 0.15, 0], transform: ['translateX(0px)', 'translateX(8px)', 'translateX(18px)'] }
                  : { opacity: Math.min(1, c.heat) * 0.8 }
              }
              transition={active ? { duration: 1.8, repeat: Infinity, delay: i * 0.5, ease: 'linear' } : { duration: 0 }}
            />
          ))}
          <text x={178} y={162} textAnchor="middle" fontSize={11} fill={svg.dim}>
            {c.cool ? 'viilennys' : 'lämmönhukka'}
          </text>

          {/* thermometer */}
          <rect x={THERMO.x - 7} y={THERMO.top - 6} width={14} height={THERMO.bottom - THERMO.top + 12} rx={7} fill={svg.surface} stroke={svg.line} strokeWidth={2} />
          <circle cx={THERMO.x} cy={THERMO.bottom + 12} r={11} fill={c.level >= 40 ? svg.danger : svg.brand} />
          <motion.rect
            x={THERMO.x - 3.5}
            y={THERMO.top - 2}
            width={7}
            height={THERMO.bottom + 12 - THERMO.top}
            rx={3.5}
            fill={c.level >= 40 ? svg.danger : svg.brand}
            initial={false}
            animate={{ transform: `scaleY(${((THERMO.bottom + 12 - tempY(c.level)) / (THERMO.bottom + 12 - THERMO.top)).toFixed(3)})` }}
            transition={ease}
            style={{ transformBox: 'fill-box', originX: 0.5, originY: 1 }}
          />
          {[
            { c: 40, label: '40 °C' },
            { c: 41.8, label: '41,6–42 °C' },
          ].map((m) => (
            <g key={m.c}>
              <path d={`M${THERMO.x + 9} ${tempY(m.c)}H${THERMO.x + 16}`} stroke={svg.danger} strokeWidth={1.6} />
              <text x={THERMO.x + 18} y={tempY(m.c) + 4} fontSize={10.5} fill={svg.danger}>
                {m.label}
              </text>
            </g>
          ))}
        </svg>
      </Stage>

      <FadeSwap k={mode} className="mt-3">
        <p className={`mb-1.5 font-display text-[15px] font-semibold ${c.tone}`}>{c.title}</p>
        <Bullets items={c.items} />
      </FadeSwap>
    </div>
  )
}
