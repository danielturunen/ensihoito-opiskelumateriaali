import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { InfoCard, Bullets, rc, Stage, useLoop } from '../parts/resp-kit'

type Kind = 'partial' | 'complete'

const SIGNS: { text: string; kind: Kind }[] = [
  { text: 'Äkillinen alku ja tukehtumisen eleet', kind: 'complete' },
  { text: 'Potilas yskii', kind: 'partial' },
  { text: 'Ei pysty puhumaan tai puhe erittäin heikkoa', kind: 'complete' },
  { text: 'Saa edelleen jonkin verran ilmaa', kind: 'partial' },
  { text: 'Yskiminen on tehotonta', kind: 'complete' },
  { text: 'Syanoosi', kind: 'complete' },
]

const LABEL: Record<Kind, string> = { partial: 'Osittainen', complete: 'Täydellinen' }

/* Trachea geometry, viewBox 360 × 190 */
const TX = 180
const TOP = 8
const OBJ_Y = 74

function Airway({ kind, active }: { kind: Kind; active: boolean }) {
  const complete = kind === 'complete'
  return (
    <svg viewBox="0 0 360 190" className="h-auto w-full" role="img" aria-label={complete ? 'Täydellinen tukos: vierasesine täyttää henkitorven, ilma ei kulje.' : 'Osittainen tukos: ilmaa pääsee vierasesineen ohi.'}>
      {/* trachea + bronchi */}
      <path
        d={`M${TX - 22} ${TOP}V120C${TX - 22} 140 ${TX - 40} 150 ${TX - 70} 182M${TX + 22} ${TOP}V120C${TX + 22} 140 ${TX + 40} 150 ${TX + 70} 182`}
        fill="none"
        stroke={rc.cartilage}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path d={`M${TX - 8} 182C${TX - 8} 160 ${TX + 8} 160 ${TX + 8} 182`} fill="none" stroke={rc.cartilage} strokeWidth={3} strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M${TX - 22} ${TOP + 12 + i * 18}q22 8 44 0`} fill="none" stroke={rc.cartilage} strokeWidth={1.4} opacity={0.35} />
      ))}
      {/* foreign body */}
      <motion.path
        initial={false}
        animate={{
          d: complete
            ? `M${TX - 21} ${OBJ_Y - 12}C${TX - 10} ${OBJ_Y - 20} ${TX + 12} ${OBJ_Y - 18} ${TX + 21} ${OBJ_Y - 10}L${TX + 21} ${OBJ_Y + 12}C${TX + 8} ${OBJ_Y + 20} ${TX - 12} ${OBJ_Y + 18} ${TX - 21} ${OBJ_Y + 10}Z`
            : `M${TX - 21} ${OBJ_Y - 10}C${TX - 14} ${OBJ_Y - 16} ${TX} ${OBJ_Y - 14} ${TX + 6} ${OBJ_Y - 8}L${TX + 6} ${OBJ_Y + 10}C${TX} ${OBJ_Y + 16} ${TX - 14} ${OBJ_Y + 14} ${TX - 21} ${OBJ_Y + 8}Z`,
        }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.1 }}
        fill="#78716c"
        stroke="#57534e"
        strokeWidth={1.5}
      />
      <text x={TX + 32} y={OBJ_Y + 4} fontSize={11.5} fontWeight={600} fill={svg.ink}>
        vierasesine
      </text>
      {/* airflow */}
      {Array.from({ length: 5 }, (_, i) => {
        const x = complete ? TX - 6 + (i % 3) * 6 : TX + 13
        return (
          <motion.circle
            key={`${kind}-${i}`}
            cx={x}
            r={3}
            fill={rc.airInk}
            initial={false}
            animate={
              active
                ? complete
                  ? { cy: [150, OBJ_Y + 24, 150], opacity: [0, 0.9, 0] }
                  : { cy: [150, TOP], opacity: [0, 1, 1, 0] }
                : { cy: complete ? OBJ_Y + 30 + i * 8 : 40 + i * 22, opacity: 0.9 }
            }
            transition={{ duration: complete ? 1.4 : 1.8, repeat: active ? Infinity : 0, delay: i * 0.36, ease: 'easeInOut' }}
          />
        )
      })}
      <text x={24} y={30} fontSize={12} fontWeight={700} fill={complete ? svg.danger : rc.airInk}>
        {complete ? 'Ilma ei kulje' : 'Ilmaa pääsee ohi'}
      </text>
      <text x={24} y={46} fontSize={11} fill={svg.dim}>
        {complete ? 'tehoton yskä, ei puhetta' : 'potilas voi yskiä'}
      </text>
    </svg>
  )
}

export default function Choking(_props: WidgetProps) {
  const [kind, setKind] = useState<Kind>('partial')
  const { ref, active } = useLoop<HTMLDivElement>()
  const [idx, setIdx] = useState(0)
  const [answer, setAnswer] = useState<Kind | null>(null)
  const [score, setScore] = useState(0)
  const done = idx >= SIGNS.length
  const sign = SIGNS[idx]

  const pick = (k: Kind) => {
    if (answer) return
    setAnswer(k)
    if (k === sign.kind) setScore((s) => s + 1)
  }
  const next = () => {
    setAnswer(null)
    setIdx((i) => i + 1)
  }
  const reset = () => {
    setIdx(0)
    setAnswer(null)
    setScore(0)
  }

  return (
    <div ref={ref}>
      <Segmented
        layoutId="choking-kind"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'partial', label: 'Osittainen tukos' },
          { value: 'complete', label: 'Täydellinen tukos' },
        ]}
      />
      <Stage className="mt-3">
        <Airway kind={kind} active={active} />
      </Stage>

      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Harjoittele: kumpi tukos?</p>
          <p className="font-display text-[13px] font-semibold tabular-nums text-[var(--text-dim)]">
            {Math.min(idx + (answer ? 1 : 0), SIGNS.length)}/{SIGNS.length}
          </p>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-center">
              <p className="font-display text-3xl font-bold text-brand-500">
                {score}/{SIGNS.length}
              </p>
              <p className="mt-1 text-[13px] text-[var(--text-dim)]">oikein</p>
              <button onClick={reset} className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[var(--border)] px-4 text-[13px] font-semibold active:scale-[0.97]">
                <RotateCcw className="h-4 w-4" /> Uudestaan
              </button>
            </motion.div>
          ) : (
            <motion.div key={idx} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              <p className="mt-2 font-display text-[16px] font-semibold leading-snug">{sign.text}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(['partial', 'complete'] as Kind[]).map((k) => {
                  const correct = answer && k === sign.kind
                  const wrong = answer === k && k !== sign.kind
                  return (
                    <button
                      key={k}
                      onClick={() => pick(k)}
                      disabled={!!answer}
                      className={`flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-3 text-[14px] font-semibold transition-colors duration-150 active:scale-[0.98] ${
                        correct ? 'border-teal-500 bg-teal-500/10 text-teal-600' : wrong ? 'border-danger-500 bg-danger-500/10 text-danger-500' : 'border-[var(--border)]'
                      }`}
                    >
                      {correct && <CheckCircle2 className="h-4 w-4" />}
                      {wrong && <XCircle className="h-4 w-4" />}
                      {LABEL[k]}
                    </button>
                  )
                })}
              </div>
              {answer && (
                <div className="mt-3 flex justify-end">
                  <button onClick={next} className="inline-flex min-h-[44px] items-center rounded-full bg-brand-500 px-5 text-[13px] font-semibold text-white active:scale-[0.97]">
                    {idx + 1 < SIGNS.length ? 'Seuraava' : 'Tulos'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3">
        <InfoCard title="Muista">
          <Bullets
            items={[
              'Arvioi nopeasti, onko tukos täydellinen vai osittainen, ja toimi algoritmin mukaan.',
              'Tajuton potilas: siirry elvytys- ja ilmatiealgoritmeihin.',
              'Kuljeta päivystykseen myös onnistuneen poiston jälkeen, jos epäillään jäännösmateriaalia tai aspiraatiota.',
            ]}
          />
        </InfoCard>
      </div>
    </div>
  )
}
