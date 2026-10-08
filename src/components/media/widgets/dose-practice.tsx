import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Check, RefreshCw, X } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Caption, NumberField, Segmented } from '../ui'

interface Drug {
  id: string
  name: string
  perKg: number
  perKgMax?: number
  unit: string
  min?: number
  max?: number
  note?: string
}

// Values from the articles: Lapsi ensihoidossa, Atropiini, Ondansetroni, Palovamma, Intoksikaatio.
const DRUGS: Drug[] = [
  { id: 'morfiini', name: 'Morfiini i.v.', perKg: 0.1, unit: 'mg' },
  { id: 'fentanyyli', name: 'Fentanyyli i.v.', perKg: 1, unit: 'µg' },
  { id: 'alfentaniili', name: 'Alfentaniili i.v.', perKg: 10, unit: 'µg' },
  { id: 'ketamiini', name: 'S-ketamiini i.v.', perKg: 0.125, perKgMax: 0.25, unit: 'mg' },
  { id: 'atropiini', name: 'Atropiini i.v.', perKg: 0.02, unit: 'mg', min: 0.1, max: 0.5, note: 'vähintään 0,1 mg, enintään 0,5 mg kerta-annoksena' },
  { id: 'ondansetroni', name: 'Ondansetroni i.v. (yli 6 kk)', perKg: 0.1, unit: 'mg', max: 4, note: 'enintään 4 mg' },
  { id: 'bolus', name: 'Nestebolus sokissa', perKg: 10, unit: 'ml', note: 'isotoninen neste, toistetaan vastetta tarkkaillen' },
  { id: 'palo', name: 'Palovamman nestehoito', perKg: 20, unit: 'ml/h', note: 'vaikea palovamma (ei kuuman veden aiheuttama)' },
  { id: 'hiili', name: 'Lääkehiili', perKg: 1, unit: 'g', note: 'tehoaa parhaiten tunnin sisällä' },
]

const fmt = (n: number) => {
  const r = Math.round(n * 1000) / 1000
  return String(r).replace('.', ',')
}

function dose(d: Drug, kg: number) {
  const raw = d.perKg * kg
  const rawMax = d.perKgMax ? d.perKgMax * kg : undefined
  let val = raw
  let clamped: 'min' | 'max' | null = null
  if (d.min !== undefined && raw < d.min) {
    val = d.min
    clamped = 'min'
  }
  if (d.max !== undefined && raw > d.max) {
    val = d.max
    clamped = 'max'
  }
  return { raw, rawMax, val, clamped }
}

function Calculator() {
  const [kg, setKg] = useState(20)
  return (
    <div>
      <NumberField label="Lapsen paino" unit="kg" value={kg} onChange={setKg} min={3} max={60} />
      <div className="mt-4 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
        {DRUGS.map((d) => {
          const r = dose(d, kg)
          return (
            <div key={d.id} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text)]">{d.name}</p>
                <p className="text-[11px] leading-snug text-[var(--text-dim)]">
                  {fmt(d.perKg)}
                  {d.perKgMax ? `–${fmt(d.perKgMax)}` : ''} {d.unit}/kg{d.note ? ` · ${d.note}` : ''}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-[16px] font-bold tabular-nums text-[var(--text)]">
                  {r.rawMax ? `${fmt(r.raw)}–${fmt(r.rawMax)}` : fmt(r.val)}
                  <span className="ml-0.5 text-[11px] font-medium text-[var(--text-dim)]">{d.unit}</span>
                </p>
                {r.clamped && <p className="text-[10px] font-semibold text-brand-600">{r.clamped === 'max' ? 'enimmäisannos' : 'vähimmäisannos'}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function randomCase() {
  const d = DRUGS[Math.floor(Math.random() * DRUGS.length)]
  const kg = 4 + Math.floor(Math.random() * 37)
  return { d, kg }
}

function Practice() {
  const [c, setC] = useState(randomCase)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const reduce = useReducedMotion()
  const r = useMemo(() => dose(c.d, c.kg), [c])

  function check() {
    const v = Number(answer.replace(',', '.'))
    if (!answer || Number.isNaN(v)) return
    const target = r.val
    const ok = r.rawMax ? v >= r.raw * 0.98 && v <= r.rawMax * 1.02 : Math.abs(v - target) <= Math.max(0.01, target * 0.02)
    setResult(ok ? 'right' : 'wrong')
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }))
  }

  function next() {
    setC(randomCase())
    setAnswer('')
    setResult(null)
  }

  const working = r.rawMax
    ? `${fmt(c.d.perKg)}–${fmt(c.d.perKgMax!)} ${c.d.unit}/kg × ${c.kg} kg = ${fmt(r.raw)}–${fmt(r.rawMax)} ${c.d.unit}`
    : `${fmt(c.d.perKg)} ${c.d.unit}/kg × ${c.kg} kg = ${fmt(r.raw)} ${c.d.unit}${r.clamped ? ` → ${r.clamped === 'max' ? 'enimmäisannos' : 'vähimmäisannos'} ${fmt(r.val)} ${c.d.unit}` : ''}`

  return (
    <div>
      <motion.div
        key={`${c.d.id}-${c.kg}`}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-[var(--bg)] p-4"
      >
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Tehtävä</p>
        <p className="mt-1 font-display text-[17px] font-semibold leading-snug text-[var(--text)]">
          Lapsi painaa {c.kg} kg. Laske: {c.d.name}
        </p>
        <p className="mt-1 text-[12px] text-[var(--text-dim)]">
          Annos {fmt(c.d.perKg)}
          {c.d.perKgMax ? `–${fmt(c.d.perKgMax)}` : ''} {c.d.unit}/kg{c.d.note ? ` (${c.d.note})` : ''}
        </p>
      </motion.div>

      <div className="mt-3 flex gap-2">
        <label className="flex min-h-[48px] flex-1 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] px-3 focus-within:border-brand-500">
          <input
            inputMode="decimal"
            enterKeyHint="done"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value)
              setResult(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && check()}
            placeholder="Vastaus"
            className="w-full bg-transparent text-[16px] outline-none placeholder:text-[var(--text-dim)]"
            aria-label="Vastauksesi"
          />
          <span className="shrink-0 text-[13px] text-[var(--text-dim)]">{c.d.unit}</span>
        </label>
        <button
          onClick={check}
          className="min-h-[48px] shrink-0 rounded-xl bg-brand-500 px-4 text-[14px] font-semibold text-white shadow-sm shadow-brand-500/30 active:scale-[0.97]"
        >
          Tarkista
        </button>
      </div>

      {result && (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-3 rounded-xl border px-4 py-3 ${result === 'right' ? 'border-teal-500/30 bg-teal-500/10' : 'border-danger-500/30 bg-danger-500/10'}`}
        >
          <p className={`flex items-center gap-1.5 font-display text-[15px] font-semibold ${result === 'right' ? 'text-teal-600' : 'text-danger-500'}`}>
            {result === 'right' ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
            {result === 'right' ? 'Oikein!' : 'Ei aivan'}
          </p>
          <p className="mt-1 text-[13px] tabular-nums text-[var(--text-dim)]">{working}</p>
        </motion.div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[12px] tabular-nums text-[var(--text-dim)]">
          {score.right}/{score.total} oikein
        </span>
        <button onClick={next} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--bg-card)] px-4 text-[13px] font-semibold text-[var(--text)] active:scale-[0.97]">
          <RefreshCw className="h-4 w-4" /> Uusi tehtävä
        </button>
      </div>
    </div>
  )
}

export default function DosePractice(_props: WidgetProps) {
  const [mode, setMode] = useState<'practice' | 'calc'>('practice')
  return (
    <div>
      <Segmented
        layoutId="dose-mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'practice', label: 'Harjoittele' },
          { value: 'calc', label: 'Laskuri' },
        ]}
      />
      <div className="mt-4">{mode === 'practice' ? <Practice /> : <Calculator />}</div>
      <div className="mt-4">
        <Caption>
          Harjoitustyökalu laskurutiinin kehittämiseen – annokset artikkeleiden mukaan. Tarkista aina voimassa oleva hoito-ohje ja tee kaksoistarkistus ennen
          lääkkeen antoa.
        </Caption>
      </div>
    </div>
  )
}
