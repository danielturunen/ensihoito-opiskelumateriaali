import { useState, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg } from '../ui'

/* Emergency cricothyrotomy landmarks and steps (Ensihoito-opas: Hätäkrikotyreotomia aikuisella;
 * European Trauma Course). Schematic side view of the larynx, anterior to the left. */

type Part = 'hyoid' | 'thyroid' | 'membrane' | 'cricoid' | 'trachea'

const PARTS: Record<Part, { label: string; note: string }> = {
  hyoid: { label: 'Kieliluu', note: 'Kieliluu on kurkunpään yläpuolella – liian ylhäällä.' },
  thyroid: { label: 'Kilpirusto', note: 'Kilpirusto (aataminomena) palpoidaan ensin. Toimenpidepaikka on sen alapuolella.' },
  membrane: { label: 'Kilpi- ja sormusruston välinen ligamentti', note: 'Oikein: krikotyreoideakalvo kilpiruston ja sormusruston välissä. Sormusrusto palpoituu yleensä selvästi, ja kalvo on välittömästi sen yläpuolella.' },
  cricoid: { label: 'Sormusrusto', note: 'Sormusrusto on maamerkki – avaus tehdään välittömästi sen yläpuolelle, ei ruston läpi.' },
  trachea: { label: 'Henkitorven rustorenkaat', note: 'Henkitorvi on liian alhaalla hätäkrikotyreotomiaan.' },
}

const STEPS = [
  'Asento: ei niskavammaa → koroke hartioiden alle ja pää ojennukseen. Mahdollinen niskavamma → ei ojennusta.',
  'Palpoi kilpirusto ja siitä alaspäin sormusrusto. Ota napakka ote kurkunpäästä ja pingota iho sormilla.',
  'Pitkittäinen viilto ihon ja ihonalaiskudoksen läpi keskilinjaan, noin 5 cm aataminomenan päältä sormusruston yli.',
  'Palpoi krikotyreoideakalvo ja tee kalvon läpi poikittainen, noin 1 cm:n viilto.',
  'Tunnustele sormella, että olet henkitorvessa, ja avarra samalla aukkoa – tarvittaessa instrumentilla.',
  'Vie intubaatioputki (koko 6) ohjainta käyttäen aukosta sisään niin, että kalvosin häviää sisälle.',
  'Varmista sijainti onnistuneella ventilaatiolla ja EtCO₂-mittauksella. Vuotoa painetaan taitoksilla.',
]

function Larynx({ selected, onPick, step }: { selected: Part | null; onPick?: (p: Part) => void; step?: number }) {
  const reduce = useReducedMotion()
  const hit = (p: Part) =>
    onPick
      ? {
          role: 'button' as const,
          tabIndex: 0,
          'aria-label': PARTS[p].label,
          onClick: () => onPick(p),
          onKeyDown: (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && onPick(p),
          style: { cursor: 'pointer' },
        }
      : {}
  const fill = (p: Part, base: string) => (selected === p ? (p === 'membrane' ? svg.tealSoft : svg.brandSoft) : base)
  const stroke = (p: Part) => (selected === p ? (p === 'membrane' ? svg.teal : svg.brand) : svg.dim)
  return (
    <svg viewBox="0 0 220 270" className="mx-auto h-auto w-full max-w-[300px]" role="img" aria-label="Kurkunpää sivulta: kieliluu, kilpirusto, krikotyreoideakalvo, sormusrusto ja henkitorvi">
      {/* skin line, anterior to the left */}
      <path d="M30 10 C34 60 26 90 30 130 C34 170 30 220 34 262" fill="none" stroke={svg.line} strokeWidth={2} strokeDasharray="5 5" aria-hidden />
      <text x={14} y={20} fontSize={11} fill={svg.dim} aria-hidden>
        iho
      </text>
      <g {...hit('hyoid')}>
        <rect x={60} y={22} width={110} height={14} rx={7} fill={fill('hyoid', svg.raised)} stroke={stroke('hyoid')} strokeWidth={2} />
      </g>
      <g {...hit('thyroid')}>
        <path d="M48 58 L60 52 L170 56 L176 118 L66 122 Q56 96 48 58 Z" fill={fill('thyroid', svg.raised)} stroke={stroke('thyroid')} strokeWidth={2} strokeLinejoin="round" />
      </g>
      <g {...hit('membrane')}>
        <path d="M66 124 L120 122 L120 140 L70 142 Z" fill={fill('membrane', 'transparent')} stroke={stroke('membrane')} strokeWidth={1.5} strokeDasharray="3 3" />
        <rect x={56} y={118} width={70} height={28} fill="transparent" />
      </g>
      <g {...hit('cricoid')}>
        <path d="M70 144 L122 142 L170 118 L176 168 L72 162 Z" fill={fill('cricoid', svg.raised)} stroke={stroke('cricoid')} strokeWidth={2} strokeLinejoin="round" />
      </g>
      <g {...hit('trachea')}>
        {[0, 1, 2, 3, 4].map((n) => (
          <rect key={n} x={74} y={172 + n * 18} width={100} height={11} rx={5} fill={fill('trachea', svg.raised)} stroke={stroke('trachea')} strokeWidth={2} />
        ))}
      </g>
      {step !== undefined && step >= 2 && (
        <motion.line
          x1={40}
          x2={40}
          y1={60}
          y2={160}
          stroke={svg.danger}
          strokeWidth={3}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {step !== undefined && step >= 3 && (
        <motion.line
          x1={66}
          x2={100}
          y1={132}
          y2={132}
          stroke={svg.danger}
          strokeWidth={3}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}
      {step !== undefined && step >= 5 && (
        <motion.path
          d="M10 128 L92 132 L150 150"
          fill="none"
          stroke={svg.teal}
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.8}
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </svg>
  )
}

function Find() {
  const [pick, setPick] = useState<Part | null>(null)
  return (
    <div>
      <p className="mb-2 text-[13px] text-[var(--text)]">Napauta kohtaa, johon hätäkrikotyreotomian avaus tehdään.</p>
      <Larynx selected={pick} onPick={setPick} />
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {(Object.keys(PARTS) as Part[]).map((p) => (
          <button
            key={p}
            onClick={() => setPick(p)}
            aria-pressed={pick === p}
            className={`min-h-[44px] rounded-xl border px-2.5 text-left text-[12px] font-semibold leading-snug transition-[background-color,border-color] duration-150 ${
              pick === p ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
            }`}
          >
            {PARTS[p].label}
          </button>
        ))}
      </div>
      {pick && (
        <div className="mt-3">
          <Result tone={pick === 'membrane' ? 'ok' : 'warning'} title={pick === 'membrane' ? 'Oikea kohta' : PARTS[pick].label}>
            {PARTS[pick].note}
          </Result>
        </div>
      )}
    </div>
  )
}

function Steps() {
  const [i, setI] = useState(0)
  return (
    <div>
      <Larynx selected={i >= 1 && i <= 3 ? 'membrane' : null} step={i} />
      <div className="mt-2 rounded-xl bg-[var(--bg)] px-3.5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
          Vaihe {i + 1} / {STEPS.length}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{STEPS[i]}</p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} className="min-h-[44px] rounded-xl border border-[var(--border)] text-[13px] font-semibold text-[var(--text)] disabled:opacity-40">
          Edellinen
        </button>
        <button onClick={() => setI((v) => Math.min(STEPS.length - 1, v + 1))} disabled={i === STEPS.length - 1} className="min-h-[44px] rounded-xl bg-brand-500 text-[13px] font-semibold text-white disabled:opacity-40">
          Seuraava
        </button>
      </div>
    </div>
  )
}

export default function CricLandmark() {
  const [tab, setTab] = useState<'find' | 'steps'>('find')
  return (
    <div>
      <Segmented
        layoutId="cric"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'find', label: 'Löydä kohta' },
          { value: 'steps', label: 'Vaiheet' },
        ]}
      />
      <div className="mt-3">{tab === 'find' ? <Find /> : <Steps />}</div>
    </div>
  )
}
