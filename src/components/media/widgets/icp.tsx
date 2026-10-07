import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption, NumberField, Result, svg } from '../ui'

export default function Icp(_props: WidgetProps) {
  const [sbp, setSbp] = useState(120)
  const [dbp, setDbp] = useState(75)
  const [icp, setIcp] = useState(10)
  const reduce = useReducedMotion()

  const map = Math.round(dbp + (sbp - dbp) / 3)
  const cpp = map - icp
  const ok = cpp >= 60
  const borderline = cpp >= 50 && cpp < 60
  // Illustrative only: the "mass" inside the skull grows with ICP.
  const mass = Math.min(1, icp / 40)

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
        <svg viewBox="0 0 180 170" className="mx-auto h-auto w-full max-w-[200px]" role="img" aria-label="Kallo, jonka sisällä aivokudos, veri ja aivo-selkäydinneste">
          <ellipse cx="90" cy="85" rx="78" ry="72" fill={svg.surface} stroke={svg.ink} strokeWidth="3" />
          <motion.ellipse
            cx="90"
            cy="88"
            fill="rgba(125,211,252,0.35)"
            animate={{ rx: 66 - mass * 10, ry: 60 - mass * 9 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0.1 }}
          />
          <motion.path
            d="M40 90c0-28 22-50 50-50s50 22 50 50-22 45-50 45-50-17-50-45z"
            fill="rgba(248,105,10,0.16)"
            stroke={svg.brand}
            strokeWidth="2"
            animate={{ scale: 1 - mass * 0.12, x: mass * 8 }}
            style={{ transformOrigin: '90px 90px' }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0.1 }}
          />
          <motion.circle
            cx="48"
            cy="70"
            fill={svg.blood}
            animate={{ r: 4 + mass * 22, opacity: mass > 0.15 ? 0.85 : 0 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0.1 }}
          />
        </svg>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-[var(--bg)] px-2 py-2">
            <p className="text-[10px] font-semibold uppercase text-[var(--text-dim)]">MAP</p>
            <p className="font-display text-xl font-bold tabular-nums">{map}</p>
          </div>
          <div className="rounded-xl bg-[var(--bg)] px-2 py-2">
            <p className="text-[10px] font-semibold uppercase text-[var(--text-dim)]">ICP</p>
            <p className="font-display text-xl font-bold tabular-nums">{icp}</p>
          </div>
          <div className={`rounded-xl px-2 py-2 ${ok ? 'bg-teal-500/15' : borderline ? 'bg-brand-500/15' : 'bg-danger-500/15'}`}>
            <p className="text-[10px] font-semibold uppercase text-[var(--text-dim)]">CPP</p>
            <p className={`font-display text-xl font-bold tabular-nums ${ok ? 'text-teal-600' : borderline ? 'text-brand-600' : 'text-danger-500'}`}>{cpp}</p>
          </div>
          <p className="col-span-3 rounded-xl bg-[var(--bg)] px-3 py-2 text-left text-[12px] leading-relaxed text-[var(--text-dim)]">
            MAP = DAP + (SAP − DAP) / 3 = {dbp} + ({sbp} − {dbp}) / 3 ≈ <b className="text-[var(--text)]">{map}</b>
            <br />
            CPP = MAP − ICP = {map} − {icp} = <b className="text-[var(--text)]">{cpp} mmHg</b>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <NumberField label="Systolinen verenpaine (SAP)" unit="mmHg" value={sbp} onChange={(v) => setSbp(Math.max(v, dbp + 10))} min={60} max={220} />
        <NumberField label="Diastolinen verenpaine (DAP)" unit="mmHg" value={dbp} onChange={(v) => setDbp(Math.min(v, sbp - 10))} min={30} max={130} />
        <NumberField label="Kallonsisäinen paine (ICP)" unit="mmHg" value={icp} onChange={setIcp} min={0} max={40} />
      </div>

      <div className="mt-4">
        {ok ? (
          <Result tone="ok" title="Aivoperfuusio riittävä">
            CPP:n tulisi pysyä vähintään noin 50–60 mmHg:ssä aivojen riittävän happeutumisen turvaamiseksi.
          </Result>
        ) : (
          <Result tone={borderline ? 'warning' : 'danger'} title={borderline ? 'CPP rajoilla' : 'Aivoperfuusio vaarassa'}>
            Matala verenpaine tai kohoava ICP laskee aivojen perfuusiopainetta. Aivovammapotilaalla tavoitteena SAP yli 120 mmHg; vältä hypoksiaa, hyperkapniaa ja
            hyperventilaatiota.
          </Result>
        )}
      </div>
      <div className="mt-3">
        <Caption>
          Kallon tilavuus on vakio (aivokudos, veri, aivo-selkäydinneste): hematooma tai turvotus nostaa kallonsisäistä painetta. Kuva on havainnollistava.
        </Caption>
      </div>
    </div>
  )
}
