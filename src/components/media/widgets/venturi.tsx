import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Result } from '../ui'

/* Venturi mask valves: colour → oxygen flow → delivered oxygen concentration
 * (Käypä hoito Keuhkoahtaumatauti: happihoito pahenemisvaiheessa). */

const VALVES = [
  { color: 'Sininen', hex: '#3b82f6', flow: 2, fio2: 24 },
  { color: 'Valkoinen', hex: '#e5e7eb', flow: 4, fio2: 28 },
  { color: 'Keltainen', hex: '#facc15', flow: 8, fio2: 35 },
  { color: 'Punainen', hex: '#ef4444', flow: 10, fio2: 40 },
  { color: 'Vihreä', hex: '#22c55e', flow: 15, fio2: 60 },
] as const

export default function Venturi() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const v = VALVES[i]
  const pct = ((v.fio2 - 21) / (60 - 21)) * 100

  return (
    <div>
      <p className="mb-2 text-[13px] text-[var(--text-dim)]">Valitse venttiili – kukin väri on suunniteltu tietylle happivirtaukselle.</p>
      <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Venturi-venttiili">
        {VALVES.map((x, k) => {
          const active = k === i
          return (
            <button
              key={x.color}
              role="radio"
              aria-checked={active}
              aria-label={`${x.color} venttiili`}
              onClick={() => setI(k)}
              className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border transition-[border-color,background-color,transform] duration-150 active:scale-[0.97] ${
                active ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border)]'
              }`}
            >
              <span className="h-7 w-7 rounded-full border border-black/15 shadow-sm" style={{ background: x.hex }} aria-hidden />
              <span className="text-[10.5px] font-medium text-[var(--text)]">{x.color}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[var(--bg)] px-3 py-2.5 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-dim)]">Happivirtaus</p>
          <p className="font-display text-2xl font-bold tabular-nums text-[var(--text)]">{v.flow} l/min</p>
        </div>
        <div className="rounded-xl bg-[var(--bg)] px-3 py-2.5 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-dim)]">Hapen osuus</p>
          <p className="font-display text-2xl font-bold tabular-nums text-[var(--text)]">{v.fio2} %</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] text-[var(--text-dim)]">
          <span>huoneilma 21 %</span>
          <span>60 %</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-[var(--bg)]">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: v.hex === '#e5e7eb' ? '#9ca3af' : v.hex, originX: 0 }}
            initial={false}
            animate={{ scaleX: Math.max(0.04, pct / 100) }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0 }}
          />
        </div>
      </div>

      <div className="mt-3">
        <Result tone="brand" title="Keuhkoahtaumapotilaalla: tavoite SpO₂ 88–92 %">
          Lisähappi annetaan hallitusti happiviiksillä tai venturimaskilla. Venturimaski antaa luotettavimmin ennakoitavan happipitoisuuden. Jos hiilidioksidia kertyy (uneliaisuus, päänsärky, desorientaatio, ihon punakkuus), NIV aloitetaan varhain.
        </Result>
      </div>
    </div>
  )
}
