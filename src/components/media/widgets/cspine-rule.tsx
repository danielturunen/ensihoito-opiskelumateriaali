import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { Result, Segmented, type Tone } from '../ui'

/* Canadian C-Spine Rule as presented in the European Trauma Course manual (ch. 9, fig. 9.3):
 * alert (GCS 15) and stable trauma patients – does the cervical spine need imaging? */

const EXCLUDE = [
  { id: 'nt', label: 'Ei vammapotilas' },
  { id: 'gcs', label: 'GCS alle 15' },
  { id: 'vit', label: 'Epävakaat peruselintoiminnot' },
  { id: 'age', label: 'Alle 16-vuotias' },
  { id: 'par', label: 'Äkillinen halvaus' },
  { id: 'dis', label: 'Tunnettu selkärankasairaus' },
  { id: 'prev', label: 'Aiempi kaularankavamma' },
]
const HIGH = [
  { id: 'old', label: 'Ikä yli 65 vuotta' },
  { id: 'mech', label: 'Vaarallinen vammamekanismi', hint: 'Putoaminen yli 1 m tai 5 porrasta, aksiaalinen isku päähän, yli 100 km/h, kierähdys tai sinkoutuminen, moottoroitu kulkupeli, polkupyöräkolari' },
  { id: 'par', label: 'Raajojen tuntoharhat (parestesiat)' },
]
const LOW = [
  { id: 'rear', label: 'Yksinkertainen peräänajo', hint: 'Ei, jos työntyi vastaantulevaan liikenteeseen, törmääjä oli bussi tai rekka, auto kierähti tai törmääjällä oli suuri nopeus' },
  { id: 'sit', label: 'Istuu päivystyksessä' },
  { id: 'walk', label: 'On kävellyt jossain vaiheessa' },
  { id: 'late', label: 'Niskakipu alkoi viiveellä (ei heti)' },
  { id: 'mid', label: 'Ei keskilinjan aristusta kaularangassa' },
]

function Rows({ items, on, toggle, disabled }: { items: { id: string; label: string; hint?: string }[]; on: Set<string>; toggle: (id: string) => void; disabled: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((f) => {
        const c = on.has(f.id)
        return (
          <button
            key={f.id}
            role="checkbox"
            aria-checked={c}
            disabled={disabled}
            onClick={() => toggle(f.id)}
            className={`flex min-h-[44px] items-start gap-3 rounded-xl border px-3 py-2 text-left text-[13px] transition-[background-color,border-color] duration-150 ${
              c ? 'border-brand-500/50 bg-brand-500/10' : 'border-[var(--border)]'
            }`}
          >
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${c ? 'border-brand-500 bg-brand-500 text-white' : 'border-[var(--border)] bg-[var(--bg-raised)]'}`}>
              {c && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <span className="flex-1">
              <span className="text-[var(--text)]">{f.label}</span>
              {f.hint && <span className="mt-0.5 block text-[12px] leading-snug text-[var(--text-dim)]">{f.hint}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Chips({ items, on, toggle }: { items: { id: string; label: string }[]; on: Set<string>; toggle: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((f) => {
        const c = on.has(f.id)
        return (
          <button
            key={f.id}
            role="checkbox"
            aria-checked={c}
            onClick={() => toggle(f.id)}
            className={`flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-[12px] transition-[background-color,border-color] duration-150 ${
              c ? 'border-brand-500 bg-brand-500/15 font-medium text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
            }`}
          >
            {c && <Check className="h-3.5 w-3.5 text-brand-500" strokeWidth={3} />}
            {f.label}
          </button>
        )
      })}
    </div>
  )
}

function Step({ n, title, active, children }: { n: number; title: string; active: boolean; children: ReactNode }) {
  return (
    <section className={`mt-4 transition-opacity duration-200 first:mt-0 ${active ? '' : 'pointer-events-none opacity-40'}`} aria-disabled={!active}>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
        {n}. {title}
      </p>
      {children}
    </section>
  )
}

export default function CspineRule() {
  const [ex, setEx] = useState<Set<string>>(new Set())
  const [hi, setHi] = useState<Set<string>>(new Set())
  const [lo, setLo] = useState<Set<string>>(new Set(['walk']))
  const [rot, setRot] = useState<'y' | 'n' | 'q'>('q')
  const reduce = useReducedMotion()

  const mk = (set: typeof setEx) => (id: string) =>
    set((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  let stage = 0
  let title: string
  let text: string
  let tone: Tone
  if (ex.size > 0) {
    title = 'Sääntö ei sovellu'
    text = 'Säännön ulkopuolelle jäävällä potilaalla kaularankaa ei voi vapauttaa sen perusteella. Tuenta jatkuu, ja kuvantamisesta päätetään muilla perusteilla.'
    tone = 'warning'
  } else if (hi.size > 0) {
    stage = 1
    title = 'Kuvantaminen – tuenta jatkuu'
    text = 'Yksikin suuren riskin tekijä riittää. Kaularangan liikkuvuutta ei testata.'
    tone = 'danger'
  } else if (lo.size === 0) {
    stage = 2
    title = 'Kuvantaminen – tuenta jatkuu'
    text = 'Ilman yhtäkään pienen riskin tekijää liikkuvuutta ei voi turvallisesti testata.'
    tone = 'warning'
  } else if (rot === 'q') {
    stage = 3
    title = 'Pyydä potilasta kääntämään päätään'
    text = 'Pienen riskin tekijä sallii liikkuvuuden testaamisen: pystyykö potilas itse kääntämään päätään 45° kumpaankin suuntaan?'
    tone = 'neutral'
  } else if (rot === 'n') {
    stage = 3
    title = 'Kuvantaminen – tuenta jatkuu'
    text = 'Potilas ei pysty kääntämään päätään 45° molempiin suuntiin.'
    tone = 'warning'
  } else {
    stage = 3
    title = 'Ei kuvantamista'
    text = 'Kaularanka voidaan vapauttaa kliinisesti, ja tukiväline poistetaan.'
    tone = 'ok'
  }

  return (
    <div>
      <Step n={0} title="Rajaako jokin potilaan säännön ulkopuolelle?" active>
        <Chips items={EXCLUDE} on={ex} toggle={mk(setEx)} />
      </Step>
      <Step n={1} title="Suuren riskin tekijä?" active={ex.size === 0}>
        <Rows items={HIGH} on={hi} toggle={mk(setHi)} disabled={ex.size > 0} />
      </Step>
      <Step n={2} title="Pienen riskin tekijä, joka sallii testauksen?" active={stage >= 2}>
        <Rows items={LOW} on={lo} toggle={mk(setLo)} disabled={stage < 2} />
      </Step>
      <Step n={3} title="Kääntää päätään itse 45° vasemmalle ja oikealle?" active={stage >= 3}>
        <Segmented
          layoutId="cspine-rot"
          size="sm"
          value={rot}
          onChange={setRot}
          options={[
            { value: 'q', label: 'Testaamatta' },
            { value: 'y', label: 'Pystyy' },
            { value: 'n', label: 'Ei pysty' },
          ]}
        />
      </Step>

      <div className="mt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={title + stage}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <Result tone={tone} title={title}>
              {text}
            </Result>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
