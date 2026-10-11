import { useState } from 'react'
import { Minus, Plus, RefreshCw } from 'lucide-react'
import { Result, Segmented, svg } from '../ui'

/* External pacing trainer (Ensihoito-opas: Ulkoinen tahdistus). Current starts at the minimum
 * and is raised until each pacing spike is followed by a wide QRS (capture). The threshold is
 * usually 40–120 mA; the final current is set 10–20 mA above it. */

const STEP = 5

function randomThreshold() {
  return 40 + STEP * Math.floor(Math.random() * ((120 - 40) / STEP + 1))
}

function Strip({ capture, on }: { capture: boolean; on: boolean }) {
  const spikes = [30, 95, 160, 225, 290]
  let d = 'M0 40'
  if (capture) {
    for (const x of spikes) d += ` L${x} 40 L${x + 3} 40 L${x + 7} 12 L${x + 13} 54 L${x + 18} 40 L${x + 24} 40 C${x + 30} 26 ${x + 40} 26 ${x + 46} 40`
  } else {
    // slow escape rhythm unrelated to the spikes
    for (const x of [70, 230]) d += ` L${x} 40 L${x + 4} 22 L${x + 10} 50 L${x + 15} 40 L${x + 22} 40 C${x + 28} 30 ${x + 36} 30 ${x + 42} 40`
  }
  d += ' L320 40'
  return (
    <svg viewBox="0 0 320 64" className="h-auto w-full" role="img" aria-label={capture ? 'Jokaista tahdistinpiikkiä seuraa leveä QRS-kompleksi' : 'Tahdistinpiikkejä ilman QRS-kompleksia, hidas oma rytmi'}>
      <rect width={320} height={64} rx={6} fill="#0b1a14" />
      <path d={d} fill="none" stroke="#34d399" strokeWidth={2} strokeLinejoin="round" />
      {on &&
        spikes.map((x) => (
          <line key={x} x1={x + 2} x2={x + 2} y1={8} y2={44} stroke="#fbbf24" strokeWidth={1.6} strokeLinecap="round" />
        ))}
    </svg>
  )
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, value - STEP))}
        aria-label={`${label}: laske`}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--text)] active:scale-[0.95]"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="range"
        min={0}
        max={200}
        step={STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-11 w-full accent-[#f8690a]"
      />
      <button
        onClick={() => onChange(Math.min(200, value + STEP))}
        aria-label={`${label}: nosta`}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--text)] active:scale-[0.95]"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

function Capture() {
  const [threshold, setThreshold] = useState(randomThreshold)
  const [ma, setMa] = useState(0)
  const [phase, setPhase] = useState<'find' | 'set' | 'done'>('find')
  const [marked, setMarked] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'warning'; title: string; text: string } | null>(null)

  const capture = ma >= threshold && ma > 0

  function reset() {
    setThreshold(randomThreshold())
    setMa(0)
    setPhase('find')
    setMarked(null)
    setMsg(null)
  }

  function mark() {
    if (!capture) {
      setMsg({ tone: 'warning', title: 'Ei vielä kaappausta', text: 'Piikin perässä ei tule QRS-kompleksia – nosta virtaa.' })
      return
    }
    if (ma - STEP >= threshold) {
      setMsg({ tone: 'warning', title: 'Kaappaus näkyy, mutta kynnys on alempana', text: 'Laske virtaa, kunnes löydät pienimmän virran, jolla jokaista piikkiä seuraa QRS.' })
      return
    }
    setMarked(ma)
    setPhase('set')
    setMsg({ tone: 'ok', title: `Kynnys ${ma} mA – kirjaa se muistiin`, text: 'Aseta nyt lopullinen virta 10–20 mA kynnyksen yläpuolelle.' })
  }

  function confirm() {
    if (marked === null) return
    const over = ma - marked
    if (over >= 10 && over <= 20) {
      setPhase('done')
      setMsg({ tone: 'ok', title: `Virta ${ma} mA (kynnys + ${over} mA)`, text: 'Palpoi rannesyke: vastaako se asetettua taajuutta? Mittaa verenpaine. Varaudu kynnyksen nousuun ja akkujen loppumiseen siirron aikana.' })
    } else {
      setMsg({ tone: 'warning', title: over < 10 ? 'Liian lähellä kynnystä' : 'Enemmän kuin ohje neuvoo', text: `Nyt ${over >= 0 ? '+' : ''}${over} mA. Ensihoito-oppaan mukaan virtaa nostetaan 10–20 mA kynnyksen yli.` })
    }
  }

  return (
    <div>
      <ol className="mb-3 grid grid-cols-2 gap-1.5 text-[11px] leading-snug text-[var(--text-dim)]">
        {['Aktivoi tahdistin', 'Säädä haluttu taajuus', 'Valitse demand-tila', 'Virta minimiin ja aloita'].map((t, n) => (
          <li key={t} className="rounded-lg bg-[var(--bg)] px-2.5 py-1.5">
            <span className="font-semibold text-[var(--text)]">{n + 1}.</span> {t}
          </li>
        ))}
      </ol>
      <Strip capture={capture} on={ma > 0} />
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-[12px] font-semibold" style={{ color: capture ? svg.teal : svg.brand }}>
          {ma === 0 ? 'Tahdistus ei vielä käynnissä' : capture ? 'Sähköinen kaappaus' : 'Piikit ilman kaappausta'}
        </span>
        <span className="font-display text-[20px] font-bold tabular-nums text-[var(--text)]">
          {ma}
          <span className="ml-0.5 text-[12px] font-medium text-[var(--text-dim)]">mA</span>
        </span>
      </div>
      <div className="mt-2">
        <Stepper
          value={ma}
          label="Tahdistusvirta"
          onChange={(v) => {
            if (phase === 'done') return
            setMa(v)
            setMsg(null)
          }}
        />
      </div>
      {phase === 'find' && (
        <button onClick={mark} className="mt-3 min-h-[44px] w-full rounded-xl bg-brand-500 text-[13px] font-semibold text-white active:scale-[0.98]">
          Merkitse kynnys
        </button>
      )}
      {phase === 'set' && (
        <button onClick={confirm} className="mt-3 min-h-[44px] w-full rounded-xl bg-brand-500 text-[13px] font-semibold text-white active:scale-[0.98]">
          Vahvista lopullinen virta
        </button>
      )}
      {msg && (
        <div className="mt-3">
          <Result tone={msg.tone} title={msg.title}>
            {msg.text}
          </Result>
        </div>
      )}
      <button onClick={reset} className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--bg-card)] px-4 text-[13px] font-semibold text-[var(--text)] active:scale-[0.97]">
        <RefreshCw className="h-4 w-4" /> Uusi potilas
      </button>
    </div>
  )
}

function Torso({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 140 170" className="h-auto w-full" role="img" aria-label={back ? 'Selkäpuoli: posteriorinen elektrodi vasemmalla lapaluun alla' : 'Etupuoli: anteriorinen elektrodi vasemman rintalihaksen päällä'}>
      <path d="M50 18 Q70 6 90 18 L92 34 Q118 40 126 60 L122 160 L18 160 L14 60 Q22 40 48 34 Z" fill={svg.raised} stroke={svg.line} strokeWidth={2} strokeLinejoin="round" />
      {back ? (
        <>
          <line x1={70} y1={36} x2={70} y2={156} stroke={svg.line} strokeWidth={2} strokeDasharray="4 5" aria-hidden />
          <path d="M34 54 Q46 50 56 58 L52 92 Q40 96 32 88 Z" fill="none" stroke={svg.dim} strokeWidth={1.5} aria-hidden />
          <path d="M106 54 Q94 50 84 58 L88 92 Q100 96 108 88 Z" fill="none" stroke={svg.dim} strokeWidth={1.5} aria-hidden />
          {/* posterior pad: patient's left = viewer's left on the back view */}
          <rect x={30} y={90} width={34} height={30} rx={6} fill={svg.brandSoft} stroke={svg.brand} strokeWidth={2} />
          <text x={47} y={110} textAnchor="middle" fontSize={13} fontWeight={700} fill={svg.brand}>B</text>
        </>
      ) : (
        <>
          <line x1={70} y1={40} x2={70} y2={104} stroke={svg.line} strokeWidth={2} aria-hidden />
          {/* anterior pad: patient's left = viewer's right on the front view */}
          <rect x={78} y={50} width={36} height={32} rx={6} fill={svg.brandSoft} stroke={svg.brand} strokeWidth={2} />
          <text x={96} y={71} textAnchor="middle" fontSize={13} fontWeight={700} fill={svg.brand}>A</text>
        </>
      )}
    </svg>
  )
}

function Pads() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <figure>
          <Torso />
          <figcaption className="mt-1 text-center text-[12px] font-semibold text-[var(--text)]">Edestä</figcaption>
        </figure>
        <figure>
          <Torso back />
          <figcaption className="mt-1 text-center text-[12px] font-semibold text-[var(--text)]">Takaa</figcaption>
        </figure>
      </div>
      <ul className="mt-3 space-y-1.5 text-[13px] leading-snug text-[var(--text)]">
        <li>
          <span className="font-semibold text-brand-600">A</span> Anteriorinen elektrodi vasemmalle rintalihaksen päälle.
        </li>
        <li>
          <span className="font-semibold text-brand-600">B</span> Posteriorinen elektrodi vasemmalle selkäpuolelle lapaluun alle.
        </li>
        <li className="text-[var(--text-dim)]">Ajele ihokarvat elektrodien alta ja kuivaa iho.</li>
      </ul>
    </div>
  )
}

export default function PacingCapture() {
  const [tab, setTab] = useState<'capture' | 'pads'>('capture')
  return (
    <div>
      <Segmented
        layoutId="pacing"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'capture', label: 'Kynnysvirta' },
          { value: 'pads', label: 'Elektrodit' },
        ]}
      />
      <div className="mt-3">{tab === 'capture' ? <Capture /> : <Pads />}</div>
    </div>
  )
}
