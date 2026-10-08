import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Result, svg } from '../ui'

/* Schematic: a child's blood pressure stays normal while compensation (vasoconstriction,
 * tachycardia) hides the loss – until it suddenly fails. x = 0…1, where 1 ≈ "jopa 50 %". */

const CW = 300
const CH = 130
const X0 = 34
const Y0 = 14

const bpAt = (x: number) => (x < 0.86 ? 0.72 : 0.72 - ((x - 0.86) / 0.14) ** 1.6 * 0.62)
const compAt = (x: number) => 0.12 + 0.78 * (1 - Math.exp(-x * 3.2))

const px = (x: number) => X0 + x * (CW - X0 - 8)
const py = (v: number) => Y0 + (1 - v) * (CH - Y0 - 22)

function line(f: (x: number) => number) {
  let d = ''
  for (let i = 0; i <= 60; i++) {
    const x = i / 60
    d += `${i ? 'L' : 'M'}${px(x).toFixed(1)} ${py(f(x)).toFixed(1)}`
  }
  return d
}

const SIGNS = ['Takykardia', 'Kapillaaritäyttöaika > 2 s', 'Heikentyneet ääreispulssit', 'Iho harmaankalpea / marmoroitunut', 'Tajunnantason lasku']

export default function ChildCompensation(_props: WidgetProps) {
  const [v, setV] = useState(0.15)
  const reduce = useReducedMotion()
  const compensating = v >= 0.2
  const failing = v >= 0.86
  const skin = failing ? 'rgba(148,163,184,0.55)' : compensating ? 'rgba(203,213,225,0.5)' : 'rgba(244,184,160,0.55)'

  return (
    <div>
      <div className="grid gap-3 min-[520px]:grid-cols-[110px_1fr] min-[520px]:items-center">
        {/* child figure */}
        <svg viewBox="0 0 110 150" className="mx-auto h-auto w-[84px] min-[520px]:w-[110px]" role="img" aria-label={failing ? 'Lapsen iho harmaa ja marmoroitunut, verenpaine laskee.' : compensating ? 'Lapsen iho kalpenee, ääreisverenkierto supistuu.' : 'Lapsi hyvävointinen.'}>
          <motion.g initial={false} animate={{ fill: skin }} transition={{ duration: 0.4 }} stroke={svg.dim} strokeWidth={1.5}>
            <circle cx={55} cy={34} r={24} />
            <path d="M30 70C30 60 40 56 55 56S80 60 80 70V112H30Z" />
            <path d="M30 66L14 104M80 66L96 104M38 112L34 146M72 112L76 146" strokeWidth={11} strokeLinecap="round" />
          </motion.g>
          {failing && (
            <g fill="none" stroke="rgba(100,116,139,0.6)" strokeWidth={1.2}>
              <path d="M36 80c4 -4 8 4 12 0s8 4 12 0 8 4 12 0" />
              <path d="M36 94c4 -4 8 4 12 0s8 4 12 0 8 4 12 0" />
            </g>
          )}
        </svg>

        {/* chart */}
        <div>
          <svg viewBox={`0 0 ${CW} ${CH}`} className="h-auto w-full" role="img" aria-label="Kaavio: verenpaine pysyy normaalina, kunnes kompensaatio pettää; sitten se laskee nopeasti.">
            <path d={`M${X0} ${Y0}V${CH - 22}H${CW - 6}`} fill="none" stroke={svg.line} strokeWidth={1.5} />
            <text x={X0} y={CH - 6} fontSize={10.5} fill={svg.dim}>
              0
            </text>
            <text x={CW - 6} y={CH - 6} fontSize={10.5} fill={svg.dim} textAnchor="end">
              jopa 50 % verivolyymista
            </text>
            <text x={X0 - 4} y={Y0 + 8} fontSize={10.5} fill={svg.dim} textAnchor="end">
              ↑
            </text>
            {/* late zone */}
            <rect x={px(0.86)} y={Y0} width={px(1) - px(0.86)} height={CH - 22 - Y0} fill="rgba(220,38,38,0.1)" />
            <path d={line(compAt)} fill="none" stroke={svg.brand} strokeWidth={2.4} strokeLinecap="round" />
            <path d={line(bpAt)} fill="none" stroke={svg.danger} strokeWidth={2.6} strokeLinecap="round" />
            <text x={px(0.6)} y={py(compAt(0.6)) - 8} fontSize={11} fontWeight={700} fill={svg.brand} textAnchor="end">
              Kompensaatio
            </text>
            <text x={px(0.02)} y={py(0.72) - 7} fontSize={11} fontWeight={700} fill={svg.danger}>
              Verenpaine
            </text>
            {/* cursor */}
            <motion.g initial={false} animate={{ x: px(v) }} transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.35, bounce: 0 }}>
              <line x1={0} x2={0} y1={Y0} y2={CH - 22} stroke={svg.ink} strokeWidth={1.2} strokeDasharray="3 3" />
            </motion.g>
            <motion.circle r={5} fill={svg.danger} stroke={svg.raised} strokeWidth={2} initial={false} animate={{ cx: px(v), cy: py(bpAt(v)) }} transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.35, bounce: 0 }} />
            <motion.circle r={5} fill={svg.brand} stroke={svg.raised} strokeWidth={2} initial={false} animate={{ cx: px(v), cy: py(compAt(v)) }} transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.35, bounce: 0 }} />
          </svg>
          <label className="mt-1 block">
            <span className="flex justify-between text-[12px] font-medium text-[var(--text-dim)]">
              <span>Verenhukka</span>
              <span className="font-semibold text-[var(--text)]">{failing ? 'Kompensaatio pettää' : compensating ? 'Kompensoitu sokki' : 'Vähäinen'}</span>
            </span>
            <input type="range" min={0} max={1} step={0.01} value={v} onChange={(e) => setV(Number(e.target.value))} className="mt-1 h-8 w-full cursor-pointer accent-brand-500" aria-label="Verenhukka" />
          </label>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SIGNS.map((s) => (
          <span
            key={s}
            className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors duration-300 ${compensating ? 'bg-brand-500/12 text-brand-600' : 'bg-[var(--bg-card)] text-[var(--text-dim)]'}`}
          >
            {s}
          </span>
        ))}
        <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors duration-300 ${failing ? 'bg-danger-500 text-white' : 'bg-[var(--bg-card)] text-[var(--text-dim)]'}`}>Matala verenpaine</span>
      </div>

      <div className="mt-3">
        {failing ? (
          <Result tone="danger" title="Verenpaineen lasku on myöhäinen merkki">
            Se ennakoi pian tapahtuvaa elvytystilannetta.
          </Result>
        ) : compensating ? (
          <Result tone="warning" title="Verenpaine on vielä normaali – lapsi on silti sokissa">
            Lapsen elimistö supistaa ääreisverenkiertoa niin tehokkaasti, että verenpaine pysyy normaalina, vaikka jopa 50 % verivolyymista olisi menetetty. Tunnista sokki muista löydöksistä.
          </Result>
        ) : (
          <Result tone="neutral" title="Liu'uta verenhukkaa">
            Katso, mitkä löydökset ilmaantuvat ja milloin verenpaine vasta laskee.
          </Result>
        )}
      </div>
      <p className="mt-2 text-[12px] text-[var(--text-dim)]">Kaaviokuva, ei mittausarvoja. Monitoroi jatkuvasti myös hyväkuntoiselta vaikuttavaa lasta.</p>
    </div>
  )
}
