import { useState } from 'react'
import type { WidgetProps } from '../registry'
import { Caption, NumberField, Result, Segmented, Stat } from '../ui'

// Official NEWS2 bands (Royal College of Physicians 2017, SpO2 scale 1).
const scoreRR = (v: number) => (v <= 8 ? 3 : v <= 11 ? 1 : v <= 20 ? 0 : v <= 24 ? 2 : 3)
const scoreSpO2 = (v: number) => (v <= 91 ? 3 : v <= 93 ? 2 : v <= 95 ? 1 : 0)
const scoreSBP = (v: number) => (v <= 90 ? 3 : v <= 100 ? 2 : v <= 110 ? 1 : v <= 219 ? 0 : 3)
const scoreHR = (v: number) => (v <= 40 ? 3 : v <= 50 ? 1 : v <= 90 ? 0 : v <= 110 ? 1 : v <= 130 ? 2 : 3)
const scoreTemp = (v: number) => (v <= 35 ? 3 : v <= 36 ? 1 : v <= 38 ? 0 : v <= 39 ? 1 : 2)

function Pill({ p }: { p: number }) {
  const cls = p === 0 ? 'bg-[var(--bg-card)] text-[var(--text-dim)]' : p === 1 ? 'bg-brand-500/15 text-brand-600' : p === 2 ? 'bg-brand-500/30 text-brand-700' : 'bg-danger-500 text-white'
  return <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 font-display text-[12px] font-bold tabular-nums ${cls}`}>{p}</span>
}

export default function News2(_props: WidgetProps) {
  const [rr, setRr] = useState(18)
  const [spo2, setSpo2] = useState(96)
  const [o2, setO2] = useState<'air' | 'o2'>('air')
  const [sbp, setSbp] = useState(125)
  const [hr, setHr] = useState(80)
  const [acvpu, setAcvpu] = useState<'A' | 'CVPU'>('A')
  const [temp, setTemp] = useState(37)

  const parts = [
    { label: 'Hengitystaajuus', p: scoreRR(rr) },
    { label: 'SpO₂', p: scoreSpO2(spo2) },
    { label: 'Lisähappi', p: o2 === 'o2' ? 2 : 0 },
    { label: 'Systolinen RR', p: scoreSBP(sbp) },
    { label: 'Syke', p: scoreHR(hr) },
    { label: 'Tajunta', p: acvpu === 'CVPU' ? 3 : 0 },
    { label: 'Lämpö', p: scoreTemp(temp) },
  ]
  const total = parts.reduce((a, b) => a + b.p, 0)
  const anyThree = parts.some((x) => x.p === 3)
  const level = total >= 7 ? 'high' : total >= 5 ? 'medium' : anyThree ? 'single' : 'low'

  return (
    <div>
      <div className="grid grid-cols-[96px_1fr] items-center gap-4">
        <Stat label="NEWS2" value={total} tone={level === 'high' ? 'danger' : level === 'low' ? 'ok' : 'warning'} />
        <div className="flex flex-wrap gap-1.5">
          {parts.map((x) => (
            <span key={x.label} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--bg)] py-1 pr-1 pl-2 text-[11px] text-[var(--text-dim)]">
              {x.label} <Pill p={x.p} />
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <NumberField label="Hengitystaajuus" unit="/min" value={rr} onChange={setRr} min={4} max={40} />
        <NumberField label="Happisaturaatio" unit="%" value={spo2} onChange={setSpo2} min={80} max={100} />
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-[var(--text-dim)]">Lisähappi</p>
          <Segmented
            layoutId="news2-o2"
            value={o2}
            onChange={setO2}
            options={[
              { value: 'air', label: 'Huoneilma' },
              { value: 'o2', label: 'Lisähappi' },
            ]}
          />
        </div>
        <NumberField label="Systolinen verenpaine" unit="mmHg" value={sbp} onChange={setSbp} min={60} max={240} />
        <NumberField label="Syke" unit="/min" value={hr} onChange={setHr} min={30} max={180} />
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-[var(--text-dim)]">Tajunta (ACVPU)</p>
          <Segmented
            layoutId="news2-acvpu"
            value={acvpu}
            onChange={setAcvpu}
            options={[
              { value: 'A', label: 'Hereillä (A)' },
              { value: 'CVPU', label: 'Uusi sekavuus / V / P / U' },
            ]}
            size="sm"
          />
        </div>
        <NumberField label="Lämpötila" unit="°C" value={temp} onChange={(v) => setTemp(Math.round(v * 10) / 10)} min={33} max={41} step={0.1} />
      </div>

      <div className="mt-4">
        {level === 'high' ? (
          <Result tone="danger" title="Korkea pistemäärä (7 tai yli)">
            Edellyttää välitöntä arviota ja usein kiireellistä kuljetusta.
          </Result>
        ) : level === 'medium' ? (
          <Result tone="warning" title="Keskitaso (5–6)">
            Tihennetty seuranta ja lääkärin konsultaatio.
          </Result>
        ) : level === 'single' ? (
          <Result tone="warning" title="Yksittäinen parametri 3 pistettä">
            Yksikin äärilukema riittää nostamaan tilanteen kiireelliseksi, vaikka kokonaispisteet näyttäisivät maltillisilta.
          </Result>
        ) : (
          <Result tone="ok" title="Matala pistemäärä">
            Normaali seurantaväli – arvioi uudelleen tilan muuttuessa.
          </Result>
        )}
      </div>
      <div className="mt-3">
        <Caption>Pisterajat NEWS2:n (Royal College of Physicians, 2017) mukaan. Tarkat toimintarajat vaihtelevat käytössä olevan hoito-ohjeen mukaan.</Caption>
      </div>
    </div>
  )
}
