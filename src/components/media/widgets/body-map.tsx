import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Check, ChevronLeft, ChevronRight, Droplet, HeartPulse, Pause, Play, TrendingDown, TriangleAlert, X } from 'lucide-react'
import { Caption, Segmented, svg } from '../ui'
import { BODY_GAP, BodyShapePath, BodySilhouette, type BodyPart, type BodyShape } from '../parts/body-silhouette'

/* Vammapotilaan kehokartta – articles: liikenneonnettomuus (RiVaLAiSeR) + traumapotilaan-tutkiminen. */

type Mode = 'order' | 'bleed'
type StepId = 'chest' | 'abdomen' | 'pelvis' | 'head' | 'back' | 'limbs'
type SiteId = 'thorax' | 'abdomen' | 'pelvis' | 'femur' | 'floor'

interface Step {
  id: StepId
  n: number
  letters: string
  title: string
  hot: { x: number; y: number }
  front: BodyPart[]
  back: BodyPart[]
  checks: string[]
  typical?: string[]
  note?: { tone: 'warning' | 'danger'; text: string }
  kkk?: boolean
}

const LIMBS: BodyPart[] = ['armR', 'armL', 'legR', 'legL']

const STEPS: Step[] = [
  {
    id: 'chest',
    n: 1,
    letters: 'Ri',
    title: 'Rintakehä',
    hot: { x: 100, y: 110 },
    front: ['chest'],
    back: [],
    checks: ['Näkyvät vammat, stabiilius ja aristukset', 'Krepitaatio', 'Hengitysmekaniikka ja -äänet: puolierot, paradoksaalinen liike'],
    typical: ['Kylkiluun murtuma', 'Keuhkoruhje', 'Ilmarinta', 'Jänniteilmarinta'],
  },
  {
    id: 'abdomen',
    n: 2,
    letters: 'Va',
    title: 'Vatsa',
    hot: { x: 100, y: 174 },
    front: ['abdomen'],
    back: [],
    checks: ['Näkyvät vammat, esim. turvavyön jälki', 'Tunnustelu kauttaaltaan, myös kylkikaarilta', 'Aristus – onko vatsa pehmeä vai kova?'],
    note: { tone: 'warning', text: 'Vuoto voi olla huomattava ilman ulkoisia merkkejä.' },
  },
  {
    id: 'pelvis',
    n: 3,
    letters: 'L',
    title: 'Lantio',
    hot: { x: 100, y: 219 },
    front: ['pelvis'],
    back: [],
    checks: ['Kipu ja näkyvät vammat', 'Alaraajojen pituusero tai rotaatio'],
    note: { tone: 'danger', text: 'Älä paina tai heiluttele lantiota turhaan – se voi rikkoa hyytymän. Epäilyssä lantiovyö.' },
  },
  {
    id: 'head',
    n: 4,
    letters: 'Ai',
    title: 'Aivot (pää)',
    hot: { x: 100, y: 32 },
    front: ['headNeck'],
    back: [],
    checks: [
      'Kallon ja kasvojen palpaatio, murtumalinjat',
      'Verenvuoto tai kirkas neste korvista tai nenästä',
      'Kallonpohjanmurtuman merkit: ”pesukarhusilmät”, korvan takainen mustelma (Battlen merkki)',
    ],
  },
  {
    id: 'back',
    n: 5,
    letters: 'Se',
    title: 'Selkä',
    hot: { x: 250, y: 150 },
    front: [],
    back: ['upperBack', 'lowerBack'],
    checks: ['Tarkistus blokkikäännön aikana', 'Rankakivut', 'Puutuminen tai lihasheikkous – neurologiset puutosoireet'],
  },
  {
    id: 'limbs',
    n: 6,
    letters: 'R',
    title: 'Raajat',
    hot: { x: 114, y: 292 },
    front: LIMBS,
    back: LIMBS,
    checks: ['Sykkeet, liike ja tunto molemmin puolin', 'Virheasennot ja avomurtumat'],
    note: { tone: 'warning', text: 'Pitkän luun murtuma voi vuotaa useita litroja.' },
    kkk: true,
  },
]

interface Site {
  id: SiteId
  title: string
  sub?: string
  labelY: number
  from: { x: number; y: number }
  blobs: { cx: number; cy: number; rx: number; ry: number }[]
  text: string
}

const SITES: Site[] = [
  {
    id: 'thorax',
    title: 'Rintaontelo',
    labelY: 114,
    from: { x: 126, y: 120 },
    blobs: [{ cx: 100, cy: 122, rx: 27, ry: 19 }],
    text: 'Katso hengitysliikkeiden symmetria ja kuuntele hengitysäänten puolierot.',
  },
  {
    id: 'abdomen',
    title: 'Vatsaontelo',
    labelY: 168,
    from: { x: 123, y: 175 },
    blobs: [{ cx: 100, cy: 176, rx: 24, ry: 17 }],
    text: 'Vatsaontelon vuoto voi olla huomattava ilman selkeitä ulkoisia merkkejä.',
  },
  {
    id: 'pelvis',
    title: 'Lantio',
    labelY: 220,
    from: { x: 121, y: 215 },
    blobs: [{ cx: 100, cy: 215, rx: 22, ry: 11 }],
    text: 'Älä paina tai heiluttele lantiota turhaan – hyytymä voi rikkoutua. Epäilyssä lantiovyö.',
  },
  {
    id: 'femur',
    title: 'Pitkät luut',
    sub: 'reidet',
    labelY: 272,
    from: { x: 125, y: 262 },
    blobs: [
      { cx: 83.5, cy: 262, rx: 10, ry: 23 },
      { cx: 116.5, cy: 262, rx: 10, ry: 23 },
    ],
    text: 'Pitkän luun murtuma voi vuotaa useita litroja.',
  },
  {
    id: 'floor',
    title: 'Verta lattialla',
    sub: 'ulkoinen vuoto',
    labelY: 394,
    from: { x: 166, y: 401 },
    blobs: [],
    text: 'Ulkoinen vuoto näkyy. Henkeä uhkaava ulkoinen vuoto tyrehdytetään heti (c), jopa ennen hengitystien varmistamista: suora paine, tarvittaessa kiristysside.',
  },
]

const FACTS = [
  { Icon: Droplet, text: 'Rintaontelo, vatsaontelo, lantio ja pitkät luut voivat piilottaa litroja verta ilman ulkoista vuotoa.' },
  { Icon: HeartPulse, text: 'Takykardia on vammapotilaalla verenvuodon merkki, kunnes toisin todistetaan.' },
  { Icon: TrendingDown, text: 'Verenpaine laskee usein vasta, kun noin kolmannes verivolyymista on menetetty.' },
]

/* One SVG holds both figures: front at x 0–200, back shifted by BACK_DX. */
const BACK_DX = 150
const VB = { x: 26, y: 2, w: 298, h: 424 }
const LABEL_X = 171
const STEP_MS = 6500
const PUDDLE =
  'M124 403.5C124 399.5 133 398.6 141 399.4C150 398.4 166 399.6 166.5 403.4C167 407 156 408.4 146 407.8C135 408.6 124 407.6 124 403.5Z'

const pct = (x: number, y: number) => ({
  left: `${((x - VB.x) / VB.w) * 100}%`,
  top: `${((y - VB.y) / VB.h) * 100}%`,
})

const spring = { type: 'spring', duration: 0.45, bounce: 0.15 } as const

function Region({ shape, on, reduce }: { shape: BodyShape; on: boolean; reduce: boolean }) {
  return (
    <>
      <BodyShapePath shape={shape} />
      <AnimatePresence initial={false}>
        {on && (
          <motion.path
            key="on"
            d={shape.d}
            fill={svg.brand}
            stroke={svg.raised}
            strokeWidth={BODY_GAP}
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.88 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0 }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function StepCard({ step }: { step: Step }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 font-display text-[13px] font-bold text-white">
          {step.n}
        </span>
        <p className="min-w-0 flex-1 font-display text-[16px] font-semibold text-[var(--text)]">{step.title}</p>
        <span className="shrink-0 text-[12px] tabular-nums text-[var(--text-dim)]">{step.n}/6</span>
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {step.checks.map((c) => (
          <li key={c} className="flex gap-2 text-[13.5px] leading-snug text-[var(--text)]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={2.5} aria-hidden />
            <span>{c}</span>
          </li>
        ))}
      </ul>
      {step.typical && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Tyypillisiä vammoja</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {step.typical.map((t) => (
              <span key={t} className="rounded-full bg-[var(--bg)] px-2.5 py-1 text-[12px] font-medium text-[var(--text)]">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
      {step.note && (
        <p
          className={`mt-3 flex gap-2 rounded-lg px-3 py-2 text-[13px] leading-snug text-[var(--text)] ${
            step.note.tone === 'danger' ? 'bg-danger-500/10' : 'bg-brand-500/10'
          }`}
        >
          <TriangleAlert
            className={`mt-0.5 h-4 w-4 shrink-0 ${step.note.tone === 'danger' ? 'text-danger-500' : 'text-brand-600'}`}
            aria-hidden
          />
          <span>{step.note.text}</span>
        </p>
      )}
      {step.kkk && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="mr-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">KKK</span>
          {['Kylmä', 'Kohotus', 'Kompressi'].map((w) => (
            <span key={w} className="rounded-full bg-teal-500/10 px-2.5 py-1 text-[12px] font-semibold text-teal-600">
              {w}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BodyMap() {
  const reduce = useReducedMotion() ?? false
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { amount: 0.25 })

  const [mode, setMode] = useState<Mode>('order')
  const [active, setActive] = useState<StepId | null>(null)
  const [touring, setTouring] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [site, setSite] = useState<SiteId | null>(null)

  const idx = STEPS.findIndex((s) => s.id === active)
  const step = idx >= 0 ? STEPS[idx] : null
  const running = touring && playing && inView && !reduce

  useEffect(() => {
    if (!running) return
    const t = window.setTimeout(() => {
      if (idx < STEPS.length - 1) setActive(STEPS[idx + 1].id)
      else setPlaying(false)
    }, STEP_MS)
    return () => window.clearTimeout(t)
  }, [running, idx])

  const front = new Set<BodyPart>(mode === 'order' && step ? step.front : [])
  const back = new Set<BodyPart>(mode === 'order' && step ? step.back : [])

  const changeMode = (m: Mode) => {
    setMode(m)
    setTouring(false)
    setPlaying(false)
  }
  const startTour = () => {
    setActive('chest')
    setTouring(true)
    setPlaying(!reduce)
  }
  const stopTour = () => {
    setTouring(false)
    setPlaying(false)
  }
  const next = () => {
    if (idx < STEPS.length - 1) setActive(STEPS[idx + 1].id)
    else stopTour()
  }
  const prev = () => {
    if (idx > 0) setActive(STEPS[idx - 1].id)
  }

  const fade = reduce ? { duration: 0 } : { duration: 0.25, ease: [0.23, 1, 0.32, 1] as const }
  const selectedSite = SITES.find((s) => s.id === site) ?? null

  return (
    <div ref={rootRef} className="@container space-y-3">
      <Segmented
        value={mode}
        onChange={changeMode}
        layoutId={`${uid}-mode`}
        options={[
          { value: 'order', label: 'Tutkimisjärjestys' },
          { value: 'bleed', label: 'Piilovuodot' },
        ]}
      />

      <div className="grid gap-4 @lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)] @lg:items-start">
        {/* ---------- figure ---------- */}
        <div className="relative mx-auto w-full max-w-[300px]">
          <svg
            viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
            className="block h-auto w-full"
            role="img"
            aria-label={
              mode === 'order'
                ? 'Ihmiskeho edestä ja takaa. Numerot näyttävät tutkimisjärjestyksen: rintakehä, vatsa, lantio, aivot, selkä, raajat.'
                : 'Ihmiskeho edestä. Piilovuodon paikat: rintaontelo, vatsaontelo, lantio ja reidet sekä verta lattialla.'
            }
          >
            <defs>
              <radialGradient id={`${uid}-blood`}>
                <stop offset="0%" stopColor={svg.danger} stopOpacity={0.92} />
                <stop offset="62%" stopColor={svg.danger} stopOpacity={0.55} />
                <stop offset="100%" stopColor={svg.danger} stopOpacity={0} />
              </radialGradient>
            </defs>

            {/* front */}
            <BodySilhouette view="front" renderShape={(s) => <Region shape={s} on={front.has(s.id)} reduce={reduce} />} />

            {/* back */}
            <motion.g initial={false} animate={{ opacity: mode === 'order' ? 1 : 0 }} transition={fade} aria-hidden={mode !== 'order'}>
              <g transform={`translate(${BACK_DX} 0)`}>
                <BodySilhouette view="back" renderShape={(s) => <Region shape={s} on={back.has(s.id)} reduce={reduce} />} />
              </g>
            </motion.g>

            {/* hidden bleeding */}
            <AnimatePresence initial={false}>
              {mode === 'bleed' && (
                <motion.g key="bleed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
                  <path d="M42 404.5H172" stroke={svg.dim} strokeOpacity={0.35} strokeWidth={1.2} strokeLinecap="round" />
                  {SITES.map((s, i) => {
                    const on = site === s.id
                    const dimmed = site !== null && !on
                    const loop = !reduce && inView && !dimmed
                    return (
                      <g key={s.id}>
                        <path
                          d={`M${s.from.x} ${s.from.y}L${LABEL_X - 3} ${s.labelY}`}
                          stroke={on ? svg.danger : svg.dim}
                          strokeOpacity={on ? 0.9 : 0.45}
                          strokeWidth={on ? 1.4 : 1}
                          strokeLinecap="round"
                          fill="none"
                        />
                        <circle cx={s.from.x} cy={s.from.y} r={1.8} fill={on ? svg.danger : svg.dim} fillOpacity={on ? 1 : 0.6} />
                        {s.id === 'floor' ? (
                          <g onClick={() => setSite(s.id)} style={{ cursor: 'pointer' }}>
                            <motion.path
                              d={PUDDLE}
                              fill={svg.danger}
                              initial={false}
                              animate={{ opacity: dimmed ? 0.45 : 0.9 }}
                              transition={fade}
                            />
                            <ellipse cx={137} cy={401.6} rx={6} ry={1.1} fill={svg.raised} fillOpacity={0.4} />
                          </g>
                        ) : (
                          s.blobs.map((b, j) => (
                            <g key={j} onClick={() => setSite(s.id)} style={{ cursor: 'pointer' }}>
                              <motion.ellipse
                                cx={b.cx}
                                cy={b.cy}
                                rx={b.rx}
                                ry={b.ry}
                                fill={`url(#${uid}-blood)`}
                                initial={false}
                                animate={loop ? { opacity: [0.6, 1, 0.6] } : { opacity: dimmed ? 0.35 : 0.85 }}
                                transition={
                                  loop ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 } : fade
                                }
                              />
                              <motion.ellipse
                                cx={b.cx}
                                cy={b.cy}
                                rx={b.rx}
                                ry={b.ry}
                                fill="none"
                                stroke={svg.danger}
                                strokeWidth={1.3}
                                initial={false}
                                animate={{ opacity: on ? 0.9 : 0 }}
                                transition={fade}
                              />
                            </g>
                          ))
                        )}
                      </g>
                    )
                  })}
                </motion.g>
              )}
            </AnimatePresence>
          </svg>

          {/* view captions */}
          <AnimatePresence initial={false}>
            {mode === 'order' &&
              [
                { x: 100, t: 'Etupuoli' },
                { x: 100 + BACK_DX, t: 'Takapuoli' },
              ].map((c) => (
                <motion.span
                  key={c.t}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                  style={pct(c.x, 417)}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]"
                >
                  {c.t}
                </motion.span>
              ))}
          </AnimatePresence>

          {/* numbered hotspots */}
          <AnimatePresence initial={false}>
            {mode === 'order' &&
              STEPS.map((s) => {
                const on = active === s.id
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fade}
                    style={pct(s.hot.x, s.hot.y)}
                    onClick={() => setActive(s.id)}
                    aria-label={`${s.n}. ${s.title}`}
                    aria-pressed={on}
                    className="absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                  >
                    {on && !reduce && inView && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-0 m-auto h-7 w-7 rounded-full bg-brand-500/45"
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 1.9, opacity: 0 }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                    <motion.span
                      initial={false}
                      animate={{ scale: on ? 1.14 : 1 }}
                      transition={reduce ? { duration: 0 } : spring}
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full font-display text-[13px] font-bold shadow-[0_1px_4px_rgba(0,0,0,0.18)] ring-1 transition-colors duration-150 ${
                        on ? 'bg-brand-500 text-white ring-brand-600' : 'bg-[var(--bg-raised)] text-[var(--text)] ring-[var(--border)]'
                      }`}
                    >
                      {s.n}
                    </motion.span>
                  </motion.button>
                )
              })}
          </AnimatePresence>

          {/* hidden-bleeding labels */}
          <AnimatePresence initial={false}>
            {mode === 'bleed' &&
              SITES.map((s) => {
                const on = site === s.id
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fade}
                    style={pct(LABEL_X, s.labelY)}
                    onClick={() => setSite(on ? null : s.id)}
                    aria-pressed={on}
                    className={`absolute z-10 flex min-h-[44px] max-w-[49%] -translate-y-1/2 flex-col justify-center rounded-lg px-2 text-left ring-1 transition-colors duration-150 ${
                      on ? 'bg-danger-500/10 ring-danger-500/50' : 'bg-[var(--bg-raised)]/90 ring-[var(--border)]'
                    }`}
                  >
                    <span className={`text-[12.5px] font-semibold leading-tight ${on ? 'text-danger-500' : 'text-[var(--text)]'}`}>{s.title}</span>
                    {s.sub && <span className="text-[11px] leading-tight text-[var(--text-dim)]">{s.sub}</span>}
                  </motion.button>
                )
              })}
          </AnimatePresence>
        </div>

        {/* ---------- side panel ---------- */}
        <div className="min-w-0 space-y-3">
          {mode === 'order' ? (
            <>
              <div className="no-select grid grid-cols-6 gap-1 rounded-xl bg-[var(--bg)] p-1" role="group" aria-label="RiVaLAiSeR-järjestys">
                {STEPS.map((s) => {
                  const on = active === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActive(s.id)}
                      aria-pressed={on}
                      aria-label={`${s.n}. ${s.title}`}
                      className={`relative flex min-h-[48px] flex-col items-center justify-center rounded-lg transition-colors duration-150 ${
                        on ? 'text-white' : 'text-[var(--text)]'
                      }`}
                    >
                      {on && (
                        <motion.span
                          layoutId={`${uid}-mn`}
                          className="absolute inset-0 rounded-lg bg-brand-500 shadow-sm"
                          transition={reduce ? { duration: 0 } : spring}
                        />
                      )}
                      <span className={`relative text-[10px] font-semibold tabular-nums ${on ? 'text-white/80' : 'text-[var(--text-dim)]'}`}>{s.n}</span>
                      <span className="relative font-display text-[17px] font-bold leading-none">{s.letters}</span>
                    </button>
                  )
                })}
              </div>

              <div className="min-h-[150px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active ?? 'intro'}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: reduce ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {step ? (
                      <StepCard step={step} />
                    ) : (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-[13.5px] leading-relaxed text-[var(--text)]">
                        <p className="font-display text-[15px] font-semibold">Täydennetty tilannearvio</p>
                        <p className="mt-1 text-[var(--text-dim)]">
                          Tehdään, kun peruselintoiminnot on turvattu – kriittisyysjärjestyksessä rintakehä → vatsa → lantio → aivot →
                          selkä → raajat. Napauta numeroa tai käy alueet läpi järjestyksessä.
                        </p>
                        <p className="mt-2 text-[12.5px] text-[var(--text-dim)]">Ei saa viivyttää kuljetusta hätätilapotilaalla.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {!touring ? (
                <button
                  type="button"
                  onClick={startTour}
                  className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-[14px] font-semibold text-white shadow-sm transition-transform duration-150 ease-out active:scale-[0.98]"
                >
                  <Play className="h-4 w-4" fill="currentColor" aria-hidden />
                  Käy läpi järjestyksessä
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prev}
                      disabled={idx <= 0}
                      aria-label="Edellinen"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text)] transition-transform duration-150 active:scale-[0.96] disabled:opacity-35"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden />
                    </button>
                    {!reduce && (
                      <button
                        type="button"
                        onClick={() => setPlaying((p) => !p)}
                        aria-label={playing ? 'Pysäytä automaattinen eteneminen' : 'Jatka automaattisesti'}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text)] transition-transform duration-150 active:scale-[0.96]"
                      >
                        {playing ? <Pause className="h-4 w-4" fill="currentColor" aria-hidden /> : <Play className="h-4 w-4" fill="currentColor" aria-hidden />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={next}
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-xl bg-brand-500 px-3 text-[14px] font-semibold text-white shadow-sm transition-transform duration-150 ease-out active:scale-[0.98]"
                    >
                      {idx >= STEPS.length - 1 ? 'Valmis' : 'Seuraava'}
                      {idx < STEPS.length - 1 && <ChevronRight className="h-4 w-4" aria-hidden />}
                    </button>
                    <button
                      type="button"
                      onClick={stopTour}
                      aria-label="Lopeta läpikäynti"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--text-dim)] transition-transform duration-150 active:scale-[0.96]"
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                  <div className="flex gap-1" aria-hidden>
                    {STEPS.map((s, i) => (
                      <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                        {i < idx || (i === idx && !running) ? (
                          <div className="h-full w-full bg-brand-500" />
                        ) : i === idx ? (
                          <motion.div
                            key={`${active}-${playing}`}
                            className="h-full w-full origin-left bg-brand-500"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Caption>RiVaLAiSeR: rintakehä, vatsa, lantio, aivot, selkä, raajat – kehon alueet kriittisyysjärjestyksessä.</Caption>
            </>
          ) : (
            <>
              <div className="min-h-[92px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={site ?? 'none'}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: reduce ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
                  >
                    {selectedSite ? (
                      <>
                        <p className="font-display text-[15px] font-semibold text-danger-500">
                          {selectedSite.title}
                          {selectedSite.sub && <span className="font-sans text-[13px] font-medium text-[var(--text-dim)]"> · {selectedSite.sub}</span>}
                        </p>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text)]">{selectedSite.text}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-display text-[15px] font-semibold text-[var(--text)]">Missä veri on?</p>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-dim)]">
                          Napauta vuotokohtaa. Vain lattialla näkyvä veri paljastuu katsomalla – muut vuodot pitää osata epäillä.
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <ul className="space-y-2.5 rounded-xl border border-danger-500/30 bg-danger-500/8 px-4 py-3" aria-live="polite">
                {FACTS.map(({ Icon, text }) => (
                  <li key={text} className="flex gap-2.5 text-[13.5px] leading-snug text-[var(--text)]">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" aria-hidden />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
