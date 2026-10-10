import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { NumberField, Result, svg, type Tone } from '../ui'

/* Tissue oxygen delivery depends on saturation × haemoglobin × cardiac output
 * (heart rate × stroke volume). Relative values only: 100 % = the patient's own baseline. */

export default function O2Delivery() {
  const [sat, setSat] = useState(98)
  const [hb, setHb] = useState(100)
  const [hr, setHr] = useState(100)
  const [sv, setSv] = useState(100)
  const reduce = useReducedMotion()

  const rel = (sat / 98) * (hb / 100) * (hr / 100) * (sv / 100)
  const pct = Math.round(rel * 100)

  let title: string
  let text: string
  let tone: Tone
  if (sat >= 94 && pct < 70) {
    title = 'Saturaatio on hyvä – hapentarjonta silti heikko'
    text = 'Pulssioksimetri kertoo vain, kuinka suuri osa hemoglobiinista on sitonut happea. Se ei kerro, onko hemoglobiinia tarpeeksi eikä kuljettaako sydän veren kudoksiin.'
    tone = 'danger'
  } else if (pct < 70) {
    title = 'Hapentarjonta on heikentynyt'
    text = 'Katso, mikä tekijä laskee tarjontaa eniten – ja mihin hoidolla voi vaikuttaa.'
    tone = 'warning'
  } else {
    title = 'Hapentarjonta lähellä lähtötasoa'
    text = 'Elimistö voi myös kompensoida: kun iskutilavuus pienenee, syke nousee ylläpitääkseen minuuttitilavuutta.'
    tone = 'ok'
  }

  const bars = [
    { label: 'SpO₂', v: sat / 98 },
    { label: 'Hb', v: hb / 100 },
    { label: 'Syke', v: hr / 100 },
    { label: 'Iskutilavuus', v: sv / 100 },
  ]

  return (
    <div>
      <svg viewBox="0 0 320 120" className="h-auto w-full" role="img" aria-label={`Hapentarjonta noin ${pct} % lähtötasosta`}>
        <g aria-hidden>
          {bars.map((b, i) => {
            const x = 14 + i * 58
            const h = Math.min(1.6, b.v) * 50
            return (
              <g key={b.label}>
                <rect x={x} y={20} width={40} height={80} rx={6} fill={svg.raised} />
                <motion.rect x={x} width={40} rx={6} initial={false} animate={{ y: 100 - h, height: h }} transition={{ duration: reduce ? 0 : 0.3 }} fill={b.v < 0.85 ? svg.brand : svg.teal} fillOpacity={0.7} />
                <line x1={x - 2} x2={x + 42} y1={50} y2={50} stroke={svg.ink} strokeOpacity={0.35} strokeDasharray="3 3" />
                <text x={x + 20} y={114} fontSize={9} fill={svg.dim} textAnchor="middle">
                  {b.label}
                </text>
              </g>
            )
          })}
          <motion.text x={290} y={66} fontSize={22} fontWeight={700} textAnchor="middle" initial={false} animate={{ fill: pct < 70 ? svg.danger : svg.teal }}>
            {pct} %
          </motion.text>
          <text x={290} y={84} fontSize={9} fill={svg.dim} textAnchor="middle">
            hapentarjonta
          </text>
          <text x={8} y={14} fontSize={9} fill={svg.dim}>
            katkoviiva = potilaan lähtötaso
          </text>
        </g>
      </svg>

      <div className="mt-2 flex flex-col gap-3">
        <NumberField label="Happisaturaatio" value={sat} onChange={setSat} min={60} max={100} unit="%" />
        <NumberField label="Hemoglobiini (lähtötasosta)" value={hb} onChange={setHb} min={30} max={120} step={5} unit="%" />
        <NumberField label="Syketaajuus (lähtötasosta)" value={hr} onChange={setHr} min={30} max={180} step={5} unit="%" />
        <NumberField label="Iskutilavuus (lähtötasosta)" value={sv} onChange={setSv} min={20} max={120} step={5} unit="%" />
      </div>
      <div className="mt-3">
        <Result tone={tone} title={title}>
          {text}
        </Result>
      </div>
    </div>
  )
}
