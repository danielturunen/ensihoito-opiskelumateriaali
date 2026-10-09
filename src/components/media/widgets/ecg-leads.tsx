import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, RotateCcw, X } from 'lucide-react'
import { Result, Segmented, svg } from '../ui'

/* Electrode placement: limb leads (colours, Einthoven pairs) and chest leads V1–V6,
 * plus a tap-the-spot practice. Positions: Akuuttihoito-opas, EKG-kytkennät (Mäkijärvi). */

type Mode = 'limb' | 'chest' | 'test'
type LimbLead = 'I' | 'II' | 'III' | 'aVF'

const LIMB = {
  RA: { x: 86, y: 176, fill: '#dc2626', name: 'Oikea käsi', color: 'punainen' },
  LA: { x: 234, y: 176, fill: '#eab308', name: 'Vasen käsi', color: 'keltainen' },
  LL: { x: 184, y: 284, fill: '#16a34a', name: 'Vasen jalka', color: 'vihreä' },
  RL: { x: 136, y: 284, fill: '#111827', name: 'Oikea jalka', color: 'musta (maa)' },
} as const

const LEADS: Record<LimbLead, { neg: (keyof typeof LIMB)[]; pos: keyof typeof LIMB; text: string }> = {
  I: { neg: ['RA'], pos: 'LA', text: 'Kytkentä I: oikea käsi (punainen) negatiivinen, vasen käsi (keltainen) positiivinen.' },
  II: { neg: ['RA'], pos: 'LL', text: 'Kytkentä II: oikea käsi (punainen) ja vasen jalka (vihreä).' },
  III: { neg: ['LA'], pos: 'LL', text: 'Kytkentä III: vasen käsi (keltainen) ja vasen jalka (vihreä).' },
  aVF: {
    neg: ['RA', 'LA'],
    pos: 'LL',
    text: 'Vahvistettu kytkentä aVF: vasen jalka positiivisena, molemmat yläraajat yhdessä negatiivisena elektrodina.',
  },
}

// Chest geometry (patient's left = viewer's right). 4th ICS y=148, 5th ICS y=172.
const CHEST: Record<string, { x: number; y: number; where: string }> = {
  V1: { x: 148, y: 148, where: '4. kylkiluuväli rintalastan oikealla puolella' },
  V2: { x: 172, y: 148, where: '4. kylkiluuväli rintalastan vasemmalla puolella' },
  V3: { x: 190, y: 160, where: 'V2:n ja V4:n puolivälissä' },
  V4: { x: 208, y: 172, where: '5. kylkiluuväli keskisolisviivassa' },
  V5: { x: 236, y: 172, where: 'Etuaksillaariviiva, samalla vaakatasolla kuin V4' },
  V6: { x: 262, y: 172, where: 'Keskiaksillaariviiva, samalla vaakatasolla kuin V4 – ei kylkiluuväliä seuraten' },
}
const ORDER = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6']

// Practice candidates: the six correct spots plus typical mistakes.
const DISTRACTORS = [
  { x: 148, y: 124 },
  { x: 172, y: 124 },
  { x: 208, y: 148 },
  { x: 208, y: 196 },
  { x: 236, y: 186 },
  { x: 262, y: 198 },
  { x: 160, y: 172 },
]

function Torso() {
  return (
    <g aria-hidden>
      <path d="M70 80 Q160 52 250 80 L276 120 L272 262 L48 262 L44 120 Z" fill={svg.raised} stroke={svg.line} strokeWidth={1.5} />
      {/* clavicles */}
      <path d="M100 84 Q130 92 156 88 M164 88 Q190 92 220 84" fill="none" stroke={svg.dim} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
      {/* sternum */}
      <rect x={154} y={90} width={12} height={104} rx={5} fill="none" stroke={svg.dim} strokeWidth={1.5} opacity={0.6} />
      {/* intercostal spaces 2–6 */}
      {[100, 124, 148, 172, 196].map((y, i) => (
        <g key={y}>
          <path d={`M60 ${y + 8} Q100 ${y - 2} 150 ${y}`} fill="none" stroke={svg.line} strokeWidth={1.2} />
          <path d={`M170 ${y} Q220 ${y - 2} 266 ${y + 8}`} fill="none" stroke={svg.line} strokeWidth={1.2} />
          <text x={36} y={y + 8} fontSize={10} fill={svg.dim} textAnchor="middle">
            {i + 2}.
          </text>
        </g>
      ))}
      {/* reference lines on the patient's left */}
      <line x1={208} y1={100} x2={208} y2={250} stroke={svg.brand} strokeWidth={1} strokeDasharray="3 4" opacity={0.6} />
      <line x1={236} y1={110} x2={236} y2={250} stroke={svg.teal} strokeWidth={1} strokeDasharray="3 4" opacity={0.6} />
      <line x1={262} y1={120} x2={262} y2={250} stroke={svg.dim} strokeWidth={1} strokeDasharray="3 4" opacity={0.6} />
    </g>
  )
}

export default function EcgLeads() {
  const [mode, setMode] = useState<Mode>('limb')
  const [lead, setLead] = useState<LimbLead>('I')
  const [chest, setChest] = useState<string>('V4')
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState<{ x: number; y: number; ok: boolean } | null>(null)
  const [score, setScore] = useState(0)
  const reduce = useReducedMotion()

  const L = LEADS[lead]
  const target = ORDER[step]
  const candidates = [...ORDER.map((k) => CHEST[k]), ...DISTRACTORS]
  const done = step >= ORDER.length

  function pick(c: { x: number; y: number }) {
    if (answer || done) return
    const t = CHEST[target]
    const ok = c.x === t.x && c.y === t.y
    setAnswer({ x: c.x, y: c.y, ok })
    if (ok) setScore((s) => s + 1)
  }
  function next() {
    setAnswer(null)
    setStep((s) => s + 1)
  }
  function reset() {
    setAnswer(null)
    setStep(0)
    setScore(0)
  }

  return (
    <div>
      <Segmented
        layoutId="ecg-leads"
        value={mode}
        onChange={(v) => {
          setMode(v)
          reset()
        }}
        options={[
          { value: 'limb', label: 'Raajat' },
          { value: 'chest', label: 'Rinta' },
          { value: 'test', label: 'Harjoittele' },
        ]}
      />

      {mode === 'limb' ? (
        <>
          <svg viewBox="0 0 320 300" className="mt-3 h-auto w-full" role="img" aria-label={`Raajaelektrodit ja ${L.text}`}>
            <g aria-hidden>
              <circle cx={160} cy={34} r={20} fill={svg.raised} stroke={svg.line} strokeWidth={1.5} />
              <path d="M124 60 L196 60 L204 170 L116 170 Z" fill={svg.raised} stroke={svg.line} strokeWidth={1.5} />
              <path d="M124 64 L86 170 M196 64 L234 170" stroke={svg.line} strokeWidth={14} strokeLinecap="round" />
              <path d="M140 168 L136 280 M180 168 L184 280" stroke={svg.line} strokeWidth={16} strokeLinecap="round" />
            </g>
            {/* active lead vector */}
            <AnimatePresence mode="wait">
              <motion.g key={lead} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} aria-hidden>
                {L.neg.map((n) => (
                  <motion.line
                    key={n}
                    x1={LIMB[n].x}
                    y1={LIMB[n].y}
                    x2={LIMB[L.pos].x}
                    y2={LIMB[L.pos].y}
                    stroke={svg.brand}
                    strokeWidth={3}
                    strokeLinecap="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ))}
              </motion.g>
            </AnimatePresence>
            {(Object.keys(LIMB) as (keyof typeof LIMB)[]).map((k) => {
              const e = LIMB[k]
              const isPos = L.pos === k
              const isNeg = L.neg.includes(k)
              return (
                <g key={k}>
                  <circle cx={e.x} cy={e.y} r={11} fill={e.fill} stroke={isPos || isNeg ? svg.brand : svg.dim} strokeWidth={isPos || isNeg ? 3 : 1.5} />
                  {(isPos || isNeg) && (
                    <text x={e.x} y={e.y + 4} fontSize={13} fontWeight={700} textAnchor="middle" fill="#fff">
                      {isPos ? '+' : '–'}
                    </text>
                  )}
                </g>
              )
            })}
            <text x={60} y={206} fontSize={11} fill={svg.dim} textAnchor="middle">
              oikea
            </text>
            <text x={260} y={206} fontSize={11} fill={svg.dim} textAnchor="middle">
              vasen
            </text>
          </svg>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {(Object.keys(LEADS) as LimbLead[]).map((k) => (
              <button
                key={k}
                onClick={() => setLead(k)}
                aria-pressed={lead === k}
                className={`min-h-[44px] rounded-xl border font-display text-[15px] font-semibold transition-[background-color,border-color] duration-150 ${
                  lead === k ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text)]'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--text)]">{L.text}</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] text-[var(--text-dim)]">
            {(Object.keys(LIMB) as (keyof typeof LIMB)[]).map((k) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: LIMB[k].fill }} aria-hidden />
                {LIMB[k].name}: {LIMB[k].color}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <svg viewBox="24 64 272 210" className="mt-3 h-auto w-full" role="img" aria-label={mode === 'chest' ? `Rintaelektrodi ${chest}: ${CHEST[chest].where}` : `Harjoitus: napauta elektrodin ${target ?? ''} paikkaa`}>
            <Torso />
            {mode === 'chest' &&
              ORDER.map((k) => {
                const p = CHEST[k]
                const active = chest === k
                return (
                  <g key={k} onClick={() => setChest(k)} style={{ cursor: 'pointer' }}>
                    <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
                    <motion.circle cx={p.x} cy={p.y} initial={false} animate={{ r: active ? 10 : 7.5 }} fill={active ? svg.brand : svg.surface} stroke={svg.brand} strokeWidth={2} />
                    <text x={p.x} y={p.y - 13} fontSize={10.5} fontWeight={700} textAnchor="middle" fill={active ? svg.brand : svg.ink}>
                      {k}
                    </text>
                  </g>
                )
              })}
            {mode === 'test' &&
              candidates.map((c, i) => {
                const chosen = answer && answer.x === c.x && answer.y === c.y
                const isTarget = answer && !done && CHEST[target].x === c.x && CHEST[target].y === c.y
                const fill = chosen ? (answer.ok ? svg.teal : svg.danger) : isTarget ? svg.teal : svg.surface
                return (
                  <g
                    key={i}
                    role="button"
                    tabIndex={answer ? -1 : 0}
                    aria-label={`Vaihtoehto ${i + 1}`}
                    onClick={() => pick(c)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick(c)}
                    style={{ cursor: answer ? 'default' : 'pointer' }}
                  >
                    <circle cx={c.x} cy={c.y} r={14} fill="transparent" />
                    <circle cx={c.x} cy={c.y} r={7.5} fill={fill} stroke={chosen || isTarget ? fill : svg.dim} strokeWidth={2} />
                  </g>
                )
              })}
            <text x={208} y={262} fontSize={9.5} fill={svg.brand} textAnchor="middle">
              keskisolis
            </text>
            <text x={238} y={252} fontSize={9.5} fill={svg.teal} textAnchor="middle">
              etuaks.
            </text>
            <text x={270} y={262} fontSize={9.5} fill={svg.dim} textAnchor="middle">
              keskiaks.
            </text>
          </svg>

          {mode === 'chest' ? (
            <>
              <div className="mt-2 grid grid-cols-6 gap-1">
                {ORDER.map((k) => (
                  <button
                    key={k}
                    onClick={() => setChest(k)}
                    aria-pressed={chest === k}
                    className={`min-h-[44px] rounded-xl border font-display text-[13px] font-semibold transition-[background-color,border-color] duration-150 ${
                      chest === k ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text)]'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Result tone="brand" title={chest}>
                  {CHEST[chest].where}.
                </Result>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-dim)]">
                Lisäkytkennät: V7–V9 selkäpuolella samalla korkeudella kuin V4–V6, peilikuvakytkennät (esim. V4R) oikealla puolella.
              </p>
            </>
          ) : done ? (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-teal-500/10 px-3.5 py-2.5">
              <span className="text-[13px] font-semibold text-teal-600">
                {score}/{ORDER.length} oikein
              </span>
              <button onClick={reset} className="inline-flex min-h-[40px] items-center gap-1 rounded-full bg-[var(--bg-raised)] px-3 text-[12px] font-semibold text-[var(--text)]">
                <RotateCcw className="h-3.5 w-3.5" /> Uudestaan
              </button>
            </div>
          ) : (
            <div className="mt-3">
              {answer ? (
                <Result
                  tone={answer.ok ? 'ok' : 'danger'}
                  title={
                    <span className="inline-flex items-center gap-1.5">
                      {answer.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} {answer.ok ? 'Oikein' : 'Ei aivan'} – {target}
                    </span>
                  }
                >
                  {CHEST[target].where}.
                  <button onClick={next} className="mt-2 block min-h-[40px] rounded-full bg-[var(--bg-raised)] px-4 text-[12px] font-semibold text-[var(--text)]">
                    {step + 1 < ORDER.length ? 'Seuraava elektrodi' : 'Katso tulos'}
                  </button>
                </Result>
              ) : (
                <Result tone="neutral" title={`Napauta: mihin ${target}?`}>
                  {step + 1}/{ORDER.length} · Kylkiluuvälit on numeroitu vasemmalle.
                </Result>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
