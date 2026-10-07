import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption, NumberField, Result, Segmented } from '../ui'

const limits = {
  m: { prolonged: 440, ondansetron: 450 },
  n: { prolonged: 460, ondansetron: 470 },
} as const

const MIN = 360
const MAX = 560

export default function Qtc(_props: WidgetProps) {
  const [sex, setSex] = useState<'m' | 'n'>('m')
  const [qtc, setQtc] = useState(430)
  const l = limits[sex]
  const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100

  const marks = [
    { at: l.prolonged, label: `${l.prolonged}`, title: 'pidentynyt' },
    { at: l.ondansetron, label: `${l.ondansetron}`, title: 'ondansetroni ✗' },
    { at: 500, label: '500', title: 'merkittävä riski' },
  ]

  return (
    <div>
      <Segmented
        layoutId="qtc-sex"
        value={sex}
        onChange={setSex}
        options={[
          { value: 'm', label: 'Mies' },
          { value: 'n', label: 'Nainen' },
        ]}
      />

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[var(--text-dim)]">QTc-aika</span>
        <span className="font-display text-3xl font-bold tabular-nums">
          {qtc}
          <span className="ml-1 text-[14px] font-medium text-[var(--text-dim)]">ms</span>
        </span>
      </div>

      <div className="relative mt-3 h-4 overflow-hidden rounded-full bg-teal-500/40">
        <motion.div className="absolute inset-y-0 right-0 bg-brand-500/45" animate={{ left: `${pct(l.prolonged)}%` }} transition={{ type: 'spring', duration: 0.4, bounce: 0 }} />
        <div className="absolute inset-y-0 right-0 bg-danger-500/70" style={{ left: `${pct(500)}%` }} />
      </div>
      <div className="relative h-10">
        {marks.map((m) => (
          <motion.div
            key={m.title}
            className="absolute top-0 -translate-x-1/2 text-center"
            animate={{ left: `${pct(m.at)}%` }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
          >
            <div className="mx-auto h-2 w-px bg-[var(--text-dim)]" />
            <p className="text-[10px] font-semibold tabular-nums text-[var(--text)]">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <NumberField label="Säädä QTc" unit="ms" value={qtc} onChange={setQtc} min={MIN} max={MAX} step={5} />

      <div className="mt-4 flex flex-col gap-2">
        {qtc > 500 ? (
          <Result tone="danger" title="Yli 500 ms – merkittävä riski">
            Altistaa kääntyvien kärkien kammiotakykardialle. Amiodaroni ja muut QT-aikaa pidentävät lääkkeet vasta-aiheisia; kääntyvien kärkien hoito magnesium 2 g i.v.
          </Result>
        ) : qtc > l.prolonged ? (
          <Result tone="warning" title="Pidentynyt QTc">
            Raja {sex === 'm' ? 'miehillä 440 ms' : 'naisilla 460 ms'}.{' '}
            {qtc > l.ondansetron
              ? `Ylittää myös ondansetronin vasta-ainerajan (${l.ondansetron} ms) – harkitse muuta antiemeettiä.`
              : 'Huomioi QT-aikaa pidentävät lääkkeet (esim. amiodaroni, ondansetroni) ja elektrolyyttihäiriöt.'}
          </Result>
        ) : (
          <Result tone="ok" title="Ei pidentynyt">
            Pidentyneen QTc:n raja on miehillä 440 ms ja naisilla 460 ms.
          </Result>
        )}
      </div>
      <div className="mt-3">
        <Caption>Altistavat tekijät: synnynnäinen pitkä QT -oireyhtymä, useat lääkkeet, sydänlihasvaurio sekä matala kalium, magnesium tai kalsium.</Caption>
      </div>
    </div>
  )
}
