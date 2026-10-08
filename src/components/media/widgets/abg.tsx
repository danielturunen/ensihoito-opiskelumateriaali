import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption, Result, Segmented, svg, type Tone } from '../ui'

/* Systematic blood gas interpretation (Kettunen, Verikaasuanalyysi; ERC ALS).
 * Normal: pH 7.35–7.45, pCO2 4.7–6.0 kPa, BE −2…+2 mmol/l, paO2 10–13 kPa,
 * expected paO2 ≈ FiO2 % + 10 kPa when the lungs work normally. */

type Mode = 'calc' | 'cases'
type Dx = 'resp-acid' | 'met-acid' | 'resp-alk' | 'met-alk' | 'mixed-acid' | 'normal'

const fi = (v: number, d = 1) => v.toFixed(d).replace('.', ',')

interface Gas {
  ph: number
  co2: number
  be: number
}

function interpret({ ph, co2, be }: Gas): { dx: Dx; title: string; tone: Tone; text: string } {
  const acid = ph < 7.35
  const alk = ph > 7.45
  const hiCO2 = co2 > 6.0
  const loCO2 = co2 < 4.7
  const loBE = be < -2
  const hiBE = be > 2
  if (acid && hiCO2 && loBE)
    return { dx: 'mixed-acid', title: 'Sekamuotoinen asidoosi', tone: 'danger', text: 'Sekä hiilidioksidi kertyy (hengitys) että emäksiä puuttuu (metabolia) – esim. elvytys tai vaikea sokki ja hengitysvajaus.' }
  if (acid && hiCO2)
    return {
      dx: 'resp-acid',
      title: hiBE ? 'Respiratorinen asidoosi, metabolisesti osittain kompensoitu' : 'Respiratorinen asidoosi',
      tone: 'danger',
      text: hiBE
        ? 'Kohonnut BE kertoo munuaisten hitaasta kompensaatiosta – tila on kestänyt päiviä (esim. COPD:n paheneminen).'
        : 'Hengitysvajaus: hiilidioksidi kertyy. Hoitona hengityksen korjaaminen (NIV, intubaatio ja ventilaattori).',
    }
  if (acid && loBE)
    return {
      dx: 'met-acid',
      title: loCO2 ? 'Metabolinen asidoosi, respiratorisesti kompensoitu' : 'Metabolinen asidoosi',
      tone: 'danger',
      text: loCO2
        ? 'Potilas hyperventiloi ja puhaltaa hiilidioksidia pois pH:n nostamiseksi (esim. Kussmaulin hengitys DKA:ssa).'
        : 'Happoja kertyy tai emäksiä menetetään: DKA, laktaatti (sokki), munuaisten vajaatoiminta, ripuli, myrkytykset.',
    }
  if (alk && loCO2)
    return { dx: 'resp-alk', title: 'Respiratorinen alkaloosi', tone: 'warning', text: 'Liian tiheä hengitys: hyperventilaatio, kipu, kuume, keuhkoembolia, sepsis, raskaus. Hoitona perussyy ja hengityksen rauhoittaminen.' }
  if (alk && hiBE)
    return {
      dx: 'met-alk',
      title: hiCO2 ? 'Metabolinen alkaloosi, respiratorisesti kompensoitu' : 'Metabolinen alkaloosi',
      tone: 'warning',
      text: 'Vetyionien menetys tai liika bikarbonaatti: oksentelu, diureetit, bikarbonaatin anto – usein piilevä hypovolemia.',
    }
  if (!acid && !alk && hiCO2 && hiBE)
    return { dx: 'resp-acid', title: 'Kompensoitunut respiratorinen asidoosi (tai metabolinen alkaloosi)', tone: 'warning', text: 'pH on normaali, mutta sekä CO₂ että BE ovat koholla. Tyypillinen kroonisella hiilidioksidiretentiolla (COPD) – vertaa potilaan vointiin.' }
  if (!acid && !alk && loCO2 && loBE)
    return { dx: 'met-acid', title: 'Kompensoitunut metabolinen asidoosi (tai respiratorinen alkaloosi)', tone: 'warning', text: 'pH on normaali, mutta CO₂ ja BE ovat molemmat matalat – kompensaatio on käynnissä.' }
  if (acid || alk)
    return { dx: 'normal', title: acid ? 'Asidoosi' : 'Alkaloosi', tone: 'warning', text: 'pH on poikkeava, mutta CO₂ ja BE eivät selitä sitä – tarkista arvot.' }
  return { dx: 'normal', title: 'Normaali happo-emästasapaino', tone: 'ok', text: 'pH, pCO₂ ja BE ovat viitealueilla.' }
}

const CASES: { name: string; story: string; gas: Gas; dx: Dx }[] = [
  { name: 'Opioidiyliannostus', story: 'Tajunnaltaan laskenut, hengitys 6/min.', gas: { ph: 7.18, co2: 9.6, be: 0 }, dx: 'resp-acid' },
  { name: 'Diabeettinen ketoasidoosi', story: 'Nuori diabeetikko, syvä ja tiheä hengitys, asetonin haju.', gas: { ph: 7.08, co2: 2.6, be: -20 }, dx: 'met-acid' },
  { name: 'Hyperventilaatio', story: 'Ahdistunut potilas, sormien puutuminen, hengitys 30/min.', gas: { ph: 7.56, co2: 3.1, be: 0 }, dx: 'resp-alk' },
  { name: 'Toistuva oksentelu', story: 'Useita vuorokausia oksentanut, kuivuneen oloinen.', gas: { ph: 7.52, co2: 6.2, be: 9 }, dx: 'met-alk' },
  { name: 'Vuotosokki', story: 'Liikenneonnettomuus, takykardia, viileä iho, laktaatti koholla.', gas: { ph: 7.22, co2: 4.2, be: -10 }, dx: 'met-acid' },
]

const CHOICES: { value: Dx; label: string }[] = [
  { value: 'resp-acid', label: 'Respiratorinen asidoosi' },
  { value: 'met-acid', label: 'Metabolinen asidoosi' },
  { value: 'resp-alk', label: 'Respiratorinen alkaloosi' },
  { value: 'met-alk', label: 'Metabolinen alkaloosi' },
]

function Slider({ label, value, min, max, step, unit, d, onChange, lo, hi }: { label: string; value: number; min: number; max: number; step: number; unit?: string; d: number; onChange: (v: number) => void; lo: number; hi: number }) {
  const off = value < lo || value > hi
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[13px] font-medium text-[var(--text-dim)]">
        <span>
          {label} <span className="text-[11px]">({lo < 0 ? `${fi(lo, d).replace('-', '−')}…+${fi(hi, d)}` : `${fi(lo, d)}–${fi(hi, d)}`})</span>
        </span>
        <span className={`font-display text-[15px] font-semibold tabular-nums ${off ? 'text-danger-500' : 'text-[var(--text)]'}`}>
          {value > 0 && label.startsWith('BE') ? '+' : ''}
          {fi(value, d).replace('-', '−')}
          {unit && <span className="ml-0.5 text-[12px] font-medium text-[var(--text-dim)]">{unit}</span>}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 h-8 w-full cursor-pointer accent-brand-500" />
    </label>
  )
}

/* pH bar with two arrows: what the lungs (CO2) and the metabolism (BE) push towards. */
function PhBar({ gas }: { gas: Gas }) {
  const W = 340
  const x = (p: number) => 20 + ((Math.min(7.8, Math.max(6.9, p)) - 6.9) / 0.9) * 300
  const co2Push = Math.max(-1, Math.min(1, (gas.co2 - 5.3) / 4)) // + = acid
  const bePush = Math.max(-1, Math.min(1, -gas.be / 15)) // + = acid
  const mid = x(7.4)
  return (
    <svg viewBox={`0 0 ${W} 112`} className="h-auto w-full" role="img" aria-label={`pH ${fi(gas.ph, 2)}`}>
      <defs>
        <linearGradient id="abg-grad" x1="0" x2="1">
          <stop offset="0" stopColor={svg.danger} stopOpacity={0.55} />
          <stop offset="0.5" stopColor={svg.teal} stopOpacity={0.5} />
          <stop offset="1" stopColor="#6366f1" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <rect x={20} y={40} width={300} height={14} rx={7} fill="url(#abg-grad)" />
      <rect x={x(7.35)} y={36} width={x(7.45) - x(7.35)} height={22} rx={4} fill="none" stroke={svg.teal} strokeWidth={2} />
      <text x={20} y={74} fontSize={10} fill={svg.dim}>
        6,9 asidoosi
      </text>
      <text x={320} y={74} fontSize={10} fill={svg.dim} textAnchor="end">
        alkaloosi 7,8
      </text>
      <motion.g initial={false} animate={{ x: x(gas.ph) }} transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}>
        <path d="M0 34 l-7 -10 h14 z" fill={svg.ink} />
        <text y={18} textAnchor="middle" fontSize={12} fontWeight={700} fill={svg.ink}>
          pH {fi(gas.ph, 2)}
        </text>
      </motion.g>
      {/* pushes */}
      <g>
        <text x={mid} y={92} textAnchor="middle" fontSize={10} fill={svg.dim}>
          CO₂ (hengitys)
        </text>
        <motion.line y1={98} y2={98} x1={mid} stroke={svg.brand} strokeWidth={4} strokeLinecap="round" initial={false} animate={{ x2: mid - co2Push * 110 }} />
      </g>
      <g>
        <motion.line y1={106} y2={106} x1={mid} stroke="#a855f7" strokeWidth={4} strokeLinecap="round" initial={false} animate={{ x2: mid - bePush * 110 }} />
      </g>
    </svg>
  )
}

export default function Abg(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('calc')
  const [gas, setGas] = useState<Gas>({ ph: 7.4, co2: 5.3, be: 0 })
  const [ci, setCi] = useState(0)
  const [pick, setPick] = useState<Dx | null>(null)
  const res = interpret(gas)
  const c = CASES[ci]

  return (
    <div>
      <Segmented
        layoutId="abg-mode"
        value={mode}
        onChange={(m) => {
          setMode(m)
          setPick(null)
        }}
        options={[
          { value: 'calc', label: 'Tulkitse arvot' },
          { value: 'cases', label: 'Harjoittele' },
        ]}
      />

      {mode === 'calc' ? (
        <div className="mt-3 space-y-3">
          <PhBar gas={gas} />
          <div className="flex gap-4 text-[11px] text-[var(--text-dim)]">
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-4 rounded bg-brand-500" /> pCO₂:n vaikutus
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-4 rounded bg-purple-500" /> BE:n vaikutus
            </span>
          </div>
          <Slider label="pH" value={gas.ph} min={6.9} max={7.7} step={0.01} d={2} lo={7.35} hi={7.45} onChange={(v) => setGas({ ...gas, ph: v })} />
          <Slider label="pCO₂" unit="kPa" value={gas.co2} min={2} max={12} step={0.1} d={1} lo={4.7} hi={6.0} onChange={(v) => setGas({ ...gas, co2: v })} />
          <Slider label="BE" unit="mmol/l" value={gas.be} min={-25} max={15} step={1} d={0} lo={-2} hi={2} onChange={(v) => setGas({ ...gas, be: v })} />
          <Result tone={res.tone} title={res.title}>
            {res.text}
          </Result>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
            <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--text-dim)]">
              Tapaus {ci + 1} / {CASES.length}
            </p>
            <p className="mt-1 text-[14px] text-[var(--text)]">{c.story}</p>
            <p className="mt-2 font-display text-[15px] font-semibold tabular-nums text-[var(--text)]">
              pH {fi(c.gas.ph, 2)} · pCO₂ {fi(c.gas.co2)} kPa · BE {c.gas.be > 0 ? '+' : ''}
              {c.gas.be}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CHOICES.map((o) => {
              const chosen = pick === o.value
              const right = pick && o.value === c.dx
              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={!!pick}
                  onClick={() => setPick(o.value)}
                  className={`min-h-11 rounded-xl border px-2 py-2 text-[13px] font-medium transition-colors ${
                    right ? 'border-teal-500 bg-teal-500/15 text-[var(--text)]' : chosen ? 'border-danger-500 bg-danger-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text)]'
                  }`}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
          {pick && (
            <Result tone={pick === c.dx ? 'ok' : 'danger'} title={`${pick === c.dx ? 'Oikein' : 'Ei aivan'} – ${interpret(c.gas).title}`}>
              {c.name}: {interpret(c.gas).text}
            </Result>
          )}
          <button
            type="button"
            onClick={() => {
              setCi((i) => (i + 1) % CASES.length)
              setPick(null)
            }}
            className="min-h-11 w-full rounded-xl bg-brand-600 text-[14px] font-semibold text-white active:scale-[0.98]"
          >
            Seuraava tapaus →
          </button>
        </div>
      )}
      <div className="mt-3">
        <Caption>Järjestys: 1) Miten potilas voi? 2) Hypoksemia (paO₂ alle 10 kPa)? 3) Asidoosi vai alkaloosi? 4) pCO₂? 5) BE / bikarbonaatti? 6) Kompensaatio? Ohjeelliset viitearvot: Kettunen, Verikaasuanalyysi.</Caption>
      </div>
    </div>
  )
}
