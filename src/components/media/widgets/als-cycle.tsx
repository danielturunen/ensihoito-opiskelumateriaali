import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption, Segmented, Stat, svg } from '../ui'
import { FadeSwap, useLoop } from '../parts/resp-kit'

/* Adult ALS in 2-minute cycles (Käypä hoito: Elvytys 2021).
 * Shockable: one shock per analysis; adrenaline 1 mg + amiodarone 300 mg after the 3rd shock,
 * amiodarone 150 mg after the 5th, adrenaline every 3–5 min (≈ every other cycle).
 * Non-shockable: adrenaline 1 mg as soon as possible, then every 3–5 min. */

type Rhythm = 'vf' | 'pea'
const CYCLES = 7

interface Step {
  shock: boolean
  adr: boolean
  amio: 0 | 150 | 300
}

function stepFor(rhythm: Rhythm, n: number): Step {
  if (rhythm === 'pea') return { shock: false, adr: n % 2 === 1, amio: 0 }
  return { shock: true, adr: n >= 3 && n % 2 === 1, amio: n === 3 ? 300 : n === 5 ? 150 : 0 }
}

function Badge({ x, y, label, fill }: { x: number; y: number; label: string; fill: string }) {
  return (
    <g>
      <rect x={x - 11} y={y - 7} width={22} height={14} rx={7} fill={fill} />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
        {label}
      </text>
    </g>
  )
}

export default function AlsCycle(_props: WidgetProps) {
  const [rhythm, setRhythm] = useState<Rhythm>('vf')
  const [n, setN] = useState(1)
  const { ref, active } = useLoop<HTMLDivElement>()

  const steps = Array.from({ length: CYCLES }, (_, i) => stepFor(rhythm, i + 1))
  const cur = steps[n - 1]
  const done = steps.slice(0, n)
  const shocks = done.filter((s) => s.shock).length
  const adr = done.filter((s) => s.adr).length
  const amio = done.reduce((a, s) => a + s.amio, 0)

  const W = 340
  const gap = (W - 40) / (CYCLES - 1)

  return (
    <div ref={ref}>
      <Segmented
        layoutId="als-rhythm"
        value={rhythm}
        onChange={(r) => {
          setRhythm(r)
          setN(1)
        }}
        options={[
          { value: 'vf', label: 'Iskettävä (VF / VT)' },
          { value: 'pea', label: 'Ei-iskettävä (PEA / asystole)' },
        ]}
      />

      <svg viewBox={`0 0 ${W} 92`} className="mt-3 h-auto w-full" role="img" aria-label={`Rytmianalyysi ${n} / ${CYCLES}`}>
        <line x1={20} x2={W - 20} y1={46} y2={46} stroke={svg.line} strokeWidth={3} strokeLinecap="round" />
        <motion.line
          x1={20}
          y1={46}
          y2={46}
          stroke={svg.brand}
          strokeWidth={3}
          strokeLinecap="round"
          initial={false}
          animate={{ x2: 20 + (n - 1) * gap }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.1 }}
        />
        {steps.map((s, i) => {
          const x = 20 + i * gap
          const on = i + 1 === n
          const past = i + 1 <= n
          return (
            <g key={i} onClick={() => setN(i + 1)} style={{ cursor: 'pointer' }}>
              <rect x={x - gap / 2} y={0} width={gap} height={92} fill="transparent" />
              <text x={x} y={14} textAnchor="middle" fontSize={9} fill={svg.dim}>
                {i * 2} min
              </text>
              {s.shock && <Badge x={x} y={28} label="⚡" fill={past ? svg.danger : 'rgba(220,38,38,0.35)'} />}
              <circle cx={x} cy={46} r={on ? 9 : 6} fill={past ? svg.brand : svg.raised} stroke={past ? svg.brand : svg.line} strokeWidth={2} />
              {on && active && (
                <motion.circle
                  cx={x}
                  cy={46}
                  r={9}
                  fill="none"
                  stroke={svg.brand}
                  strokeWidth={2}
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  style={{ transformOrigin: `${x}px 46px` }}
                />
              )}
              {s.adr && <Badge x={x} y={66} label="A" fill={past ? svg.brand : 'rgba(248,105,10,0.35)'} />}
              {s.amio > 0 && <Badge x={x} y={83} label={s.amio === 300 ? '300' : '150'} fill={past ? svg.teal : 'rgba(15,184,172,0.35)'} />}
            </g>
          )
        })}
      </svg>

      <FadeSwap k={`${rhythm}-${n}`} className="mt-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
          <p className="font-display text-[15px] font-semibold text-[var(--text)]">
            {n}. rytmianalyysi · {(n - 1) * 2} min
          </p>
          <ul className="mt-1.5 space-y-1 text-[13.5px] leading-snug text-[var(--text)]">
            {cur.shock ? (
              <li>
                <span className="font-semibold text-danger-500">Isku {n}</span> – painelu jatkuu heti iskun jälkeen 2 min ilman rytmin tarkistusta.
              </li>
            ) : (
              <li>Ei iskua – painelu jatkuu heti. Etsi ja hoida syy (4H / 4T).</li>
            )}
            {cur.adr && (
              <li>
                <span className="font-semibold text-brand-600">Adrenaliini 1 mg</span> i.v./i.o.
                {rhythm === 'pea' && n === 1 ? ' heti, kun yhteys on saatu.' : rhythm === 'vf' && n === 3 ? ' 3. iskun jälkeen.' : ' (3–5 min välein).'}
              </li>
            )}
            {cur.amio > 0 && (
              <li>
                <span className="font-semibold text-teal-600">Amiodaroni {cur.amio} mg</span> i.v./i.o. {cur.amio === 300 ? '3. iskun jälkeen' : '5. iskun jälkeen'} (vaihtoehtoisesti lidokaiini {cur.amio === 300 ? 100 : 50} mg).
              </li>
            )}
            {!cur.adr && !cur.amio && rhythm === 'vf' && n < 3 && <li className="text-[var(--text-dim)]">Ei vielä lääkkeitä – ne annetaan 3. iskun jälkeen.</li>}
            {!cur.adr && !cur.amio && (rhythm === 'pea' || n > 3) && <li className="text-[var(--text-dim)]">Ei lääkettä tällä kierroksella – adrenaliini 3–5 min välein.</li>}
          </ul>
        </div>
      </FadeSwap>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Iskuja" value={shocks} tone={shocks ? 'danger' : 'neutral'} />
        <Stat label="Adrenaliini" value={`${adr} mg`} tone={adr ? 'brand' : 'neutral'} />
        <Stat label="Amiodaroni" value={`${amio} mg`} tone={amio ? 'ok' : 'neutral'} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setN(1)}
          className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[14px] font-medium text-[var(--text)] active:scale-[0.98]"
        >
          Alusta
        </button>
        <button
          type="button"
          disabled={n >= CYCLES}
          onClick={() => setN((v) => Math.min(CYCLES, v + 1))}
          className="min-h-11 rounded-xl bg-brand-600 text-[14px] font-semibold text-white active:scale-[0.98] disabled:opacity-40"
        >
          Seuraava analyysi →
        </button>
      </div>

      <div className="mt-3">
      <Caption>
        Painelu 5–6 cm, 100–120/min, painelija vaihtuu 2 min välein. Ventilaatio supraglottisella välineellä 10/min painelua keskeyttämättä. Monitoroidulla, viiveettä havaitulla VF:llä voidaan antaa 3 iskua peräkkäin ennen painelua. Lähde: Käypä hoito, Elvytys 2021.
      </Caption>
      </div>
    </div>
  )
}
