import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption, NumberField, Result } from '../ui'

export default function ShockIndex(_props: WidgetProps) {
  const [hr, setHr] = useState(120)
  const [sbp, setSbp] = useState(80)
  const si = hr / sbp
  const shown = si.toFixed(2).replace('.', ',')
  const tone = si >= 1 ? 'danger' : si >= 0.9 ? 'warning' : 'ok'
  // Gauge spans 0.4–2.0
  const pos = Math.min(1, Math.max(0, (si - 0.4) / 1.6))

  return (
    <div>
      <div className="rounded-2xl bg-[var(--bg)] p-4 text-center">
        <p className="text-[12px] font-medium text-[var(--text-dim)]">Sokki-indeksi = syke ÷ systolinen verenpaine</p>
        <p className="mt-1 font-display text-[15px] font-semibold tabular-nums text-[var(--text-dim)]">
          {hr} ÷ {sbp} =
        </p>
        <p className={`font-display text-5xl font-bold tabular-nums ${tone === 'danger' ? 'text-danger-500' : tone === 'warning' ? 'text-brand-600' : 'text-teal-600'}`}>{shown}</p>

        <div className="relative mx-auto mt-3 h-3 max-w-sm overflow-hidden rounded-full">
          <div className="absolute inset-0 flex">
            <div className="bg-teal-500/50" style={{ flexGrow: 0.5 }} />
            <div className="bg-brand-500/50" style={{ flexGrow: 0.1 }} />
            <div className="bg-danger-500/60" style={{ flexGrow: 1 }} />
          </div>
        </div>
        <div className="relative mx-auto h-4 max-w-sm">
          <motion.div className="absolute inset-x-0 top-0" animate={{ x: `${pos * 100}%` }} transition={{ type: 'spring', duration: 0.3, bounce: 0 }}>
            <div className="h-0 w-0 -translate-x-1/2 border-x-[7px] border-b-[9px] border-x-transparent border-b-[var(--text)]" />
          </motion.div>
        </div>
        <div className="relative mx-auto h-4 max-w-sm text-[10px] tabular-nums text-[var(--text-dim)]">
          {[0.4, 0.9, 1.0, 2.0].map((v) => (
            <span key={v} className="absolute top-0 -translate-x-1/2" style={{ left: `${((v - 0.4) / 1.6) * 100}%` }}>
              {v.toFixed(1).replace('.', ',')}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <NumberField label="Syke" unit="/min" value={hr} onChange={setHr} min={40} max={180} />
        <NumberField label="Systolinen verenpaine" unit="mmHg" value={sbp} onChange={setSbp} min={50} max={200} />
      </div>

      <div className="mt-4">
        {si >= 1 ? (
          <Result tone="danger" title="Sokki todennäköinen">
            Syke on suurempi kuin systolinen verenpaine. Hoida verenvuoto ja kuljeta kiireellisesti.
          </Result>
        ) : si >= 0.9 ? (
          <Result tone="warning" title="Piilevä sokki mahdollinen (≥ 0,9)">
            Verenpaine voi olla vielä kompensoitunut normaaliksi – seuraa tiiviisti.
          </Result>
        ) : (
          <Result tone="ok" title="Normaali (alle 0,9)">
            Arvioi uudelleen – yksittäinen arvo ei sulje pois etenevää vuotoa.
          </Result>
        )}
      </div>
      <div className="mt-3">
        <Caption>
          70 kg aikuisen verivolyymi on noin 5 litraa, ja aikuinen voi menettää noin 30 % siitä ennen kuin verenpaine alkaa laskea – verenpaineen lasku on myöhäinen
          sokin merkki.
        </Caption>
      </div>
    </div>
  )
}
