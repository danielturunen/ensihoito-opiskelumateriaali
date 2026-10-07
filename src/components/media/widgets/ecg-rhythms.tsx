import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, GraduationCap, Heart, X } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Result, Segmented } from '../ui'
import { ECG_HEIGHT_MM, ECG_MM_PER_S, ECG_WINDOW_S, rhythmStrip, type RhythmId, type RhythmStrip } from '../parts/ecg-wave'

/* ------------------------------------------------------------------ */
/* Content — facts only from the rytmihäiriöt / amiodaroni / atropiini  */
/* ------------------------------------------------------------------ */

type CareItem = string | { text: string; tone: 'danger' | 'warning' }

interface Rhythm {
  id: RhythmId
  tab: string
  name: string
  sub?: string
  tag?: string
  features: string[]
  care: CareItem[]
}

const RHYTHMS: Rhythm[] = [
  {
    id: 'sinus',
    tab: 'Sinusrytmi',
    name: 'Sinusrytmi',
    tag: 'Vertailukohta',
    features: [
      'Säännöllinen rytmi',
      '**P-aalto** ennen jokaista kapeaa QRS-kompleksia',
      'Impulssi lähtee **sinussolmukkeesta**, joka tahdistaa sydäntä nopeimmin',
    ],
    care: [],
  },
  {
    id: 'af',
    tab: 'Eteisvärinä',
    name: 'Eteisvärinä',
    features: [
      '**Ei selviä P-aaltoja** – eteisten sähköinen toiminta on nopeaa ja järjestäytymätöntä',
      '**Epäsäännöllinen** kammiorytmi',
      'Kammiotaajuus tyypillisesti 100–180/min',
      'Yleisin rytmihäiriö (2–4 % aikuisista)',
    ],
    care: [
      { text: 'Muista **aivohalvausriski** myös kohtauksittaisessa eteisvärinässä', tone: 'warning' },
      'CHA₂DS₂-VASc ≥ 2 → antikoagulaatiota suositellaan',
    ],
  },
  {
    id: 'flutter',
    tab: 'Eteislepatus',
    name: 'Eteislepatus',
    features: [
      'Järjestäytyneempi eteisaktivaatio noin 300/min – **sahalaitakuvio**',
      'Kammiovaste usein vakiotaajuinen, esim. 2:1 tai 3:1',
      'Kuvassa 2:1 – joka toinen lepatusaalto johtuu kammioihin',
    ],
    care: [],
  },
  {
    id: 'psvt',
    tab: 'PSVT',
    name: 'PSVT',
    sub: 'Paroksysmaalinen supraventrikulaarinen takykardia',
    features: [
      'Kohtauksittainen, **kapeakompleksinen** ja **säännöllinen** takykardia',
      'Yleisimmin eteis-kammiosolmukkeen kiertoaktivaatio',
    ],
    care: [
      'Vagaalinen stimulaatio: **modifioitu Valsalva** – puhallus ruiskuun 15 s, sitten selälleen ja jalat koholle',
      'Tarvittaessa **adenosiini**',
    ],
  },
  {
    id: 'vt',
    tab: 'Kammiotakykardia',
    name: 'Kammiotakykardia',
    features: [
      'Yli kolme peräkkäistä **leveää** kammioperäistä kompleksia',
      'Taajuus yli 100/min',
      'Voi muuttua kammiovärinäksi',
    ],
    care: [
      'Eloton → **defibrillaatio**',
      'Hemodynaamisesti epävakaa → **sähköinen kardioversio**',
      'Vakaa → **amiodaroni** infuusiona 150–300 mg 10–20 min, ei nopeana boluksena',
    ],
  },
  {
    id: 'tdp',
    tab: 'Torsades',
    name: 'Kääntyvien kärkien kammiotakykardia',
    sub: 'torsades de pointes',
    features: [
      'QRS-kompleksien amplitudi **”kiertyy” perusviivan ympäri**',
      'Syntyy pitkän QT-ajan pohjalta: QTc > 440 ms miehillä, > 460 ms naisilla',
      'QTc > 500 ms: merkittävä riski',
    ],
    care: [{ text: '**Amiodaroni on vasta-aiheinen**', tone: 'danger' }, '**Magnesium 2 g i.v.**, voidaan toistaa'],
  },
  {
    id: 'vf',
    tab: 'Kammiovärinä',
    name: 'Kammiovärinä',
    features: ['**Kaoottinen** – ei tunnistettavia QRS-komplekseja', 'Potilas on **eloton**'],
    care: [
      'Elvytysohjeen mukainen **defibrillaatio**',
      '**Amiodaroni 300 mg i.v.** kolmannen defibrilloinnin jälkeen, tarvittaessa lisäannos 150 mg',
    ],
  },
  {
    id: 'brady',
    tab: 'Bradykardia',
    name: 'Bradykardia',
    features: ['Hidas syke', 'Säännöllinen rytmi'],
    care: [
      'Hengenvaaran merkit (sokki, tajunnanmenetys, iskemia, vajaatoiminta) → **atropiini 0,5 mg i.v.** tai ulkoinen tahdistus',
      { text: 'Anna aina **vähintään 0,5 mg** – pienempi annos voi aiheuttaa paradoksaalisen bradykardian', tone: 'warning' },
      'Toisto 3–5 min välein, enintään noin 3 mg',
    ],
  },
  {
    id: 'avb3',
    tab: 'Totaali AV-katkos',
    name: 'Totaali AV-katkos',
    features: [
      'P-aallot ja QRS-kompleksit **eivät liity toisiinsa**',
      'Eteiset ja kammiot lyövät omaa tahtiaan – kammiot hitaasti',
      'QRS voi olla leveä',
    ],
    care: [
      { text: '**Asystolen riski** → lääkehoito tai tahdistus', tone: 'warning' },
      'Riittämätön atropiinivaste → harkitse adrenaliini-infuusiota tai ulkoista tahdistusta',
    ],
  },
]

const BY_ID = Object.fromEntries(RHYTHMS.map((r) => [r.id, r])) as Record<RhythmId, Rhythm>

/* ------------------------------------------------------------------ */
/* Monitor                                                              */
/* ------------------------------------------------------------------ */

const GREEN = '#4ade80'
const SCREEN_BG = '#040807'
const SCREEN_W = ECG_WINDOW_S * ECG_MM_PER_S
const SCREEN_H = ECG_HEIGHT_MM

function rich(text: string): ReactNode {
  return text.split('**').map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-semibold text-[var(--text)]">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

/** Static monitor grid: 1 mm minor and 5 mm major squares. */
function MonitorGrid() {
  const minor: ReactNode[] = []
  const major: ReactNode[] = []
  for (let x = 1; x < SCREEN_W; x++) {
    const el = <line key={`x${x}`} x1={x} x2={x} y1={0} y2={SCREEN_H} />
    ;(x % 5 === 0 ? major : minor).push(el)
  }
  for (let y = 1; y < SCREEN_H; y++) {
    const el = <line key={`y${y}`} x1={0} x2={SCREEN_W} y1={y} y2={y} />
    ;(y % 5 === 0 ? major : minor).push(el)
  }
  return (
    <svg
      viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
      preserveAspectRatio="none"
      className="absolute inset-0 block h-full w-full"
      aria-hidden
    >
      <g stroke={GREEN} strokeOpacity={0.05} strokeWidth={1} vectorEffect="non-scaling-stroke" shapeRendering="crispEdges">
        {minor}
      </g>
      <g stroke={GREEN} strokeOpacity={0.13} strokeWidth={1} vectorEffect="non-scaling-stroke" shapeRendering="crispEdges">
        {major}
      </g>
    </svg>
  )
}

/** Heart-blink keyframes aligned with the moment each QRS enters at the right edge. */
function pulseKeyframes(strip: RhythmStrip): Keyframe[] {
  const T = strip.period
  const rest = { opacity: 0.35, transform: 'scale(1)' }
  const events = strip.beats.map((b) => ((((b - strip.window * 0.97) % T) + T) % T) / T).sort((a, b) => a - b)
  const frames: Keyframe[] = [{ offset: 0, ...rest }]
  let last = 0
  for (const e of events) {
    const pre = Math.max(last, e - 0.0005)
    if (pre > last) frames.push({ offset: pre, ...rest })
    frames.push({ offset: Math.max(pre, e), opacity: 1, transform: 'scale(1.25)' })
    const end = Math.min(1, Math.max(pre, e) + 0.2 / T)
    frames.push({ offset: end, ...rest })
    last = end
  }
  if (last < 1) frames.push({ offset: 1, ...rest })
  return frames
}

/** One rhythm: the scrolling strip + its rate readout. Keyed per rhythm so switching cross-fades. */
function TraceLayer({ id, playing, reduce }: { id: RhythmId; playing: boolean; reduce: boolean }) {
  const strip = rhythmStrip(id)
  const stripRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<HTMLSpanElement>(null)
  const anims = useRef<Animation[]>([])

  useEffect(() => {
    if (reduce) return
    const el = stripRef.current
    if (!el || typeof el.animate !== 'function') return
    const total = strip.period + strip.window
    const shift = (strip.period / total) * 100
    const list: Animation[] = [
      el.animate([{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(-${shift}%,0,0)` }], {
        duration: strip.period * 1000,
        iterations: Infinity,
        easing: 'linear',
      }),
    ]
    const heart = pulseRef.current
    if (heart && strip.beats.length) {
      list.push(heart.animate(pulseKeyframes(strip), { duration: strip.period * 1000, iterations: Infinity, easing: 'linear' }))
    }
    anims.current = list
    return () => {
      list.forEach((a) => a.cancel())
      anims.current = []
    }
  }, [strip, reduce])

  useEffect(() => {
    for (const a of anims.current) {
      if (playing) a.play()
      else a.pause()
    }
  }, [playing, strip, reduce])

  const total = strip.period + strip.window
  return (
    <>
      <div
        ref={stripRef}
        className="absolute inset-y-0 left-0 will-change-transform"
        style={{ width: `${(total / strip.window) * 100}%` }}
      >
        <svg
          viewBox={`0 0 ${strip.widthMm} ${strip.heightMm}`}
          preserveAspectRatio="none"
          className="block h-full w-full"
          aria-hidden
        >
          <path
            d={strip.path}
            fill="none"
            stroke={GREEN}
            strokeOpacity={0.16}
            strokeWidth={6}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={strip.path}
            fill="none"
            stroke={GREEN}
            strokeWidth={1.75}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Rate readout */}
      <div className="absolute right-2 top-2 flex flex-col items-end rounded-lg px-2 py-1 sm:right-3 sm:top-3" style={{ background: 'rgba(4,8,7,0.8)' }}>
        <div className="flex items-center gap-1 text-[11px] font-semibold tracking-wider" style={{ color: 'rgba(74,222,128,0.7)' }}>
          <span
            ref={pulseRef}
            className="inline-flex"
            style={{ opacity: strip.beats.length ? (reduce ? 0.9 : 0.35) : 0.25, color: GREEN }}
          >
            <Heart className="h-3 w-3" fill="currentColor" strokeWidth={0} />
          </span>
          HR
        </div>
        <div className="font-display text-[22px] font-semibold leading-none tabular-nums sm:text-[28px]" style={{ color: GREEN }}>
          {strip.rate ? (
            <>
              ≈ {strip.rate}
              <span className="ml-1 text-[11px] font-medium opacity-70 sm:text-[12px]">/min</span>
            </>
          ) : (
            <span className="text-[15px] sm:text-[18px]">kaoottinen</span>
          )}
        </div>
      </div>
    </>
  )
}

function Monitor({ id, label, reduce }: { id: RhythmId; label: string; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.2 })
  return (
    <div className="rounded-[18px] p-1.5 shadow-[var(--shadow)]" style={{ background: '#0c1110' }}>
      <div
        ref={ref}
        role="img"
        aria-label={label}
        className="relative w-full overflow-hidden rounded-xl"
        // isolation + own layer: keeps the rounded clip working in Safari while the strip animates on the compositor
        style={{ aspectRatio: `${SCREEN_W} / ${SCREEN_H}`, background: SCREEN_BG, isolation: 'isolate', transform: 'translateZ(0)' }}
      >
        <MonitorGrid />
        <AnimatePresence initial={false}>
          <motion.div
            key={id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.45, ease: [0.23, 1, 0.32, 1] }}
          >
            <TraceLayer id={id} playing={inView && !reduce} reduce={reduce} />
          </motion.div>
        </AnimatePresence>

        {/* Edge fades + glass */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[8%]"
          style={{ background: `linear-gradient(to right, ${SCREEN_BG}, rgba(4,8,7,0))` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[3%]"
          style={{ background: `linear-gradient(to left, ${SCREEN_BG}, rgba(4,8,7,0))` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 28px rgba(0,0,0,0.55)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-2.5 top-2 flex items-baseline gap-2 text-[11px] font-semibold sm:left-3.5 sm:top-3"
          style={{ color: 'rgba(74,222,128,0.62)' }}
          aria-hidden
        >
          <span className="text-[12px]" style={{ color: GREEN }}>
            II
          </span>
          <span className="font-medium tabular-nums">25 mm/s</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Info panel                                                           */
/* ------------------------------------------------------------------ */

function RhythmFacts({ r, reduce }: { r: Rhythm; reduce: boolean }) {
  const hasCare = r.care.length > 0
  return (
    <motion.div
      key={r.id}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', duration: 0.45, bounce: 0 }}
      className={`grid gap-2.5 ${hasCare ? 'sm:grid-cols-2' : ''}`}
    >
      <section className="rounded-xl bg-[var(--bg)] px-3.5 py-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider !text-[var(--text-dim)]">Tunnistepiirteet</h4>
        <ul className="mt-2 space-y-1.5">
          {r.features.map((f) => (
            <li key={f} className="flex gap-2.5 text-[13.5px] leading-snug text-[var(--text-dim)]">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
              <span>{rich(f)}</span>
            </li>
          ))}
        </ul>
      </section>
      {hasCare && (
        <section className="rounded-xl border border-brand-500/25 bg-brand-500/[0.06] px-3.5 py-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider !text-brand-600">Ensihoidossa</h4>
          <ul className="mt-2 space-y-1.5">
            {r.care.map((c) => {
              const item = typeof c === 'string' ? { text: c, tone: undefined } : c
              const dot = item.tone === 'danger' ? 'bg-danger-500' : 'bg-brand-500'
              const color =
                item.tone === 'danger' ? 'text-danger-500' : item.tone === 'warning' ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'
              return (
                <li key={item.text} className={`flex gap-2.5 text-[13.5px] leading-snug ${color}`}>
                  <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
                  <span className={item.tone === 'danger' ? '[&_strong]:!text-danger-500' : ''}>{rich(item.text)}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </motion.div>
  )
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bg)] text-[var(--text)] transition-transform duration-150 ease-out active:scale-[0.94]"
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Quiz                                                                 */
/* ------------------------------------------------------------------ */

interface Quiz {
  target: RhythmId
  options: RhythmId[]
  picked: RhythmId | null
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeQuestion(avoid?: RhythmId): Quiz {
  const pool = RHYTHMS.map((r) => r.id).filter((id) => id !== avoid)
  const target = pool[Math.floor(Math.random() * pool.length)]
  const distractors = shuffle(RHYTHMS.map((r) => r.id).filter((id) => id !== target)).slice(0, 3)
  return { target, options: shuffle([target, ...distractors]), picked: null }
}

/* ------------------------------------------------------------------ */
/* Widget                                                               */
/* ------------------------------------------------------------------ */

export default function EcgRhythms(_props: WidgetProps) {
  const reduce = useReducedMotion() ?? false
  const [selected, setSelected] = useState<RhythmId>('sinus')
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const tabsRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const shown = quiz ? quiz.target : selected
  const rhythm = BY_ID[shown]
  const index = RHYTHMS.findIndex((r) => r.id === selected)

  const step = useCallback(
    (dir: 1 | -1) => setSelected(RHYTHMS[(index + dir + RHYTHMS.length) % RHYTHMS.length].id),
    [index],
  )

  // Keep the active tab centred in the scrollable segmented control (horizontal only — never scroll the page).
  useEffect(() => {
    if (quiz) return
    const tab = tabsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    const list = tab?.parentElement
    if (!tab || !list) return
    const t = tab.getBoundingClientRect()
    const l = list.getBoundingClientRect()
    const delta = t.left - l.left - (l.width - t.width) / 2
    if (Math.abs(delta) > 2) list.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' })
  }, [selected, quiz, reduce])

  // Edge fades hint that the rhythm tabs scroll sideways.
  useEffect(() => {
    if (quiz) return
    const list = tabsRef.current?.querySelector<HTMLElement>('[role="tablist"]')
    if (!list) return
    const update = () => {
      const start = list.scrollLeft < 4
      const end = list.scrollLeft + list.clientWidth >= list.scrollWidth - 4
      setEdges((e) => (e.start === start && e.end === end ? e : { start, end }))
    }
    update()
    list.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      list.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [quiz])

  const startQuiz = () => {
    setScore({ right: 0, total: 0 })
    setQuiz(makeQuestion(selected))
  }
  const exitQuiz = () => {
    if (quiz) setSelected(quiz.target)
    setQuiz(null)
  }
  const answer = (id: RhythmId) => {
    if (!quiz || quiz.picked) return
    setQuiz({ ...quiz, picked: id })
    setScore((s) => ({ right: s.right + (id === quiz.target ? 1 : 0), total: s.total + 1 }))
  }
  const nextQuestion = () => quiz && setQuiz(makeQuestion(quiz.target))

  const monitorLabel = quiz
    ? 'EKG-monitori: tunnistettava rytmi'
    : `EKG-monitori: ${rhythm.name}${rhythmStrip(shown).rate ? `, syke noin ${rhythmStrip(shown).rate}/min` : ''}`

  return (
    <div className="space-y-3">
      {/* Top bar: rhythm tabs or quiz header (same height, no layout jump) */}
      {quiz ? (
        <div className="flex min-h-[48px] items-center gap-2 rounded-xl bg-[var(--bg)] p-1 pl-3">
          <GraduationCap className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[var(--text)]">Tunnista rytmi</span>
          <span className="shrink-0 text-[12px] font-medium tabular-nums text-[var(--text-dim)]" aria-live="polite">
            {score.right}/{score.total} oikein
          </span>
          <button
            type="button"
            onClick={exitQuiz}
            className="min-h-[40px] shrink-0 rounded-lg bg-[var(--bg-raised)] px-3 text-[13px] font-medium text-[var(--text)] shadow-sm transition-transform duration-150 active:scale-[0.97]"
          >
            Lopeta
          </button>
        </div>
      ) : (
        <div ref={tabsRef} className="relative">
          <Segmented
            value={selected}
            onChange={setSelected}
            options={RHYTHMS.map((r) => ({ value: r.id, label: r.tab }))}
            layoutId="ecg-rhythm-tab"
            size="sm"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-8 rounded-l-xl transition-opacity duration-200"
            style={{ background: 'linear-gradient(to right, var(--bg), transparent)', opacity: edges.start ? 0 : 1 }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-xl transition-opacity duration-200"
            style={{ background: 'linear-gradient(to left, var(--bg), transparent)', opacity: edges.end ? 0 : 1 }}
            aria-hidden
          />
        </div>
      )}

      <Monitor id={shown} label={monitorLabel} reduce={reduce} />

      {quiz ? (
        <div className="space-y-3">
          <p className="font-display text-[16px] font-semibold text-[var(--text)]">Mikä rytmi monitorissa näkyy?</p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {quiz.options.map((id) => {
              const isTarget = id === quiz.target
              const isPicked = id === quiz.picked
              const done = quiz.picked !== null
              let cls = 'border-[var(--border)] text-[var(--text)]'
              if (done && isTarget) cls = 'border-teal-500 bg-teal-500/10 text-[var(--text)] font-semibold'
              else if (done && isPicked) cls = 'border-danger-500 bg-danger-500/10 text-danger-500'
              else if (done) cls = 'border-[var(--border)] text-[var(--text-dim)] opacity-60'
              return (
                <button
                  key={id}
                  type="button"
                  disabled={done}
                  onClick={() => answer(id)}
                  className={`flex min-h-[48px] items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-left text-[13.5px] transition-[background-color,border-color,opacity,transform] duration-150 ease-out active:scale-[0.99] ${cls}`}
                >
                  <span>{BY_ID[id].name}</span>
                  {done && isTarget && <Check className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />}
                  {done && isPicked && !isTarget && <X className="h-4 w-4 shrink-0 text-danger-500" aria-hidden />}
                </button>
              )
            })}
          </div>

          {quiz.picked && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0 }}
              className="space-y-3"
            >
              {quiz.picked === quiz.target ? (
                <Result tone="ok" title={`Oikein – ${rhythm.name}`} />
              ) : (
                <Result tone="danger" title="Ei aivan">
                  Oikea vastaus: <strong className="text-[var(--text)]">{rhythm.name}</strong>
                </Result>
              )}
              <RhythmFacts r={rhythm} reduce={reduce} />
              <button
                type="button"
                onClick={nextQuestion}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-[14px] font-semibold text-white shadow-sm transition-transform duration-150 ease-out active:scale-[0.98]"
              >
                Seuraava rytmi
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="font-display text-[18px] font-semibold leading-tight text-[var(--text)]">{rhythm.name}</p>
                {rhythm.tag && (
                  <span className="rounded-full bg-teal-500/12 px-2 py-0.5 text-[11px] font-semibold text-teal-600">{rhythm.tag}</span>
                )}
              </div>
              {rhythm.sub && <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--text-dim)]">{rhythm.sub}</p>}
            </div>
            <IconButton label="Edellinen rytmi" onClick={() => step(-1)}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </IconButton>
            <IconButton label="Seuraava rytmi" onClick={() => step(1)}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </IconButton>
          </div>

          <RhythmFacts r={rhythm} reduce={reduce} />

          <button
            type="button"
            onClick={startQuiz}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 text-[14px] font-medium text-[var(--text)] transition-transform duration-150 ease-out active:scale-[0.98]"
          >
            <GraduationCap className="h-4 w-4 text-brand-600" aria-hidden />
            Tunnista rytmi – harjoittele
          </button>
        </>
      )}
    </div>
  )
}
