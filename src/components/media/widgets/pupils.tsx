import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react'
import { Check, Flashlight, X } from 'lucide-react'
import { Segmented, toneSurface, toneText, type Tone } from '../ui'
import { EyeGlyph } from '../parts/misc-eye'

type StateId = 'normal' | 'small' | 'large' | 'aniso' | 'fixed'

interface EyeSpec {
  r: number
  word: string
  reactive: boolean
}

interface PupilState {
  id: StateId
  label: string
  title: string
  tone: Tone
  /** [potilaan oikea (kuvassa vasemmalla), potilaan vasen] */
  eyes: [EyeSpec, EyeSpec]
  items: { lead?: string; text: string }[]
}

const NORMAL: EyeSpec = { r: 8.5, word: 'Normaali', reactive: true }

// Articles: intoksikaatiopotilaan-hoito, tajuttomuus, traumapotilaan-tutkiminen.
const STATES: PupilState[] = [
  {
    id: 'normal',
    label: 'Normaalit',
    title: 'Normaalit pupillit',
    tone: 'ok',
    eyes: [NORMAL, NORMAL],
    items: [
      { text: 'Pupillien koko, symmetria ja valoreaktio tarkistetaan osana D-arviota.' },
      { text: 'Myös sedatiivis-hypnoottisessa myrkytyksessä (bentsodiatsepiinit, alkoholi) pupillit voivat olla normaalit.' },
    ],
  },
  {
    id: 'small',
    label: 'Pienet (mioosi)',
    title: 'Pienet pupillit (mioosi)',
    tone: 'warning',
    eyes: [
      { r: 3.2, word: 'Pieni', reactive: true },
      { r: 3.2, word: 'Pieni', reactive: true },
    ],
    items: [
      { lead: 'Opioidi', text: 'usein yhdessä hengityslaman kanssa. Vastalääke naloksoni – vaikutusaika lyhyt, hengityslama voi uusiutua.' },
      { lead: 'Kolinerginen myrkytys', text: 'torjunta-aineet, hermokaasut; iho hikoileva, ”märkä”.' },
    ],
  },
  {
    id: 'large',
    label: 'Laajat',
    title: 'Laajat pupillit',
    tone: 'warning',
    eyes: [
      { r: 15.5, word: 'Laaja', reactive: true },
      { r: 15.5, word: 'Laaja', reactive: true },
    ],
    items: [
      { lead: 'Sympatomimeettinen', text: 'amfetamiini, kokaiini, ekstaasi – iho hikoileva.' },
      { lead: 'Antikolinerginen', text: 'trisykliset masennuslääkkeet, atropiini – iho kuiva ja punoittava.' },
      { text: 'Atropiini laajentaa pupilleja myös haittavaikutuksena.' },
    ],
  },
  {
    id: 'aniso',
    label: 'Erisuuret (anisokoria)',
    title: 'Erisuuret pupillit (anisokoria)',
    tone: 'warning',
    eyes: [{ r: 15, word: 'Laaja', reactive: true }, NORMAL],
    items: [
      {
        text: 'Viittaa vahvasti kallonsisäiseen paikalliseen syyhyn – etenkin yhdessä toispuolisten oireiden, katsedeviaation tai hypertension ja bradykardian kanssa.',
      },
      { lead: 'Toiminta', text: 'kuljetus kohti neurokirurgista yksikköä.' },
    ],
  },
  {
    id: 'fixed',
    label: 'Laaja valojäykkä',
    title: 'Uhkaava herniaatio',
    tone: 'danger',
    eyes: [{ r: 16, word: 'Laaja', reactive: false }, NORMAL],
    items: [
      { text: 'Toispuolinen laaja, valojäykkä pupilli ja nopeasti laskeva tajunta ovat merkkejä aivojen puristumisesta.' },
      { lead: 'Toimi', text: 'varmista hengitystie ja riittävä happeutuminen, vältä hypotensiota, konsultoi välittömästi.' },
    ],
  },
]

const LIT_MS = 1300
const RECOVER_MS = 1000
const constricted = (r: number) => Math.max(2.4, r * 0.48)

export default function Pupils() {
  const reduce = useReducedMotion()
  const [id, setId] = useState<StateId>('normal')
  const [phase, setPhase] = useState<'idle' | 'lit' | 'recover'>('idle')
  const [tested, setTested] = useState(false)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  const st = STATES.find((s) => s.id === id)!
  const lit = phase === 'lit'

  function choose(v: StateId) {
    clearTimers()
    setPhase('idle')
    setTested(false)
    setId(v)
  }

  function shine() {
    clearTimers()
    setPhase('lit')
    setTested(true)
    timers.current.push(
      window.setTimeout(() => setPhase('recover'), LIT_MS),
      window.setTimeout(() => setPhase('idle'), LIT_MS + RECOVER_MS),
    )
  }

  const transition: Transition = reduce
    ? { duration: 0 }
    : phase === 'lit'
      ? { type: 'spring', duration: 0.45, bounce: 0, delay: 0.15 }
      : phase === 'recover'
        ? { type: 'spring', duration: 1, bounce: 0 }
        : { type: 'spring', duration: 0.55, bounce: 0.18 }

  const ariaLabel = `Pupillit: ${st.eyes.map((e, i) => `${i === 0 ? 'oikea' : 'vasen'} ${e.word.toLowerCase()}`).join(', ')}.`

  return (
    <div>
      <Segmented
        layoutId="pupils-state"
        wrap
        size="sm"
        value={id}
        onChange={choose}
        options={STATES.map((s) => ({ value: s.id, label: s.label }))}
      />

      <div className="mx-auto mt-4 w-full max-w-[420px]">
        <svg viewBox="0 0 340 104" className="h-auto w-full" role="img" aria-label={ariaLabel}>
          {st.eyes.map((e, i) => (
            <EyeGlyph
              key={i}
              x={i === 0 ? 88 : 252}
              y={54}
              pupil={lit && e.reactive ? constricted(e.r) : e.r}
              transition={transition}
              glow={lit ? 1 : 0}
            />
          ))}
        </svg>

        <div className="mt-1 grid grid-cols-2 text-center">
          {st.eyes.map((e, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-dim)]">Potilaan {i === 0 ? 'oikea' : 'vasen'}</span>
              <span className="font-display text-[14px] font-semibold text-[var(--text)]">{e.word}</span>
              <span className="flex h-5 items-center">
                <AnimatePresence initial={false}>
                  {tested && (
                    <motion.span
                      key={`${id}-${i}`}
                      initial={reduce ? false : { opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: reduce ? 0 : 0.35 }}
                      className={`inline-flex items-center gap-1 text-[12px] font-medium ${e.reactive ? 'text-teal-600' : 'text-danger-500'}`}
                    >
                      {e.reactive ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
                      {e.reactive ? 'Supistuu valolle' : 'Ei reagoi valolle'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={shine}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-[14px] font-semibold transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] ${
            lit ? 'bg-amber-300 text-amber-950' : 'bg-[var(--bg-card)] text-[var(--text)] ring-1 ring-[var(--border)]'
          }`}
        >
          <Flashlight className="h-4 w-4" strokeWidth={2.25} />
          Valoreaktio
        </button>
      </div>

      <div className="mt-4" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={st.id}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className={`rounded-xl border px-4 py-3 ${toneSurface[st.tone]}`}
          >
            <p className={`font-display text-[15px] font-semibold ${toneText[st.tone]}`}>{st.title}</p>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {st.items.map((it, i) => (
                <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[var(--text)]">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" aria-hidden="true" />
                  <span>
                    {it.lead && <span className="font-semibold">{it.lead}: </span>}
                    {it.text}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
