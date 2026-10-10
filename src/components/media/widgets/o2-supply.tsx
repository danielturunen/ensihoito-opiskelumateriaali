import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { NumberField, Result, Stat, svg } from '../ui'

/* Oxygen cylinder supply: litres = cylinder volume (l) × pressure (bar);
 * duration = litres / flow (l/min). Example from Säämänen 2008: 20 l × 120 bar, 15 l/min. */

function fmt(min: number) {
  if (!isFinite(min)) return '–'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}

export default function O2Supply() {
  const [vol, setVol] = useState(20)
  const [bar, setBar] = useState(120)
  const [flow, setFlow] = useState(15)
  const reduce = useReducedMotion()

  const litres = vol * bar
  const minutes = litres / flow
  const fill = Math.min(1, bar / 200)

  return (
    <div>
      <div className="flex items-end gap-4">
        <svg viewBox="0 0 60 150" className="h-32 w-auto shrink-0" aria-hidden>
          <rect x={22} y={4} width={16} height={14} rx={3} fill={svg.line} />
          <rect x={8} y={16} width={44} height={128} rx={18} fill={svg.raised} stroke={svg.ink} strokeOpacity={0.35} strokeWidth={2} />
          <motion.rect
            x={10}
            width={40}
            rx={16}
            fill={svg.teal}
            fillOpacity={0.55}
            initial={false}
            animate={{ y: 142 - 124 * fill, height: 124 * fill }}
            transition={{ duration: reduce ? 0 : 0.3 }}
          />
          <text x={30} y={86} fontSize={11} fontWeight={700} fill={svg.ink} textAnchor="middle">
            O₂
          </text>
        </svg>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Stat label="Happea pullossa" value={`${litres.toLocaleString('fi-FI')} l`} />
          <Stat label="Riittää" value={fmt(minutes)} />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <NumberField label="Pullon koko" value={vol} onChange={setVol} min={1} max={50} step={1} unit="l" />
        <NumberField label="Paine mittarissa" value={bar} onChange={setBar} min={0} max={200} step={5} unit="bar" />
        <NumberField label="Virtaus" value={flow} onChange={setFlow} min={1} max={25} step={1} unit="l/min" />
      </div>

      <div className="mt-3">
        <Result tone="neutral" title="Laskutapa">
          {vol} l × {bar} bar = <strong className="text-[var(--text)]">{litres.toLocaleString('fi-FI')} l</strong> happea. {litres.toLocaleString('fi-FI')} l ÷ {flow} l/min = <strong className="text-[var(--text)]">{Math.round(minutes)} min</strong> ({fmt(minutes)}).
        </Result>
      </div>
    </div>
  )
}
