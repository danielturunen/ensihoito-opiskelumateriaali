import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { Result, Segmented, svg } from '../ui'

/* Decision trainer for adult ALS (Käypä hoito Elvytys 2021; Akuuttihoito-opas 2025;
 * Ensihoito-opas 2026). At each 2-minute rhythm check the learner chooses shock and drugs. */

type Rhythm = 'vf' | 'pea' | 'rosc'
type Drug = 'adr' | 'amio300' | 'amio150'

interface Check_ {
  rhythm: Rhythm
  shock: boolean
  drugs: Drug[]
  why: string
}

const SCEN: Record<'vf' | 'pea' | 'recur', { label: string; intro: string; checks: Check_[] }> = {
  vf: {
    label: 'Kammiovärinä',
    intro: 'Nähty elottomuus, maallikko painelee. Defibrillaattori kiinni – rytmi on kammiovärinä.',
    checks: [
      { rhythm: 'vf', shock: true, drugs: [], why: 'Iskettävä rytmi: yksi isku, ja painelu jatkuu heti 2 minuuttia. Lääkkeitä ei vielä.' },
      { rhythm: 'vf', shock: true, drugs: [], why: 'Toinen isku. Adrenaliini ja amiodaroni vasta 3. iskun jälkeen.' },
      { rhythm: 'vf', shock: true, drugs: ['adr', 'amio300'], why: '3. iskun jälkeen adrenaliini 1 mg ja amiodaroni 300 mg.' },
      { rhythm: 'vf', shock: true, drugs: [], why: 'Isku. Adrenaliini 3–5 minuutin välein – eli joka toisella kierroksella, ei nyt.' },
      { rhythm: 'vf', shock: true, drugs: ['adr', 'amio150'], why: '5. iskun jälkeen amiodaroni 150 mg ja adrenaliini (edellisestä noin 4 min).' },
      { rhythm: 'rosc', shock: false, drugs: [], why: 'Järjestäytynyt rytmi ja syke tuntuu: ROSC. Ei iskua eikä elvytyslääkkeitä – siirry ROSC-hoitoon ja ota 12-kytkentäinen EKG.' },
    ],
  },
  pea: {
    label: 'PEA',
    intro: 'Löydetty elottomana. Monitorissa järjestäytynyt rytmi, mutta syke ei tunnu: PEA.',
    checks: [
      { rhythm: 'pea', shock: false, drugs: ['adr'], why: 'Ei-iskettävä rytmi: adrenaliini 1 mg mahdollisimman pian. Ensihoito-oppaan mukaan, kun potilas on löydetty elottomana ja alkurytmi on ei-defibrilloitava, ensihoitolääkäriä konsultoidaan ennen adrenaliinia. Etsi hoidettavat syyt (4H/4T) – ultraääni erityisesti PEA:ssa.' },
      { rhythm: 'pea', shock: false, drugs: [], why: 'Ei iskua. Adrenaliini 3–5 minuutin välein – ei tällä kierroksella.' },
      { rhythm: 'pea', shock: false, drugs: ['adr'], why: 'Adrenaliini 1 mg (edellisestä noin 4 min). Amiodaronia ei anneta, jos rytmi ei ole iskettävä.' },
      { rhythm: 'rosc', shock: false, drugs: [], why: 'ROSC – syke tuntuu. Muista: monitorinäyttöön ei voi luottaa, tunnustele syke ja mittaa verenpaine.' },
    ],
  },
  recur: {
    label: 'VF uusiutuu',
    intro: 'Monitoroitu potilas menee kammiovärinään. Ensimmäinen isku palauttaa verenkierron, mutta…',
    checks: [
      { rhythm: 'vf', shock: true, drugs: [], why: 'Iskettävä rytmi: isku heti.' },
      { rhythm: 'rosc', shock: false, drugs: [], why: 'Verenkierto palasi. Uuden pysähdyksen riski on suurin ensimmäisten minuuttien aikana – tarkkaile rytmiä tiiviisti.' },
      { rhythm: 'vf', shock: true, drugs: ['amio300'], why: 'Akuuttihoito-oppaan mukaan, kun kammiovärinä uusiutuu 1. tai 2. iskun jälkeen palanneen verenkierron jälkeen, ensimmäinen toimenpide on välitön uusi isku ja amiodaroni – ei adrenaliini.' },
      { rhythm: 'rosc', shock: false, drugs: [], why: 'ROSC. Toistuvasti kammiovärinään menevä, toipumiskykyinen potilas viedään nopeasti angiolaboratorioon.' },
    ],
  },
}

const DRUGS: { id: Drug; label: string }[] = [
  { id: 'adr', label: 'Adrenaliini 1 mg' },
  { id: 'amio300', label: 'Amiodaroni 300 mg' },
  { id: 'amio150', label: 'Amiodaroni 150 mg' },
]

const RLABEL: Record<Rhythm, string> = { vf: 'Kammiovärinä', pea: 'PEA – ei sykettä', rosc: 'Järjestäytynyt rytmi, syke tuntuu' }

function Strip({ r }: { r: Rhythm }) {
  let d = ''
  if (r === 'vf') {
    for (let x = 0; x <= 300; x += 6) d += `${x === 0 ? 'M' : 'L'}${x} ${30 + Math.sin(x * 0.21) * 12 + Math.sin(x * 0.07) * 7}`
  } else {
    const beats = r === 'rosc' ? [20, 90, 160, 230] : [30, 130, 230]
    d = 'M0 34'
    for (const b of beats) d += ` L${b} 34 L${b + 4} 30 L${b + 8} 34 L${b + 14} 34 L${b + 16} 38 L${b + 19} 6 L${b + 22} 44 L${b + 25} 34 L${b + 34} 34 C${b + 38} 26 ${b + 46} 26 ${b + 50} 34`
    d += ' L300 34'
  }
  return (
    <svg viewBox="0 0 300 50" className="h-auto w-full" aria-hidden>
      <rect width={300} height={50} rx={6} fill="#0b1a14" />
      <path d={d} fill="none" stroke={r === 'rosc' ? '#34d399' : r === 'vf' ? '#fbbf24' : '#34d399'} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  )
}

export default function AlsSim() {
  const [scen, setScen] = useState<keyof typeof SCEN>('vf')
  const [i, setI] = useState(0)
  const [shock, setShock] = useState<boolean | null>(null)
  const [drugs, setDrugs] = useState<Set<Drug>>(new Set())
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const reduce = useReducedMotion()

  const s = SCEN[scen]
  const done = i >= s.checks.length
  const c = s.checks[Math.min(i, s.checks.length - 1)]
  const shockOk = shock === c.shock
  const drugsOk = c.drugs.length === drugs.size && c.drugs.every((d) => drugs.has(d))
  const ok = shockOk && drugsOk

  function reset(k: keyof typeof SCEN) {
    setScen(k)
    setI(0)
    setShock(null)
    setDrugs(new Set())
    setChecked(false)
    setScore(0)
  }
  function confirm() {
    setChecked(true)
    if (ok) setScore((v) => v + 1)
  }
  function next() {
    setI((v) => v + 1)
    setShock(null)
    setDrugs(new Set())
    setChecked(false)
  }

  return (
    <div>
      <Segmented layoutId="als-sim" size="sm" value={scen} onChange={(v) => reset(v as keyof typeof SCEN)} options={(Object.keys(SCEN) as (keyof typeof SCEN)[]).map((k) => ({ value: k, label: SCEN[k].label }))} />
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-dim)]">{s.intro}</p>

      {done ? (
        <div className="mt-3">
          <Result tone={score === s.checks.length ? 'ok' : 'warning'} title={`${score} / ${s.checks.length} rytmintarkistusta oikein`}>
            Kokeile toista skenaariota – tai sama uudelleen, kunnes isku- ja lääkerytmi sujuu.
          </Result>
          <button onClick={() => reset(scen)} className="mt-2 min-h-[44px] w-full rounded-xl bg-brand-500 text-[13px] font-semibold text-white active:scale-[0.98]">
            Aloita alusta
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${scen}-${i}`} initial={reduce ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="mt-3">
            <div className="mb-1.5 flex items-baseline justify-between text-[12px]">
              <span className="font-semibold text-[var(--text)]">Rytmintarkistus {i + 1}</span>
              <span className="tabular-nums text-[var(--text-dim)]">noin {i * 2} min</span>
            </div>
            <Strip r={c.rhythm} />
            <p className="mt-1 text-[12px] font-semibold" style={{ color: c.rhythm === 'vf' ? svg.brand : svg.teal }}>
              {RLABEL[c.rhythm]}
            </p>

            <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Defibrillaatio</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { v: true, l: 'Isku' },
                { v: false, l: 'Ei iskua' },
              ].map((o) => (
                <button
                  key={o.l}
                  disabled={checked}
                  onClick={() => setShock(o.v)}
                  aria-pressed={shock === o.v}
                  className={`min-h-[44px] rounded-xl border text-[13px] font-semibold transition-[background-color,border-color] duration-150 ${
                    shock === o.v ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>

            <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Lääkkeet tällä kierroksella</p>
            <div className="flex flex-col gap-1.5">
              {DRUGS.map((d) => {
                const on = drugs.has(d.id)
                const should = c.drugs.includes(d.id)
                let cls = on ? 'border-brand-500/60 bg-brand-500/10' : 'border-[var(--border)]'
                if (checked) cls = should ? 'border-teal-500/50 bg-teal-500/10' : on ? 'border-danger-500/45 bg-danger-500/10' : 'border-[var(--border)] opacity-60'
                return (
                  <button
                    key={d.id}
                    role="checkbox"
                    aria-checked={on}
                    disabled={checked}
                    onClick={() =>
                      setDrugs((s0) => {
                        const n = new Set(s0)
                        if (n.has(d.id)) n.delete(d.id)
                        else n.add(d.id)
                        return n
                      })
                    }
                    className={`flex min-h-[44px] items-center justify-between rounded-xl border px-3 text-left text-[13px] text-[var(--text)] transition-[background-color,border-color,opacity] duration-150 ${cls}`}
                  >
                    {d.label}
                    {checked && (should ? <Check className="h-4 w-4 text-teal-600" strokeWidth={3} /> : on ? <X className="h-4 w-4 text-danger-500" strokeWidth={3} /> : null)}
                  </button>
                )
              })}
            </div>

            {checked && (
              <div className="mt-3">
                <Result tone={ok ? 'ok' : 'warning'} title={ok ? 'Oikein' : `Ei aivan – oikea: ${c.shock ? 'isku' : 'ei iskua'}${c.drugs.length ? ' + ' + c.drugs.map((d) => DRUGS.find((x) => x.id === d)!.label).join(' + ') : ', ei lääkkeitä'}`}>
                  {c.why}
                </Result>
              </div>
            )}

            <button
              onClick={checked ? next : confirm}
              disabled={!checked && shock === null}
              className="mt-3 min-h-[44px] w-full rounded-xl bg-brand-500 text-[13px] font-semibold text-white transition-opacity active:scale-[0.98] disabled:opacity-40"
            >
              {checked ? (i === s.checks.length - 1 ? 'Näytä tulos' : 'Painelu jatkuu – seuraava tarkistus') : 'Vahvista'}
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
