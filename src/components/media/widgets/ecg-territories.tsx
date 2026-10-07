import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Activity, Check, RotateCcw, Shuffle, X } from 'lucide-react'
import { Result, Segmented, svg, type Tone } from '../ui'
import { useSvgId } from '../parts/cardio-hooks'

/* ------------------------------------------------------------------ data */

type Lead = 'I' | 'II' | 'III' | 'aVR' | 'aVL' | 'aVF' | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6' | 'V4R'
type TerritoryId = 'anterior' | 'inferior' | 'rv' | 'septal' | 'lateral'

interface Territory {
  id: TerritoryId
  name: string
  leadsLabel: string
  leads: Lead[]
  note: string
  extra?: string
  tone: Tone
}

const TERRITORIES: Territory[] = [
  {
    id: 'anterior',
    name: 'Etuseinä',
    leadsLabel: 'V2–V4',
    leads: ['V2', 'V3', 'V4'],
    note: 'Vaarallisin tyyppi – laaja vasemman sepelvaltimon alue.',
    tone: 'danger',
  },
  {
    id: 'inferior',
    name: 'Ala-/takaseinä',
    leadsLabel: 'II, III, aVF',
    leads: ['II', 'III', 'aVF'],
    note: 'Usein bradykardia ja hypotonia, kipu voi tuntua ylävatsalla.',
    extra: 'Suomalaisista sairaankuljettajista 84–92 % tunnisti nämä kytkennät oikein.',
    tone: 'brand',
  },
  {
    id: 'rv',
    name: 'Oikea kammio',
    leadsLabel: 'V4R',
    leads: ['V4R'],
    note: 'Liittyy ala-/takaseinäinfarktiin. Hypotensioriski nitraatin annon jälkeen – tarkista V4R ennen nitraattia.',
    tone: 'danger',
  },
  {
    id: 'septal',
    name: 'Väliseinä',
    leadsLabel: 'V1–V2',
    leads: ['V1', 'V2'],
    note: 'ST-nousu näkyy kytkennöissä V1–V2.',
    tone: 'brand',
  },
  {
    id: 'lateral',
    name: 'Korkea lateraalinen',
    leadsLabel: 'aVL',
    leads: ['aVL'],
    note: 'Muutos lähes vain aVL:ssä – helppo jäädä huomaamatta.',
    tone: 'brand',
  },
]

const BY_ID = Object.fromEntries(TERRITORIES.map((t) => [t.id, t])) as Record<TerritoryId, Territory>

/** Printed 12-lead layout: four columns, three rows. */
const GRID: Lead[] = ['I', 'aVR', 'V1', 'V4', 'II', 'aVL', 'V2', 'V5', 'III', 'aVF', 'V3', 'V6']
const ORDER: Lead[] = [...GRID.filter((_, i) => i % 4 === 0), ...GRID.filter((_, i) => i % 4 === 1), 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V4R']
const byOrder = (a: Lead, b: Lead) => ORDER.indexOf(a) - ORDER.indexOf(b)

/* --------------------------------------------------------- mini complex */

/** Schematic amplitudes (positive = up) – normal morphology differs per lead. */
interface Morph {
  p: number
  q: number
  r: number
  s: number
  t: number
}
const MORPH: Record<Lead, Morph> = {
  I: { p: 1.6, q: 0.8, r: 9, s: 1.5, t: 3 },
  II: { p: 2, q: 0.8, r: 12, s: 1.5, t: 3.5 },
  III: { p: 1.2, q: 0.8, r: 6.5, s: 2, t: 2 },
  aVR: { p: -1.6, q: 0, r: 2, s: 10, t: -2.8 },
  aVL: { p: 1, q: 0.8, r: 5.5, s: 1.5, t: 2 },
  aVF: { p: 1.6, q: 0.8, r: 9, s: 1.5, t: 2.8 },
  V1: { p: 1.2, q: 0, r: 3, s: 10, t: 1.4 },
  V2: { p: 1.4, q: 0, r: 5, s: 12, t: 3.5 },
  V3: { p: 1.4, q: 0, r: 8, s: 8, t: 4 },
  V4: { p: 1.4, q: 0.4, r: 12, s: 5, t: 4 },
  V5: { p: 1.4, q: 0.8, r: 12, s: 3, t: 3.5 },
  V6: { p: 1.4, q: 0.8, r: 10, s: 1.5, t: 3 },
  V4R: { p: 1.2, q: 0, r: 3, s: 6, t: 1.4 },
}

const BASE = 21
const ST = 6

/** Same command structure for normal and ST-elevated, so motion can morph between them. */
function complexPath(m: Morph, elevated: boolean): string {
  const y = (v: number) => (BASE - v).toFixed(2)
  const j = elevated ? ST : 0
  const tp = elevated ? Math.max(m.t, 0) + ST * 0.75 + 1 : m.t
  const c1 = elevated ? (BASE - ST - 1.6).toFixed(2) : y(0)
  return (
    `M0 ${y(0)} L9 ${y(0)} Q13.5 ${y(m.p * 2)} 18 ${y(0)} L24 ${y(0)} L26 ${y(-m.q)} L29 ${y(m.r)} L32.5 ${y(-m.s)} ` +
    `L35 ${y(j)} C39.5 ${c1} 43 ${y(tp)} 47 ${y(tp)} C51 ${y(tp)} 53 ${y(0)} 57 ${y(0)} L80 ${y(0)}`
  )
}

type TileState = 'normal' | 'stemi' | 'picked' | 'correct' | 'missed' | 'extra'

const tileSurface: Record<TileState, string> = {
  normal: 'border-[var(--border)] bg-[var(--bg-card)]',
  stemi: 'border-brand-500/50 bg-brand-500/10',
  picked: 'border-brand-500 bg-brand-500/5 shadow-[0_0_0_3px_rgba(248,105,10,0.18)]',
  correct: 'border-teal-500/70 bg-teal-500/10',
  missed: 'border-dashed border-brand-500/80 bg-brand-500/10',
  extra: 'border-danger-500/60 bg-danger-500/10',
}
const tileLabel: Record<TileState, string> = {
  normal: 'text-[var(--text)]',
  stemi: 'text-brand-600',
  picked: 'text-brand-600',
  correct: 'text-teal-600',
  missed: 'text-brand-600',
  extra: 'text-danger-500',
}
const tileStroke: Record<TileState, string> = {
  normal: svg.ink,
  stemi: svg.brand,
  picked: svg.ink,
  correct: svg.teal,
  missed: svg.brand,
  extra: svg.danger,
}

const PAPER =
  'linear-gradient(to right, color-mix(in srgb, var(--border) 65%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--border) 65%, transparent) 1px, transparent 1px)'

function Badge({ state }: { state: TileState }) {
  if (state === 'stemi') return <span className="font-display text-[10.5px] font-bold leading-none text-brand-600">ST↑</span>
  if (state === 'picked')
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  if (state === 'correct')
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  if (state === 'missed')
    return <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 font-display text-[11px] font-bold leading-none text-white">!</span>
  if (state === 'extra')
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-white">
        <X className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  return null
}

function LeadTile({ lead, state, onTap, reduce }: { lead: Lead; state: TileState; onTap?: () => void; reduce: boolean }) {
  const elevated = state === 'stemi' || state === 'correct' || state === 'missed'
  const body = (
    <>
      <span className="flex h-[18px] items-center justify-between px-2 pt-1.5">
        <span className={`font-display text-[12.5px] font-semibold leading-none transition-colors duration-200 ${tileLabel[state]}`}>{lead}</span>
        <AnimatePresence initial={false}>
          {state !== 'normal' && (
            <motion.span
              key={state}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.25 }}
              className="flex"
            >
              <Badge state={state} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="m-1 mt-1 block rounded-md" style={{ backgroundImage: PAPER, backgroundSize: '9px 9px', backgroundPosition: 'center' }}>
        <svg viewBox="0 0 80 36" className="block h-auto w-full" aria-hidden>
          <motion.path
            initial={false}
            animate={{ d: complexPath(MORPH[lead], elevated) }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.55, bounce: 0.15 }}
            fill="none"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ stroke: tileStroke[state], transition: 'stroke 200ms ease-out' }}
          />
        </svg>
      </span>
    </>
  )
  const cls = `relative block w-full overflow-hidden rounded-xl border text-left transition-[background-color,border-color,box-shadow] duration-200 ${tileSurface[state]}`
  if (onTap) {
    return (
      <motion.button
        type="button"
        onClick={onTap}
        whileTap={reduce ? undefined : { scale: 0.95 }}
        transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
        aria-pressed={state === 'picked'}
        aria-label={`Kytkentä ${lead}`}
        className={`${cls} min-h-[44px]`}
      >
        {body}
      </motion.button>
    )
  }
  return (
    <div className={cls} aria-label={`Kytkentä ${lead}${elevated ? ', ST-nousu' : ''}`} role="img">
      {body}
    </div>
  )
}

/* ------------------------------------------------------------ the heart */

const HEART =
  'M66 70C44 80 36 110 44 138C52 160 70 176 92 186C124 200 160 212 184 214C194 214 199 206 196 196C190 160 186 120 172 92C176 86 172 76 164 76C140 70 100 62 66 70Z'

/** Painted in this order; each later wall covers the earlier ones inside the heart outline. */
const REGIONS: { id: TerritoryId; d: string }[] = [
  { id: 'rv', d: HEART },
  { id: 'septal', d: 'M97 40L119 40L175 222L153 222Z' },
  { id: 'anterior', d: 'M119 40L260 40L260 222L175 222Z' },
  { id: 'lateral', d: 'M119 40L260 40L260 150L134 88Z' },
  { id: 'inferior', d: 'M0 150C70 158 150 182 240 186L240 240L0 240Z' },
]
const ATRIUM = 'M0 0L86 0C76 70 70 130 76 178L0 190Z'

const MUSCLE = 'rgba(220,38,38,0.10)'
const ATRIUM_FILL = 'rgba(220,38,38,0.05)'
const OUTLINE = 'color-mix(in srgb, var(--text) 38%, transparent)'

function Tube({ d, w }: { d: string; w: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={OUTLINE} strokeWidth={w + 3} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={svg.raised} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={MUSCLE} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

function HeartFigure({
  active,
  onSelect,
  reduce,
}: {
  active: TerritoryId
  onSelect?: (id: TerritoryId) => void
  reduce: boolean
}) {
  const clip = useSvgId('heart')
  return (
    <svg viewBox="0 0 224 222" className="h-auto w-full" role="img" aria-label={`Sydän edestä, korostettuna: ${BY_ID[active].name}`}>
      <defs>
        <clipPath id={clip}>
          <path d={HEART} />
        </clipPath>
      </defs>
      {/* great vessels, behind the heart */}
      <g aria-hidden>
        <rect x="64" y="10" width="20" height="68" rx="10" fill={svg.raised} stroke={OUTLINE} strokeWidth="1.5" />
        <rect x="64" y="10" width="20" height="68" rx="10" fill={MUSCLE} />
        <Tube d="M108 74L108 40C108 16 152 10 166 32L170 58" w={18} />
        <Tube d="M136 80C140 66 144 56 151 47" w={15} />
      </g>

      <g clipPath={`url(#${clip})`}>
        {REGIONS.map((r) => {
          const on = r.id === active
          return (
            <g
              key={r.id}
              onClick={onSelect ? () => onSelect(r.id) : undefined}
              style={{ cursor: onSelect ? 'pointer' : undefined }}
            >
              <path d={r.d} fill={svg.surface} />
              <path d={r.d} fill={MUSCLE} />
              <motion.path
                d={r.d}
                fill={svg.brand}
                initial={false}
                animate={on ? (reduce ? { opacity: 0.55 } : { opacity: [0.62, 0.42, 0.62] }) : { opacity: 0 }}
                transition={
                  on && !reduce
                    ? { opacity: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }
                    : { duration: reduce ? 0 : 0.25, ease: 'easeOut' }
                }
              />
              <path d={r.d} fill="none" stroke={svg.surface} strokeWidth="2.5" strokeLinejoin="round" />
            </g>
          )
        })}
        <path d={ATRIUM} fill={svg.surface} />
        <path d={ATRIUM} fill={ATRIUM_FILL} stroke={svg.surface} strokeWidth="2.5" />
      </g>
      <path d={HEART} fill="none" stroke={OUTLINE} strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

/* ------------------------------------------------------------- widget */

function TerritoryList({ value, onChange }: { value: TerritoryId; onChange: (id: TerritoryId) => void }) {
  return (
    <div className="flex flex-col gap-1" role="radiogroup" aria-label="Infarktin sijainti">
      {TERRITORIES.map((t) => {
        const on = t.id === value
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(t.id)}
            className="relative flex min-h-[46px] w-full flex-col justify-center rounded-xl px-3 py-1.5 text-left transition-transform duration-150 ease-out active:scale-[0.98]"
          >
            {on && (
              <motion.span
                layoutId="ecg-territory-pill"
                className="absolute inset-0 rounded-xl border border-brand-500/60 bg-brand-500/10"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className={`relative font-display text-[13.5px] font-semibold leading-tight ${on ? 'text-[var(--text)]' : 'text-[var(--text)]/80'}`}>{t.name}</span>
            <span className={`relative text-[12px] font-medium leading-tight tabular-nums ${on ? 'text-brand-600' : 'text-[var(--text-dim)]'}`}>{t.leadsLabel}</span>
          </button>
        )
      })}
    </div>
  )
}

interface Quiz {
  target: TerritoryId
  picked: Lead[]
  checked: boolean
}

function randomTerritory(not?: TerritoryId): TerritoryId {
  const pool = TERRITORIES.filter((t) => t.id !== not)
  return pool[Math.floor(Math.random() * pool.length)].id
}

const list = (leads: Lead[]) => (leads.length ? [...leads].sort(byOrder).join(', ') : '–')

export default function EcgTerritories() {
  const reduce = useReducedMotion() ?? false
  const [mode, setMode] = useState<'explore' | 'quiz'>('explore')
  const [sel, setSel] = useState<TerritoryId>('inferior')
  const [quiz, setQuiz] = useState<Quiz>(() => ({ target: randomTerritory(), picked: [], checked: false }))
  const [score, setScore] = useState({ right: 0, total: 0 })

  const quizMode = mode === 'quiz'
  const territory = BY_ID[quizMode ? quiz.target : sel]
  const involved = new Set<Lead>(territory.leads)
  const picked = new Set<Lead>(quiz.picked)

  const stateFor = (lead: Lead): TileState => {
    if (!quizMode) return involved.has(lead) ? 'stemi' : 'normal'
    if (!quiz.checked) return picked.has(lead) ? 'picked' : 'normal'
    if (involved.has(lead)) return picked.has(lead) ? 'correct' : 'missed'
    return picked.has(lead) ? 'extra' : 'normal'
  }

  const toggle = (lead: Lead) =>
    setQuiz((q) => (q.checked ? q : { ...q, picked: q.picked.includes(lead) ? q.picked.filter((l) => l !== lead) : [...q.picked, lead] }))

  const correct = territory.leads.filter((l) => picked.has(l))
  const missed = territory.leads.filter((l) => !picked.has(l))
  const extra = quiz.picked.filter((l) => !involved.has(l))
  const perfect = missed.length === 0 && extra.length === 0

  const check = () => {
    setQuiz((q) => ({ ...q, checked: true }))
    setScore((s) => ({ right: s.right + (perfect ? 1 : 0), total: s.total + 1 }))
  }
  const next = () => setQuiz((q) => ({ target: randomTerritory(q.target), picked: [], checked: false }))

  const tile = (lead: Lead) => (
    <LeadTile key={lead} lead={lead} state={stateFor(lead)} reduce={reduce} onTap={quizMode && !quiz.checked ? () => toggle(lead) : undefined} />
  )

  return (
    <div className="@container">
      <Segmented
        layoutId="ecg-territories-mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'explore', label: 'Tutki' },
          { value: 'quiz', label: 'Testaa itsesi' },
        ]}
      />

      <div className="mt-3 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-3 @lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @lg:gap-5">
        <div className="mx-auto w-full max-w-[260px]">
          <HeartFigure active={territory.id} reduce={reduce} onSelect={quizMode ? undefined : setSel} />
        </div>

        {quizMode ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Infarktin sijainti</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={quiz.target}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="mt-0.5 font-display text-[18px] font-semibold leading-tight text-brand-600"
              >
                {territory.name}
              </motion.p>
            </AnimatePresence>
            <p className="mt-1.5 text-[13px] leading-snug text-[var(--text-dim)]">Napauta kytkennät, joissa näkyy ST-nousu.</p>
            <p className="mt-2.5 text-[12px] text-[var(--text-dim)]">
              Oikein{' '}
              <span className="font-display text-[14px] font-semibold tabular-nums text-[var(--text)]">
                {score.right}/{score.total}
              </span>
            </p>
          </div>
        ) : (
          <TerritoryList value={sel} onChange={setSel} />
        )}
      </div>

      {!quizMode && (
        <div className="mt-3">
          <Result tone={territory.tone} title={`ST-nousu: ${territory.leadsLabel}`}>
            <p>{territory.note}</p>
            {territory.extra && <p className="mt-1">{territory.extra}</p>}
          </Result>
        </div>
      )}

      <div className="mt-3">
        <div className="grid grid-cols-4 gap-1.5">{GRID.map(tile)}</div>
        <div className="mt-1.5 grid grid-cols-4 items-center gap-1.5">
          {tile('V4R')}
          <p className="col-span-3 pl-1 text-[12px] leading-snug text-[var(--text-dim)]">
            Oikean puolen kytkentä <span className="font-semibold text-[var(--text)]">V4R</span>
          </p>
        </div>
      </div>

      {quizMode && (
        <div className="mt-3">
          {quiz.checked ? (
            <div className="space-y-3">
              <Result
                tone={perfect ? 'ok' : 'warning'}
                title={perfect ? 'Oikein!' : correct.length ? 'Osittain oikein' : 'Ei vielä – katso oikeat kytkennät'}
              >
                <p className="tabular-nums">
                  <span className="font-semibold text-teal-600">Oikein:</span> {list(correct)}
                  {missed.length > 0 && (
                    <>
                      {' · '}
                      <span className="font-semibold text-brand-600">Puuttui:</span> {list(missed)}
                    </>
                  )}
                  {extra.length > 0 && (
                    <>
                      {' · '}
                      <span className="font-semibold text-danger-500">Ylimääräiset:</span> {list(extra)}
                    </>
                  )}
                </p>
                <p className="mt-1">{territory.note}</p>
              </Result>
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-5 text-[14px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-transform duration-150 ease-out active:scale-[0.98]"
              >
                <Shuffle className="h-4 w-4" /> Uusi kohde
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuiz((q) => ({ ...q, picked: [] }))}
                disabled={quiz.picked.length === 0}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[var(--border)] px-4 text-[13px] font-semibold text-[var(--text)] transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" /> Tyhjennä
              </button>
              <button
                type="button"
                onClick={check}
                disabled={quiz.picked.length === 0}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 px-5 text-[14px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-[opacity,transform] duration-150 ease-out active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
              >
                <Check className="h-4 w-4" strokeWidth={2.5} /> Tarkista
              </button>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-[var(--text-dim)]">
        <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" strokeWidth={2.25} />
        <span>Kaikilta rintakipupotilailta rekisteröidään 15-kytkentäinen EKG.</span>
      </p>
    </div>
  )
}
