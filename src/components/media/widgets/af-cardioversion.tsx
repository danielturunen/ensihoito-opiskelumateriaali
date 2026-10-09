import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { Result, Segmented, type Tone } from '../ui'

/* Acute atrial fibrillation: CHA2DS2-VA score + onset time + anticoagulation decide
 * whether early cardioversion is possible (Käypä hoito Eteisvärinä 2025). */

type Age = 'u65' | '65' | '75'
type Dur = 'lt12' | '12to48' | 'gt48'

const FACTORS = [
  { id: 'c', label: 'Sydämen vajaatoiminta', pts: 1 },
  { id: 'h', label: 'Kohonnut verenpaine', pts: 1 },
  { id: 'd', label: 'Diabetes', pts: 1 },
  { id: 's', label: 'Aiempi aivohalvaus tai TIA', pts: 2 },
  { id: 'v', label: 'Valtimosairaus', pts: 1 },
] as const

function riskText(score: number): { label: string; tone: Tone; text: string } {
  if (score >= 2) return { label: 'Suuri riski', tone: 'danger', text: 'Pysyvä antikoagulaatio on aiheellinen lähes poikkeuksetta.' }
  if (score === 1) return { label: 'Keskisuuri riski', tone: 'warning', text: 'Antikoagulaation tarve arvioidaan yksilöllisesti.' }
  return { label: 'Pieni riski', tone: 'ok', text: 'Antikoagulaatiota ei anneta – hyöty on haittoja pienempi.' }
}

export default function AfCardioversion() {
  const [on, setOn] = useState<Set<string>>(new Set(['h']))
  const [age, setAge] = useState<Age>('65')
  const [unstable, setUnstable] = useState(false)
  const [dur, setDur] = useState<Dur>('lt12')
  const [ak, setAk] = useState(false)
  const reduce = useReducedMotion()

  const score = FACTORS.reduce((s, f) => s + (on.has(f.id) ? f.pts : 0), 0) + (age === '75' ? 2 : age === '65' ? 1 : 0)
  const risk = riskText(score)

  let title: string
  let text: string
  let tone: Tone
  if (unstable) {
    title = 'Sähköinen rytminsiirto heti'
    text = 'Kun eteisvärinä romahduttaa hemodynamiikan, rytmi siirretään heti – kestosta ja antikoagulaatiosta riippumatta.'
    tone = 'danger'
  } else if (ak) {
    title = 'Välitön rytminsiirto mahdollinen'
    text = 'Pysyvää hoitotasoista antikoagulaatiota käyttävän rytmi voidaan siirtää heti rytmihäiriön kestosta riippumatta.'
    tone = 'ok'
  } else if (dur === 'gt48') {
    title = 'Ei välitöntä rytminsiirtoa'
    text = 'Vähintään 48 tuntia kestäneessä tai kestoltaan epäselvässä eteisvärinässä rytmi siirretään vasta 3 viikon tehokkaan antikoagulaation jälkeen tai, jos kaikututkimus ruokatorven kautta tai TT ei näytä sydämensisäisiä trombeja. Alkuun sykkeenhallinta.'
    tone = 'warning'
  } else if (score <= 1 && dur === 'lt12') {
    title = 'Rytminsiirto ilman antikoagulaatiota'
    text = 'Pienen tai keskisuuren riskin potilaalla alle 12 tuntia kestäneen eteisvärinän rytminsiirtoon ei tarvita antikoagulaatiota ennen eikä jälkeen.'
    tone = 'ok'
  } else if (score <= 1) {
    title = 'Antikoagulaatio ennen rytminsiirtoa'
    text = 'Kesto 12–48 tuntia: ensimmäinen antikoagulanttiannos annetaan ennen rytminsiirtoa, ja hoitoa jatketaan vähintään kuukauden tai pysyvästi. Spontaania palautumista ei odoteta yli 48 tuntia.'
    tone = 'warning'
  } else {
    title = 'Antikoagulaatio ennen rytminsiirtoa ja pysyvästi'
    text = 'Suuren riskin potilaalle aloitetaan suora antikoagulantti (tai pienimolekyylinen hepariini ja varfariini) ennen rytminsiirtoa. Antikoaguloimattoman spontaania palautumista ei odoteta yli 24 tuntia.'
    tone = 'warning'
  }

  function toggle(id: string) {
    setOn((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">1. CHA₂DS₂-VA-pisteet</p>
      <Segmented
        layoutId="af-age"
        size="sm"
        value={age}
        onChange={setAge}
        options={[
          { value: 'u65', label: 'Alle 65 v' },
          { value: '65', label: '65–74 v (1)' },
          { value: '75', label: '≥ 75 v (2)' },
        ]}
      />
      <div className="mt-1.5 flex flex-col gap-1.5">
        {FACTORS.map((f) => {
          const c = on.has(f.id)
          return (
            <button
              key={f.id}
              role="checkbox"
              aria-checked={c}
              onClick={() => toggle(f.id)}
              className={`flex min-h-[44px] items-center gap-3 rounded-xl border px-3 py-2 text-left text-[13px] transition-[background-color,border-color] duration-150 ${
                c ? 'border-brand-500/50 bg-brand-500/10' : 'border-[var(--border)]'
              }`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${c ? 'border-brand-500 bg-brand-500 text-white' : 'border-[var(--border)] bg-[var(--bg-raised)]'}`}>
                {c && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <span className="flex-1 text-[var(--text)]">{f.label}</span>
              <span className="font-display text-[12px] font-semibold text-[var(--text-dim)]">+{f.pts}</span>
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex items-center justify-between rounded-xl bg-[var(--bg)] px-3.5 py-2.5">
        <span className="text-[13px] text-[var(--text-dim)]">
          {risk.label} – {risk.text}
        </span>
        <span className="ml-3 font-display text-2xl font-bold tabular-nums text-[var(--text)]">{score}</span>
      </div>

      <p className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">2. Hemodynamiikka</p>
      <Segmented
        layoutId="af-hemo"
        size="sm"
        value={unstable ? 'u' : 's'}
        onChange={(v) => setUnstable(v === 'u')}
        options={[
          { value: 's', label: 'Vakaa' },
          { value: 'u', label: 'Romahtanut' },
        ]}
      />
      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">3. Kohtauksen kesto</p>
      <Segmented
        layoutId="af-dur"
        size="sm"
        value={dur}
        onChange={setDur}
        options={[
          { value: 'lt12', label: 'Alle 12 h' },
          { value: '12to48', label: '12–48 h' },
          { value: 'gt48', label: 'Yli 48 h / ?' },
        ]}
      />
      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">4. Antikoagulaatio</p>
      <Segmented
        layoutId="af-ak"
        size="sm"
        value={ak ? 'y' : 'n'}
        onChange={(v) => setAk(v === 'y')}
        options={[
          { value: 'n', label: 'Ei käytössä' },
          { value: 'y', label: 'Hoitotasolla ≥ 3 vk' },
        ]}
      />

      <div className="mt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={title}
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
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-dim)]">
        Ensihoitajan tärkein tieto tähän päätökseen on <strong className="text-[var(--text)]">oireiden alkamisaika</strong> ja antikoagulaation säännöllisyys – kirjaa ne tarkasti.
      </p>
    </div>
  )
}
